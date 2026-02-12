import type { SkillConfig } from './types.js';

export function createBuiltinSkills(): SkillConfig[] {
  return [
    {
      name: 'code-review',
      description: 'Professional code review with security and maintainability focus',
      trigger: 'review',
      prompt:
        'Review code with severity levels and focus on security, performance, maintainability, and test coverage.'
    },
    {
      name: 'refactor',
      description: 'Refactor code while preserving behavior',
      trigger: 'refactor',
      prompt:
        'Refactor code incrementally, preserve behavior, reduce complexity, and keep tests passing.'
    },
    {
      name: 'debug',
      description: 'Systematic debugging for failures and unexpected behavior',
      trigger: 'debug',
      prompt:
        'Diagnose root cause before fixes, collect evidence, validate hypotheses, and confirm resolution with tests.'
    }
  ];
}
