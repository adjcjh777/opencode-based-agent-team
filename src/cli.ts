import { Command } from 'commander';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

import { createBuiltinPrimaryAgents } from './agent/builtin.js';
import { loadAgentPrompt } from './agent/prompts.js';
import { type CodexConfig, loadConfig } from './core/config.js';
import { runDoctor } from './core/doctor.js';
import { CoreEngine } from './core/engine.js';
import { initializeProject } from './core/init.js';
import { LLMAdapter } from './llm/adapter.js';
import { SessionManager } from './session/manager.js';
import { SQLiteSessionStore } from './session/store.js';
import { SkillManager } from './skills/manager.js';
import { createToolRuntime } from './tools/bootstrap.js';
import { MCPManager } from './tools/mcp/client.js';
import { extractMcpServerConfigs } from './tools/mcp/loader.js';
import { TeamManager } from './teams/team-manager.js';
import type { TeamConfig, Task } from './teams/types.js';

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

interface TeamRuntimeSettings {
  enabled: boolean;
  maxTeammates: number;
  strategy: 'balanced' | 'parallel' | 'sequential';
  worker: 'in-process' | 'worker';
}

function resolveCwd(deps: CliDeps): string {
  return deps.cwd ?? process.cwd();
}

function resolveEnv(deps: CliDeps): NodeJS.ProcessEnv {
  return deps.env ?? process.env;
}

function resolveCodexHome(deps: CliDeps, cwd: string): string {
  return deps.codexHome ?? resolveEnv(deps).CODEX_HOME ?? join(cwd, '.codex');
}

function resolveSessionStorePath(deps: CliDeps, cwd: string): string {
  return join(resolveCodexHome(deps, cwd), 'sessions.db');
}

function resolveTeamRuntimeSettings(config: CodexConfig): TeamRuntimeSettings {
  return {
    enabled: config.team?.enabled ?? false,
    maxTeammates: config.team?.maxTeammates ?? 3,
    strategy: config.team?.strategy ?? 'balanced',
    worker: config.team?.worker ?? 'in-process'
  };
}

function buildDefaultTeamConfig(settings: TeamRuntimeSettings): TeamConfig {
  const memberCount = Math.max(1, settings.maxTeammates);
  const members = Array.from({ length: memberCount }, (_, index) => {
    const id = `teammate-${index + 1}`;
    return {
      id,
      name: `Teammate ${index + 1}`,
      role: settings.strategy,
      prompt: `You are ${id}. Complete assigned tasks with concise updates.`
    };
  });

  return {
    name: 'default-team',
    leader: 'leader',
    members,
    displayMode: 'in-process'
  };
}

