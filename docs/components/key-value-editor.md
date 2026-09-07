# KeyValueEditor 键值编辑

`KeyValueEditor` 管理有序、受控的配置草稿。每项使用稳定 `id`，键和值在修正前可以暂时为空、重复或无效；提交时组件修剪键，保留值的字符串表示。

```tsx
<KeyValueEditor
  value={entries}
  onValueChange={setEntries}
  onDraftValueChange={(id, patch, path) => recordDraft(path, patch)}
  requireValues
  onSubmit={saveConfiguration}
/>
```

| 能力 | 契约 |
| --- | --- |
| 值类型 | `kind` 支持 `text`、`number`、`boolean`、`select`、`date`。值始终为字符串；数字可保留无效草稿，布尔使用 `"true" / "false"`。 |
| 路径 | `path` 是字符串/数字段数组；缺省时草稿回调使用修剪后的键，空键回退稳定 ID。组件不自行构造嵌套对象。 |
| 验证 | 键必填且按修剪后文本区分大小写判重；值可全局必填，并支持数字上下界、选项范围、日期格式及 `validateValue`。 |
| 状态 | `disabled` 可用于整个编辑器或单项；`readOnly` 保留复制与敏感值显隐，但禁止修改和删除。 |
| 敏感值 | `secret` 只对文本输入提供视觉遮罩，不加密、不清除浏览器内存，也不替代凭据存储。 |
| 提交 | `onValueChange` 保存每次草稿变化；`onSubmit` 是可选异步事务入口，失败保留当前数组。完整重置与跨字段事务属于 PROPERTIES-02。 |

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-keyvalueeditor-键值编辑--playground) 可在同一 Story 切换类型、路径、敏感与逐项禁用；[富类型值](http://127.0.0.1:6006/?path=/story/复杂-keyvalueeditor-键值编辑--typed-values)和[嵌套路径](http://127.0.0.1:6006/?path=/story/复杂-keyvalueeditor-键值编辑--nested-paths)提供独立预设。
