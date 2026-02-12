import type { LLMAdapter } from '../llm/adapter.js';
import type { SessionManager } from '../session/manager.js';

export interface SingleTurnChatLoopInput {
  session: SessionManager;
  adapter: LLMAdapter;
  userInput: string;
}

export async function runSingleTurnChatLoop({
  session,
  adapter,
  userInput
}: SingleTurnChatLoopInput): Promise<string> {
  session.addUserMessage(userInput);

  let assistantText = '';
  for await (const chunk of adapter.chat(session.getMessages())) {
    assistantText += chunk.text;
  }

  session.addAssistantMessage(assistantText);
  return assistantText;
}
