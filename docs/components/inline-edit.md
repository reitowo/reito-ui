# InlineEdit

`InlineEdit` 为短文本和数字提供显示、编辑、校验与保存事务。值始终由宿主持有；组件只管理当前草稿、异步状态和焦点。

```tsx
<InlineEdit
  label="工作区名称"
  value={name}
  onValueChange={value => setName(String(value))}
  required
  validate={value => String(value).length < 2 ? '名称至少需要 2 个字符' : undefined}
  onSubmit={(value, { signal }) => saveName(String(value), signal)}
/>
```

点击显示按钮或用键盘激活后进入编辑，编辑器自动获得焦点。Enter 提交，Escape 或“取消”丢弃草稿并把焦点还给显示按钮；中文输入法组合期间的 Enter 不会提交。同步校验和异步提交失败都保留草稿并把焦点留在编辑器。异步保存期间禁止重复提交，但取消仍可用，并会中止传给宿主的 `AbortSignal`。

`kind="number"` 解析有限数字并支持 `min / max / step`。`readOnly` 输出静态文本且不创建按钮；`disabled` 保留显示按钮语义但不能进入编辑。`editing / onEditingChange` 可控制模式。

`renderDisplay(value)` 替换显示内容；`renderEditor({ draft, onDraftChange, inputProps })` 替换编辑器。自定义编辑器应把 `inputProps` 传给可聚焦控件，以保留标签、错误关联、禁用状态和自动聚焦。长段内容、富文本或多字段表单应使用相应编辑器，而不是扩张 InlineEdit。
