import {
  createDataStream,
  streamText,
  type CoreAssistantMessage,
  type CoreMessage,
  type CoreToolMessage,
  type DataStreamWriter,
  type LanguageModelUsage,
  type Message,
  type ProviderMetadata,
  type StepResult,
} from 'ai';
import { formatDataStreamPart } from 'ai';
import { ROLE_SYSTEM_PROMPT, generalSystemPrompt } from 'chef-agent/prompts/system';
import { deployTool } from 'chef-agent/tools/deploy';
import { viewTool } from 'chef-agent/tools/view';
import type { ConvexToolSet } from 'chef-agent/types';
import { npmInstallTool } from 'chef-agent/tools/npmInstall';
import type { Tracer } from '~/lib/.server/chat';
import { editTool } from 'chef-agent/tools/edit';
import { captureException, captureMessage } from '@sentry/remix';
import type { SystemPromptOptions } from 'chef-agent/types';
import { cleanupAssistantMessages } from 'chef-agent/cleanupAssistantMessages';
import { logger } from 'chef-agent/utils/logger';
import { encodeUsageAnnotation, encodeModelAnnotation } from '~/lib/.server/usage';
import { compressWithLz4Server } from '~/lib/compression.server';
import { getConvexSiteUrl } from '~/lib/convexSiteUrl';
import { REPEATED_ERROR_REASON } from '~/lib/common/annotations';
import { waitUntil } from '@vercel/functions';
import type { internal } from '@convex/_generated/api';
import type { Usage } from '~/lib/common/annotations';
import type { UsageRecord } from '@convex/schema';
import { getProvider, type ModelProvider } from '~/lib/.server/llm/provider';
import { getEnv } from '~/lib/.server/env';
import { calculateChefTokens, usageFromGeneration } from '~/lib/common/usage';
import { lookupDocsTool } from 'chef-agent/tools/lookupDocs';
import { addEnvironmentVariablesTool } from 'chef-agent/tools/addEnvironmentVariables';
import { getConvexDeploymentNameTool } from 'chef-agent/tools/getConvexDeploymentName';
import type { PromptCharacterCounts } from 'chef-agent/ChatContextManager';
import { streamClaudeAgentResponse } from '~/lib/.server/llm/claude-agent-sdk-provider';
import { isStillPlanning } from 'chef-agent/prompts/planningPhase';

/**
 * Filter out Claude SDK internal XML tags that appear when SDK is in plan mode
 * These tags are internal to the SDK and should not be shown to users
 */
function filterInternalXmlTags(text: string): string {
  // Remove SDK internal XML tags and their content
  const patterns = [
    /<attempt_completion>[\s\S]*?<\/attempt_completion>/gi,
    /<anthropic_sub_agent>[\s\S]*?<\/anthropic_sub_agent>/gi,
    /<agent_type>[\s\S]*?<\/agent_type>/gi,
    /<\/agent_type>/gi,
    /<\/attempt_completion>/gi,
  ];
  let filtered = text;
  for (const pattern of patterns) {
    filtered = filtered.replace(pattern, '');
  }
  return filtered;
}

type Messages = Message[];

