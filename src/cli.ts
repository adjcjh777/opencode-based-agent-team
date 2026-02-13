import { Command } from 'commander';
import { join } from 'node:path';

import { loadAgentPrompt } from './agent/prompts.js';
import { loadConfig } from './core/config.js';
import { runDoctor } from './core/doctor.js';
import { CoreEngine } from './core/engine.js';
import { LLMAdapter } from './llm/adapter.js';
import { SessionManager } from './session/manager.js';
import { SkillManager } from './skills/manager.js';
import { createToolRuntime } from './tools/bootstrap.js';

export interface ChatCommandOptions {
  agent: string;
  message?: string;
  systemPrompt?: string;
}

export interface CliDeps {
  runChat?: (options: ChatCommandOptions) => Promise<void>;
  cwd?: string;
  codexHome?: string;
  env?: NodeJS.ProcessEnv;
}

function createConfigCommand(deps: CliDeps): Command {
  const configCommand = new Command('config').description('Inspect configuration and providers');
  const cwd = deps.cwd ?? process.cwd();
  const env = deps.env ?? process.env;

  configCommand
    .command('show')
    .description('Show effective configuration')
    .action(async () => {
      const config = await loadConfig({ cwd, env });
      process.stdout.write(`${JSON.stringify(config, null, 2)}\n`);
    });

  configCommand
    .command('validate')
    .description('Validate effective configuration')
    .action(async () => {
      const config = await loadConfig({ cwd, env });
      const mcpServerCount = config.mcp?.servers?.length ?? 0;
      const permissionCount = Object.keys(config.tools?.permissions ?? {}).length;
      process.stdout.write('Configuration is valid.\n');
      process.stdout.write(`Provider: ${config.provider.type}\n`);
      process.stdout.write(`MCP servers: ${mcpServerCount}\n`);
      process.stdout.write(`Tool permission rules: ${permissionCount}\n`);
    });

  return configCommand;
}

function statusTag(status: 'pass' | 'warn' | 'fail'): string {
  if (status === 'pass') {
    return 'PASS';
  }

  if (status === 'warn') {
    return 'WARN';
  }

  return 'FAIL';
}

function createDoctorCommand(deps: CliDeps): Command {
  return new Command('doctor')
    .description('Run local environment diagnostics')
    .option('--json', 'output machine-readable report')
    .action(async (options: { json?: boolean }) => {
      const cwd = deps.cwd ?? process.cwd();
      const env = deps.env ?? process.env;
      const codexHome = deps.codexHome ?? env.CODEX_HOME ?? join(cwd, '.codex');
      const report = await runDoctor({ cwd, env, codexHome });

      if (options.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      } else {
        process.stdout.write('CodexAgentTeams doctor report\n');
        for (const check of report.checks) {
          process.stdout.write(`[${statusTag(check.status)}] ${check.id}: ${check.message}\n`);
          if (check.detail) {
            process.stdout.write(`  ${check.detail}\n`);
          }
        }
        process.stdout.write(`Overall status: ${report.ok ? 'PASS' : 'FAIL'}\n`);
      }

      if (!report.ok) {
        process.exitCode = 1;
      }
    });
}

async function runChatWithDefaults(options: ChatCommandOptions): Promise<void> {
  process.stdout.write(`Starting chat session with ${options.agent} agent...\n`);

  if (!options.message) {
    return;
  }

  const config = await loadConfig();
  await createToolRuntime(config);
  const adapter = LLMAdapter.create(config);
  const session = new SessionManager({ activeAgent: options.agent });
  const engine = new CoreEngine({ adapter, session, systemPrompt: options.systemPrompt });
  const result = await engine.runTurn(options.message);

  process.stdout.write(`${result.assistant}\n`);
}

async function resolveChatContext(options: ChatCommandOptions, deps: CliDeps): Promise<ChatCommandOptions> {
  const cwd = deps.cwd ?? process.cwd();
  const codexHome = deps.codexHome ?? process.env.CODEX_HOME ?? join(cwd, '.codex');

  let systemPrompt = await loadAgentPrompt(options.agent, { projectRoot: cwd });
  if (!systemPrompt) {
    systemPrompt = `You are ${options.agent} agent.`;
  }

  if (options.message) {
    const skillManager = new SkillManager({ projectRoot: cwd, codexHome });
    const activated = await skillManager.activateForInput(options.message, systemPrompt);
    systemPrompt = activated.prompt;
  }

  return {
    ...options,
    systemPrompt
  };
}

function createChatCommand(deps: CliDeps): Command {
  const runChat = deps.runChat ?? runChatWithDefaults;

  return new Command('chat')
    .description('Start an interactive chat session')
    .option('--agent <name>', 'agent name', 'build')
    .option('--message <text>', 'send one message and exit')
    .action(async (options: ChatCommandOptions) => {
      process.env.CODEXAGENTTEAMS_UI = '1';
      const chatContext = await resolveChatContext({ agent: options.agent, message: options.message }, deps);
      await runChat(chatContext);
    });
}

export function createCli(deps: CliDeps = {}): Command {
  const program = new Command();

  program
    .name('codexagentteams')
    .description('CodexAgentTeams CLI with Agent Teams workflows')
    .version('0.1.0');

  program.addCommand(createChatCommand(deps));
  program.addCommand(createConfigCommand(deps));
  program.addCommand(createDoctorCommand(deps));

  return program;
}
