import { Leader } from './leader.js';
import { MessageBus } from './message-bus.js';
import { TaskBoard } from './task-board.js';
import type { Task, TeamConfig, TeamMessage } from './types.js';

type MemberStatus = 'idle' | 'busy' | 'offline';

interface TeamMonitorState {
  idle: number;
  busy: number;
  offline: number;
  total: number;
}

export class TeamManager {
  private readonly leader: Leader;
  private readonly taskBoard = new TaskBoard();
  private readonly messageBus = new MessageBus();
  private readonly memberStatus = new Map<string, MemberStatus>();
  private selectedMemberIndex = 0;
  private messageCounter = 0;

  constructor(private readonly config: TeamConfig) {
    this.leader = new Leader(config.leader);
    this.messageBus.registerMember(config.leader);
  }

  async spawn(): Promise<void> {
    for (const member of this.config.members) {
      this.memberStatus.set(member.id, 'idle');
      this.messageBus.registerMember(member.id);
    }

    this.selectedMemberIndex = 0;
  }

  getMemberStatus(memberId: string): MemberStatus | undefined {
    return this.memberStatus.get(memberId);
  }

  async planAndAssign(request: string): Promise<Task[]> {
    const tasks = await this.leader.planTasks(request);

    for (const task of tasks) {
      this.taskBoard.addTask(task);

      const assignee = this.pickIdleMember();
      if (!assignee) {
        continue;
      }

      this.taskBoard.assign(task.id, assignee);
      this.memberStatus.set(assignee, 'busy');
    }

    return this.listTasks();
  }

  listTasks(): Task[] {
    return this.taskBoard.list();
  }

  getTask(taskId: string): Task | undefined {
    return this.taskBoard.get(taskId);
  }

  async completeTask(taskId: string, result: string): Promise<void> {
    const task = this.taskBoard.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    this.taskBoard.updateStatus(taskId, 'completed', result);
    if (task.assignee) {
      this.memberStatus.set(task.assignee, 'idle');
    }
  }

  monitor(): TeamMonitorState {
    const state: TeamMonitorState = {
      idle: 0,
      busy: 0,
      offline: 0,
      total: this.config.members.length
    };

    for (const member of this.config.members) {
      const status = this.memberStatus.get(member.id) ?? 'offline';
      state[status] += 1;
    }

    return state;
  }

  async shutdown(): Promise<void> {
    for (const member of this.config.members) {
      this.memberStatus.set(member.id, 'offline');
    }
  }

  getSelectedTeammate(): string | undefined {
    return this.config.members[this.selectedMemberIndex]?.id;
  }

  selectNextTeammate(): string | undefined {
    if (this.config.members.length === 0) {
      return undefined;
    }

    this.selectedMemberIndex = (this.selectedMemberIndex + 1) % this.config.members.length;
    return this.getSelectedTeammate();
  }

  selectPreviousTeammate(): string | undefined {
    if (this.config.members.length === 0) {
      return undefined;
    }

    this.selectedMemberIndex =
      (this.selectedMemberIndex - 1 + this.config.members.length) % this.config.members.length;
    return this.getSelectedTeammate();
  }

  async sendDirectMessage(content: string): Promise<void> {
    const teammateId = this.getSelectedTeammate();
    if (!teammateId) {
      throw new Error('No teammate selected');
    }

    this.messageCounter += 1;

    const message: TeamMessage = {
      id: `${this.config.leader}-${this.messageCounter}`,
      from: this.config.leader,
      to: teammateId,
      content,
      timestamp: this.messageCounter,
      type: 'message'
    };

    this.messageBus.send(message);
  }

  readInbox(memberId: string): TeamMessage[] {
    return this.messageBus.readInbox(memberId);
  }

  async cleanup(): Promise<void> {
    await this.shutdown();
    this.taskBoard.clear();
  }

  private pickIdleMember(): string | undefined {
    return this.config.members.find((member) => this.memberStatus.get(member.id) === 'idle')?.id;
  }
}
