# RichTextEditor

`RichTextEditor` 是复杂层的 schema 文档编辑面。它使用 Tiptap / ProseMirror 状态与事务，不把浏览器 `contentEditable` DOM 当作宿主数据模型。

```tsx
const [value, setValue] = useState('# 工作区说明\n\n使用 **Graphite** 组件。')

<RichTextEditor
  format="markdown"
  value={value}
  onValueChange={next => setValue(String(next))}
  label="工作区说明"
  toolbarItems={['bold', 'italic', 'heading-1', 'task-list', 'align-left', 'emoji', 'link', 'undo', 'redo']}
/>
```

## 内容契约

- `format="json"` 接收 `type: "doc"` 的 Tiptap `JSONContent`，并严格按当前 StarterKit schema 校验。这是保真度最高、适合长期保存和后续扩展的规范格式。
- `format="html"` 接收字符串。支持的元素和属性会进入文档树，未知节点、事件属性和当前 schema 不理解的结构会被规范化或移除。
- `format="markdown"` 接收字符串，经 `@tiptap/markdown` 解析为同一 JSON 文档树；输出会规范列表缩进、空行和部分内嵌 HTML。Markdown 扩展仍处于 Tiptap 的 Beta 阶段，不承诺任意 Markdown 方言逐字往返。
- `onValueChange(value, snapshot)` 的第一个参数按当前 `format` 输出；`snapshot` 同时提供 `json / html / markdown / text / isEmpty`。宿主可以保存选定格式，也能检查转换后的规范结果。
- `value` 是受控值，`defaultValue` 是初始未受控值。组件会跳过较旧的受控回声，避免快速输入或中文组合输入被宿主前一个事务覆盖；真正不同的外部值仍会替换当前文档。

`value` 与 `format` 必须匹配：JSON 使用对象，HTML/Markdown 使用字符串。解析失败会保留最后一个有效文档、显示错误，并调用 `onContentError`。`error` 用于展示宿主保存或加载失败，不会删除当前草稿。

## 基本编辑操作

`toolbar` 默认为 `true`，渲染一行固定工具栏。`toolbarItems` 接收公开的 `RichTextEditorToolbarItem[]`，默认顺序覆盖加粗、斜体、下划线、删除线、行内代码、清除格式、正文、一级/二级标题、无序/有序/任务列表、引用、四种对齐、Emoji、链接/取消链接、撤销与重做。宿主可按工作面裁剪：

```tsx
<RichTextEditor
  format="html"
  value={value}
  onValueChange={setValue}
  toolbarItems={['bold', 'italic', 'task-list', 'align-left', 'align-center', 'emoji', 'undo', 'redo']}
/>
```

- mark、heading、list、blockquote 与 clear-format 按钮执行 Tiptap command，回调值来自变更后的 schema 文档；具有状态的按钮通过 `aria-pressed` 反映当前选区。混合选区不会误报为统一格式。
- 链接按钮只在存在文本选区或光标处于现有链接时可用。点击或按 `Mod-K` 会保存选区，链接 Popover 获得焦点后仍能把 mark 写回原文字；空地址和 Tiptap 拒绝的协议会保留内容并显示错误。`linkPlaceholder` 只改变输入提示。
- StarterKit 提供 `Mod-B / Mod-I / Mod-U / Mod-E` 等格式快捷键及平台对应的撤销/重做快捷键；按钮与键盘使用同一个历史栈。初始值和外部受控替换标记为非用户历史，不会让首次“撤销”回到空文档。
- 工具栏是单一 Tab 停靠点；左右方向键循环移动，Home/End 跳到首尾可用动作。禁用项不会进入方向键序列。
- 工具栏按钮在 `readOnly` 或 `disabled` 时不可执行。中文组合输入期间自定义 `Mod-K` handler 返回给输入法，不打开弹层；真实操作系统输入法仍应由消费应用人工验证。
- 默认固定工具栏在窄工作面保持单行并允许自身横向滚动。`toolbar={false}` 可隐藏整行，但不会移除 StarterKit 的原生键盘编辑能力；此时组件不会接管 `Mod-K`。

## 任务列表、对齐与 Emoji

EDIT-03 安装固定版本的 Tiptap TaskList、TaskItem、TextAlign 与 Emoji 扩展，并把动作接到同一工具栏与同一历史栈。扩展没有独立的富文本状态。

- `task-list` 把当前块转换为 `taskList / taskItem` 节点。Markdown 输入输出支持 `- [ ]`、`- [x]` 和缩进后的嵌套任务；复选框更新真实 `checked` 属性。`Mod-Shift-9` 切换任务列表，Enter 拆分任务，Tab / Shift-Tab 下沉或提升任务。只读复选框不会改变文档。
- `align-left / align-center / align-right / align-justify` 作用于 paragraph 与 heading。对齐值进入 JSON 的 `textAlign` 属性和 HTML 的 `style="text-align: …"`，但 Markdown 没有等价表示，导出 Markdown 时会丢失该属性。长期保存含对齐的文档应选择 JSON，或选择可接受该限制的 HTML。
- `emoji` 插入真正的 inline `emoji` 节点。默认选择器只公开八个工作区常用项，`emojiItems` 可以用 `RichTextEditorEmojiName[]` 调整顺序、缩小集合或传空数组显示空态；扩展还识别 `:sparkles:` 等已登记 shortcode 输入规则。输出 HTML 包含 `data-type="emoji"`，JSON 保留节点名称，Markdown 输出 `:name:`。
- Emoji 的 Markdown 扩展只声明导出，没有声明把 `:name:` 重新解析为 emoji 节点。因此当前受控会话会保留刚插入的节点，但把输出 Markdown 交给一个新编辑器解析时会得到普通文本 shortcode。需要跨会话保留节点身份时使用 JSON。

