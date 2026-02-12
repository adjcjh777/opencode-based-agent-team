import { Command } from 'commander';
import { join } from 'node:path';

import { loadAgentPrompt } from './agent/prompts.js';
import { loadConfig } from './core/config.js';
import { CoreEngine } from './core/engine.js';
import { LLMAdapter } from './llm/adapter.js';
import { SessionManager } from './session/manager.js';
import { SkillManager } from './skills/manager.js';

export interface ChatCommandOptions {
  agent: string;
  message?: string;
  systemPrompt?: string;
}

export interface CliDeps {
  runChat?: (options: ChatCommandOptions) => Promise<void>;
  cwd?: string;
  codexHome?: string;
}

function createConfigCommand(): Command {
  const configCommand = new Command('config').description('Inspect configuration and providers');

  configCommand
    .command('show')
    .description('Show effective configuration')
    .action(async () => {
      const config = await loadConfig();
      process.stdout.write(`${JSON.stringify(config, null, 2)}\n`);
    });

  return configCommand;
}

async function runChatWithDefaults(options: ChatCommandOptions): Promise<void> {
  process.stdout.write(`Starting chat session with ${options.agent} agent...\n`);

  if (!options.message) {
    return;
  }

  const config = await loadConfig();
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
  program.addCommand(createConfigCommand());

  return program;
}
