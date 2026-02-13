# OpenCode Mapping (Baseline for CodexAgentTeams)

## 1. 目标

本文件记录 OpenCode 风格能力与当前实现的映射，用于后续持续回归。

## 2. 基线声明

- 参考对象：OpenCode CLI 命令体验（本地 `opencode` `1.1.53`）
- 本项目目标：命令体验对齐 + 二进制保持 `codexagentteams`

## 3. 命令映射

| OpenCode 风格能力 | CodexAgentTeams 命令 | 状态 |
| --- | --- | --- |
| 默认启动交互 | `codexagentteams` | ✅ |
| 单轮执行 | `codexagentteams run "..."` | ✅ |
| MCP 管理 | `codexagentteams mcp list/tools` | ✅ (核心子集) |
| Agent 管理 | `codexagentteams agent list` | ✅ (核心子集) |
| Session 管理 | `codexagentteams session list/show` | ✅ (核心子集) |
| 环境诊断 | `codexagentteams doctor` | ✅ |
| 团队协作扩展 | `codexagentteams team status/run` | ✅ (项目扩展) |

## 4. 架构映射

| 关注点 | OpenCode 基线语义 | 当前实现模块 |
| --- | --- | --- |
| CLI 入口/路由 | 默认进入主链路 + 子命令分发 | `src/index.ts`, `src/cli.ts` |
| 会话循环 | 用户输入 → 模型输出 | `src/core/engine.ts`, `src/core/chat-loop.ts` |
| 模型抽象 | 多 provider 适配 | `src/llm/adapter.ts`, `src/llm/providers/*` |
| 工具系统 | 内置工具 + MCP | `src/tools/*` |
| 会话存储 | 可持久化历史 | `src/session/*` |
| Agent 系统 | 主/子 agent + prompt | `src/agent/*`, `agents/*` |
| 团队扩展 | (OpenCode 无 teams) | `src/teams/*`, `team` 命令 |

## 5. 已替换/收敛项

- 取消 `opencode` bin 别名，避免覆盖官方安装
- 修复入口行为：无参数默认进入 `chat`
- 新增核心命令面：`run/mcp/agent/session/team`
- `chat/run` 接入 SQLite 会话持久化

## 6. 后续迁移待办

- 按 OpenCode 上游源码进一步对齐 TUI 行为和交互细节
- 将 `mcp tools` 连接真实 MCP server transport 流程
- 增强 `agent` 命令到完整 agent profile 管理
- 增强 `team` 到长生命周期、多轮协同执行

