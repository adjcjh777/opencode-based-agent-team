import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { loadSkillFile, loadSkillsFromDirectory } from '../../../src/skills/loader.js';

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'codexagent-skills-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('skill loader', () => {
  it('loads markdown skill with frontmatter and prompt body', async () => {
    const dir = await createTempDir();
    const path = join(dir, 'code-review.md');

    await writeFile(
      path,
      [
        '---',
        'name: code-review',
        'description: Review code quality',
        'trigger: review',
        '---',
        'You are a review specialist.'
      ].join('\n')
    );

    const skill = await loadSkillFile(path);

    expect(skill.name).toBe('code-review');
    expect(skill.description).toBe('Review code quality');
    expect(skill.trigger).toBe('review');
    expect(skill.prompt).toBe('You are a review specialist.');
  });

  it('loads all markdown skills sorted by filename', async () => {
    const dir = await createTempDir();

    await writeFile(
      join(dir, 'b-skill.md'),
      ['---', 'name: b-skill', 'description: B', '---', 'B prompt'].join('\n')
    );

    await writeFile(
      join(dir, 'a-skill.md'),
      ['---', 'name: a-skill', 'description: A', '---', 'A prompt'].join('\n')
    );

    const skills = await loadSkillsFromDirectory(dir);

    expect(skills.map((skill) => skill.name)).toEqual(['a-skill', 'b-skill']);
  });
});
