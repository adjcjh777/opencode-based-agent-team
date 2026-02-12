import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';

import { createBuiltinSkills } from './builtin.js';
import { SkillExecutor } from './executor.js';
import { loadSkillsFromDirectory } from './loader.js';
import { SkillRegistry } from './registry.js';
import type { SkillConfig } from './types.js';

export interface SkillManagerOptions {
  projectRoot: string;
  codexHome: string;
}

export interface ActivateSkillResult {
  prompt: string;
  activeSkills: SkillConfig[];
}

async function directoryExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export class SkillManager {
  private readonly registry = new SkillRegistry();
  private readonly executor = new SkillExecutor();
  private loaded = false;

  constructor(private readonly options: SkillManagerOptions) {}

  private async loadFromDirectory(directoryPath: string): Promise<SkillConfig[]> {
    if (!(await directoryExists(directoryPath))) {
      return [];
    }

    return loadSkillsFromDirectory(directoryPath);
  }

  async loadAll(): Promise<SkillConfig[]> {
    this.registry.clear();

    const builtinSkills = createBuiltinSkills();
    const globalSkills = await this.loadFromDirectory(join(this.options.codexHome, 'skills'));
    const projectSkills = await this.loadFromDirectory(join(this.options.projectRoot, '.codex', 'skills'));

    for (const skill of [...builtinSkills, ...globalSkills, ...projectSkills]) {
      this.registry.upsert(skill);
    }

    this.loaded = true;
    return this.registry.list();
  }

  async activateForInput(input: string, basePrompt: string): Promise<ActivateSkillResult> {
    if (!this.loaded) {
      await this.loadAll();
    }

    const matched = this.registry.findByTrigger(input);
    let prompt = basePrompt;

    for (const skill of matched) {
      prompt = await this.executor.activate(skill, prompt);
    }

    return {
      prompt,
      activeSkills: matched
    };
  }
}
