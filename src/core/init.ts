import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface InitProjectOptions {
  cwd: string;
  force?: boolean;
}

export interface InitProjectResult {
  created: string[];
  skipped: string[];
}

const defaultConfig = {
  provider: {
    type: 'right-codes',
    baseUrl: '${RC_BASE_URL}',
    apiKey: '${RC_API_KEY}',
    defaultModel: 'claude-sonnet-4'
  },
  models: {
    primary: 'claude-sonnet-4',
    fast: 'claude-haiku-4',
    reasoning: 'claude-opus-4'
  },
  tools: {
    permissions: {
      read: 'allow',
      write: 'allow',
      edit: 'allow',
      list: 'allow',
      glob: 'allow',
      grep: 'allow',
      bash: 'ask',
      webfetch: 'allow',
      websearch: 'allow',
      'mcp_*': 'ask'
    }
  }
};

const defaultBuildPrompt = [
  '# Build Agent',
  '',
  'You are the build agent.',
  'Implement requested changes with small, verifiable steps and keep commits atomic.'
].join('\n');

const defaultPlanPrompt = [
  '# Plan Agent',
  '',
  'You are the plan agent.',
  'Propose concise execution plans with clear checkpoints before code changes.'
].join('\n');

const defaultEnvExample = ['RC_API_KEY=your_key_here', 'RC_BASE_URL=https://your-endpoint.right.codes/v1'].join(
  '\n'
);

async function writeFileWithStrategy(
  filePath: string,
  content: string,
  result: InitProjectResult,
  force: boolean
): Promise<void> {
  try {
    await writeFile(filePath, `${content.endsWith('\n') ? content : `${content}\n`}`, {
      encoding: 'utf8',
      flag: force ? 'w' : 'wx'
    });
    result.created.push(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      result.skipped.push(filePath);
      return;
    }

    throw error;
  }
}

export async function initializeProject({ cwd, force = false }: InitProjectOptions): Promise<InitProjectResult> {
  const result: InitProjectResult = { created: [], skipped: [] };

  const agentsDir = join(cwd, 'agents');
  const projectSkillsDir = join(cwd, '.codex', 'skills');
  await mkdir(agentsDir, { recursive: true });
  await mkdir(projectSkillsDir, { recursive: true });

  await writeFileWithStrategy(
    join(cwd, 'codex.config.json'),
    JSON.stringify(defaultConfig, null, 2),
    result,
    force
  );
  await writeFileWithStrategy(join(cwd, '.env.example'), defaultEnvExample, result, force);
  await writeFileWithStrategy(join(agentsDir, 'build.md'), defaultBuildPrompt, result, force);
  await writeFileWithStrategy(join(agentsDir, 'plan.md'), defaultPlanPrompt, result, force);
  await writeFileWithStrategy(join(projectSkillsDir, '.gitkeep'), '', result, force);

  return result;
}

