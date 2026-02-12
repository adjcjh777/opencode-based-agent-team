import { describe, expect, it } from 'vitest';

import { createLogger } from '../../../src/core/logger.js';

describe('createLogger', () => {
  it('writes formatted log entries according to level', () => {
    const lines: string[] = [];
    const logger = createLogger({
      level: 'info',
      sink: (line) => {
        lines.push(line);
      }
    });

    logger.debug('debug message');
    logger.info('info message', { scope: 'chat' });
    logger.error('error message');

    expect(lines.length).toBe(2);
    expect(lines[0]).toContain('[INFO] info message');
    expect(lines[0]).toContain('scope=chat');
    expect(lines[1]).toContain('[ERROR] error message');
  });
});
