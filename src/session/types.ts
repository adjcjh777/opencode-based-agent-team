import type { LLMMessage } from '../llm/types.js';

export interface SessionOptions {
  id?: string;
  activeAgent?: string;
  now?: () => number;
}

export type SessionMessage = LLMMessage;

export interface SessionSnapshot {
  id: string;
  activeAgent: string;
  createdAt: number;
  updatedAt: number;
  messages: SessionMessage[];
}

export interface SessionStore {
  save(snapshot: SessionSnapshot): void;
  load(id: string): SessionSnapshot | undefined;
  list(limit?: number): SessionSnapshot[];
}
