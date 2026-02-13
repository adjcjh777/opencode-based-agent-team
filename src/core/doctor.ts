import { constants } from 'node:fs';
import { access, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { loadConfig, type LoadConfigOptions } from './config.js';

export type DoctorStatus = 'pass' | 'warn' | 'fail';

export interface DoctorCheck {
  id: string;
  status: DoctorStatus;
  message: string;
  detail?: string;
}

export interface DoctorReport {
  ok: boolean;
  checks: DoctorCheck[];
}

export interface RunDoctorOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  codexHome?: string;
}

function parseNodeMajor(version: string): number {
  const normalized = version.startsWith('v') ? version.slice(1) : version;
  const [majorText] = normalized.split('.');
  const major = Number.parseInt(majorText ?? '0', 10);
  return Number.isNaN(major) ? 0 : major;
}

async function checkPathExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function runDoctor(options: RunDoctorOptions = {}): Promise<DoctorReport> {
  const checks: DoctorCheck[] = [];
  const cwd = options.cwd ?? process.cwd();
  const env = options.env ?? process.env;
  const codexHome = options.codexHome ?? env.CODEX_HOME ?? join(cwd, '.codex');

  const nodeMajor = parseNodeMajor(process.version);
  if (nodeMajor >= 20) {
    checks.push({
      id: 'node-version',
      status: 'pass',
      message: `Node.js ${process.version} is supported`
    });
  } else {
    checks.push({
      id: 'node-version',
      status: 'fail',
      message: `Node.js ${process.version} is not supported`,
      detail: 'Require Node.js >= 20.'
    });
  }

  const configPath = join(cwd, 'codex.config.json');
  const hasConfig = await checkPathExists(configPath);
  if (hasConfig) {
    checks.push({
      id: 'config-file',
      status: 'pass',
      message: 'codex.config.json found'
    });
  } else {
    checks.push({
      id: 'config-file',
      status: 'fail',
      message: 'codex.config.json not found',
      detail: `Expected path: ${configPath}`
    });
  }

  const loadOptions: LoadConfigOptions = { cwd, env };
  try {
    await loadConfig(loadOptions);
    checks.push({
      id: 'config-parse',
      status: 'pass',
      message: 'Configuration loaded successfully'
    });
  } catch (error) {
    checks.push({
      id: 'config-parse',
      status: 'fail',
      message: 'Configuration loading failed',
      detail: error instanceof Error ? error.message : String(error)
    });
  }

  try {
    await mkdir(codexHome, { recursive: true });
    await access(codexHome, constants.W_OK);
    checks.push({
      id: 'codex-home',
      status: 'pass',
      message: 'CODEX_HOME is writable',
      detail: codexHome
    });
  } catch (error) {
    checks.push({
      id: 'codex-home',
      status: 'fail',
      message: 'CODEX_HOME is not writable',
      detail: error instanceof Error ? error.message : String(error)
    });
  }

  const ok = checks.every((check) => check.status !== 'fail');
  return { ok, checks };
}

