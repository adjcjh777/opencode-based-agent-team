import { MessageBus } from './message-bus.js';
import type { Task, TeammateConfig } from './types.js';

interface TeammateDeps {
  executeTask?: (task: Task, context: string) => Promise<string>;
  messageBus?: MessageBus;
  now?: () => number;
}

export class Teammate {
  readonly id: string;
  private activeTask: Task | undefined;
  private activeContext = '';
  private readonly executeTaskImpl: (task: Task, context: string) => Promise<string>;
  private readonly messageBus?: MessageBus;
  private readonly now: () => number;

  constructor(
    private readonly config: TeammateConfig,
    deps: TeammateDeps = {}
  ) {
    this.id = config.id;
    this.executeTaskImpl = deps.executeTask ?? (async () => `${config.name} completed task`);
    this.messageBus = deps.messageBus;
    this.now = deps.now ?? (() => Date.now());
  }

  async receiveTask(task: Task, context: string): Promise<void> {
    this.activeTask = {
      ...task,
      assignee: this.id,
      status: 'assigned'
    };
    this.activeContext = context;
  }

  async executeTask(): Promise<Task> {
    if (!this.activeTask) {
      throw new Error(`No active task for teammate: ${this.id}`);
    }

    const task = { ...this.activeTask };
    const result = await this.executeTaskImpl(task, this.activeContext);

    const completedTask: Task = {
      ...task,
      status: 'completed',
      assignee: this.id,
      result
    };

    this.activeTask = completedTask;
    return completedTask;
  }

  async sendMessage(to: string, content: string): Promise<void> {
    this.messageBus?.send({
      id: `${this.id}-${this.now()}`,
      from: this.id,
      to,
      content,
      timestamp: this.now(),
      type: 'message'
    });
  }

  async claimNextTask(tasks: Task[]): Promise<Task | null> {
    const task = tasks.find((item) => item.status === 'pending' && !item.assignee);
    if (!task) {
      return null;
    }

    return {
      ...task,
      assignee: this.id,
      status: 'assigned'
    };
  }
}
