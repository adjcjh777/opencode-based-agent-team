import type { SessionMessage, SessionOptions } from './types.js';

export class SessionManager {
  private readonly messages: SessionMessage[] = [];
  private readonly activeAgent: string;

  constructor(options: SessionOptions = {}) {
    this.activeAgent = options.activeAgent ?? 'build';
  }

  addUserMessage(content: string): void {
    this.messages.push({ role: 'user', content });
  }

  addAssistantMessage(content: string): void {
    this.messages.push({ role: 'assistant', content });
  }

  getMessages(): SessionMessage[] {
    return [...this.messages];
  }

  getActiveAgent(): string {
    return this.activeAgent;
  }
}
