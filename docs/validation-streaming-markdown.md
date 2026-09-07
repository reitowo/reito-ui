# 流式 Markdown 验收

2026-09-07，`MARKDOWN-02` 完成。`MarkdownContent` 增加追加式流的未闭合语法恢复、显式新流 key、busy 状态和可关闭/可配置的处理策略；`RichMessage` 自动把消息 streaming 状态传给正文。实现继续使用同一 CommonMark/GFM 文档树和 Graphite 排版，没有引入另一套消息组件或外部产品样式。

## 自动验证

- `npx playwright test tests/markdown-content.spec.ts --reporter=line`：37/37 通过，其中 13 项覆盖流式新增能力与四种主题密度，24 项回归 MARKDOWN-01。验证未闭合强调/链接/fenced code、禁用补全、表格阶段变形、前置节点身份、手动追加/完成、`streamKey` 重置、RichMessage 透传、原文复制、Controls、窄屏和 axe。
- `npx playwright test tests/workbench-app.spec.ts --reporter=line`：14/14 通过。固定本地播放现在通过 RichMessage 使用流式 Markdown，消息、编辑、停止、产物和三视图原有流程保持通过。
- MarkdownContent / RichMessage 组件族共 25 个 Story；25 × dark/light × compact/comfortable 为 100/100 次冻结 Storybook 组合。page error 0、console error 0、WCAG 2A/2AA/2.1AA 违规 0、页面水平溢出 0。报告为 `.logs/markdown-content/storybook-audit-markdown-02-static.json`。
- 主 Playground 公开九项内容与组合 Controls；流式 Playground 在同一 Canvas 公开 `source / chunkSize / intervalMs / autoStart / asMessage / completeIncompleteMarkdown` 六项 Controls，并提供播放、暂停、单步、完成和重置。
- `npm run check` 与 `npm run build`：通过。全库保持 122 个组件族（基础 70、复杂 32、AI 20）；构建只保留既有 chunk size 提示。

## 参考与视觉核对

尾部恢复能力核对 Streamdown 官方 streaming / remend 说明与 remend 1.3.1 README；静态 AST、安全与 URL 规则继续以 react-markdown / remark-gfm 官方文档为准。Reito UI 使用 remend 的文本预处理能力，没有采用 Streamdown 的组件结构、主题、代码插件、数学或图表实现。

人工查看 `.logs/markdown-content/streaming-dark-compact.png`、`streaming-dark-comfortable.png`、`streaming-light-compact.png` 与 `streaming-light-comfortable.png`：流式正文沿用 14px / 24px，Message 只显示一处“正在输出”；未闭合代码仍是单层 CodeBlock，局部内容增长没有额外卡片或页面水平溢出。表格阶段使用同一紧凑 cell tokens，只有合法分隔行出现时才切换语义。

本项处理追加式完整 source。任意位置 patch、乱序 token、MDX/数学/图表、代码执行、异步插件 Suspense、跨消息虚拟化和完成播报由宿主或后续专门能力承担；`streamKey` 是重置边界，不会自动判断业务分支身份。
