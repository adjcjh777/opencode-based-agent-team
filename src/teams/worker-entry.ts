import type { Task } from './types.js';

export type WorkerMessage =
  | {
      type: 'assign-task';
      task: Task;
      context: string;
    }
  | {
      type: 'message';
      to: string;
      content: string;
    }
  | {
      type: 'shutdown';
    };

export interface WorkerTeammate {
  receiveTask(task: Task, context: string): Promise<void>;
  executeTask(): Promise<Task>;
  sendMessage(to: string, content: string): Promise<void>;
  cleanup(): Promise<void>;
}

export interface WorkerPort {
  postMessage(message: unknown): void;
}

export function createWorkerMessageHandler(teammate: WorkerTeammate, workerPort: WorkerPort) {
  return async function handleMessage(message: WorkerMessage): Promise<void> {
    switch (message.type) {
      case 'assign-task': {
        await teammate.receiveTask(message.task, message.context);
        const task = await teammate.executeTask();
        workerPort.postMessage({ type: 'task-complete', task });
        break;
      }
      case 'message': {
        await teammate.sendMessage(message.to, message.content);
        break;
      }
      case 'shutdown': {
        await teammate.cleanup();
        workerPort.postMessage({ type: 'shutdown-complete' });
        break;
      }
    }
  };
}
