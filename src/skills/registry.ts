import type { SkillConfig } from './types.js';

export class SkillRegistry {
  private readonly skills = new Map<string, SkillConfig>();

  register(skill: SkillConfig): void {
    if (this.skills.has(skill.name)) {
      throw new Error(`Skill already registered: ${skill.name}`);
    }

    this.skills.set(skill.name, skill);
  }

  upsert(skill: SkillConfig): void {
    this.skills.set(skill.name, skill);
  }

  clear(): void {
    this.skills.clear();
  }

  list(): SkillConfig[] {
    return [...this.skills.values()];
  }

  getByName(name: string): SkillConfig | undefined {
    return this.skills.get(name);
  }

  findByTrigger(input: string): SkillConfig[] {
    const normalized = input.toLowerCase();

    return [...this.skills.values()].filter((skill) => {
      if (!skill.trigger) {
        return false;
      }

      return normalized.includes(skill.trigger.toLowerCase());
    });
  }
}
