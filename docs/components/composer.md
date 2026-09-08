# Composer 结构化草稿

Composer 保留原生多行输入、字符串 `value/defaultValue/onValueChange` 和 `onSubmit(text)`。需要文件或人员引用时，使用 `draft/defaultDraft` 与 `onDraftChange`；同时提供字符串和结构化值时，`draft` 优先。

```tsx
const [draft, setDraft] = useState<ComposerDraft>({
  text: '', mentions: [], contextIds: [],
});
<Composer
  draft={draft}
  onDraftChange={setDraft}
  mentionItems={[{ id: 'design', label: 'design-language.md', kind: 'file' }]}
  commandItems={[{ id: 'review', label: 'review', insertText: '请检查当前文件：' }]}
  onSubmit={() => undefined}
  onSubmitDraft={async next => saveDraft(next)}
/>
```

`onSubmitDraft` 存在时只调用它，旧的 `onSubmit` 仍是必需 prop，但不会再被调用。宿主负责实际请求、持久化、文件解析与人员权限；示例仅演示本地行为。

## 值与提交

- `ComposerDraft` 包含 `text`、`mentions` 和 `contextIds`。提及保存稳定 `key`、`itemId`、`kind`、`label` 和原生字符串 UTF-16 的 `[start, end)` 区间。
- 选中提及插入 `@label` 及空格；编辑其前方文字会移动区间，修改提及内部文字会解除结构化引用，保留用户文字。移除提及标签删除对应文字和一个尾随空格。
- `contextItems` 显式提供时决定当前上下文 ID；移除动作通过 `onContextRemove` 通知宿主更新数组。未提供时使用草稿的 `contextIds`，以 ID 作为显示标签。普通 `context` 插槽仅负责展示，不生成结构化值。
- 受控宿主应同步回写变化，并提供唯一提及 key、有效且不重叠的区间。纯字符串外部更新不能重建文件引用。
- 提交期间禁用输入和移除操作、防止重复发送；失败保留草稿并显示错误。成功仅清空仍与提交值一致的文字和提及，上下文保留。宿主在等待期间替换的新草稿不应被旧请求清空。

## 命令与键盘

行首或空白后的 `/` 与 `@` 打开对应候选；未配置候选数据时按普通字符处理。候选按标签、描述和关键词过滤。命令的 `insertText` 替换触发文本，未提供时删除触发文本并通过 `onCommandSelect` 交由宿主处理动作。

上下键跳过禁用项并循环，活动项自动滚入可视区域，焦点保留在输入框。Enter 选择候选；空结果时阻止误发。Escape 关闭，Tab 继续焦点导航，Shift+Enter 换行。组合输入期间的 Enter 不选择或发送；自动化测试使用合成 composition 事件，不代表真实系统 IME 已验证。

Storybook 的 Playground 同页调整命令、提及、上下文开关及基础输入参数。另有结构化提交、失败恢复、移除、禁用、空候选和长候选列表场景。附件粘贴和上传仍由 `AI-COMPOSER-02` 跟踪。
