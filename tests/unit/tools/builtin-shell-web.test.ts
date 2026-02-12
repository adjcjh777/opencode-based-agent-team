import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { afterEach, describe, expect, it } from 'vitest';

import { createBashTool } from '../../../src/tools/builtin/bash.js';
import { createWebFetchTool } from '../../../src/tools/builtin/web-fetch.js';
import { createWebSearchTool } from '../../../src/tools/builtin/web-search.js';

const servers: Array<ReturnType<typeof createServer>> = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        })
    )
  );
});

async function startServer(
  handler: (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => void
): Promise<string> {
  const server = createServer(handler);
  servers.push(server);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to resolve test server address.');
  }

  return `http://127.0.0.1:${address.port}`;
}

describe('builtin shell/web tools', () => {
  it(
    'bash tool executes command via PowerShell',
    async () => {
      const bash = createBashTool();

      const result = await bash.execute({ command: 'Write-Output hello-shell' });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('hello-shell');
    },
    15000
  );

  it('webfetch tool returns HTTP response body', async () => {
    const baseUrl = await startServer((_req, res) => {
      res.statusCode = 200;
      res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.end('hello-webfetch');
    });

    const webfetch = createWebFetchTool();
    const result = await webfetch.execute({ url: `${baseUrl}/hello` });

    expect(result.status).toBe(200);
    expect(result.body).toContain('hello-webfetch');
  });

  it('websearch tool returns result entries from endpoint json payload', async () => {
    const baseUrl = await startServer((req, res) => {
      const query = new URL(req.url ?? '/', 'http://localhost').searchParams.get('q');

      res.statusCode = 200;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          query,
          results: [
            {
              title: 'Result A',
              url: 'https://example.com/a',
              snippet: 'Snippet A'
            },
            {
              title: 'Result B',
              url: 'https://example.com/b',
              snippet: 'Snippet B'
            }
          ]
        })
      );
    });

    const websearch = createWebSearchTool();
    const result = await websearch.execute({
      query: 'agent teams',
      endpoint: `${baseUrl}/search`
    });

    expect(result.results.length).toBe(2);
    expect(result.results[0].title).toBe('Result A');
  });
});
