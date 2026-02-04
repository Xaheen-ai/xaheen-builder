/**
 * Claude Agent SDK Provider
 *
 * Enables Claude OAuth token authentication by:
 * 1. Reading OAuth token from macOS Keychain (stored by `claude setup-token`)
 * 2. Using Claude Agent SDK `query()` function
 * 3. Transforming async generator output to streaming format
 */

import { execSync } from 'child_process';
import { createScopedLogger } from 'chef-agent/utils/logger';
import type { Options } from '@anthropic-ai/claude-agent-sdk';

const logger = createScopedLogger('claude-agent-sdk');

// OAuth token format from Claude Code CLI
const OAUTH_TOKEN_PREFIX = 'sk-ant-oat01-';

/**
 * Check if a token is a Claude OAuth token
 */
export function isClaudeOAuthToken(token: string | undefined): boolean {
    return token?.startsWith(OAUTH_TOKEN_PREFIX) ?? false;
}

/**
 * Get Claude OAuth token from macOS Keychain
 * This reads credentials stored by `claude setup-token`
 */
export function getOAuthTokenFromKeychain(): string | null {
    try {
        // Claude Code stores credentials in macOS Keychain under "Claude Code-credentials"
        const result = execSync(
            '/usr/bin/security find-generic-password -s "Claude Code-credentials" -w',
            { encoding: 'utf-8', timeout: 5000 }
        );

        const credentialsJson = result.trim();
        if (!credentialsJson) {
            logger.debug('No credentials found in keychain');
            return null;
        }

        const data = JSON.parse(credentialsJson);
        const token = data?.claudeAiOauth?.accessToken;

        if (!token) {
            logger.debug('No OAuth token in keychain credentials');
            return null;
        }

        // Validate token format
        if (!token.startsWith(OAUTH_TOKEN_PREFIX)) {
            logger.warn('Token in keychain does not have expected format');
            return null;
        }

        logger.info('Successfully retrieved OAuth token from keychain');
        return token;
    } catch (error) {
        logger.debug('Failed to get OAuth token from keychain:', error);
        return null;
    }
}

/**
 * Get OAuth token from environment variable or keychain
 */
export function getClaudeOAuthToken(): string | null {
    // First check environment variable (like Auto-Claude)
    const envToken = process.env.CLAUDE_CODE_OAUTH_TOKEN || process.env.ANTHROPIC_OAUTH_TOKEN;
    if (envToken && isClaudeOAuthToken(envToken)) {
        logger.info('Using OAuth token from environment variable');
        return envToken;
    }

    // Fall back to keychain
    return getOAuthTokenFromKeychain();
}

/**
 * Stream Claude Agent SDK output as text chunks
 *
 * The SDK returns SDKMessage objects (AsyncGenerator<SDKMessage>).
 * We extract text content and stream it back.
 */
export async function* streamClaudeAgentResponse(
    prompt: string,
    systemPrompt: string,
    oauthToken: string
): AsyncGenerator<
    | { type: 'text'; text: string }
    | { type: 'done'; usage: { promptTokens: number; completionTokens: number } }
> {
    // Dynamically import the SDK (it's ESM-only)
    const { query } = await import('@anthropic-ai/claude-agent-sdk');

    let promptTokens = 0;
    let completionTokens = 0;

    try {
        // Set the OAuth token via environment (SDK reads from env)
        process.env.CLAUDE_CODE_OAUTH_TOKEN = oauthToken;

        const options: Options = {
            // Disable all built-in tools since we handle tools separately in Chef
            tools: [],
            // Use Chef's custom system prompt directly (plain string, NOT preset)
            systemPrompt: systemPrompt,
            // Bypass permissions for headless operation
            permissionMode: 'bypassPermissions',
            allowDangerouslySkipPermissions: true,
            // Don't persist sessions
            persistSession: false,
        };

        const queryResult = query({ prompt, options });

        let messageCount = 0;
        for await (const message of queryResult) {
            messageCount++;
            // Handle different message types from Claude Agent SDK
            // The SDK yields SDKMessage which can be various types
            const msg = message as Record<string, unknown>;

            // Debug: Log message types to understand SDK output
            logger.debug(`SDK message #${messageCount}: type=${msg.type}`);

            // Handle assistant text content
            if (msg.type === 'assistant' && msg.message) {
                const assistantMsg = msg.message as { content?: Array<{ type: string; text?: string }> };
                if (assistantMsg.content) {
                    for (const block of assistantMsg.content) {
                        logger.debug(`  Content block type: ${block.type}`);
                        // Only yield actual text content, skip thinking/reasoning blocks
                        if (block.type === 'text' && block.text) {
                            yield { type: 'text', text: block.text };
                        }
                        // Explicitly skip: 'thinking', 'redacted_thinking', 'tool_use', 'tool_result'
                    }
                }
            }

            // Handle partial streaming messages
            if (msg.type === 'partial_assistant' && msg.content) {
                const content = msg.content as Array<{ type: string; text?: string; thinking?: string }>;
                for (const block of content) {
                    // Only yield actual text content, skip thinking blocks
                    if (block.type === 'text' && block.text) {
                        yield { type: 'text', text: block.text };
                    }
                    // Skip: 'thinking', 'redacted_thinking' blocks
                }
            }

            // Handle result with usage info
            if (msg.type === 'result' && msg.usage) {
                const usage = msg.usage as { input_tokens?: number; output_tokens?: number };
                promptTokens = usage.input_tokens ?? 0;
                completionTokens = usage.output_tokens ?? 0;
                logger.info(`SDK completed. Usage: ${promptTokens} in, ${completionTokens} out`);
            }

            // Log any error messages from the SDK
            if (msg.type === 'error') {
                logger.error('SDK returned error message:', msg);
            }
        }

        logger.info(`SDK stream finished after ${messageCount} messages`);

        yield {
            type: 'done',
            usage: { promptTokens, completionTokens },
        };
    } catch (error) {
        logger.error('Claude Agent SDK error:', error);
        throw error;
    }
}
