# 0.4 新增基础组件来源

本轮新增 Toast、MultiSelect、NumberField、Meter 四个组件族。它们是本项目基于已安装 **`@base-ui/react@1.8.0`** 的本地组合，**不是原有 50 族的 shadcn CLI 生成产物**；原有生成记录仍以 [shadcn-provenance.json](shadcn-provenance.json) 为准。没有引入新依赖、品牌资产、产品字体或 Multica 受限源码。

## 已核对的上游 API

| 新组件 | 官方来源与核对内容 | 本地入口 |
| --- | --- | --- |
| Toast | [Base UI Toast](https://base-ui.com/react/components/toast)：Provider、Portal、Viewport、Root、Content、Title、Description、Action、Close、useToastManager、createToastManager。实际类型与实现核对 `node_modules/@base-ui/react/toast/`。 | `packages/ui/src/basic/feedback.tsx` |
| MultiSelect | [Base UI Combobox](https://base-ui.com/react/components/combobox)：multiple、Value、Chips、Chip、ChipsInput、ChipRemove、List、Item。复用现有 `primitives/combobox.tsx`，标签移除使用上游 ChipRemove 并补明确名称。 | `packages/ui/src/basic/multi-select.tsx` |
| NumberField | [Base UI Number Field](https://base-ui.com/react/components/number-field)：Root、Group、Input、Increment、Decrement，以及 nullable value、locale、format、min/max/step、onValueCommitted。实际类型核对 `node_modules/@base-ui/react/number-field/`。 | `packages/ui/src/basic/number-field.tsx` |
| Meter | [Base UI Meter](https://base-ui.com/react/components/meter)：Root、Label、Value、Track、Indicator。实际类型核对 `node_modules/@base-ui/react/meter/`，保留 role=meter 与取值范围语义。 | `packages/ui/src/basic/meter.tsx` |

上述链接是组件行为和 API 的官方参考，不是 Cursor 或 Claude Desktop 视觉截图。上游软件许可沿用 [UI 包第三方声明](../packages/ui/THIRD_PARTY_NOTICES.md) 中的 Base UI 及既有依赖许可；本轮未复制受限参考代码。

## 使用边界

- `@reito/ui/basic` 导出 `ToastProvider`、`useToastManager`、`createToastManager`。Provider 接受上游 `timeout`、`limit`、`toastManager`，并增加通知区、关闭按钮名称和通知区 class。通知管理保留上游 add/update/close/promise API；计时、暂停、焦点、F6 导航和公告由 Base UI 管理。撤销操作示例只改变本地状态；异步示例只运行本地 Promise。
- `MultiSelect` 接受 `label`、`options: {value, label, disabled?}[]`、受控或非受控 `string[]`、`onValueChange`、`name`、disabled/loading/error/description。它是方便消费的字符串值封装；需要更细的完整组合控制时，仍可使用已导出的 Combobox 原语。键盘选择、标签导航、移除和弹层焦点仍由 Base UI 处理。
- `NumberField` 接受上游 Root 的公共属性（除 children、className），再增加 label、description、error、placeholder 和步进按钮名称。使用官方 Group 与公共 Button/Label；只在整个字段 disabled 时降低输入组权重。达到 min/max 时只禁用相应步进按钮，仍可编辑的输入保持正常对比度。数值解析、边界提交、键盘步进与格式化没有另写实现。
- `Meter` 显示容量、质量、预算等**有界测量值**；任务运行使用现有 Progress。它增加 label、description、valueLabel、tone；明确数值和说明补充颜色意义，保留上游 min/max/format/locale 和 aria 属性。

四族沿用语义色、公共字体与密度。通知使用 `--rui-content-padding` / `--rui-content-gap-sm`；NumberField 和 MultiSelect 使用 `--rui-control-height`。没有修改原有 primitives、共享 styles 或依赖清单。

## 实际验证

2026-09-06，新增范围 UI 与 Storybook 类型检查均退出 0。`scripts/check-storybook.mjs` 选择这四族，检查 **18 stories × dark/light × compact/comfortable = 72 场景，72 通过**；其中 7 个 story 带交互 play。报告为 `.logs/new-foundation-audit.json`：页面错误、console error、自动 WCAG 2A/2AA/2.1AA 违规和页面水平溢出均为 0，没有禁用 axe 规则。此记录只覆盖新增四族；全库 check/build、发布包与完整工作台验证由集成流程另行记录。

交互包含 Toast 的 F6 进入通知区、关闭、撤销与 Promise 成功更新；MultiSelect 搜索、选择、移除与空列表；NumberField 点击/方向键步进、输入越界后提交；Meter 数值更新与归零。修复前的 NumberField 边界 opacity 误用及 Toast 测试未先进入通知区的问题已在复测中消除。

额外保留 960×720 下 dark/compact 和 light/comfortable 的四族截图于 `.logs/new-foundation/`，供本地复核。人工查看了通知、展开多选、边界数值和容量测量的代表截图，确认中性表面、柔和边界与紧凑控件；截图不是产品官方图，也不证明整体页面与 Cursor/Claude Desktop 相似。完整工作场景的参考比较仍遵循 [design-language.md](design-language.md) 与 [references.md](references.md)，本轮没有把四个独立控件当作产品界面复刻。

后续在包含多个交互区域的独立消费页中，打开 MultiSelect 产生一类 `aria-hidden-focus` 提示；原来的单组件 Storybook 结果没有覆盖该背景组合，不能扩大为全部可访问性通过。已保留上游 Combobox 交互与原始扫描结果，来源、Tab/Escape/背景点击证据及真实读屏尚未验证的边界见 [a11y-combobox-note.md](a11y-combobox-note.md)。