```tsx
<RichTextEditor
  format="json"
  value={document}
  onValueChange={setDocument}
  toolbarItems={['task-list', 'align-left', 'align-center', 'align-right', 'emoji']}
  emojiItems={['eyes', 'check', 'warning']}
/>
```

## 斜杠命令与提及

`suggestions` 默认为 `true`。顶层空段落的行首输入 `/` 会打开结构命令，空格后输入 `@` 会打开提及菜单；电子邮箱式的行内 `@`、已有正文后的 `/` 以及列表内的 `/` 不触发菜单。两个菜单都保留编辑器焦点，使用方向键、Home/End、Enter 或 Tab 选择，Escape 只关闭菜单并保留已经输入的查询。

```tsx
<RichTextEditor
  format="json"
  value={document}
  onValueChange={setDocument}
  mentionItems={[
    { id: 'reito', label: 'Reito', description: '设计系统维护者' },
    { id: 'lin', label: 'Lin', description: '组件工程' },
  ]}
  slashCommands={['paragraph', 'heading-1', 'heading-2', 'task-list', 'blockquote']}
/>
```

- `slashCommands` 从内置命令 ID 中选择可见能力。当前内置正文、一级/二级标题、无序/有序/任务列表、引用、代码块和分隔线；执行后删除 `/查询` 并写入真实 schema 节点。
- `mentionItems` 提供本地数据并按 `id / label / description / keywords` 筛选。`disabled` 项可见但不会成为键盘活动项，也不能插入。
- `loadMentionItems(query, { signal })` 用于异步 Provider；存在时取代本地筛选。新查询会中止旧请求，加载和空结果有明确状态。未中止的失败调用 `onSuggestionError` 并把本次结果置空，宿主负责日志或重试入口。
- 提及插入 inline `mention` 节点和一个尾随空格。JSON 保存 `id / label / mentionSuggestionChar`，HTML 输出 `data-type="mention"` 与数据属性，Markdown 使用 Tiptap Mention 的可解析内联扩展语法。外部 Provider 返回的 ID、标签和关键词仍应由宿主按自己的身份与授权边界校验。
- `suggestions={false}` 会关闭两个触发器；切换为只读或禁用也会立即退出已打开菜单。组合输入期间不会打开菜单，也不会让 Enter 选择建议。

## 块操作

`blockControls` 默认为 `true`。可编辑内容在顶层块左侧保留一个 XS 控件槽位；悬停块时显示官方 Tiptap DragHandle，拖动会通过原生 ProseMirror drop 事务重排块。点击句柄或工具栏中的 `block-actions` 会打开同一个菜单。`blockActions` 可裁剪菜单能力，也可以传空数组保留明确空态：

```tsx
<RichTextEditor
  format="markdown"
  value={value}
  onValueChange={setValue}
  toolbarItems={['block-actions', 'undo', 'redo']}
  blockActions={['move-up', 'move-down', 'heading-2', 'blockquote', 'delete']}
/>
```

- 默认动作包括上移/下移、正文、一级/二级标题、无序/有序/任务列表、引用、代码块和删除。已经是当前结构的转换动作以及首块上移、末块下移会直接禁用。
- 菜单移动与 `Alt+Shift+↑/↓` 使用同一个顶层块事务；移动后的块保持节点选择与编辑器焦点。原生拖放由 DragHandle 插件恢复拖动前的多节点选择。
- 转换先把当前顶层块归一为可转换文本块，再执行对应 Tiptap command。删除唯一块会留下一个空 paragraph，确保文档 schema 仍有效；删除、移动和转换都进入同一个撤销/重做历史。
- `value / onValueChange` 仍按选定格式工作。JSON 与 HTML 保留安装 schema 能表达的结构；Markdown 输出对应的 heading、list、quote 和 fenced code 语法。外部受控替换仍以宿主值为准。
- `readOnly`、`disabled` 或 `blockControls={false}` 会移除拖拽句柄；工具栏块动作在只读/禁用时不可执行，关闭能力时从可见工具栏过滤。`blockActions` 只做能力裁剪，不是权限系统，宿主仍应在业务层校验最终写入。

当前范围是文档的顶层块。嵌套列表项的独立句柄、跨编辑器拖放、多块框选操作和协作光标不在 EDIT-05 契约内。

## 状态与布局

`readOnly` 保留阅读和选择能力，`disabled` 暴露禁用语义；两者都停止文档编辑。空文档的 `placeholder` 是界面提示，不进入序列化内容。编辑区使用 `--rui-editor-min-height`、内容 padding、语义边界和 Graphite 排版 token；`editorClassName` 可用已有 token 类组合具体容器高度。

当前 StarterKit 支持段落、标题、加粗/斜体/删除线/下划线、链接、列表、引用、代码块和分隔线；EDIT-03 额外组合任务列表、对齐与 Emoji，EDIT-04 组合斜杠命令与提及，EDIT-05 组合顶层块句柄和块事务。`EDIT-01` 验收基础模型和格式边界，`EDIT-02` 验收固定工具栏、格式状态、链接和历史，`EDIT-03` 验收扩展节点、键盘操作和三格式边界，`EDIT-04` 验收触发范围、同步/异步筛选、键盘退出和插入序列化，`EDIT-05` 验收受控拖拽/键盘移动、转换、删除、历史、焦点和序列化；图片上传和 AI 回调由后续 `EDIT-06` 提供。

默认 HTML schema 会移除示例中的脚本和事件属性，但这不能替代消费应用对自定义扩展、URL 协议和服务端输出的安全策略。添加新节点或属性时，应同时定义解析、序列化、展示和输入校验边界。
