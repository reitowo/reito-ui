# RichTextEditor 编辑扩展验收

日期：2026-09-07

## 范围

EDIT-03 在 EDIT-02 的统一 Tiptap 文档、工具栏和历史栈上组合 TaskList/TaskItem、TextAlign 与 Emoji。任务列表包含 Markdown 解析和导出、checked 状态、嵌套与键盘层级；对齐覆盖 paragraph/heading 的四个值；Emoji 使用八项工作区短码集合、可裁剪选择器与空态。Suggestion/Mention、块操作、媒体和 AI 接点继续由 EDIT-04～06 单独验收。

## 格式边界

- 任务列表在 JSON 中保存 `taskList / taskItem / checked`，HTML 输出 `data-type` 与 checkbox，Markdown 支持 `- [ ]`、`- [x]` 和缩进嵌套。
- 对齐在 JSON 中保存 `textAlign`，HTML 输出 `text-align`；Markdown 没有等价属性，导出会丢失对齐。
- Emoji 在 JSON 中保存 inline `emoji` 节点，HTML 输出 `data-type="emoji" / data-name`，Markdown 导出 `:name:`。当前 Emoji 扩展没有 Markdown parse hook，新编辑器从 Markdown 重载时把短码当普通文本。

## 自动验证

- `npx playwright test tests/rich-text-editor.spec.ts --workers=1`：38/38 通过，其中 11 项为本阶段新增，27 项为 EDIT-01/02 回归。
- 新增断言覆盖任务 Markdown 的嵌套/checked 解析与复选框回写、`Mod-Shift-9`、Enter、Tab/Shift-Tab、只读复选框、四种对齐的 active 状态与 HTML/JSON/Markdown 输出差异、Emoji 选区恢复、选择器空态、shortcode 输入规则及三格式 snapshot。
- Playground 在同一 Story 公开 12 项 Controls：`format / value / label / description / placeholder / readOnly / disabled / showToolbar / toolbarPreset / emojiPreset / linkPlaceholder / showOutput`。
- 对生产构建后的静态 Storybook 执行本族 29 个 Story × dark/light × compact/comfortable 共 116 个组合：116/116 通过，page error、console error、WCAG 2A/2AA/2.1AA 违规和页面级横向溢出均为 0；源码指纹在审计期间保持不变。报告为 `.logs/rich-text-editor/storybook-audit-edit-03-static.json`。
- `npm run check` 与 `npm run build`：通过；构建只报告既有大 chunk 提示。

## 视觉检查

重新核对 Nuxt UI 4.11.0 Editor/EditorToolbar 的固定工具栏组合方式，以及 Tiptap 当前 TaskList、TaskItem、TextAlign、Emoji 文档与安装源码。对照 `.logs/rich-text-editor/extensions-dark-compact.png` 和 `extensions-light-comfortable.png`：Reito 使用 XS 图标工具栏、单一弱底边界、正文 14px、token 内容间距和原生 checkbox 语义；任务项不增加表格行高，嵌套只增加列表缩进。深浅主题与两种密度均保持正文为主要工作面。

当前差异是没有 Nuxt UI 的 bubble/floating 工具栏与自定义 handler registry，也没有 Emoji suggestion 菜单。对齐在 Firefox 的 `white-space: pre-wrap` 与 justify 组合仍受 Tiptap 官方记录的浏览器限制；这些不由样式补丁伪装解决。Reito 没有复制 Nuxt UI 的 Vue 模板、样式、图标或资产。
