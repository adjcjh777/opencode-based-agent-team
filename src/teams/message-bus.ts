import type { TeamMessage } from './types.js';

export class MessageBus {
  private readonly members = new Set<string>();
  private readonly inbox = new Map<string, TeamMessage[]>();

  registerMember(memberId: string): void {
    this.members.add(memberId);
    if (!this.inbox.has(memberId)) {
      this.inbox.set(memberId, []);
    }
  }

  send(message: TeamMessage): void {
    if (message.to === 'broadcast') {
      for (const memberId of this.members) {
        if (memberId === message.from) {
          continue;
        }

        this.inbox.get(memberId)?.push({ ...message });
      }
      return;
    }

    this.inbox.get(message.to)?.push({ ...message });
  }

  readInbox(memberId: string): TeamMessage[] {
    return [...(this.inbox.get(memberId) ?? [])];
  }
}
