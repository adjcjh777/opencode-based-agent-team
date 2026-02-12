import type { UiMessage } from '../types.js';

export interface SessionState {
  messages: UiMessage[];
}

export function createSessionState(messages: UiMessage[] = []): SessionState {
  return { messages: [...messages] };
}

export function pushMessage(state: SessionState, message: UiMessage): SessionState {
  return {
    ...state,
    messages: [...state.messages, message]
  };
}
