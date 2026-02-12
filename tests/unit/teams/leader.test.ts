import { describe, expect, it } from 'vitest';

import { Leader } from '../../../src/teams/leader.js';

describe('Leader', () => {
  it('plans tasks by splitting multiline request', async () => {
    const leader = new Leader('leader-1');

    const tasks = await leader.planTasks('Review auth module\nAnalyze performance\nCheck test coverage');

    expect(tasks.map((task) => task.title)).toEqual([
      'Review auth module',
      'Analyze performance',
      'Check test coverage'
    ]);
    expect(tasks.every((task) => task.status === 'pending')).toBe(true);
  });

  it('summarizes completed tasks into report text', () => {
    const leader = new Leader('leader-1');

    const summary = leader.summarize([
      {
        id: 't1',
        title: 'Review auth module',
        description: '',
        status: 'completed',
        result: 'No critical issues'
      },
      {
        id: 't2',
        title: 'Analyze performance',
        description: '',
        status: 'completed',
        result: 'Found one hotspot'
      }
    ]);

    expect(summary).toContain('Review auth module: No critical issues');
    expect(summary).toContain('Analyze performance: Found one hotspot');
  });
});
