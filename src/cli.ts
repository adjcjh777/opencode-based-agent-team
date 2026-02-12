import { Command } from 'commander';

import { loadConfig } from './core/config.js';
import { CoreEngine } from './core/engine.js';
import { LLMAdapter } from './llm/adapter.js';
import { SessionManager } from './session/manager.js';

export interface ChatCommandOptions {
  agent: string;
  message?: string;
}

export interface CliDeps {
  runChat?: (options: ChatCommandOptions) => Promise<void>;
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
  const engine = new CoreEngine({ adapter, session });
  const result = await engine.runTurn(options.message);

  process.stdout.write(`${result.assistant}\n`);
}

function createChatCommand(deps: CliDeps): Command {
  const runChat = deps.runChat ?? runChatWithDefaults;

  return new Command('chat')
    .description('Start an interactive chat session')
    .option('--agent <name>', 'agent name', 'build')
    .option('--message <text>', 'send one message and exit')
    .action(async (options: ChatCommandOptions) => {
      process.env.CODEXAGENTTEAMS_UI = '1';
      await runChat({ agent: options.agent, message: options.message });
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
