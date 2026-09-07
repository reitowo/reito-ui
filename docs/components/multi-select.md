# MultiSelect

`MultiSelect` 用于从本地选项集合中选择多个字符串值。选项支持 `description`、`group` 与 `disabled`；组件支持受控/非受控值、筛选、创建和当前结果批量操作。

```tsx
const options = [
  { value: 'react', label: 'React', group: '前端' },
  { value: 'storybook', label: 'Storybook', group: '工具' },
  { value: 'rust', label: 'Rust', group: '后端', disabled: true },
];

<MultiSelect
  label="技术栈"
  options={options}
  value={value}
  onValueChange={setValue}
  showSelectAll
  onCreateOption={label => ({
    value: label.toLocaleLowerCase().replaceAll(' ', '-'),
    label,
    group: '自定义',
  })}
/>
```

`showSelectAll` 增加一个可访问的三态批量开关和“清除已选”操作。范围始终是**当前筛选结果中的非禁用项**：半选状态使用 `aria-checked="mixed"`，切换不会改动筛选结果外的已选值。批量清除与 chip 移除会保留已选且禁用的值。`selectAllLabel` 与 `clearAllLabel` 可替换内置文案。

`onCreateOption(query)` 可以同步或异步返回完整选项。成功后组件缓存并选中返回值；失败时保留查询并显示错误，`onCreateError` 可交给宿主记录。与已有选项的 `label` 或 `value` 精确匹配时不会显示创建动作。宿主仍负责把创建结果持久化到业务数据源。

`MultiSelect` 适合已在内存中的集合；远程结果使用 `AsyncMultiSelect`，任意标签及分隔粘贴使用 `InputTags`。大量选项的窗口化属于 `SELECT-03`，当前组件不会把普通筛选伪装成虚拟化。
