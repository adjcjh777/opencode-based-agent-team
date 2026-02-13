# Implementation Status

This file tracks completion status against `IMPLEMENTATION_PLAN.md`.

## Phase 1: Foundation + right.codes

- [x] Project scaffold (`TypeScript`, `ESLint`, `Prettier`, `vitest`, `tsx`)
- [x] CLI entry and command parsing (`src/index.ts`, `src/cli.ts`)
- [x] Project initialization command (`src/core/init.ts`, `init` CLI)
- [x] Config system with `codex.config.json` (`src/core/config.ts`)
- [x] right.codes adapter support (`src/llm/providers/right-codes.ts`)
- [x] LLM adapter layer (`src/llm/adapter.ts`)
- [x] Basic TUI skeleton (`src/ui/App.tsx`, `src/ui/components/*`, `src/ui/renderer.ts`)
- [x] Session management + chat loop (`src/session/*`, `src/core/chat-loop.ts`, `src/core/engine.ts`)

## Phase 2: Agent System

- [x] Agent types and registry (`src/agent/types.ts`, `src/agent/registry.ts`)
- [x] Build + Plan agents (`src/agent/builtin.ts`)
- [x] Subagent system (`src/agent/subagent.ts`)
- [x] Agent switching primitives (`src/agent/switcher.ts`, `src/ui/keybindings.ts`)
- [x] `@mention` subagent routing (`src/agent/mention-router.ts`)
- [x] Custom agent loading (`src/agent/custom-loader.ts`)

## Phase 3: Tools + MCP + Skills

- [x] Tool interface and registry (`src/tools/types.ts`, `src/tools/registry.ts`)
- [x] Permission manager + runtime enforcement (`src/tools/permission.ts`, `src/tools/bootstrap.ts`)
- [x] Built-in tools (`src/tools/builtin/*.ts`)
- [x] Web tools (`src/tools/builtin/web-fetch.ts`, `src/tools/builtin/web-search.ts`)
- [x] Windows shell behavior (`src/tools/builtin/bash.ts` via PowerShell)
- [x] MCP manager + discovery + registration (`src/tools/mcp/client.ts`, `src/tools/mcp/registry.ts`)
- [x] MCP config loading (`src/tools/mcp/loader.ts`)
- [x] MCP bootstrap helper (`src/tools/mcp/bootstrap.ts`)
- [x] Skills markdown loader/registry/executor (`src/skills/loader.ts`, `src/skills/registry.ts`, `src/skills/executor.ts`)
- [x] Built-in skills (`src/skills/builtin.ts`)
- [x] User custom skills (global + project) (`src/skills/manager.ts`)

## Phase 4: Agent Teams

- [x] Team config and types (`src/teams/types.ts`)
- [x] Leader role (`src/teams/leader.ts`)
- [x] Teammate execution model (`src/teams/teammate.ts`, `src/teams/worker-entry.ts`)
- [x] Message bus (`src/teams/message-bus.ts`)
- [x] Task board (`src/teams/task-board.ts`)
- [x] Team lifecycle (`spawn`, `monitor`, `shutdown`, `cleanup`) (`src/teams/team-manager.ts`)
- [x] TUI team panels (`src/ui/panels/*.ts`, `src/ui/components/*Panel*.tsx`)
- [x] Direct teammate interaction (`selectNextTeammate`, `selectPreviousTeammate`, keybindings)

## Phase 5: Enhancements

- [x] Multi-provider support (`right-codes`, `openai-compatible`, `anthropic`, `google`, `ollama`)
- [x] Session persistence (`src/session/store.ts`)
- [x] Retry and error handling (`src/core/retry.ts`, chat-loop integration)
- [x] Logging utilities (`src/core/logger.ts`)
- [x] Diagnostics command (`src/core/doctor.ts`, `doctor` CLI)
- [x] Release-oriented build packaging (`tsconfig.build.json`, `package.json` bin/files/prepack)
- [x] Documentation updates (`README.md`, `IMPLEMENTATION_STATUS.md`, `docs/USAGE.md`)

## Verification Snapshot

- [x] `npm test`
- [x] `npm run typecheck`
- [x] `npm run lint`
