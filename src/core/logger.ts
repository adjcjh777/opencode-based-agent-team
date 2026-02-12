type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export interface LoggerOptions {
  level?: LogLevel;
  sink?: (line: string) => void;
  now?: () => Date;
}

function formatMeta(meta?: Record<string, unknown>): string {
  if (!meta || Object.keys(meta).length === 0) {
    return '';
  }

  return Object.entries(meta)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(' ');
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const level = options.level ?? 'info';
  const sink = options.sink ?? ((line: string) => process.stderr.write(`${line}\n`));
  const now = options.now ?? (() => new Date());

  function log(at: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (levelOrder[at] < levelOrder[level]) {
      return;
    }

    const timestamp = now().toISOString();
    const detail = formatMeta(meta);
    const suffix = detail ? ` ${detail}` : '';
    sink(`${timestamp} [${at.toUpperCase()}] ${message}${suffix}`);
  }

  return {
    debug(message, meta) {
      log('debug', message, meta);
    },
    info(message, meta) {
      log('info', message, meta);
    },
    warn(message, meta) {
      log('warn', message, meta);
    },
    error(message, meta) {
      log('error', message, meta);
    }
  };
}
