# CodexAgentTeams

Node.js + TypeScript CLI prototype inspired by OpenCode and Claude-style Agent Teams collaboration.

## Current Status

The implementation currently includes:

- Multi-agent foundation (primary agents, subagents, mention routing, switching)
- Team collaboration core (leader, teammate, task board, message bus, team manager lifecycle)
- Team display primitives for in-process rendering
- Built-in tools (read/write/edit/list/glob/grep/bash/webfetch/websearch/patch)
- MCP foundation with config loading, manager state, discovery, and registry wiring
- Skills foundation with loader, registry, executor, and built-in skills
- LLM adapter with provider routing:
  - `right-codes`
  - `openai-compatible`
  - `anthropic`
  - `google`
  - `ollama`
- Session layer with in-memory manager, SQLite persistence, and history query helper
- Core reliability utilities (retry + logger)

## Quick Start

```bash
npm install
npm run dev -- chat
```

Show effective configuration:

```bash
npm run dev -- config show
```

## Environment Variables

At minimum for `right-codes`:

```bash
RC_API_KEY=your_key
RC_BASE_URL=https://your-endpoint.right.codes/v1
```

Depending on selected provider, additional variables are supported:

- `OPENAI_COMPAT_API_KEY`
- `OPENAI_COMPAT_BASE_URL`
- `ANTHROPIC_API_KEY`
- `GOOGLE_API_KEY`
- `OLLAMA_BASE_URL`

## Quality Gates

```bash
npm test
npm run typecheck
npm run lint
```

All of the above are currently passing on branch `feature/phase1-foundation`.