function normalizeTeamRequest(rawRequest: string): string {
  return rawRequest
    .split(/[\n;]/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

function renderTaskLine(task: Task): string {
  const assignee = task.assignee ?? 'unassigned';
  return `${task.id}: ${task.status} [${assignee}]`;
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

function createInitCommand(deps: CliDeps): Command {
  return new Command('init')
    .description('Initialize project config, prompts, and local skill directory')
    .option('--force', 'overwrite existing generated files')
    .action(async (options: { force?: boolean }) => {
      const cwd = deps.cwd ?? process.cwd();
      const result = await initializeProject({ cwd, force: options.force ?? false });

      process.stdout.write(`Initialized project in ${cwd}\n`);
      process.stdout.write(`Created: ${result.created.length}\n`);
      for (const filePath of result.created) {
        process.stdout.write(`  + ${filePath}\n`);
      }

      process.stdout.write(`Skipped: ${result.skipped.length}\n`);
      for (const filePath of result.skipped) {
        process.stdout.write(`  - ${filePath}\n`);
      }
    });
}

async function runChatWithDefaults(options: ChatCommandOptions, deps: CliDeps = {}): Promise<void> {
  process.stdout.write(`Starting chat session with ${options.agent} agent...\n`);

  if (!options.message && (!process.stdin.isTTY || !process.stdout.isTTY)) {
    process.stdout.write('Interactive chat requires a TTY. Use `codexagentteams run "..."`.\n');
    return;
  }

  const cwd = resolveCwd(deps);
  const env = resolveEnv(deps);
  const sessionStore = new SQLiteSessionStore(resolveSessionStorePath(deps, cwd));
  const config = await loadConfig({ cwd, env });
  await createToolRuntime(config);
  const adapter = LLMAdapter.create(config);
  const session = new SessionManager({ activeAgent: options.agent }, sessionStore);
  const engine = new CoreEngine({ adapter, session, systemPrompt: options.systemPrompt });

  try {
    if (options.message) {
      const result = await engine.runTurn(options.message);
      process.stdout.write(`${result.assistant}\n`);
      return;
    }

    process.stdout.write('Interactive mode. Type /exit to quit.\n');

    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });

    try {
      while (true) {
        const rawInput = await readline.question('> ');
        const userInput = rawInput.trim();

        if (userInput.length === 0) {
          continue;
        }

        if (userInput === '/exit' || userInput === '/quit') {
          break;
        }

        try {
          const result = await engine.runTurn(userInput);
          process.stdout.write(`${result.assistant}\n`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          process.stdout.write(`Error: ${message}\n`);
        }
      }
    } finally {
      readline.close();
    }
  } finally {
    sessionStore.close();
  }
}

async function resolveChatContext(options: ChatCommandOptions, deps: CliDeps): Promise<ChatCommandOptions> {
  const cwd = resolveCwd(deps);
  const codexHome = resolveCodexHome(deps, cwd);

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
  const runChat = deps.runChat ?? ((options: ChatCommandOptions) => runChatWithDefaults(options, deps));

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

function createRunCommand(deps: CliDeps): Command {
  const runChat = deps.runChat ?? ((options: ChatCommandOptions) => runChatWithDefaults(options, deps));

  return new Command('run')
    .description('Run a single task and exit')
    .argument('<message...>', 'task message')
    .option('--agent <name>', 'agent name', 'build')
    .action(async (messageParts: string[], options: { agent: string }) => {
      const message = messageParts.join(' ').trim();
      const chatContext = await resolveChatContext({ agent: options.agent, message }, deps);
      await runChat(chatContext);
    });
}

function createMcpCommand(deps: CliDeps): Command {
  const mcpCommand = new Command('mcp').description('Inspect MCP servers and tools');

  mcpCommand
    .command('list')
    .description('List configured MCP servers')
    .action(async () => {
      const cwd = resolveCwd(deps);
      const env = resolveEnv(deps);
      const config = await loadConfig({ cwd, env, resolveProviderEnv: false });
      const servers = extractMcpServerConfigs(config);

      if (servers.length === 0) {
        process.stdout.write('No MCP servers configured.\n');
        return;
      }

      for (const server of servers) {
        process.stdout.write(`- ${server.id} (${server.transport})\n`);
      }
    });

  mcpCommand
    .command('tools [serverId]')
    .description('List discovered MCP tools')
    .action(async (serverId?: string) => {
      const cwd = resolveCwd(deps);
      const env = resolveEnv(deps);
      const config = await loadConfig({ cwd, env, resolveProviderEnv: false });
      const manager = new MCPManager();
      const servers = extractMcpServerConfigs(config).filter((server) => (serverId ? server.id === serverId : true));

      if (servers.length === 0) {
        process.stdout.write('No MCP servers configured.\n');
        return;
      }

      await manager.loadServers(servers);
      for (const server of servers) {
        await manager.connect(server.id);
        const tools = await manager.discoverTools(server.id);
        if (tools.length === 0) {
          process.stdout.write(`${server.id}: no tools discovered\n`);
          continue;
        }

        process.stdout.write(`${server.id}:\n`);
        for (const tool of tools) {
          process.stdout.write(`  - ${tool.name}\n`);
        }
      }
    });

  return mcpCommand;
}

function createAgentCommand(): Command {
  const agentCommand = new Command('agent').description('Inspect builtin agent definitions');

  agentCommand
    .command('list')
    .description('List available primary agents')
    .action(() => {
      const agents = createBuiltinPrimaryAgents();
      for (const agent of agents) {
        process.stdout.write(`- ${agent.id}: ${agent.description}\n`);
      }
    });

  return agentCommand;
}

function createSessionCommand(deps: CliDeps): Command {
  const sessionCommand = new Command('session').description('Inspect persisted chat sessions');

  sessionCommand
    .command('list')
    .description('List recent sessions')
    .option('--limit <count>', 'maximum sessions to list', '20')
    .action((options: { limit?: string }) => {
      const cwd = resolveCwd(deps);
      const limit = Number.parseInt(options.limit ?? '20', 10);
      const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;
      const store = new SQLiteSessionStore(resolveSessionStorePath(deps, cwd));

      try {
        const sessions = store.list(safeLimit);
        if (sessions.length === 0) {
          process.stdout.write('No sessions found.\n');
          return;
        }

        for (const session of sessions) {
          process.stdout.write(
            `- ${session.id} | agent=${session.activeAgent} | messages=${session.messages.length}\n`
          );
        }
      } finally {
        store.close();
      }
    });

  sessionCommand
    .command('show <id>')
    .description('Show a session transcript')
    .action((id: string) => {
      const cwd = resolveCwd(deps);
      const store = new SQLiteSessionStore(resolveSessionStorePath(deps, cwd));

      try {
        const session = store.load(id);
        if (!session) {
          process.stdout.write(`Session not found: ${id}\n`);
          process.exitCode = 1;
          return;
        }

        process.stdout.write(`Session ${session.id} (agent=${session.activeAgent})\n`);
        for (const message of session.messages) {
          process.stdout.write(`${message.role}: ${message.content}\n`);
        }
      } finally {
        store.close();
      }
    });

  return sessionCommand;
}

function createTeamCommand(deps: CliDeps): Command {
  const teamCommand = new Command('team').description('Run task orchestration with agent teams');

  teamCommand
    .command('status')
    .description('Show team runtime settings')
      .action(async () => {
        const cwd = resolveCwd(deps);
        const env = resolveEnv(deps);
        const config = await loadConfig({ cwd, env, resolveProviderEnv: false });
        const settings = resolveTeamRuntimeSettings(config);

      process.stdout.write(`enabled: ${settings.enabled}\n`);
      process.stdout.write(`maxTeammates: ${settings.maxTeammates}\n`);
      process.stdout.write(`strategy: ${settings.strategy}\n`);
      process.stdout.write(`worker: ${settings.worker}\n`);
    });

  teamCommand
    .command('run')
    .description('Plan and execute tasks with teammates')
    .argument('<request...>', 'request text')
      .action(async (requestParts: string[]) => {
        const cwd = resolveCwd(deps);
        const env = resolveEnv(deps);
        const config = await loadConfig({ cwd, env, resolveProviderEnv: false });
        const settings = resolveTeamRuntimeSettings(config);

      if (!settings.enabled) {
        process.stdout.write('Team mode is disabled in config (team.enabled=false).\n');
        process.exitCode = 1;
        return;
      }

      if (settings.worker !== 'in-process') {
        process.stdout.write('Only in-process worker mode is currently supported.\n');
        process.exitCode = 1;
        return;
      }

      const request = normalizeTeamRequest(requestParts.join(' '));
      const manager = new TeamManager(buildDefaultTeamConfig(settings));

      await manager.spawn();
      const tasks = await manager.planAndAssign(request);
      const assigned = tasks.filter((task) => task.assignee);

      await Promise.all(
        assigned.map(async (task) => {
          await manager.completeTask(task.id, `Completed by ${task.assignee ?? 'unknown'}`);
        })
      );

      process.stdout.write('Team run complete\n');
      for (const task of manager.listTasks()) {
        process.stdout.write(`${renderTaskLine(task)}\n`);
      }

      await manager.cleanup();
    });

  return teamCommand;
}

export function createCli(deps: CliDeps = {}): Command {
  const program = new Command();

  program
    .name('codexagentteams')
    .description('CodexAgentTeams CLI with Agent Teams workflows')
    .version('0.1.0');

  program.addCommand(createChatCommand(deps));
  program.addCommand(createRunCommand(deps));
  program.addCommand(createMcpCommand(deps));
  program.addCommand(createAgentCommand());
  program.addCommand(createSessionCommand(deps));
  program.addCommand(createTeamCommand(deps));
  program.addCommand(createConfigCommand(deps));
  program.addCommand(createDoctorCommand(deps));
  program.addCommand(createInitCommand(deps));

  return program;
}
