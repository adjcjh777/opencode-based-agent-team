import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

import matter from 'gray-matter';

import type { SkillConfig } from './types.js';

function parseSkillMarkdown(content: string): SkillConfig {
  const parsed = matter(content);
  const data = parsed.data as Record<string, unknown>;

  if (typeof data.name !== 'string' || !data.name.trim()) {
    throw new Error('Skill frontmatter requires a non-empty "name" field.');
  }

  if (typeof data.description !== 'string' || !data.description.trim()) {
    throw new Error('Skill frontmatter requires a non-empty "description" field.');
  }

  return {
    name: data.name,
    description: data.description,
    trigger: typeof data.trigger === 'string' ? data.trigger : undefined,
    scriptPath: typeof data.scriptPath === 'string' ? data.scriptPath : undefined,
    prompt: parsed.content.trim()
  };
}

export async function loadSkillFile(filePath: string): Promise<SkillConfig> {
  const extension = extname(filePath).toLowerCase();
  if (extension !== '.md') {
    throw new Error(`Unsupported skill file extension: ${extension}`);
  }

  const content = await readFile(filePath, 'utf8');
  return parseSkillMarkdown(content);
}

export async function loadSkillsFromDirectory(directoryPath: string): Promise<SkillConfig[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => extname(name).toLowerCase() === '.md')
    .sort((a, b) => a.localeCompare(b));

  const result: SkillConfig[] = [];
  for (const file of files) {
    result.push(await loadSkillFile(join(directoryPath, file)));
  }

  return result;
}
