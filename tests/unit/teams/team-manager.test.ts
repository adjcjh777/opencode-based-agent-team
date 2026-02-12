import { describe, expect, it } from 'vitest';

import { TeamManager } from '../../../src/teams/team-manager.js';
import type { TeamConfig } from '../../../src/teams/types.js';

const config: TeamConfig = {
  name: 'review-team',
  leader: 'leader-1',
  members: [
    {
      id: 'worker-1',
      name: 'security-reviewer',
      role: 'security checks',
      prompt: 'security prompt'
    },
    {
      id: 'worker-2',
      name: 'perf-reviewer',
      role: 'performance checks',
      prompt: 'performance prompt'
    }
  ],
  displayMode: 'in-process'
};

describe('TeamManager', () => {
  it('spawns members and marks status', async () => {
    const manager = new TeamManager(config);

    await manager.spawn();

    expect(manager.getMemberStatus('worker-1')).toBe('idle');
    expect(manager.getMemberStatus('worker-2')).toBe('idle');
  });

  it('assigns planned tasks to idle teammates', async () => {
    const manager = new TeamManager(config);
    await manager.spawn();

    await manager.planAndAssign('Task A\nTask B');

    const tasks = manager.listTasks();
    expect(tasks.length).toBe(2);
    expect(tasks.every((task) => task.assignee)).toBe(true);
    expect(tasks.every((task) => task.status === 'assigned')).toBe(true);
    expect(manager.getMemberStatus('worker-1')).toBe('busy');
    expect(manager.getMemberStatus('worker-2')).toBe('busy');
  });

  it('completes assigned task and updates member state to idle', async () => {
    const manager = new TeamManager(config);
    await manager.spawn();
    await manager.planAndAssign('Task A');

    const [task] = manager.listTasks();
    await manager.completeTask(task.id, 'done');

    expect(manager.getTask(task.id)?.status).toBe('completed');
    expect(manager.getTask(task.id)?.result).toBe('done');
    expect(manager.getMemberStatus(task.assignee ?? '')).toBe('idle');
  });

  it('reports member state summary and supports shutdown lifecycle', async () => {
    const manager = new TeamManager(config);
    await manager.spawn();
    await manager.planAndAssign('Task A');

    expect(manager.monitor()).toMatchObject({
      idle: 1,
      busy: 1,
      offline: 0,
      total: 2
    });

    await manager.shutdown();

    expect(manager.getMemberStatus('worker-1')).toBe('offline');
    expect(manager.getMemberStatus('worker-2')).toBe('offline');
    expect(manager.monitor()).toMatchObject({
      idle: 0,
      busy: 0,
      offline: 2,
      total: 2
    });
  });

  it('cycles selected teammate and sends direct message', async () => {
    const manager = new TeamManager(config);
    await manager.spawn();

    expect(manager.getSelectedTeammate()).toBe('worker-1');

    manager.selectNextTeammate();
    expect(manager.getSelectedTeammate()).toBe('worker-2');

    await manager.sendDirectMessage('Please review latest diff');

    expect(manager.readInbox('worker-2')).toEqual([
      {
        id: 'leader-1-1',
        from: 'leader-1',
        to: 'worker-2',
        content: 'Please review latest diff',
        timestamp: 1,
        type: 'message'
      }
    ]);
  });
});
