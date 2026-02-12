import { describe, expect, it } from 'vitest';

import { MessageBus } from '../../../src/teams/message-bus.js';
import { Teammate } from '../../../src/teams/teammate.js';
import type { Task, TeammateConfig } from '../../../src/teams/types.js';

const teammateConfig: TeammateConfig = {
  id: 'worker-1',
  name: 'security-reviewer',
  role: 'security checks',
  prompt: 'security prompt'
};

function createTask(id: string, title: string): Task {
  return {
    id,
    title,
    description: '',
    status: 'pending'
  };
}

describe('Teammate', () => {
  it('receives and executes task to completion', async () => {
    const teammate = new Teammate(teammateConfig, {
      executeTask: async () => 'analysis complete'
    });

    await teammate.receiveTask(createTask('t1', 'Review auth module'), 'focus on dependencies');
    const result = await teammate.executeTask();

    expect(result).toMatchObject({
      id: 't1',
      status: 'completed',
      result: 'analysis complete',
      assignee: 'worker-1'
    });
  });

  it('sends teammate message through message bus', async () => {
    const bus = new MessageBus();
    bus.registerMember('leader-1');

    const teammate = new Teammate(teammateConfig, { messageBus: bus, now: () => 123 });

    await teammate.sendMessage('leader-1', 'Task is in progress');

    expect(bus.readInbox('leader-1')).toEqual([
      {
        id: 'worker-1-123',
        from: 'worker-1',
        to: 'leader-1',
        content: 'Task is in progress',
        timestamp: 123,
        type: 'message'
      }
    ]);
  });

  it('claims first pending unassigned task', async () => {
    const teammate = new Teammate(teammateConfig);
    const tasks: Task[] = [
      { ...createTask('t1', 'Task A'), assignee: 'someone', status: 'assigned' },
      createTask('t2', 'Task B'),
      createTask('t3', 'Task C')
    ];

    const claimed = await teammate.claimNextTask(tasks);

    expect(claimed).toMatchObject({ id: 't2', assignee: 'worker-1', status: 'assigned' });
  });
});
