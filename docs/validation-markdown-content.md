# MarkdownContent / RichMessage 验收

2026-09-07，`MARKDOWN-01` 完成。新增安全默认的 CommonMark/GFM 阅读面 `MarkdownContent`，并通过 `RichMessage` 组合现有消息角色、流式状态和附加内容。Workbench 例工程已经直接消费公共 `RichMessage`，没有复制渲染实现。

## 自动验证

- `npx playwright test tests/markdown-content.spec.ts --reporter=line`：24/24 通过。覆盖 CommonMark/GFM 语义、表格局部滚动、任务复选框、fenced code 高亮与原文复制、单层 CodeBlock 边界、行内代码、链接策略、HTML 转义/移除、危险 URL、元素筛选、自定义节点/代码渲染、空态、长文、窄面和四种主题密度 axe。
- `npx playwright test tests/workbench-app.spec.ts --reporter=line`：14/14 通过。Workbench 的本地消息发送、编辑、停止、重试、分支、附件、上下文、快捷命令、产物等原有路径保持通过，并确认用户与助手正文都由 `MarkdownContent` 呈现。文件页只有少量本地示例日志，显式使用 LogViewer 的非虚拟配方，保留区域语义并避免对静态小集合启动虚拟测量。
- 17 个 Story × dark/light × compact/comfortable：68/68 通过；page error 0、console error 0、WCAG 2A/2AA/2.1AA 违规 0、页面水平溢出 0。报告为 `.logs/markdown-content/storybook-audit-markdown-01-static.json`。
- Playground 在同一 Story 公开 `value / htmlPolicy / externalLinkTarget / codeCopyable / asMessage / from / streaming / emptyText` 八项 Controls。
- `npm run check` 与 `npm run build`：通过。全库为 122 个组件族（基础 70、复杂 32、AI 20）；构建只保留既有 chunk size 提示。

## 参考与视觉核对

内容模型和安全默认值核对 react-markdown 官方 README；GFM 能力核对 remark-gfm 官方 README；消息与编辑面分层参考 Nuxt UI 当前 Components 目录中的 ChatMessage / ChatMessages / Editor 分类。视觉继续以 Reito Graphite 现有 `Message`、`CodeBlock` 和密度 tokens 为直接基线，没有移植外部产品界面。

人工查看 `.logs/markdown-content/document-dark-compact.png`、`document-light-comfortable.png`、`message-dark-compact.png` 与 `message-light-comfortable.png`：正文维持 14px / 24px，标题只提高一到两级，任务与表格内距紧凑；表格在局部容器滚动，fenced code 只有一层外框，消息没有为各段落重复加卡片。comfortable 密度保留共享 Message 的较大外部间距，内容字号不变。

当前仍不会执行原始 HTML、MDX、数学或图表语法，也不抓取外部链接。自定义 `urlTransform`、rehype 插件和节点渲染器会改变默认信任边界，需要宿主审查。流式未闭合语法与节点稳定仍归 `MARKDOWN-02`，本项没有以静态文档渲染替代其验收。
