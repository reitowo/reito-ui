# RichTextEditor 块操作验收

日期：2026-09-07

## 范围

EDIT-05 在 EDIT-01～04 的同一 Tiptap 文档、受控值和历史栈上增加顶层块操作。范围包括官方 DragHandle 原生拖放、菜单与 `Alt+Shift+↑/↓` 移动、结构转换、删除、撤销/重做、选择与焦点恢复，以及 JSON/HTML/Markdown 同步输出。图片上传、AI 补全和宿主异步回调由 EDIT-06 单独验收。

## 行为与数据边界

- 拖拽句柄来自固定版本 `@tiptap/extension-drag-handle-react@3.31.3`；插件负责命中顶层节点、原生 drag/drop、位置映射与拖后选择恢复。句柄内容、菜单、tokens、受控适配和非拖拽操作由 Reito UI 实现。
- `blockControls` 控制整组块能力；`blockActions` 裁剪上移/下移、正文、一级/二级标题、无序/有序/任务列表、引用、代码块和删除。空动作集合显示明确空态。只读、禁用和关闭能力不会留下可写句柄。
- 菜单移动和键盘移动使用单一 delete/insert 事务，移动后的节点保持选中和编辑器焦点。首块不能上移，末块不能下移；已有结构的转换动作禁用。
- 转换经 Tiptap command 写入真实 schema 节点；删除唯一块时以空 paragraph 保持合法文档。移动、转换与删除都进入 StarterKit 历史，可由同一撤销/重做按钮恢复。
- 受控宿主继续接收当前 `format` 的值和同步 snapshot。JSON/HTML 保留安装 schema 支持的结构，Markdown 输出对应结构语法。首版只声明顶层块；嵌套块句柄、跨编辑器拖放、多块框选和协作位置不在范围内。

## 自动验证

- `npx playwright test tests/rich-text-editor.spec.ts`：63/63 通过，其中 14 项覆盖本阶段块行为和四套主题/密度视觉状态，其余为 EDIT-01～04 回归。
- 块断言覆盖菜单命中与边界禁用、受控菜单移动、`Alt+Shift` 键盘事务、Markdown/HTML/JSON 同步、正文/heading/三类列表/引用/代码转换、删除/撤销/重做、唯一块删除、空动作集合、只读/禁用/关闭能力，以及官方句柄的 native drag。
- Playground 在同一 Story 公开 17 项 Controls；新增 `blockControls` 与 `blockPreset`，后者可在 full、move、structure、none 间切换，无需离开当前 Story。
- 对生产构建后的静态 Storybook 执行本族 41 个 Story × dark/light × compact/comfortable 共 164 个组合：164/164 通过，page error、console error、WCAG 2A/2AA/2.1AA 违规和页面级横向溢出均为 0；报告为 `.logs/rich-text-editor/storybook-audit-edit-05-static.json`。
- `npm run check` 与 `npm run build`：通过；构建只报告既有大 chunk 提示。

## 视觉检查

参考上下文为 Nuxt UI EditorDragHandle 的块重排能力说明、Tiptap 3.31.3 Drag Handle 官方文档与已安装源码；视觉继续按 Graphite 的 Cursor 向紧凑桌面工作面实现。检查 `.logs/rich-text-editor/blocks-dark-compact.png`、`blocks-dark-comfortable.png`、`blocks-light-compact.png` 与 `blocks-light-comfortable.png`：句柄只占一个 XS 控件槽位，正文 padding 与占位符同步；菜单复用现有 Popover、Button、Separator 和 container/space/control-height tokens，选中块使用 ring 语义轮廓，危险动作使用 destructive 角色。四套组合没有新增局部颜色、固定像素高度或页面横向溢出。

与参考能力的剩余差异是首版不提供嵌套块句柄、拖拽菜单自定义 renderer、多块框选操作或跨编辑器拖放。Reito UI 没有复制 Nuxt UI 的 Vue 模板、样式、图标或资产。
