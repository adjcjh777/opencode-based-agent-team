# CodexAgentTeams

`codexagentteams` 是一个 Node.js/TypeScript CLI，目标是对齐 OpenCode 的命令行体验，并在其上扩展 Agent Teams。

![CI](https://github.com/adjcjh777/opencode-based-agent-team/actions/workflows/ci.yml/badge.svg)

## 项目约束

- 本项目二进制只使用 `codexagentteams`
- **不会**提供 `opencode` 别名
- 目标是保持你本机官方 `opencode` 安装不受影响

## 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 初始化项目配置

```bash
npm run dev -- init
```

### 3) 开发模式启动

```bash
npm run dev
```

> 无参数默认进入 `chat` 主链路。

### 4) 本地链接为全局命令

```bash
npm run build
npm link
codexagentteams
```

## 核心命令面

- `codexagentteams`：默认进入交互会话
- `codexagentteams run "..."`：单轮执行并退出
- `codexagentteams mcp list`
- `codexagentteams mcp tools [serverId]`
- `codexagentteams agent list`
- `codexagentteams session list`
- `codexagentteams session show <id>`
- `codexagentteams team status`
- `codexagentteams team run "task 1; task 2"`
- `codexagentteams doctor`

## 配置摘要

配置文件：`codex.config.json`

关键配置段：

- `provider`：模型提供方
- `models`：主/快/推理模型
- `tools.permissions`：工具权限
- `mcp.servers`：MCP 服务列表
- `team`：Agent Teams 运行参数

`team` 支持：

- `team.enabled`
- `team.maxTeammates`
- `team.strategy` (`balanced` / `parallel` / `sequential`)
- `team.worker` (`in-process` / `worker`)

## 质量门禁

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## 文档

- 使用手册：`docs/USAGE.md`
- 架构说明：`docs/ARCHITECTURE.md`
- OpenCode 迁移映射：`docs/migration/opencode-mapping.md`
- 贡献指南：`CONTRIBUTING.md`
- 安全策略：`SECURITY.md`
