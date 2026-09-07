# RichTextEditor 基本编辑操作验收

日期：2026-09-07

## 范围

EDIT-02 在 EDIT-01 的 Tiptap schema 文档上增加固定工具栏、选区格式状态、mark/heading/list/blockquote/clear-format 事务、链接编辑与协议拒绝、撤销重做和 `Mod-K`。工具栏可整体隐藏或按公开 item ID 裁剪；任务列表、对齐、emoji、suggestion/mention、块操作、媒体和 AI 接点仍按 EDIT-03～06 单独验收。

## 自动验证

- `npx playwright test tests/rich-text-editor.spec.ts --workers=1`：27/27 通过，其中 8 项为本阶段新增行为，19 项为内容模型回归。
- 新增断言覆盖 mark 与 clear-format 的真实 Markdown/DOM 输出、标题和双列表项结构、选区格式激活态、链接按钮与 `Mod-K` 的选区恢复、危险协议拒绝、unlink、初始历史清洁、按钮/快捷键共用 undo/redo、工具栏裁剪/隐藏/禁用，以及 composition 期间不打开链接面。
- Playground 在同一 Story 公开 11 项 Controls：`format / value / label / description / placeholder / readOnly / disabled / showToolbar / toolbarPreset / linkPlaceholder / showOutput`，回调继续回写当前画布。
- 对生产构建后的静态 Storybook 执行本族 23 个 Story × dark/light × compact/comfortable 共 92 个组合：92/92 通过，page error、console error、可访问性违规和页面级横向溢出均为 0；源码指纹在审计期间保持不变。报告为 `.logs/rich-text-editor/storybook-audit-edit-02-static.json`。
- `npm run check` 与 `npm run build`：通过；生产构建只保留既有 chunk size 提示。

## 视觉检查

核对 Nuxt UI 4.11.0 当前 Editor/EditorToolbar 工作面与 `.logs/rich-text-editor/toolbar-dark-compact.png`、`dark-compact.png`、`light-comfortable.png`。两者都把 marks、heading、lists、blockquote、link 与 history 建模为可执行且可判断状态的工具项，并允许工具栏按场景组合。Nuxt UI 还提供 fixed/bubble/floating 三种布局；Reito 当前固定工具栏使用 XS 图标按钮、弱底色、短分隔线和单一底边界，窄面板时在自身横向滚动，正文仍是主要工作面。

Reito 没有复制 Nuxt UI 的 Vue handler、模板、样式或图标资产。当前差异是未提供 bubble/floating 布局和自定义 handler 注册；这些能力需要与后续扩展、选择菜单和块操作一起设计，不能由 EDIT-02 的字符串 item 列表冒充。
