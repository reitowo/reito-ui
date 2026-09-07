# RichTextEditor 建议与提及验收

日期：2026-09-07

## 范围

EDIT-04 在 EDIT-02/03 的同一 Tiptap 文档和历史栈上组合 Suggestion 与 Mention。`/` 菜单覆盖顶层行首结构转换、筛选和插入；`@` 菜单覆盖本地数据、异步 Provider、旧请求取消、加载/空结果、禁用项、键盘选择/退出和 JSON/HTML/Markdown 序列化。块重排、媒体与 AI 接点继续由 EDIT-05～06 单独验收。

## 行为与数据边界

- `/` 只在顶层 paragraph 行首触发；已有正文后的 `/` 和列表内 `/` 不打开。命令执行删除触发查询并创建 paragraph、heading、bullet/ordered/task list、blockquote、code block 或 horizontal rule 节点。
- `@` 只在默认空白边界触发，电子邮箱式文本不打开。同步项目按 ID、标签、说明和关键词筛选；禁用项可见但不会成为活动项。异步 Provider 接收 AbortSignal，新查询中止旧请求，未中止错误通过 `onSuggestionError` 回传。
- 编辑器继续持有焦点。方向键循环活动项，Home/End 跳到边界可用项，Enter/Tab 插入，Escape 退出但保留查询。`aria-controls` 与 `aria-activedescendant` 只在菜单存在时写入；Portal 外层有命名 region，列表使用 listbox/option。只读、禁用、关闭能力和组合输入不会执行建议。
- Mention 节点在 JSON 保存属性，在 HTML 使用 `data-type="mention"`，在 Markdown 使用 Tiptap Mention 的 inline extension 语法并可重新解析。Provider 身份、授权与持久化仍由宿主负责。

## 自动验证

- `npx playwright test tests/rich-text-editor.spec.ts --reporter=line`：49/49 通过，其中 11 项为本阶段新增，38 项为 EDIT-01～03 回归。
- 新增断言覆盖 `/h2` 筛选与真实 heading 插入、行首边界、Escape 保留查询、本地提及、禁用项跳过、Tab 选择、三格式 snapshot、异步加载与最新查询、邮箱边界、空结果、关闭能力和组合输入保护。
- Playground 在同一 Story 公开 15 项 Controls：`format / value / label / description / placeholder / readOnly / disabled / showToolbar / toolbarPreset / emojiPreset / suggestions / mentionPreset / slashPreset / linkPlaceholder / showOutput`。
- 对生产构建后的静态 Storybook 执行本族 35 个 Story × dark/light × compact/comfortable 共 140 个组合：140/140 通过，page error、console error、WCAG 2A/2AA/2.1AA 违规和页面级横向溢出均为 0；报告为 `.logs/rich-text-editor/storybook-audit-edit-04-static.json`。
- `npm run check` 与 `npm run build`：通过；构建只报告既有大 chunk 提示。

## 视觉检查

重新核对 Tiptap 3.31.3 Mention/Suggestion 官方文档与安装源码，并沿用已记录的 Nuxt UI 4.11.0 Editor 工作面作为能力参考。对照 `.logs/rich-text-editor/suggestions-dark-compact.png` 和 `suggestions-light-comfortable.png`：Reito 菜单使用既有 popover、accent、muted、container、shadow 和 control-height tokens；正文保持 14px，菜单贴近触发文字且不移动编辑焦点，禁用项降低强调。深浅主题和两档密度都没有新增局部颜色或固定像素高度。

当前差异是斜杠命令集合由组件内置、宿主只能裁剪，尚未公开任意自定义 command/render registry；异步提及没有分页、重试按钮或远程缓存。Reito 没有复制 Nuxt UI 的 Vue 模板、样式、图标或资产。
