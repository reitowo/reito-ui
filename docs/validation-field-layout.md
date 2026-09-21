# Field 功能组布局

日期：2026-09-21。

## 组合契约

可编辑分组中，标签和输入在同一列，但操作按钮应对齐控件本身。把标签、控件和错误信息一起放进横向容器，会让按钮随整列高度偏移；原生 legend 与外部 space-y 叠加也会增加顶部留白。

`FieldSet variant="outline"` 统一分组边界、内距及 legend 间距。`FieldGroup` 与 `Field` 分别使用共享 content-gap 和 content-gap-sm tokens；紧凑与舒适密度具有一致的间距层次。

`FieldControlRow` 从 `@reito/ui/basic` 导出：children 放一个控件，actions 放相关操作。标签、说明、错误文字放在行外，按钮只与控件垂直居中。省略 actions 或传入 null、布尔值、空字符串时不保留操作列；数字 0 仍作为有效 React 内容显示。

```tsx
<FieldSet variant="outline">
  <FieldLegend variant="label">功能组</FieldLegend>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="group-name">组名</FieldLabel>
      <FieldControlRow actions={<Button type="button" onClick={removeGroup}>删除</Button>}>
        <Input id="group-name" />
      </FieldControlRow>
    </Field>
    <Field>
      <FieldLabel htmlFor="group-users">组内账号</FieldLabel>
      <Textarea id="group-users" />
    </Field>
  </FieldGroup>
</FieldSet>
```

调用方不应再次叠加 legend margin、space-y 或按钮顶部偏移。动态列表的 label/control ID 保持唯一；控件和按钮仍接收自身的 disabled。

## 验证

参考是可编辑功能组中标签、输入、删除操作和文本域的对齐反馈。Storybook 的可编辑功能组、校验错误、禁用三个示例使用虚构数据，操作仅更新本地状态。

- `npm run build` 通过 UI、Lab、Storybook、Workbench；保留非阻断的大 chunk 提示。
- `npm run check` 通过 token/catalog 一致性、设计审计和全部 workspace 类型检查。
- `git diff --check` 通过。
- 四种 theme/density 组合完成浏览器几何检查；检查浅色 compact 和深色 comfortable 的组合截图，标签和控件左边缘一致，按钮居中。
- 点击标签聚焦输入；Tab 到删除按钮，Enter 删除，恢复按钮恢复示例。
- 错误信息可见时按钮中心偏差仍为 0px；禁用态的输入、文本域、复选框及删除按钮均被禁用。
- 360×720 的浅色 comfortable 错误态没有页面水平溢出，按钮中心偏差为 0px。
- 构建后的公共导出通过 6 个空值/数字 actions 渲染检查。

正常态实测值（px），两种主题相同：

| 密度 | 标签到输入 | 标签到文本域 | legend 到内容 | 字段之间 | 按钮与输入中心偏差 |
| --- | ---: | ---: | ---: | ---: | ---: |
| compact | 8 | 8 | 12 | 12 | 0 |
| comfortable | 12 | 12 | 20 | 16 | 0 |

在 Node 24 / npm 11.9 下，现有锁文件缺少两个 emnapi 传递依赖条目，`npm ci` 未通过；本次使用 `npm install --package-lock=false` 安装后运行上述检查，没有改动依赖声明或锁文件。未运行自动无障碍扫描、原生 200% 缩放或完整屏幕阅读器验收。

本次为组件源码和示例修复，不包含版本发布。消费应用需升级组件包并采用以上结构；原生 fieldset/div 组合不会自动获得该布局。