export async function convexAgent(args: {
  chatInitialId: string;
  firstUserMessage: boolean;
  messages: Messages;
  tracer: Tracer | null;
  modelProvider: ModelProvider;
  modelChoice: string | undefined;
  userApiKey: string | undefined;
  shouldDisableTools: boolean;
  recordUsageCb: (
    lastMessage: Message | undefined,
    finalGeneration: { usage: LanguageModelUsage; providerMetadata?: ProviderMetadata },
  ) => Promise<void>;
  recordRawPromptsForDebugging: boolean;
  collapsedMessages: boolean;
  promptCharacterCounts?: PromptCharacterCounts;
  featureFlags: {
    enableResend: boolean;
  };
}) {
  const {
    chatInitialId,
    firstUserMessage,
    messages,
    tracer,
    modelProvider,
    userApiKey,
    modelChoice,
    shouldDisableTools,
    recordUsageCb,
    recordRawPromptsForDebugging,
    collapsedMessages,
    promptCharacterCounts,
    featureFlags,
  } = args;
  console.debug('Starting agent with model provider', modelProvider);
  if (userApiKey) {
    console.debug('Using user provided API key');
  }

  const startTime = Date.now();
  let firstResponseTime: number | null = null;

  // Check if we're still in planning phase (no user approval yet)
  // This applies to BOTH Claude Agent SDK and regular AI SDK paths
  const messageHistory = messages.map((m) => ({
    role: m.role,
    content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
  }));
  const planningMode = isStillPlanning(messageHistory);

  // Log planning mode status
  logger.info(planningMode
    ? '🎯 PLANNING MODE: User has not approved - tools will be disabled'
    : '🚀 EXECUTION MODE: User has approved - tools enabled'
  );

  const provider = getProvider(userApiKey, modelProvider, modelChoice);
  const opts: SystemPromptOptions = {
    enableBulkEdits: true,
    includeTemplate: true,
    openaiProxyEnabled: getEnv('OPENAI_PROXY_ENABLED') == '1',
    usingOpenAi: modelProvider == 'OpenAI',
    usingGoogle: modelProvider == 'Google',
    resendProxyEnabled: getEnv('RESEND_PROXY_ENABLED') == '1',
    enableResend: featureFlags.enableResend,
  };
  const tools: ConvexToolSet = {
    deploy: deployTool,
    npmInstall: npmInstallTool,
    lookupDocs: lookupDocsTool(),
    getConvexDeploymentName: getConvexDeploymentNameTool,
  };
  tools.addEnvironmentVariables = addEnvironmentVariablesTool();
  tools.view = viewTool;
  tools.edit = editTool;

  const messagesForDataStream: CoreMessage[] = [
    {
      role: 'system' as const,
      content: ROLE_SYSTEM_PROMPT,
    },
    {
      role: 'system' as const,
      content: generalSystemPrompt(opts),
    },
    ...cleanupAssistantMessages(messages),
  ];

  if (modelProvider === 'Bedrock') {
    messagesForDataStream[messagesForDataStream.length - 1].providerOptions = {
      bedrock: {
        cachePoint: {
          type: 'default',
        },
      },
    };
  }

  if (modelProvider === 'Anthropic') {
    messagesForDataStream[messagesForDataStream.length - 1].providerOptions = {
      anthropic: {
        cacheControl: {
          type: 'ephemeral',
        },
      },
    };
  }

  const dataStream = createDataStream({
    async execute(dataStream) {
      // Check if we should use Claude Agent SDK (for OAuth token)
      // NOTE: OAuth tokens ONLY work with Claude Agent SDK, not standard Anthropic API
      // During planning mode, we'll filter out internal XML tags from SDK output
      if (provider.useClaudeAgentSdk && provider.claudeOAuthToken) {
        logger.info(`Using Claude Agent SDK for streaming (OAuth token mode, ${planningMode ? 'PLANNING' : 'EXECUTION'} phase)`);

        // Extract last user message as the prompt
        const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
        const prompt = lastUserMessage?.content?.toString() || '';

        // Combine system prompts
        const systemPrompt = `${ROLE_SYSTEM_PROMPT}\n\n${generalSystemPrompt(opts)}`;

        try {
          let accumulatedText = '';
          let usage = { promptTokens: 0, completionTokens: 0 };

          for await (const chunk of streamClaudeAgentResponse(
            prompt,
            systemPrompt,
            provider.claudeOAuthToken,
            planningMode  // Pass planning mode to disable tools until approval
          )) {
            if (firstResponseTime === null) {
              firstResponseTime = Date.now();
              const timeToFirstResponse = firstResponseTime - startTime;
              if (tracer) {
                const span = tracer.startSpan('first-response');
                span.setAttribute('chatInitialId', chatInitialId);
                span.setAttribute('timeToFirstResponse', timeToFirstResponse);
                span.setAttribute('provider', 'Claude Agent SDK');
                span.end();
              }
              console.log('First response metrics:', {
                timeToFirstResponse: `${timeToFirstResponse}ms`,
                provider: 'Claude Agent SDK',
                chatInitialId,
              });
            }

            if (chunk.type === 'text') {
              // Filter out internal XML tags during planning mode
              const cleanText = planningMode ? filterInternalXmlTags(chunk.text) : chunk.text;
              if (cleanText) {
                accumulatedText += cleanText;
                // Use formatDataStreamPart to properly format text for the stream
                dataStream.write(formatDataStreamPart('text', cleanText));
              }
            } else if (chunk.type === 'tool_use') {
              // Handle SDK tool use events (Write, Edit, Bash, etc.)
              logger.debug(`SDK tool invoked: ${chunk.tool}`, chunk.input);

              // Translate SDK tools to Chef artifact format
              if (chunk.tool === 'Write' && chunk.input?.['path']) {
                const path = chunk.input['path'] as string;
                const content = chunk.input['content'] as string || '';
                dataStream.writeData({
                  type: 'artifact',
                  artifact: { filePath: path, content, type: 'file' }
                });
              } else if (chunk.tool === 'Edit' && chunk.input?.['path']) {
                const path = chunk.input['path'] as string;
                dataStream.writeData({
                  type: 'artifact',
                  artifact: { filePath: path, type: 'edit' }
                });
              } else if (chunk.tool === 'Bash' && chunk.input?.['command']) {
                const command = chunk.input['command'] as string;
                logger.info(`SDK running Bash: ${command.substring(0, 100)}...`);
                // Could emit command status to UI if needed
              }
            } else if (chunk.type === 'done') {
              usage = chunk.usage;
            }
          }

          // Record usage
          await recordUsageCb(messages[messages.length - 1], {
            usage: {
              promptTokens: usage.promptTokens,
              completionTokens: usage.completionTokens,
              totalTokens: usage.promptTokens + usage.completionTokens,
            },
          });

          // Write final message annotation
          const usageAnnotation = encodeUsageAnnotation(
            { kind: 'final' },
            {
              promptTokens: usage.promptTokens,
              completionTokens: usage.completionTokens,
              totalTokens: usage.promptTokens + usage.completionTokens,
            },
            undefined
          );
          dataStream.writeMessageAnnotation({ type: 'usage', usage: usageAnnotation });
        } catch (error) {
          logger.error('Claude Agent SDK streaming error:', error);
          throw error;
        }

        return;
      }

      // Standard AI SDK path
      const result = streamText({
        model: provider.model,
        maxTokens: provider.maxTokens,
        maxSteps: 10, // Enable multi-step tool execution
        providerOptions: provider.options,
        messages: messagesForDataStream,
        tools,
        // Tool choice: disabled during planning phase OR if shouldDisableTools flag is set
        // Planning mode = no approval from user yet, so must ask questions first
        toolChoice: (planningMode || shouldDisableTools) ? 'none' : 'auto',
        onFinish: (result) => {
          onFinishHandler({
            dataStream,
            messages,
            result,
            tracer,
            chatInitialId,
            recordUsageCb,
            toolsDisabledFromRepeatedErrors: shouldDisableTools,
            recordRawPromptsForDebugging,
            coreMessages: messagesForDataStream,
            modelProvider,
            modelChoice,
            collapsedMessages,
            promptCharacterCounts,
            _startTime: startTime,
            _firstResponseTime: firstResponseTime,
            providerModel: provider.model.modelId,
          });
        },
        onError({ error }) {
          console.error(error);
        },
        experimental_telemetry: {
          isEnabled: true,
          metadata: {
            firstUserMessage,
            chatInitialId,
            provider: modelProvider,
          },
        },
      });

      // Track first response time
      (async () => {
        try {
          for await (const _ of result.textStream) {
            if (firstResponseTime === null) {
              firstResponseTime = Date.now();
              const timeToFirstResponse = firstResponseTime - startTime;
              if (tracer) {
                const span = tracer.startSpan('first-response');
                span.setAttribute('chatInitialId', chatInitialId);
                span.setAttribute('timeToFirstResponse', timeToFirstResponse);
                span.setAttribute('provider', modelProvider);
                span.end();
              }
              console.log('First response metrics:', {
                timeToFirstResponse: `${timeToFirstResponse}ms`,
                provider: modelProvider,
                chatInitialId,
              });
              break;
            }
          }
        } catch (error) {
          console.error('Error tracking first response time:', error);
        }
      })();

      result.mergeIntoDataStream(dataStream);
    },
    onError(error: any) {
      return error.message;
    },
  });
  return dataStream;
}

