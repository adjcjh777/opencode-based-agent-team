import { describe, expect, it, vi } from 'vitest';

import { createWorkerMessageHandler } from '../../../src/teams/worker-entry.js';
import type { Task } from '../../../src/teams/types.js';

function createTask(id: string, title: string): Task {
  return {
    id,
    title,
    description: '',
    status: 'pending'
  };
}

describe('worker-entry', () => {
  it('handles assign-task and posts task-complete message', async () => {
    const completedTask: Task = {
      ...createTask('t1', 'Review auth module'),
      status: 'completed',
      assignee: 'worker-1',
      result: 'done'
    };

    const teammate = {
      receiveTask: vi.fn(async () => {}),
      executeTask: vi.fn(async () => completedTask),
      sendMessage: vi.fn(async () => {}),
      cleanup: vi.fn(async () => {})
    };
    const worker = {
      postMessage: vi.fn()
    };

    const handleMessage = createWorkerMessageHandler(teammate, worker);
    await handleMessage({
      type: 'assign-task',
      task: createTask('t1', 'Review auth module'),
      context: 'focus on auth flow'
    });

    expect(teammate.receiveTask).toHaveBeenCalledWith(
      createTask('t1', 'Review auth module'),
      'focus on auth flow'
    );
    expect(teammate.executeTask).toHaveBeenCalledTimes(1);
    expect(worker.postMessage).toHaveBeenCalledWith({
      type: 'task-complete',
      task: completedTask
    });
  });

  it('forwards message payload to teammate', async () => {
    const teammate = {
      receiveTask: vi.fn(async () => {}),
      executeTask: vi.fn(async () => createTask('t1', 'Task')),
      sendMessage: vi.fn(async () => {}),
      cleanup: vi.fn(async () => {})
    };
    const worker = {
      postMessage: vi.fn()
    };

    const handleMessage = createWorkerMessageHandler(teammate, worker);
    await handleMessage({
      type: 'message',
      to: 'leader-1',
      content: 'Task in progress'
    });

    expect(teammate.sendMessage).toHaveBeenCalledWith('leader-1', 'Task in progress');
  });

  it('cleans up teammate and confirms shutdown', async () => {
    const teammate = {
      receiveTask: vi.fn(async () => {}),
      executeTask: vi.fn(async () => createTask('t1', 'Task')),
      sendMessage: vi.fn(async () => {}),
      cleanup: vi.fn(async () => {})
    };
    const worker = {
      postMessage: vi.fn()
    };

    const handleMessage = createWorkerMessageHandler(teammate, worker);
    await handleMessage({ type: 'shutdown' });

    expect(teammate.cleanup).toHaveBeenCalledTimes(1);
    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'shutdown-complete' });
  });
});
