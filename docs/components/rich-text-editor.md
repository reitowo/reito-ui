# RichTextEditor

`RichTextEditor` 是复杂层的 schema 文档编辑面。它使用 Tiptap / ProseMirror 状态与事务，不把浏览器 `contentEditable` DOM 当作宿主数据模型。

```tsx
const [value, setValue] = useState('# 工作区说明\n\n使用 **Graphite** 组件。')

<RichTextEditor
  format="markdown"
  value={value}
  onValueChange={next => setValue(String(next))}
  label="工作区说明"
/>
```

## 内容契约

- `format="json"` 接收 `type: "doc"` 的 Tiptap `JSONContent`，并严格按当前 StarterKit schema 校验。这是保真度最高、适合长期保存和后续扩展的规范格式。
- `format="html"` 接收字符串。支持的元素和属性会进入文档树，未知节点、事件属性和当前 schema 不理解的结构会被规范化或移除。
- `format="markdown"` 接收字符串，经 `@tiptap/markdown` 解析为同一 JSON 文档树；输出会规范列表缩进、空行和部分内嵌 HTML。Markdown 扩展仍处于 Tiptap 的 Beta 阶段，不承诺任意 Markdown 方言逐字往返。
- `onValueChange(value, snapshot)` 的第一个参数按当前 `format` 输出；`snapshot` 同时提供 `json / html / markdown / text / isEmpty`。宿主可以保存选定格式，也能检查转换后的规范结果。
- `value` 是受控值，`defaultValue` 是初始未受控值。组件会跳过较旧的受控回声，避免快速输入或中文组合输入被宿主前一个事务覆盖；真正不同的外部值仍会替换当前文档。

`value` 与 `format` 必须匹配：JSON 使用对象，HTML/Markdown 使用字符串。解析失败会保留最后一个有效文档、显示错误，并调用 `onContentError`。`error` 用于展示宿主保存或加载失败，不会删除当前草稿。

## 状态与布局

`readOnly` 保留阅读和选择能力，`disabled` 暴露禁用语义；两者都停止文档编辑。空文档的 `placeholder` 是界面提示，不进入序列化内容。编辑区使用 `--rui-editor-min-height`、内容 padding、语义边界和 Graphite 排版 token；`editorClassName` 可用已有 token 类组合具体容器高度。

当前 StarterKit 支持段落、标题、加粗/斜体/删除线/下划线、链接、列表、引用、代码块和分隔线的内容模型与原生输入行为。`EDIT-01` 只验收基础模型和格式边界；工具栏、格式状态、撤销/重做 UI、任务列表、提及、块重排、图片上传和 AI 回调分别由后续 `EDIT-02`–`EDIT-06` 提供。

默认 HTML schema 会移除示例中的脚本和事件属性，但这不能替代消费应用对自定义扩展、URL 协议和服务端输出的安全策略。添加新节点或属性时，应同时定义解析、序列化、展示和输入校验边界。
