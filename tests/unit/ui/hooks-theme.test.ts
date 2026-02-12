import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME } from '../../../src/ui/theme.js';
import { createAgentState, setActiveAgent } from '../../../src/ui/hooks/useAgent.js';
import { createSessionState, pushMessage } from '../../../src/ui/hooks/useSession.js';
import { createSkillState, setActiveSkill } from '../../../src/ui/hooks/useSkills.js';
import { createTeamState, selectNextTeammate, selectPreviousTeammate } from '../../../src/ui/hooks/useTeam.js';

describe('ui hooks and theme', () => {
  it('exposes default theme colors', () => {
    expect(DEFAULT_THEME.brand).toBe('cyan');
    expect(DEFAULT_THEME.accent).toBe('green');
    expect(DEFAULT_THEME.muted).toBe('gray');
  });

  it('updates active agent state', () => {
    const state = createAgentState(['build', 'plan'], 'build');
    const next = setActiveAgent(state, 'plan');

    expect(next.activeAgent).toBe('plan');
    expect(next.agents).toEqual(['build', 'plan']);
  });

  it('pushes session messages', () => {
    const state = createSessionState();
    const next = pushMessage(state, { role: 'user', content: 'hello' });

    expect(next.messages).toEqual([{ role: 'user', content: 'hello' }]);
  });

  it('tracks active skill', () => {
    const state = createSkillState(['debug', 'refactor'], 'debug');
    const next = setActiveSkill(state, 'refactor');

    expect(next.activeSkill).toBe('refactor');
  });

  it('cycles teammate selection forward and backward', () => {
    const state = createTeamState('team-a', ['worker-1', 'worker-2', 'worker-3'], 'worker-1');
    const next = selectNextTeammate(state);
    const previous = selectPreviousTeammate(next);

    expect(next.selectedTeammate).toBe('worker-2');
    expect(previous.selectedTeammate).toBe('worker-1');
  });
});
