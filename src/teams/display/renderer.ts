import type { TeamDisplayState } from './in-process.js';

export function renderTeamDisplay(state: TeamDisplayState): string[] {
  const lines = [
    `Team: ${state.teamName}`,
    `Leader: ${state.leaderId}`,
    'Members:'
  ];

  for (const member of state.members) {
    lines.push(`- ${member.name} (${member.id}): ${member.status}`);
  }

  lines.push('Tasks:');

  for (const task of state.tasks) {
    const assignee = task.assignee ? ` @${task.assignee}` : '';
    lines.push(`- [${task.status}] ${task.title}${assignee}`);
  }

  return lines;
}
