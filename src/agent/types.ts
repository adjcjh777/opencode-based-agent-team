export type AgentMode = 'primary' | 'subagent';

export interface ToolPermissions {
  read: boolean;
  write: boolean;
  edit: boolean;
  bash: boolean;
  grep: boolean;
  glob: boolean;
  list: boolean;
  patch: boolean;
  webfetch: boolean;
  websearch: boolean;
  [key: string]: boolean;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  mode: AgentMode;
  model: string;
  prompt: string;
  temperature?: number;
  maxSteps?: number;
  tools: ToolPermissions;
  color?: string;
}
