import { describe, expect, it } from 'vitest';

import { withRetry } from '../../../src/core/retry.js';

describe('withRetry', () => {
  it('retries until operation succeeds', async () => {
    let attempts = 0;

    const result = await withRetry(
      async () => {
        attempts += 1;
        if (attempts < 3) {
          throw new Error('transient');
        }

        return 'ok';
      },
      { retries: 3 }
    );

    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });

  it('throws final error after retry budget exhausted', async () => {
    let attempts = 0;

    await expect(
      withRetry(
        async () => {
          attempts += 1;
          throw new Error('always fail');
        },
        { retries: 2 }
      )
    ).rejects.toThrow('always fail');

    expect(attempts).toBe(3);
  });
});
