import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { SkillManager } from '../../../src/skills/manager.js';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'codexagent-skills-manager-test-'));
  tempDirs.push(dir);
  return dir;
}

async function writeSkillFile(directoryPath: string, fileName: string, body: string): Promise<void> {
  await mkdir(directoryPath, { recursive: true });
  await writeFile(join(directoryPath, fileName), body);
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('SkillManager', () => {
  it('loads builtins + global + project skills with project override precedence', async () => {
    const projectRoot = await createTempDir();
    const codexHome = await createTempDir();

    await writeSkillFile(
      join(codexHome, 'skills'),
      'review.md',
      ['---', 'name: review', 'description: global', 'trigger: review', '---', 'global prompt'].join('\n')
    );

    await writeSkillFile(
      join(projectRoot, '.codex', 'skills'),
      'review.md',
      ['---', 'name: review', 'description: project', 'trigger: review', '---', 'project prompt'].join('\n')
    );

    await writeSkillFile(
      join(projectRoot, '.codex', 'skills'),
      'project-debug.md',
      ['---', 'name: project-debug', 'description: project debug', 'trigger: debug', '---', 'debug prompt'].join('\n')
    );

    const manager = new SkillManager({ projectRoot, codexHome });
    const skills = await manager.loadAll();

    expect(skills.some((skill) => skill.name === 'code-review')).toBe(true);
    expect(skills.some((skill) => skill.name === 'project-debug')).toBe(true);
    expect(skills.find((skill) => skill.name === 'review')?.prompt).toBe('project prompt');
  });

  it('activates matching skills and merges prompt context', async () => {
    const projectRoot = await createTempDir();

    await writeSkillFile(
      join(projectRoot, '.codex', 'skills'),
      'review.md',
      [
        '---',
        'name: review',
        'description: project review',
        'trigger: review',
        '---',
        'Review changed files with risk levels.'
      ].join('\n')
    );

    const manager = new SkillManager({ projectRoot, codexHome: await createTempDir() });
    const result = await manager.activateForInput('please review this patch', 'Base prompt');

    expect(result.activeSkills.map((skill) => skill.name)).toContain('review');
    expect(result.prompt).toContain('Base prompt');
    expect(result.prompt).toContain('Skill: review');
    expect(result.prompt).toContain('Review changed files with risk levels.');
  });
});
