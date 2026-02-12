import { describe, expect, it } from 'vitest';

import { formatPermissionLine } from '../../../src/ui/panels/permission.js';
import { formatSkillPanelLine } from '../../../src/ui/panels/skills.js';
import { formatTaskListLines } from '../../../src/ui/panels/task-list.js';
import { formatTeammateViewLines } from '../../../src/ui/panels/teammate-view.js';
import { formatTeamPanelLines } from '../../../src/ui/panels/team-panel.js';

describe('ui panels', () => {
  it('formats team panel lines', () => {
    expect(formatTeamPanelLines(['Team: review-team', 'Leader: leader-1'])).toEqual([
      '=== Team Panel ===',
      'Team: review-team',
      'Leader: leader-1'
    ]);
  });

  it('formats task list lines', () => {
    expect(formatTaskListLines(['[assigned] Task A', '[completed] Task B'])).toEqual([
      '=== Tasks ===',
      '[assigned] Task A',
      '[completed] Task B'
    ]);
  });

  it('formats teammate view lines with selected teammate', () => {
    expect(formatTeammateViewLines('worker-2', ['status: busy'])).toEqual([
      '=== Teammate ===',
      'Selected: worker-2',
      'status: busy'
    ]);
  });

  it('formats skill panel line', () => {
    expect(formatSkillPanelLine(['debug', 'refactor'], 'debug')).toBe('Skills: debug* | refactor');
  });

  it('formats permission line', () => {
    expect(formatPermissionLine({ tool: 'bash', decision: 'ask' })).toBe('Permission: ask for tool bash');
  });
});
