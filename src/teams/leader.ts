import type { Task } from './types.js';

export class Leader {
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  async planTasks(request: string): Promise<Task[]> {
    const lines = request
      .split(/\r?\n/g)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return lines.map((title, index) => ({
      id: `${this.id}-task-${index + 1}`,
      title,
      description: '',
      status: 'pending'
    }));
  }

  summarize(tasks: Task[]): string {
    return tasks
      .filter((task) => task.status === 'completed')
      .map((task) => `${task.title}: ${task.result ?? 'No result'}`)
      .join('\n');
  }
}
