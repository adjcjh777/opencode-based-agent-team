import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface LoadAgentPromptOptions {
  projectRoot?: string;
}

export async function loadAgentPrompt(
  agentId: string,
  options: LoadAgentPromptOptions = {}
): Promise<string | undefined> {
  const projectRoot = options.projectRoot ?? process.cwd();
  const filePath = join(projectRoot, 'agents', `${agentId}.md`);

  try {
    const content = await readFile(filePath, 'utf8');
    return content.trim();
  } catch {
    return undefined;
  }
}
