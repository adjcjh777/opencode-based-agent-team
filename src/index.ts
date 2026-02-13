#!/usr/bin/env node

import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createCli } from './cli.js';

const topLevelCommands = new Set([
  'chat',
  'run',
  'mcp',
  'agent',
  'session',
  'team',
  'config',
  'doctor',
  'init',
  'help'
]);

const topLevelFlags = new Set(['-h', '--help', '-V', '--version']);

function normalizePathCase(filePath: string): string {
  if (process.platform !== 'win32') {
    return filePath;
  }

  return filePath.toLowerCase();
}

function resolveRealPath(filePath: string): string {
  const normalized = resolve(filePath);
  if (typeof realpathSync.native === 'function') {
    return realpathSync.native(normalized);
  }

  return realpathSync(normalized);
}

function isMainModule(argv: string[] = process.argv): boolean {
  const scriptArg = argv[1];
  if (!scriptArg) {
    return false;
  }

  try {
    const runtimePath = normalizePathCase(resolveRealPath(scriptArg));
    const modulePath = normalizePathCase(resolveRealPath(fileURLToPath(import.meta.url)));
    return runtimePath === modulePath;
  } catch {
    return false;
  }
}

export function normalizeArgvForDefaultCommand(argv: string[]): string[] {
  const executable = argv[0] ?? 'node';
  const script = argv[1] ?? 'codexagentteams';
  const userArgs = argv.slice(2);

  if (userArgs.length === 0) {
    return [executable, script, 'chat'];
  }

  const firstArg = userArgs[0] ?? '';
  if (topLevelCommands.has(firstArg) || topLevelFlags.has(firstArg)) {
    return [executable, script, ...userArgs];
  }

  return [executable, script, 'run', ...userArgs];
}

export async function runCli(argv: string[] = process.argv): Promise<void> {
  const program = createCli();
  await program.parseAsync(normalizeArgvForDefaultCommand(argv));
}

if (isMainModule()) {
  runCli().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 1;
  });
}
