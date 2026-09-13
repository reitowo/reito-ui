# CI 与 npm 发布规则

## 质量检查

`ci.yml` 对 main 的 push、面向 main 的 PR 和手动触发运行共享 `validate.yml`：

1. npm ci，固定 Node 24.11.1。
2. 完整构建后运行 npm run check，确保类型声明已生成。
3. git diff --exit-code 检查生成目录漂移。
4. Chromium 核心交互回归：主页、SelectInput、表格、表单、属性编辑和滚动焦点，共 142 项；不是全库所有测试。
5. 构建两个 tgz，检查公开入口、白名单文件、README、许可证及公开 registry 设置，上传 npm-packages artifact。

PR 不使用发布凭据。失败保留 Playwright 诊断。CI 同分支新提交取消旧检查；发布流程串行且不取消。

## npm 发布

`publish.yml` 只在推送 `v*` 标签时运行。标签必须是稳定版本 `vX.Y.Z`，与根包、全部工作区包和内部依赖一致，提交必须已包含在 origin/main。质量检查通过后发布其实际产物，先 tokens 后 ui。相同版本已存在时只允许完整性一致的包跳过，禁止替换不同内容。

第一次发布后，在 **两个 npm 包各自的 Settings → Trusted Publisher** 配置：

| 字段 | 值 |
| --- | --- |
| Provider | GitHub Actions |
| Organization or user | reitowo |
| Repository | reito-ui |
| Workflow filename | publish.yml |
| Environment name | npm |
| Allowed actions | 允许直接 npm publish |

使用 GitHub 托管 Ubuntu runner、npm 11.6.2、OIDC 和 provenance；不需要 GitHub NPM_TOKEN secret。仅提交 workflow 不会自动完成 npm 网站上的信任绑定。

后续先同步版本、提交合并到 main，再显式打标签发布：

```sh
git tag v0.5.2
git push origin v0.5.2
```

示例版本号需与实际包一致。普通 main push 更新 Pages 和运行 CI，不自动发布 npm。此配置未自动开启 GitHub 分支保护；如需强制禁止跳过 CI，可将 `quality / validate` 设为 main 的 required status check。

官方说明：https://docs.npmjs.com/trusted-publishers/
