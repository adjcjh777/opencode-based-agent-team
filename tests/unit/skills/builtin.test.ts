import { describe, expect, it } from 'vitest';

import { createBuiltinSkills } from '../../../src/skills/builtin.js';

describe('createBuiltinSkills', () => {
  it('includes code-review, refactor and debug skills', () => {
    const skills = createBuiltinSkills();

    expect(skills.map((skill) => skill.name)).toEqual(['code-review', 'refactor', 'debug']);
  });

  it('provides non-empty prompts for all builtins', () => {
    const skills = createBuiltinSkills();

    for (const skill of skills) {
      expect(skill.prompt.trim().length).toBeGreaterThan(0);
      expect(skill.description.trim().length).toBeGreaterThan(0);
    }
  });
});
