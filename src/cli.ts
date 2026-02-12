import { Command } from 'commander';

function createConfigCommand(): Command {
  const configCommand = new Command('config').description('Inspect configuration and providers');

  configCommand
    .command('show')
    .description('Show effective configuration')
    .action(() => {
      process.stdout.write('Configuration command is ready.\n');
    });

  return configCommand;
}

function createChatCommand(): Command {
  return new Command('chat')
    .description('Start an interactive chat session')
    .option('--agent <name>', 'agent name', 'build')
    .action((options: { agent: string }) => {
      process.stdout.write(`Starting chat session with ${options.agent} agent...\n`);
    });
}

export function createCli(): Command {
  const program = new Command();

  program
    .name('codexagentteams')
    .description('CodexAgentTeams CLI with Agent Teams workflows')
    .version('0.1.0');

  program.addCommand(createChatCommand());
  program.addCommand(createConfigCommand());

  return program;
}
