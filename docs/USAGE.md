# CodexAgentTeams 使用与上线手册

本手册面向项目使用者与运维发布人员，覆盖从初始化到上线发布的完整流程。

## 1. 运行环境要求

- Node.js `>= 20`
- npm `>= 10`（或兼容的 pnpm/yarn，仅文档示例使用 npm）
- Windows / macOS / Linux（Windows 下 shell 工具默认通过 PowerShell 执行）

## 2. 安装与构建

### 2.1 克隆与安装

```bash
git clone https://github.com/adjcjh777/opencode-based-agent-team.git
cd opencode-based-agent-team
npm install
```

### 2.2 本地开发运行

```bash
npm run dev -- chat
```

### 2.3 生产构建运行

```bash
npm run build
npm run start -- --help
```

## 3. 项目初始化（推荐）

首次进入空目录或新项目时，建议执行：

```bash
npm run dev -- init
```

该命令会生成（已存在则跳过）：

- `codex.config.json`
- `.env.example`
- `agents/build.md`
- `agents/plan.md`
- `.codex/skills/.gitkeep`

如需覆盖已有初始化文件：

```bash
npm run dev -- init --force
```

## 4. 配置与环境变量

### 4.1 配置文件

项目根目录使用 `codex.config.json`。

示例（right.codes）：

```json
{
  "provider": {
    "type": "right-codes",
    "baseUrl": "${RC_BASE_URL}",
    "apiKey": "${RC_API_KEY}",
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
  }
}
```

### 4.2 常用环境变量

- `RC_API_KEY`
- `RC_BASE_URL`
- `OPENAI_COMPAT_API_KEY`
- `OPENAI_COMPAT_BASE_URL`
- `ANTHROPIC_API_KEY`
- `GOOGLE_API_KEY`
- `OLLAMA_BASE_URL`
- `CODEX_HOME`（全局 skills 与会话资产目录）

## 5. 核心命令

### 5.1 聊天命令

```bash
npm run dev -- chat --agent build
npm run dev -- chat --agent plan
npm run dev -- chat --agent build --message "Summarize this repository"
```

说明：

- 未传 `--message` 时，进入会话启动逻辑。
- 传入 `--message` 时，执行单轮请求后退出。

### 5.2 配置命令

查看生效配置：

```bash
npm run dev -- config show
```

校验配置有效性：

```bash
npm run dev -- config validate
```

### 5.3 环境诊断

文本诊断：

```bash
npm run dev -- doctor
```

JSON 诊断（适合 CI）：

```bash
npm run dev -- doctor --json
```

诊断项包括：

- Node 版本检查
- `codex.config.json` 存在性
- 配置加载与解析
- `CODEX_HOME` 可写性

## 6. Agents、Skills、Prompts

### 6.1 Agent Prompt 来源

- 项目级：`agents/<agent>.md`
- 兜底：若未找到，则使用内置默认文本

### 6.2 Skills 来源与激活

- 项目级：`.codex/skills/*.md`
- 全局：`$CODEX_HOME/skills/*.md`
- 内置：`code-review`、`refactor`、`debug`

输入命中 trigger 后，skill prompt 会拼接进 system prompt。

## 7. 工具权限策略

配置位置：`tools.permissions`

权限级别：

- `allow`
- `deny`
- `ask`

规则优先级：

1. 精确匹配优先于通配符。
2. 多个通配符命中时，模式越具体优先级越高。
3. 未匹配到规则默认 `deny`。

示例：

```json
{
  "tools": {
    "permissions": {
      "mcp_*": "deny",
      "mcp_filesystem_*": "allow",
      "mcp_filesystem_delete_file": "deny"
    }
  }
}
```

上面策略代表：

- `mcp_filesystem_read_file` -> `allow`
- `mcp_browser_search` -> `deny`
- `mcp_filesystem_delete_file` -> `deny`（精确匹配覆盖）

## 8. MCP 集成

在 `codex.config.json` 中声明：

```json
{
  "mcp": {
    "servers": [
      {
        "id": "filesystem",
        "transport": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem"]
      },
      {
        "id": "search",
        "transport": "sse",
        "url": "http://localhost:8080/sse"
      }
    ]
  }
}
```

系统会自动完成：

- MCP server 配置加载
- 服务连接与工具发现
- 工具注册到运行时（命名形如 `mcp_<server>_<tool>`）

## 9. 质量门禁与 CI 建议

本地提交前至少执行：

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

建议 CI Pipeline 顺序：

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test`
5. `npm run build`
6. `npm run dev -- doctor --json`（在示例配置/环境下）

仓库已提供 GitHub Actions 示例：`.github/workflows/ci.yml`，默认在以下场景触发：

- push 到 `main` / `develop` / `feature/**`
- pull request
- 手动 `workflow_dispatch`

## 10. 上线发布指南

### 10.1 发布前检查清单

- [ ] 主分支代码冻结并完成评审
- [ ] 所有测试、类型检查、lint、build 通过
- [ ] `README.md` 与本手册同步更新
- [ ] `doctor` 在目标环境返回 `ok: true`
- [ ] 所有必要 API Key 与地址完成注入

### 10.2 npm 包发布（如需）

```bash
npm version patch
npm publish
```

说明：

- 项目已配置 `bin` 与 `prepack`，发布时会先自动构建。
- 安装后可直接使用命令：

```bash
codexagentteams --help
```

## 11. 常见问题排查

### Q1: 报错缺少配置文件

症状：`Cannot find codex.config.json...`

处理：

1. 执行 `npm run dev -- init`
2. 检查当前工作目录是否正确
3. 再执行 `npm run dev -- config validate`

### Q2: 报错缺少 provider 凭证

处理：

1. 在环境变量中设置对应 Key 与 URL
2. 或在 `codex.config.json` 中显式配置
3. 执行 `npm run dev -- doctor`

### Q3: 工具无法执行

处理：

1. 检查 `tools.permissions` 是否为 `deny`
2. 检查通配符规则是否覆盖了目标工具
3. 使用更精确规则覆盖默认策略

### Q4: MCP 工具未出现

处理：

1. 检查 `mcp.servers` 配置是否正确
2. 确认 server 可连接（command/url 可用）
3. 先执行 `doctor` 和 `config validate`

## 12. 推荐上线运行流程（团队）

1. 新环境执行 `init`
2. 注入 `.env` 和 provider 凭证
3. `config validate` + `doctor`
4. 使用 `chat --message` 执行冒烟测试
5. 接入 CI 并启用门禁
6. 标记版本并发布
