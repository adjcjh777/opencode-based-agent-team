import type { LLMAdapter } from '../llm/adapter.js';
import type { SessionManager } from '../session/manager.js';
import type { Logger } from './logger.js';
import { withRetry } from './retry.js';

export interface SingleTurnChatLoopInput {
  session: SessionManager;
  adapter: LLMAdapter;
  userInput: string;
  retries?: number;
  logger?: Logger;
}

export async function runSingleTurnChatLoop({
  session,
  adapter,
  userInput,
  retries = 0,
  logger
}: SingleTurnChatLoopInput): Promise<string> {
  session.addUserMessage(userInput);

  const assistantText = await withRetry(
    async () => {
      let text = '';
      for await (const chunk of adapter.chat(session.getMessages())) {
        text += chunk.text;
      }

      return text;
    },
    {
      retries,
      onRetry: ({ attempt, error }) => {
        logger?.warn('Retrying chat loop', {
          attempt,
          reason: error instanceof Error ? error.message : String(error)
        });
      }
    }
  );

  session.addAssistantMessage(assistantText);
  return assistantText;
}
