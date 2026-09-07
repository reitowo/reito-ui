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

在并排布局中，属性名与内容按第一行文字基线对齐，保留现有行内距和编辑按钮尺寸。长名称、说明或值换行时仍对齐第一行；窄容器继续上下排列。

## 列表级事务

传入 `onSubmit` 后显示列表级状态和保存、取消、重置动作。行内“保存字段”只把通过字段校验的值写回受控草稿；只有“保存全部”成功后，组件才更新最近一次成功提交的基线。

```tsx
<PropertyList
  items={items}
  onValueChange={(key, value) => updateOneDraft(key, value)}
  onBatchValueChange={(changes, reason) => updateDrafts(changes, reason)}
  validateAll={async values =>
    values.autosave && Number(values.retention) < 7
      ? { retention: '自动保存开启时至少保留 7 天' }
      : {}
  }
  onSubmit={async (values, changes) => {
    const result = await saveSettings(values, changes);
    return result.conflict
      ? { fieldErrors: { name: '这个名称已被占用' }, error: '请修正标记的属性。' }
      : undefined;
  }}
/>
```

| 事务能力 | 契约 |
| --- | --- |
| 更改集 | `onSubmit(values, changes, items)` 同时得到完整快照和相对已提交基线的 `PropertyChange[]`。成功返回后基线更新；无更改时不能提交。 |
| 跨字段校验 | `validateAll` 可异步返回以 `PropertyItem.key` 为索引的错误。组件把焦点移到第一个错误行。 |
| 服务端错误 | `onSubmit` 可返回 `fieldErrors` 与表单级 `error`；抛出异常显示全局错误。两种失败都保留受控草稿供修正或重试。 |
| 取消 | 恢复最近一次成功提交的基线。多字段受控宿主应实现 `onBatchValueChange`，一次应用完整更改集。省略时组件逐项调用 `onValueChange`。 |
| 重置 | 恢复每项 `defaultValue`；未提供默认值的项回到提交基线。重置结果仍是待提交草稿。 |
| 切换记录 | 宿主切换到另一条记录时改变 `baselineKey`，当前 `items` 会成为新记录的提交基线。 |

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-propertylist-属性编辑--playground) 可在同一 Story 切换字段类型、路径、事务开关和提交结果；[批量事务与跨字段校验](http://127.0.0.1:6006/?path=/story/复杂-propertylist-属性编辑--transactional)覆盖完整流程；[嵌套路径与草稿](http://127.0.0.1:6006/?path=/story/复杂-propertylist-属性编辑--nested-paths)演示宿主回写。
