import type { LLMAdapter } from '../llm/adapter.js';
import type { Logger } from './logger.js';
import { runSingleTurnChatLoop } from './chat-loop.js';
import { SessionManager } from '../session/manager.js';

export interface CoreEngineOptions {
  adapter: LLMAdapter;
  session?: SessionManager;
  retries?: number;
  logger?: Logger;
  systemPrompt?: string;
}

export interface CoreEngineTurnResult {
  assistant: string;
  messages: ReturnType<SessionManager['getMessages']>;
}

export class CoreEngine {
  private readonly session: SessionManager;
  private initialized = false;

  constructor(private readonly options: CoreEngineOptions) {
    this.session = options.session ?? new SessionManager();
  }

  getSession(): SessionManager {
    return this.session;
  }

  async runTurn(userInput: string): Promise<CoreEngineTurnResult> {
    if (!this.initialized && this.options.systemPrompt) {
      this.session.addSystemMessage(this.options.systemPrompt);
    }

    this.initialized = true;

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
