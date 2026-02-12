import { describe, expect, it } from 'vitest';

import { SkillExecutor } from '../../../src/skills/executor.js';
import type { SkillConfig } from '../../../src/skills/types.js';

describe('SkillExecutor', () => {
  it('injects skill prompt into base agent prompt context', async () => {
    const executor = new SkillExecutor();

    const skill: SkillConfig = {
      name: 'code-review',
      description: 'Review code',
      prompt: 'Review with security and performance focus.'
    };

    const mergedPrompt = await executor.activate(skill, 'Base agent prompt');

    expect(mergedPrompt).toContain('Base agent prompt');
    expect(mergedPrompt).toContain('Skill: code-review');
    expect(mergedPrompt).toContain('Review with security and performance focus.');
  });
});
