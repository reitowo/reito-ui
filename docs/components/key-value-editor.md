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
| 提交 | `onValueChange` 保存每次草稿变化；`onSubmit(entries, changes)` 是可选异步事务入口，成功后才更新已应用基线。提交值会修剪键，值仍保持字符串。 |

## 数组事务

```tsx
<KeyValueEditor
  value={entries}
  defaultValue={defaultEntries}
  onValueChange={setEntries}
  validateAll={async current => validateConfiguration(current)}
  onSubmit={async (current, changes) => {
    const result = await applyConfiguration(current, changes);
    return result.conflict
      ? { entryErrors: { [result.id]: { value: result.message } } }
      : undefined;
  }}
/>
```

| 事务能力 | 契约 |
| --- | --- |
| 更改集 | `KeyValueChange` 以稳定 `id` 表示 `add`、`update`、`remove`，包含提交前后条目和数组位置；`onSubmit` 同时得到规范化完整数组。 |
| 跨行校验 | `validateAll` 可异步返回 `Record<entry.id, { key?, value? }>`。重复键也不会导致错误映射到错误行。 |
| 错误与恢复 | 服务端可返回 `entryErrors` 和全局 `error`；异常显示全局错误。失败时数组草稿、无效文本和敏感值显式状态仍由当前受控值决定，修改对应行后清除旧错误。 |
| 取消 | “取消更改”一次性通过 `onValueChange` 恢复最近一次成功应用的完整数组，包括添加、删除、编辑与顺序。 |
| 重置 | 提供 `defaultValue` 时显示“恢复默认”；默认数组成为待应用草稿，仍需显式提交。 |
| 切换记录 | 宿主切换到另一组配置时改变 `baselineKey`，当前 `value` 会成为新记录的已应用基线。 |

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-keyvalueeditor-键值编辑--playground) 可在同一 Story 切换类型、路径、敏感、事务开关和提交结果；[批量事务与跨行校验](http://127.0.0.1:6006/?path=/story/复杂-keyvalueeditor-键值编辑--transactional)、[富类型值](http://127.0.0.1:6006/?path=/story/复杂-keyvalueeditor-键值编辑--typed-values)和[嵌套路径](http://127.0.0.1:6006/?path=/story/复杂-keyvalueeditor-键值编辑--nested-paths)提供独立预设。
