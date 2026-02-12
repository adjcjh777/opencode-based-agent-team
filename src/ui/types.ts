export interface UiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AppProps {
  activeAgent: string;
  messages: UiMessage[];
  teamDisplayLines?: string[];
}
