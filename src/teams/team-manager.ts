import { Leader } from './leader.js';
import { TaskBoard } from './task-board.js';
import type { Task, TeamConfig } from './types.js';

type MemberStatus = 'idle' | 'busy';

export class TeamManager {
  private readonly leader: Leader;
  private readonly taskBoard = new TaskBoard();
  private readonly memberStatus = new Map<string, MemberStatus>();

  constructor(private readonly config: TeamConfig) {
    this.leader = new Leader(config.leader);
  }

  async spawn(): Promise<void> {
    for (const member of this.config.members) {
      this.memberStatus.set(member.id, 'idle');
    }
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

  private pickIdleMember(): string | undefined {
    return this.config.members.find((member) => this.memberStatus.get(member.id) === 'idle')?.id;
  }
}
