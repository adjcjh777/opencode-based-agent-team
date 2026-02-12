import type { LLMAdapter } from '../llm/adapter.js';
import type { Logger } from './logger.js';
import { runSingleTurnChatLoop } from './chat-loop.js';
import { SessionManager } from '../session/manager.js';

export interface CoreEngineOptions {
  adapter: LLMAdapter;
  session?: SessionManager;
  retries?: number;
  logger?: Logger;
}

export interface CoreEngineTurnResult {
  assistant: string;
  messages: ReturnType<SessionManager['getMessages']>;
}

export class CoreEngine {
  private readonly session: SessionManager;

  constructor(private readonly options: CoreEngineOptions) {
    this.session = options.session ?? new SessionManager();
  }

  getSession(): SessionManager {
    return this.session;
  }

  async runTurn(userInput: string): Promise<CoreEngineTurnResult> {
    const assistant = await runSingleTurnChatLoop({
      session: this.session,
      adapter: this.options.adapter,
      userInput,
      retries: this.options.retries,
      logger: this.options.logger
    });

    return {
      assistant,
      messages: this.session.getMessages()
    };
  }
}
