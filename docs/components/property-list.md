# PropertyList 属性编辑

`PropertyList` 用于设置检查器和属性面板中的固定字段。每个 `PropertyItem` 具有稳定 `key`，可选 `path` 表达嵌套业务位置；当前内置 `text`、`number`、`boolean`、`select` 和 `date` 五种编辑器。

```tsx
<PropertyList
  items={[
    { key: 'fontSize', path: ['editor', 'fontSize'], label: '字号', value: 14, kind: 'number', min: 10, max: 24 },
    { key: 'wordWrap', path: ['editor', 'wordWrap'], label: '自动换行', value: true, kind: 'boolean' },
    { key: 'density', path: ['appearance', 'density'], label: '密度', value: 'compact', kind: 'select', options: densityOptions },
  ]}
  onDraftValueChange={(key, draft, path) => updateDraft(path, draft)}
  onValueChange={(key, value, path) => updateSettings(path, value)}
/>
```

| 能力 | 契约 |
| --- | --- |
| 字段类型 | 文本保留字符串；数字在保存时解析并检查有限值和 `min/max`；布尔使用 Switch；选项只提交未禁用的已知值；日期提交本地 `YYYY-MM-DD` 字符串。 |
| 草稿与保存 | 编辑期间只调用 `onDraftValueChange`；点击保存或 Enter 后通过 `onValueChange` 提交。Escape 与取消恢复当前受控值并把焦点还给编辑按钮。 |
| 嵌套路径 | `path` 是字符串/数字段数组；省略时回调得到 `[key]`。组件显示显式路径，但不自行读取或改写嵌套对象。 |
| 验证 | 内置数字、选项与日期边界先执行，再调用项目级 `validate(value)`。错误使用共享 FieldError 并保留草稿。 |
| 状态 | 列表级 `disabled` 禁用全部字段；项目级 `disabled` 保留编辑入口但不可操作；`readOnly` 不提供编辑入口。 |

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-propertylist-属性编辑--playground) 可在同一 Story 切换字段类型、路径、禁用和只读；[嵌套路径与草稿](http://127.0.0.1:6006/?path=/story/复杂-propertylist-属性编辑--nested-paths)演示宿主回写。
