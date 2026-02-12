import type { Task } from './types.js';

export class TaskBoard {
  private readonly tasks = new Map<string, Task>();

  addTask(task: Task): void {
    if (this.tasks.has(task.id)) {
      throw new Error(`Task already exists: ${task.id}`);
    }

    this.tasks.set(task.id, { ...task });
  }

  get(taskId: string): Task | undefined {
    const task = this.tasks.get(taskId);
    return task ? { ...task } : undefined;
  }

  list(): Task[] {
    return [...this.tasks.values()].map((task) => ({ ...task }));
  }

  assign(taskId: string, assignee: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    task.assignee = assignee;
    task.status = 'assigned';
  }

  updateStatus(taskId: string, status: Task['status'], result?: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    task.status = status;
    if (result !== undefined) {
      task.result = result;
    }
  }
}
