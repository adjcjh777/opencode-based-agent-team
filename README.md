# CodexAgentTeams

Node.js + TypeScript CLI prototype inspired by OpenCode and Claude-style Agent Teams collaboration.

![CI](https://github.com/adjcjh777/opencode-based-agent-team/actions/workflows/ci.yml/badge.svg)

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
- Streaming helpers (`src/llm/streaming.ts`) for chunk/text conversion
- UI panel formatters, hooks, and theme primitives
- Starter agent prompt resources in `agents/`
- Example custom skill template in `skills/example-skill.md`
- Chat context builder with:
  - agent prompt loading from `agents/<agent>.md`
  - skill activation from project `.codex/skills` and global `CODEX_HOME/skills`

## Quick Start

```bash
npm install
npm run dev -- init
npm run dev -- chat
```

Single-turn mode (non-interactive):

```bash
npm run dev -- chat --agent build --message "Summarize this repository"
```

Show effective configuration:

```bash
npm run dev -- config show
```

Validate configuration:

```bash
npm run dev -- config validate
```

Run local diagnostics:

```bash
npm run dev -- doctor
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

Global Codex home (for shared skills/session assets):

- `CODEX_HOME` (defaults to project `.codex` when unset)

## Prompt & Skills Sources

- Agent prompt files: `agents/build.md`, `agents/plan.md`, etc.
- Project skills: `.codex/skills/*.md`
- Global skills: `$CODEX_HOME/skills/*.md`
- Built-in skills: `code-review`, `refactor`, `debug`

## Tool Permissions

`codex.config.json` supports optional per-tool permission rules:

```json
{
  "tools": {
    "permissions": {
      "read": "allow",
      "bash": "ask",
      "mcp_*": "deny"
    }
  }
}
```

- Exact rules override wildcard rules.
- When multiple wildcard rules match, the most specific pattern wins.
- Tools without a matching rule default to `deny`.

## Quality Gates

```bash
npm test
npm run typecheck
npm run lint
```

All of the above are currently passing on branch `feature/phase1-foundation`.

## Documentation

- Detailed guide: `docs/USAGE.md`

## CI

- GitHub Actions workflow: `.github/workflows/ci.yml`
- Trigger: push / pull request / manual dispatch
- Jobs run: `lint`, `typecheck`, `test`, `build`, `doctor --json`
