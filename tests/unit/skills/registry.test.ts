import { describe, expect, it } from 'vitest';

import { SkillRegistry } from '../../../src/skills/registry.js';
import type { SkillConfig } from '../../../src/skills/types.js';

const reviewSkill: SkillConfig = {
  name: 'code-review',
  description: 'Review code quality',
  prompt: 'Review prompt',
  trigger: 'review'
};

const debugSkill: SkillConfig = {
  name: 'debug',
  description: 'Debug issues',
  prompt: 'Debug prompt'
};

describe('SkillRegistry', () => {
  it('registers and resolves skills by name', () => {
    const registry = new SkillRegistry();

    registry.register(reviewSkill);

    expect(registry.getByName('code-review')?.description).toBe('Review code quality');
    expect(registry.getByName('missing')).toBeUndefined();
  });

  it('finds matching skills by trigger keyword', () => {
    const registry = new SkillRegistry();
    registry.register(reviewSkill);
    registry.register(debugSkill);

    const matched = registry.findByTrigger('please review this patch');

    expect(matched.map((item) => item.name)).toEqual(['code-review']);
  });

  it('rejects duplicate skill names', () => {
    const registry = new SkillRegistry();
    registry.register(reviewSkill);

    expect(() => registry.register(reviewSkill)).toThrow('Skill already registered: code-review');
  });
});
