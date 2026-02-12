import { randomUUID } from 'node:crypto';

import type { SessionMessage, SessionOptions, SessionSnapshot, SessionStore } from './types.js';

export class SessionManager {
  private readonly id: string;
  private readonly createdAt: number;
  private readonly messages: SessionMessage[] = [];
  private readonly activeAgent: string;
  private readonly now: () => number;
  private readonly store: SessionStore | undefined;

  constructor(options: SessionOptions = {}, store?: SessionStore) {
    this.id = options.id ?? randomUUID();
    this.now = options.now ?? (() => Date.now());
    this.createdAt = this.now();
    this.activeAgent = options.activeAgent ?? 'build';
    this.store = store;
  }

  addUserMessage(content: string): void {
    this.messages.push({ role: 'user', content });
    this.persist();
  }

  addSystemMessage(content: string): void {
    this.messages.push({ role: 'system', content });
    this.persist();
  }

  addAssistantMessage(content: string): void {
    this.messages.push({ role: 'assistant', content });
    this.persist();
  }

  getMessages(): SessionMessage[] {
    return [...this.messages];
  }

  getActiveAgent(): string {
    return this.activeAgent;
  }

  toSnapshot(): SessionSnapshot {
    return {
      id: this.id,
      activeAgent: this.activeAgent,
      createdAt: this.createdAt,
      updatedAt: this.now(),
      messages: this.getMessages()
    };
  }

  private persist(): void {
    this.store?.save(this.toSnapshot());
  }
}
