import { describe, expect, it } from 'vitest';

import { renderTeamDisplay } from '../../../src/teams/display/renderer.js';
import { createInProcessDisplayState } from '../../../src/teams/display/in-process.js';
import type { Task, TeamConfig } from '../../../src/teams/types.js';

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

function createTask(id: string, title: string): Task {
  return {
    id,
    title,
    description: '',
    status: 'pending'
  };
}

describe('team display', () => {
  it('creates in-process display state from team config', () => {
    const state = createInProcessDisplayState(config);

    expect(state).toEqual({
      teamName: 'review-team',
      leaderId: 'leader-1',
      members: [
        { id: 'worker-1', name: 'security-reviewer', status: 'idle' },
        { id: 'worker-2', name: 'perf-reviewer', status: 'idle' }
      ],
      tasks: []
    });
  });

  it('renders team state lines with members and tasks', () => {
    const lines = renderTeamDisplay({
      teamName: 'review-team',
      leaderId: 'leader-1',
      members: [
        { id: 'worker-1', name: 'security-reviewer', status: 'busy' },
        { id: 'worker-2', name: 'perf-reviewer', status: 'idle' }
      ],
      tasks: [
        {
          ...createTask('t1', 'Review auth module'),
          assignee: 'worker-1',
          status: 'assigned'
        }
      ]
    });

    expect(lines).toContain('Team: review-team');
    expect(lines).toContain('Leader: leader-1');
    expect(lines).toContain('- security-reviewer (worker-1): busy');
    expect(lines).toContain('- perf-reviewer (worker-2): idle');
    expect(lines).toContain('- [assigned] Review auth module @worker-1');
  });
});
