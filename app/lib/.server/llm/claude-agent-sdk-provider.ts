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

// Stream chunk types
type StreamChunk =
    | { type: 'text'; text: string }
    | { type: 'tool_use'; tool: string; input?: Record<string, unknown> }
    | { type: 'done'; usage: { promptTokens: number; completionTokens: number } };

/**
 * Stream planning responses using direct Anthropic Messages API
 * This bypasses the Claude Agent SDK completely, which can't properly disable tools
 * 
 * Uses the OAuth token with the Anthropic API directly for text-only responses
 */
export async function* streamDirectAnthropicResponse(
    prompt: string,
    systemPrompt: string,
    oauthToken: string
): AsyncGenerator<StreamChunk> {
    const API_URL = 'https://api.anthropic.com/v1/messages';
    const MODEL = 'claude-opus-4-5-20250514';

    logger.info('🎯 PLANNING MODE: Using direct Anthropic API (no tools, no SDK)');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': oauthToken,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 4096,
                system: systemPrompt,
                messages: [{ role: 'user', content: prompt }],
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('Anthropic API error:', response.status, errorText);
            throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let promptTokens = 0;
        let completionTokens = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const event = JSON.parse(data);

                        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                            yield { type: 'text', text: event.delta.text };
                        } else if (event.type === 'message_start' && event.message?.usage) {
                            promptTokens = event.message.usage.input_tokens || 0;
                        } else if (event.type === 'message_delta' && event.usage) {
                            completionTokens = event.usage.output_tokens || 0;
                        }
                    } catch (parseError) {
                        // Skip non-JSON lines
                    }
                }
            }
        }

        yield { type: 'done', usage: { promptTokens, completionTokens } };
    } catch (error) {
        logger.error('Direct Anthropic API error:', error);
        throw error;
    }
}

/**
 * Stream Claude Agent SDK output as text chunks
 *
 * The SDK returns SDKMessage objects (AsyncGenerator<SDKMessage>).
 * We extract text content and stream it back.
 * 
 * @param prompt - The user prompt
 * @param systemPrompt - The system prompt for Claude
 * @param oauthToken - The OAuth token for authentication
 * @param planningMode - If true, tools are disabled (for planning phase before user approval)
 */
export async function* streamClaudeAgentResponse(
    prompt: string,
    systemPrompt: string,
    oauthToken: string,
    planningMode: boolean = false
): AsyncGenerator<StreamChunk> {
    // Dynamically import the SDK (it's ESM-only)
    const { query } = await import('@anthropic-ai/claude-agent-sdk');

    let promptTokens = 0;
    let completionTokens = 0;

    // In planning mode, add VERY aggressive anti-tool instructions at the START of the prompt
    // The SDK can't properly disable tools, so we must tell Claude very forcefully not to use them
    const planningPrefix = planningMode ? `
⛔⛔⛔ CRITICAL CONSTRAINT - READ THIS FIRST ⛔⛔⛔

YOU ARE IN PLANNING MODE. YOU MUST NOT USE ANY TOOLS.

FORBIDDEN ACTIONS (will cause immediate failure):
- ❌ DO NOT use Write, Edit, Read, Bash, Glob, or Grep tools
- ❌ DO NOT create, modify, or read any files
- ❌ DO NOT execute any shell commands
- ❌ DO NOT say "let me explore" or "let me check the codebase"

REQUIRED ACTIONS:
- ✅ ASK clarifying questions about what the user wants
- ✅ PRESENT a plan in text format only
- ✅ WAIT for user to say "go" or "approved" before doing ANYTHING

If you try to use tools, THIS REQUEST WILL FAIL. You MUST respond with text only.

---

` : '';

    const modifiedSystemPrompt = planningPrefix + systemPrompt;

    try {
        // Set the OAuth token via environment (SDK reads from env)
        process.env.CLAUDE_CODE_OAUTH_TOKEN = oauthToken;

        // In planning mode, use 'plan' permission mode which prevents ALL tool execution
        // This is the only reliable way to force text-only responses in Claude Agent SDK
        const enabledTools = planningMode
            ? [] // No tools during planning - AI must ask questions and present plan only
            : [
                'Read',    // Read files
                'Write',   // Write/create files  
                'Edit',    // Edit existing files
                'Bash',    // Run shell commands (for deployment, npm install)
                'Glob',    // Find files by pattern
                'Grep',    // Search in files
            ];

        logger.info(planningMode
            ? '🛑 Planning mode: using permissionMode="plan" - AI can ONLY analyze and plan'
            : '✅ Execution mode: tools ENABLED - AI can build the application'
        );

        const options: Options = {
            // Enable built-in SDK tools for file operations
            // See: https://github.com/anthropics/claude-agent-sdk
            // IMPORTANT: In planning mode, tools is [] which prevents tool execution
            // We do NOT use permissionMode: 'plan' because that triggers Claude's internal
            // planning workflow with <attempt_completion> tags instead of our custom prompt
            tools: enabledTools,
            // CRITICAL FIX: disallowedTools explicitly blocks specific tools
            // The SDK ignores tools: [], but respects disallowedTools
            disallowedTools: planningMode ? [
                'Read', 'Write', 'Edit', 'MultiEdit', 'Bash', 'Glob', 'Grep', 'LS',
                'TodoRead', 'TodoWrite', 'WebFetch', 'WebSearch', 'NotebookRead',
                'NotebookEdit', 'Task', 'Agent', 'AskUser', 'CodeReview'
            ] : [],
            // Use Chef's custom system prompt directly (plain string, NOT preset)
            // In planning mode, this includes aggressive anti-tool constraints
            systemPrompt: modifiedSystemPrompt,
            // Always use bypassPermissions - tool control is via the tools array
            // permissionMode: 'plan' triggers Claude's own workflow which overrides our prompt
            permissionMode: 'bypassPermissions',
            allowDangerouslySkipPermissions: true,
            // Don't persist sessions between requests
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

            // Handle tool use events (Edit, Write, Bash, etc.)
            if (msg.type === 'tool_use') {
                const toolUse = msg as { tool: string; input?: Record<string, unknown> };
                logger.debug(`SDK tool use: ${toolUse.tool}`, toolUse.input);
                // Optionally yield tool use info to UI
                yield {
                    type: 'tool_use',
                    tool: toolUse.tool,
                    input: toolUse.input
                } as StreamChunk;
            }

            // Handle tool results
            if (msg.type === 'tool_result') {
                const toolResult = msg as { tool?: string; content?: unknown };
                logger.debug(`SDK tool result: ${toolResult.tool || 'unknown'}`);
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