async function onFinishHandler({
  dataStream,
  messages,
  result,
  tracer,
  chatInitialId,
  recordUsageCb,
  toolsDisabledFromRepeatedErrors,
  recordRawPromptsForDebugging,
  coreMessages,
  modelProvider,
  modelChoice,
  collapsedMessages,
  promptCharacterCounts,
  _startTime,
  _firstResponseTime,
  providerModel,
}: {
  dataStream: DataStreamWriter;
  messages: Messages;
  result: Omit<StepResult<any>, 'stepType' | 'isContinued'>;
  tracer: Tracer | null;
  chatInitialId: string;
  recordUsageCb: (
    lastMessage: Message | undefined,
    finalGeneration: { usage: LanguageModelUsage; providerMetadata?: ProviderMetadata },
  ) => Promise<void>;
  recordRawPromptsForDebugging: boolean;
  toolsDisabledFromRepeatedErrors: boolean;
  coreMessages: CoreMessage[];
  modelProvider: ModelProvider;
  modelChoice: string | undefined;
  collapsedMessages: boolean;
  promptCharacterCounts?: PromptCharacterCounts;
  _startTime: number;
  _firstResponseTime: number | null;
  providerModel: string;
}) {
  const { providerMetadata } = result;
  // This usage accumulates accross multiple /api/chat calls until finishReason of 'stop'.
  const usage = {
    completionTokens: normalizeUsage(result.usage.completionTokens),
    promptTokens: normalizeUsage(result.usage.promptTokens),
    totalTokens: normalizeUsage(result.usage.totalTokens),
  };
  console.log('Finished streaming', {
    finishReason: result.finishReason,
    usage,
    providerMetadata,
  });
  console.log('Prompt character counts', promptCharacterCounts);
  if (tracer) {
    const span = tracer.startSpan('on-finish-handler');
    span.setAttribute('chatInitialId', chatInitialId);
    span.setAttribute('finishReason', result.finishReason);
    span.setAttribute('usage.completionTokens', usage.completionTokens);
    span.setAttribute('usage.promptTokens', usage.promptTokens);
    span.setAttribute('usage.totalTokens', usage.totalTokens);
    span.setAttribute('collapsedMessages', collapsedMessages);
    span.setAttribute('model', providerModel);

    if (promptCharacterCounts) {
      span.setAttribute('promptCharacterCounts.messageHistoryChars', promptCharacterCounts.messageHistoryChars);
      span.setAttribute('promptCharacterCounts.currentTurnChars', promptCharacterCounts.currentTurnChars);
      span.setAttribute('promptCharacterCounts.totalPromptChars', promptCharacterCounts.totalPromptChars);
    }
    if (providerMetadata) {
      if (providerMetadata.anthropic) {
        const anthropic: any = providerMetadata.anthropic;
        span.setAttribute('providerMetadata.anthropic.cacheCreationInputTokens', anthropic.cacheCreationInputTokens);
        span.setAttribute('providerMetadata.anthropic.cacheReadInputTokens', anthropic.cacheReadInputTokens);
      }
      if (providerMetadata.google) {
        const google: any = providerMetadata.google;
        span.setAttribute('providerMetadata.google.cachedContentTokenCount', google.cachedContentTokenCount ?? 0);
      }
      if (providerMetadata.openai) {
        const openai: any = providerMetadata.openai;
        span.setAttribute('providerMetadata.openai.cachedPromptTokens', openai.cachedPromptTokens ?? 0);
      }
      if (providerMetadata.bedrock) {
        const bedrock: any = providerMetadata.bedrock;
        span.setAttribute(
          'providerMetadata.bedrock.cacheCreationInputTokens',
          bedrock.usage?.cacheCreationInputTokens ?? 0,
        );
        span.setAttribute('providerMetadata.bedrock.cacheReadInputTokens', bedrock.usage?.cacheReadInputTokens ?? 0);
      }
    }
    if (result.finishReason === 'stop' || result.finishReason === 'unknown') {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        // This field is deprecated, but for some reason, the new field "parts", does not contain all of the tool calls. This is likely a
        // vercel bug. We do this at the end end the request because it's when we have the results from all of the tool calls.
        const toolCalls = lastMessage.toolInvocations?.filter((t) => t.toolName === 'deploy' && t.state === 'result');
        const successfulDeploys =
          toolCalls?.filter((t) => t.state === 'result' && !t.result.startsWith('Error:')).length ?? 0;
        span.setAttribute('tools.successfulDeploys', successfulDeploys);
        span.setAttribute('tools.failedDeploys', toolCalls ? toolCalls.length - successfulDeploys : 0);
      }
      span.setAttribute('tools.disabledFromRepeatedErrors', toolsDisabledFromRepeatedErrors ? 'true' : 'false');
    }
    span.end();
  }

  if (toolsDisabledFromRepeatedErrors) {
    dataStream.writeMessageAnnotation({ type: 'failure', reason: REPEATED_ERROR_REASON });
  }

  let toolCallId: { kind: 'tool-call'; toolCallId: string } | { kind: 'final' } | undefined;
  // Always stash this part's usage as an annotation -- these are used for
  // displaying usage info in the UI as well as calculating usage when the message
  // finishes.
  if (result.finishReason === 'tool-calls') {
    if (result.toolCalls.length === 1) {
      toolCallId = { kind: 'tool-call', toolCallId: result.toolCalls[0].toolCallId };
    } else {
      logger.warn('Stopped with not exactly one tool call', {
        toolCalls: result.toolCalls,
      });
    }
  } else {
    toolCallId = { kind: 'final' };
  }
  if (toolCallId) {
    const annotation = encodeUsageAnnotation(toolCallId, usage, providerMetadata);
    dataStream.writeMessageAnnotation({ type: 'usage', usage: annotation });
    const modelAnnotation = encodeModelAnnotation(toolCallId, providerMetadata, modelChoice);
    dataStream.writeMessageAnnotation({ type: 'model', ...modelAnnotation });
  }

  // Record usage once we've generated the final part.
  if (result.finishReason !== 'tool-calls') {
    await recordUsageCb(messages[messages.length - 1], { usage, providerMetadata });
  }
  if (recordRawPromptsForDebugging) {
    const responseCoreMessages = result.response.messages as (CoreAssistantMessage | CoreToolMessage)[];
    // don't block the request but keep the request alive in Vercel Lambdas
    waitUntil(
      storeDebugPrompt(
        coreMessages,
        chatInitialId,
        responseCoreMessages,
        result,
        {
          usage,
          providerMetadata,
        },
        modelProvider,
      ),
    );
  }
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/* Convert Usage into something stable to store in Convex debug logs */
function buildUsageRecord(usage: Usage): UsageRecord {
  const usageRecord = {
    completionTokens: 0,
    promptTokens: 0,
    cachedPromptTokens: 0,
  };

  for (const k of Object.keys(usage) as Array<keyof Usage>) {
    switch (k) {
      case 'completionTokens': {
        usageRecord.completionTokens += usage.completionTokens;
        break;
      }
      case 'promptTokens': {
        usageRecord.promptTokens += usage.promptTokens;
        break;
      }
      case 'xaiCachedPromptTokens': {
        usageRecord.cachedPromptTokens += usage.xaiCachedPromptTokens;
        usageRecord.promptTokens += usage.xaiCachedPromptTokens;
        break;
      }
      case 'openaiCachedPromptTokens': {
        usageRecord.cachedPromptTokens += usage.openaiCachedPromptTokens;
        break;
      }
      case 'anthropicCacheReadInputTokens': {
        usageRecord.cachedPromptTokens += usage.anthropicCacheReadInputTokens;
        usageRecord.promptTokens += usage.anthropicCacheReadInputTokens;
        break;
      }
      case 'anthropicCacheCreationInputTokens': {
        usageRecord.promptTokens += usage.anthropicCacheCreationInputTokens;
        break;
      }
      case 'googleCachedContentTokenCount': {
        usageRecord.cachedPromptTokens += usage.googleCachedContentTokenCount;
        break;
      }
      case 'googleThoughtsTokenCount': {
        usageRecord.completionTokens += usage.googleThoughtsTokenCount;
        break;
      }
      case 'bedrockCacheWriteInputTokens': {
        usageRecord.promptTokens += usage.bedrockCacheWriteInputTokens;
        break;
      }
      case 'bedrockCacheReadInputTokens': {
        usageRecord.cachedPromptTokens += usage.bedrockCacheReadInputTokens;
        usageRecord.promptTokens += usage.bedrockCacheReadInputTokens;
        break;
      }
      case 'toolCallId':
      case 'providerMetadata':
      case 'totalTokens': {
        break;
      }
      default: {
        const exhaustiveCheck: never = k;
        throw new Error(`Unhandled property: ${String(exhaustiveCheck)}`);
      }
    }
  }

  return usageRecord;
}

