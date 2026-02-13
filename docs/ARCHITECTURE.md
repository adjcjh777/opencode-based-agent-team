# CodexAgentTeams Architecture

## 1. 设计目标

- 对齐 OpenCode 的 CLI 主体验（默认交互 + 单轮 run + 核心子命令）
- 保留 `codexagentteams` 作为唯一二进制入口
- 在核心链路上扩展 Agent Teams（`team` 命令与调度层）

## 2. 分层结构

### 2.1 CLI 层（`src/index.ts`, `src/cli.ts`）

- `src/index.ts`
  - 命令入口
  - 无参数默认注入 `chat`
  - 自然语言输入默认路由到 `run`
- `src/cli.ts`
  - 命令注册与分发
  - 命令面：`chat/run/mcp/agent/session/team/config/doctor/init`

### 2.2 核心执行层（`src/core/*`）

- `CoreEngine`：统一单轮执行入口
- `chat-loop`：用户消息 → 模型流式响应 → 会话记录
- `retry`：失败重试策略
- `doctor`：环境和配置检查

### 2.3 模型适配层（`src/llm/*`）

- `LLMAdapter` 统一 provider 调用接口
- 支持 `right-codes/openai-compatible/anthropic/google/ollama`

### 2.4 会话层（`src/session/*`）

- `SessionManager` 管理内存消息
- `SQLiteSessionStore` 持久化到 `$CODEX_HOME/sessions.db`
- `session` 命令读取持久化会话

### 2.5 工具层（`src/tools/*`）

- 内置工具：文件、搜索、命令执行、web、patch
- MCP 工具：服务配置加载、连接、工具发现与注册
- 权限控制：`allow/deny/ask`

### 2.6 Agent 层（`src/agent/*`, `src/skills/*`）

- 内置主 Agent：`build`, `plan`
- prompt 由 `agents/*.md` 提供
- skills 支持本地 `.codex/skills` 和全局 `$CODEX_HOME/skills`

### 2.7 Agent Teams 扩展层（`src/teams/*`）

- `TeamManager`：团队生命周期、任务分配、成员状态
- `Leader`：任务拆解
- `TaskBoard`：任务状态流转
- `MessageBus`：队友消息通道
- 当前运行模式：`in-process`（Windows 友好，无 tmux 依赖）

## 3. 关键流程

### 3.1 默认交互流程

1. `codexagentteams`
2. `index.ts` 注入 `chat`
3. `cli.ts` 解析命令并构建执行上下文
4. 加载配置、工具运行时、LLM 适配器
5. 进入交互循环，逐轮调用 `CoreEngine.runTurn`

### 3.2 单轮执行流程

1. `codexagentteams run "..."`
2. 构建会话 + 系统 prompt
3. 调用模型执行一轮
4. 输出结果并退出

### 3.3 Team 运行流程

1. `codexagentteams team run "task1; task2"`
2. 读取 `team` 配置，构造团队
3. Leader 拆分任务，TeamManager 分配给 teammate
4. 任务完成并输出汇总

## 4. 配置边界

`codex.config.json` 中新增 `team` 配置段：

- `team.enabled`
- `team.maxTeammates`
- `team.strategy`
- `team.worker`

当前若 `team.worker != in-process`，CLI 会给出明确错误并退出。

## 5. 演进方向

- 对齐 OpenCode 上游更多命令行为细节
- 将 Team 执行上下文和 Agent 执行器深度耦合
- 增强 `mcp tools` 的真实发现能力（接入实际 transport）
- 扩展 `team` 到长生命周期会话与可视化 TUI 面板

