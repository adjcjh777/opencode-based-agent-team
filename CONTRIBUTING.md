# Contributing Guide

感谢你为 CodexAgentTeams 做贡献。

## 1. 开发前准备

1. Fork / clone 仓库并切分支：`feature/<topic>`
2. 安装依赖：`npm install`
3. 初始化本地配置：`npm run dev -- init`
4. 运行诊断：`npm run dev -- doctor`

## 2. 开发规范

- 采用小步、可验证的改动。
- 每次提交应尽量“原子化”。
- 修改功能时同步更新文档。
- 避免提交密钥、令牌、`.env` 等敏感信息。

## 3. 本地验证（提交前必做）

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## 4. Pull Request 流程

1. 推送分支并发起 PR。
2. 使用 PR 模板补齐变更背景与验证结果。
3. 等待 CI 通过并完成代码评审。
4. 合并后删除分支。

## 5. 提交信息建议

推荐采用 Conventional Commits：

- `feat:` 新功能
- `fix:` 缺陷修复
- `docs:` 文档更新
- `test:` 测试变更
- `chore:` 工程化/维护性改动
- `ci:` 流水线相关

## 6. 发布流程（维护者）

1. 确保主分支全绿（CI + review）
2. 打版本 tag：如 `v0.2.0`
3. 由 `release.yml` 自动执行发布

## 7. 相关文档

- 使用与上线手册：`docs/USAGE.md`
- 安全策略：`SECURITY.md`
- 项目状态：`IMPLEMENTATION_STATUS.md`