async function storeDebugPrompt(
  promptCoreMessages: CoreMessage[],
  chatInitialId: string,
  responseCoreMessages: CoreMessage[],
  result: Omit<StepResult<any>, 'stepType' | 'isContinued'>,
  generation: { usage: LanguageModelUsage; providerMetadata?: ProviderMetadata },
  modelProvider: ModelProvider,
) {
  try {
    const finishReason = result.finishReason;
    const modelId = result.response.modelId || '';
    const usage = usageFromGeneration(generation);

    const promptMessageData = new TextEncoder().encode(JSON.stringify(promptCoreMessages));
    const compressedData = compressWithLz4Server(promptMessageData);

    type Metadata = Omit<(typeof internal.debugPrompt.storeDebugPrompt)['_args'], 'promptCoreMessagesStorageId'>;
    const { chefTokens } = calculateChefTokens(usage, modelProvider);

    const metadata = {
      chatInitialId,
      responseCoreMessages,
      finishReason,
      modelId,
      usage: buildUsageRecord(usage),
      chefTokens,
    } satisfies Metadata;

    const formData = new FormData();
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('promptCoreMessages', new Blob([compressedData]));

    const response = await fetch(`${getConvexSiteUrl()}/upload_debug_prompt`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      const message = `Failed to store debug prompt: ${response.status} ${text}`;
      console.error(message);
      captureMessage(message);
    }
  } catch (error) {
    console.error(error);
    captureException(error);
  }
}

function normalizeUsage(usage: number) {
  return Number.isNaN(usage) ? 0 : usage;
}
