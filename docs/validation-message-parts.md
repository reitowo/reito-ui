# AI-PARTS-01 · 结构化消息 parts 验收

## 范围

新增公开 `MessageParts` 与 `StructuredMessage`。`MessagePart` 用稳定 ID 区分 `text / tool / source / attachment / artifact / unknown`，并把展示交给现有 `MarkdownContent`、`ToolCall`、`Sources`、`AttachmentList` 与 `ArtifactPanel`。统一状态为 `pending / streaming / complete / error`；请求、模型 Provider、持久化、工具执行和状态推进仍由宿主负责。

公开回调覆盖 part 重试、工具展开、附件移除/重试、产物版本/视图/关闭，全部带 part ID。文本 part 支持纯文本或 Markdown、追加流的 `streamKey`、已接收内容保留和错误恢复。运行时未知类型使用可读降级节点，不展示 payload；宿主可以通过 `renderUnknownPart` 替换。

本族共 18 个 Story：参数调试、全部已知类型、助手消息、纯文本、流式文本、工具等待/运行、错误、来源、附件、产物、显式/运行时未知类型、自定义未知渲染、空消息、稳定 ID 增量更新、宿主受控回调和窄工作面。Playground 在同一页面提供 12 项 Controls。

## 交互与视觉

`npx playwright test tests/message-parts.spec.ts tests/markdown-content.spec.ts`：53/53 通过。其中新增 16 项，覆盖已知类型映射顺序、消息 streaming 派生、稳定 part DOM 身份、工具重试 ID、附件与产物两级 ID、未知类型、错误保留、空态、同页 Controls、四种主题密度、axe 和窄工作面；MarkdownContent / RichMessage 37 项相关回归通过。

18 个 Story × 深浅主题 × 两种密度共 72 次 Storybook 审计：72/72 通过，0 页面错误、0 console 错误、0 axe 违规、0 横向溢出。报告为 `.logs/message-parts/storybook-audit.json`；四种组合截图位于 `.logs/message-parts/all-*.png`。

实际查看 Nuxt UI 4.11.1 当前 ChatMessage 深色桌面文档，视口 1265 × 712。官方示例把角色消息放在 `article`，推荐以稳定 ID 的 parts 渲染；助手正文保持裸露，用户消息用轻量背景，内容之间只留间距。本地 `all-dark-compact` 截图同样保持自然助手正文、轻量边界和紧凑工具行，并在其下顺序组合来源、附件和产物。由于验收 Story 同时覆盖五类 part，本地页面比官方单消息示例更长；Reito 没有采用头像、绿色品牌色、官网导航或营销文档布局。

## 仓库检查

- `npm run check`：通过。tokens 同步，catalog 为 131 个组件族（基础 70 / 复杂 40 / AI 21），100 组对比度通过，设计 token 审计为 0 个未批准项，四个工作区类型检查通过。
- `npm run build`：通过。tokens、catalog、UI、Lab、Storybook 和 Workbench 均完成生产构建；Vite 只保留已有的大 chunk 警告。
- Storybook 当前共 1370 个 Story，其中 1351 个属于组件族目录，两个应用配方共 19 个 Story。
- `git diff --check`：通过。

用法见 [MessageParts / StructuredMessage](components/message-parts.md)，外部依据和差异见 [参考记录](references.md#messageparts--structuredmessage2026-09-08-工作区增量)。
