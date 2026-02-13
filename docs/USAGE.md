# CodexAgentTeams 使用文档

本文档覆盖本地开发、安装、配置、命令说明、排障和上线前检查。

## 1. 运行环境

- Node.js `>= 20`
- npm `>= 10`
- Windows / macOS / Linux

## 2. 安装与初始化

### 2.1 克隆与安装

```bash
git clone https://github.com/adjcjh777/opencode-based-agent-team.git
cd opencode-based-agent-team
npm install
```

### 2.2 初始化项目

```bash
npm run dev -- init
```

该命令会创建（已存在则跳过）：

- `codex.config.json`
- `.env.example`
- `agents/build.md`
- `agents/plan.md`
- `.codex/skills/.gitkeep`

覆盖重建：

```bash
npm run dev -- init --force
```

## 3. 启动方式

### 3.1 开发模式

```bash
npm run dev
```

说明：无参数时，CLI 默认进入 `chat` 主链路。

### 3.2 构建后二进制启动

```bash
npm run build
npm start -- --help
```

### 3.3 全局链接本地包

```bash
npm run build
npm link
codexagentteams
```

> 本项目不注册 `opencode` 命令；请仅使用 `codexagentteams`。

## 4. 命令总览

### 4.1 默认交互

```bash
codexagentteams
```

进入交互模式后：

- 输入普通文本：发送一轮请求
- 输入 `/exit` 或 `/quit`：退出

### 4.2 单轮执行

```bash
codexagentteams run "Summarize this repository"
codexagentteams run --agent plan "Analyze migration risk"
```

### 4.3 MCP

```bash
codexagentteams mcp list
codexagentteams mcp tools
codexagentteams mcp tools filesystem
```

### 4.4 Agent

```bash
codexagentteams agent list
```

### 4.5 Session

```bash
codexagentteams session list
codexagentteams session list --limit 50
codexagentteams session show <session-id>
```

### 4.6 Team

```bash
codexagentteams team status
codexagentteams team run "Implement parser; Add tests; Update docs"
```

### 4.7 Config 与诊断

```bash
codexagentteams config show
codexagentteams config validate
codexagentteams doctor
codexagentteams doctor --json
```

## 5. 配置文件说明

配置文件名固定为 `codex.config.json`。

示例：

```json
{
  "provider": {
    "type": "right-codes",
    "apiKey": "${RC_API_KEY}",
    "baseUrl": "${RC_BASE_URL}",
    "defaultModel": "claude-sonnet-4"
  },
  "models": {
    "primary": "claude-sonnet-4",
    "fast": "claude-haiku-4",
    "reasoning": "claude-opus-4"
  },
  "tools": {
    "permissions": {
      "read": "allow",
      "bash": "ask",
      "mcp_*": "deny"
    }
  },
  "mcp": {
    "servers": []
  },
  "team": {
    "enabled": true,
    "maxTeammates": 3,
    "strategy": "balanced",
    "worker": "in-process"
  }
}
```

## 6. 环境变量

### 6.1 right.codes（默认）

- `RC_API_KEY`
- `RC_BASE_URL`

### 6.2 其他 provider

- `OPENAI_COMPAT_API_KEY`
- `OPENAI_COMPAT_BASE_URL`
- `ANTHROPIC_API_KEY`
- `GOOGLE_API_KEY`
- `OLLAMA_BASE_URL`

### 6.3 全局目录

- `CODEX_HOME`

若未设置，默认使用当前项目下 `.codex`。

## 7. 权限策略

`tools.permissions` 支持：

- 精确匹配：`bash`
- 通配匹配：`mcp_*`

匹配优先级：

1. 精确规则优先于通配符
2. 多个通配符匹配时，越具体优先级越高
3. 未命中规则默认 `deny`

## 8. 会话持久化

- 会话数据库路径：`$CODEX_HOME/sessions.db`
- `chat` 与 `run` 都会将消息保存到会话存储
- 可通过 `session list/show` 查看

## 9. 常见问题

### 9.1 输入 `codexagentteams` 后提示 TTY

当前 shell 非交互 TTY。请：

- 在普通终端直接运行 `codexagentteams`
- 或改用 `codexagentteams run "..."`

### 9.2 `doctor` 报配置缺失

请确认项目根目录存在 `codex.config.json`，或先执行 `codexagentteams init`。

### 9.3 不希望影响本机 `opencode`

本项目不会安装 `opencode` 命令。可检查：

```powershell
where opencode
where codexagentteams
```

## 10. 上线前检查

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

建议在 Linux + Windows、Node 20/22 的矩阵执行以上检查。

