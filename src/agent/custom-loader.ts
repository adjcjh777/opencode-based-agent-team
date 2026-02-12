import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

import matter from 'gray-matter';
import { z } from 'zod';

import type { AgentConfig } from './types.js';

const toolsSchema = z
  .object({
    read: z.boolean(),
    write: z.boolean(),
    edit: z.boolean(),
    bash: z.boolean(),
    grep: z.boolean(),
    glob: z.boolean(),
    list: z.boolean(),
    patch: z.boolean(),
    webfetch: z.boolean(),
    websearch: z.boolean()
  })
  .catchall(z.boolean());

const agentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  mode: z.union([z.literal('primary'), z.literal('subagent')]),
  model: z.string().min(1),
  prompt: z.string().min(1),
  temperature: z.number().optional(),
  maxSteps: z.number().int().positive().optional(),
  tools: toolsSchema,
  color: z.string().optional()
});

function parseBoolean(raw: unknown): boolean {
  if (typeof raw === 'boolean') {
    return raw;
  }

  if (typeof raw === 'string') {
    if (raw === 'true') return true;
    if (raw === 'false') return false;
  }

  throw new Error(`Invalid boolean value in markdown frontmatter: ${String(raw)}`);
}

function parseMarkdownAgent(content: string): AgentConfig {
  const parsed = matter(content);
  const data = parsed.data as Record<string, unknown>;

  const requiredToolKeys = [
    'read',
    'write',
    'edit',
    'bash',
    'grep',
    'glob',
    'list',
    'patch',
    'webfetch',
    'websearch'
  ] as const;

  const tools: Record<string, boolean> = {};
  for (const key of requiredToolKeys) {
    const toolValue = data[`tools.${key}`];
    tools[key] = parseBoolean(toolValue);
  }

  return agentSchema.parse({
    id: data.id,
    name: data.name,
    description: data.description,
    mode: data.mode,
    model: data.model,
    prompt: parsed.content.trim(),
    tools,
    color: data.color
  });
}

export async function loadAgentFile(filePath: string): Promise<AgentConfig> {
  const ext = extname(filePath).toLowerCase();
  const content = await readFile(filePath, 'utf8');

  if (ext === '.json') {
    return agentSchema.parse(JSON.parse(content));
  }

  if (ext === '.md') {
    return parseMarkdownAgent(content);
  }

  throw new Error(`Unsupported agent file extension: ${ext}`);
}

export async function loadAgentsFromDirectory(directoryPath: string): Promise<AgentConfig[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => ['.json', '.md'].includes(extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const agents: AgentConfig[] = [];
  for (const fileName of files) {
    agents.push(await loadAgentFile(join(directoryPath, fileName)));
  }

  return agents;
}
