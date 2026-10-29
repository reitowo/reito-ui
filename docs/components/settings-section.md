# SettingsSection / SettingsRow

从 `@reito/ui/complex` 导入。组件只负责布局与标签节点，控件状态、禁用、校验、保存和请求由宿主负责。

## 分组外观

`SettingsSection.variant` 默认为 `outlined`，保留已有外框、圆角和行内距。`plain` 保留行间分隔，去掉外框及直接子级 SettingsRow 的横向内距，适合已有 Dialog 或面板容器。任意嵌套内容不会被递归改写。

## 设置行

| 属性 | 默认值 | 用途 |
| --- | --- | --- |
| `orientation` | `horizontal` | `vertical` 把控件区放在标题和说明下方，占满行宽，适合展开选项或较长输入。 |
| `htmlFor` | 无 | 关联一个可被 label 标注的控件 ID；有值时渲染原生 label，无值时保留标题。 |
| `labelId` | 无 | 给行标题或 label 命名，供 RadioGroup 等组合的 `aria-labelledby` 引用。 |
| `descriptionId` | 无 | 给实际存在的说明段落命名，供控件或组的 `aria-describedby` 引用。 |

标签只包含文字，不包住整行或其他操作。组件不会克隆 children 或自动注入属性。`htmlFor` 不应指向 RadioGroup 的 div；用 `labelId` 或内部 FieldSet/FieldLegend 标注该组。说明为空时不生成段落，宿主也应省略对应 ARIA 引用。

```tsx
const id = useId();

<SettingsSection title="通知设置" variant="plain">
  <SettingsRow
    label="桌面提醒"
    htmlFor={`${id}-enabled`}
    description="任务完成时显示提醒。"
    descriptionId={`${id}-description`}
  >
    <Switch id={`${id}-enabled`} aria-describedby={`${id}-description`} />
  </SettingsRow>
  <SettingsRow label="提醒范围" labelId={`${id}-scope`} orientation="vertical">
    <RadioGroup aria-labelledby={`${id}-scope`} defaultValue="mentions">
      <Field orientation="horizontal">
        <RadioGroupItem id={`${id}-mentions`} value="mentions" />
        <FieldLabel htmlFor={`${id}-mentions`}>仅提及我</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem id={`${id}-all`} value="all" />
        <FieldLabel htmlFor={`${id}-all`}>所有消息</FieldLabel>
      </Field>
    </RadioGroup>
  </SettingsRow>
</SettingsSection>
```

完整可运行组合见 Storybook 的「复杂 / SettingsSection 设置分组」：参数调试、平铺分组、设置弹窗、加载中、失败与重试。示例中的保存只更新当前挂载实例的 React 状态，刷新后重置；不连接外部服务。

[验证记录与截图](../validation-settings-composition.md)
