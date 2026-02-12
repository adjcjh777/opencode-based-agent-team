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
});
