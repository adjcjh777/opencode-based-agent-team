import type { Task, TeamConfig } from '../types.js';

export type DisplayMemberStatus = 'idle' | 'busy' | 'offline';

export interface TeamDisplayMember {
  id: string;
  name: string;
  status: DisplayMemberStatus;
}

export interface TeamDisplayState {
  teamName: string;
  leaderId: string;
  members: TeamDisplayMember[];
  tasks: Task[];
}

export function createInProcessDisplayState(config: TeamConfig): TeamDisplayState {
  return {
    teamName: config.name,
    leaderId: config.leader,
    members: config.members.map((member) => ({
      id: member.id,
      name: member.name,
      status: 'idle'
    })),
    tasks: []
  };
}
