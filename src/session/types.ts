import type { LLMMessage } from '../llm/types.js';

export interface SessionOptions {
  activeAgent?: string;
}

export type SessionMessage = LLMMessage;
