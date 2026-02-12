import type { UiMessage } from './types.js';

export function formatChatLines(messages: UiMessage[]): string[] {
  return messages.map((message) => `${message.role === 'user' ? 'You' : 'Assistant'}: ${message.content}`);
}

export function formatInputLine(value: string): string {
  return `> ${value}`;
}

export interface ToolbarState {
  activeSkill?: string;
  shortcuts: string[];
}

export function formatToolbarLine({ activeSkill, shortcuts }: ToolbarState): string {
  const skill = activeSkill ? `Skill: ${activeSkill}` : 'Skill: none';
  const shortcutText = shortcuts.join(' | ');
  return `${skill} | ${shortcutText}`;
}

export function formatAgentSwitcherLine(agents: string[], activeAgent: string): string {
  return agents.map((agent) => (agent === activeAgent ? `${agent}*` : agent)).join('  ');
}
