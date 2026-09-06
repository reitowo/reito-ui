# MultiSelect 打开状态的可访问性扫描记录

保留正式 MultiSelect 的 inline Chips + Input 交互，并记录一类尚未消除的自动扫描提示。**不能把当前结果写成“所有可访问性检查通过”，也不能仅凭该提示断言已证明键盘不可用。** 没有禁用 axe 规则、过滤违规节点、手动移除 `aria-hidden`、修改上游私有实现或给页面注入 inert 补丁。

## 观察与来源

独立 0.4.0 候选消费页组合了按钮、NumberField、MultiSelect、DataTable、Artifact 和 Composer。打开 MultiSelect 并输入 `Type` 后，axe 的 `aria-hidden-focus` 对部分背景交互区域产生提示；dark/light × compact/comfortable 均能复现。候选原始报告保留于 `.logs/consumer-v04/candidate-0.4.0-consumer-verification.json`。正式 0.4.1 的复测结果存放在同目录 `consumer-verification.json`，按交互/密度与自动可访问性分别报告，原始违规详情不删减。

[Floating UI 官方 Combobox 说明](https://floating-ui.com/docs/floatingfocusmanager#comboboxes) 明确区分 DOM 焦点与读屏虚拟光标：Combobox 的 DOM 焦点不被锁在浮层里；虚拟光标可以限制在浮层范围，便于触屏读屏访问被 Portal 渲染的选项。这支持它是一种有意的上游策略；并不等于本项目已完成真实读屏验收。

[Base UI 官方 Combobox 文档](https://base-ui.com/react/components/combobox) 提供外部输入和 Popup 内输入两种组合。当前固定安装版本为 `@base-ui/react@1.8.0`，已核对以下实际源码，而非只据文档推测：

| 本地源码位置 | 实际行为 |
| --- | --- |
| `node_modules/@base-ui/react/combobox/root/AriaCombobox.js:89` | Root `modal` 默认 false。 |
| `node_modules/@base-ui/react/combobox/popup/ComboboxPopup.js:101` | 外部输入的默认 initial focus 为 false，保留输入焦点。 |
| `node_modules/@base-ui/react/combobox/popup/ComboboxPopup.js:109` | 内部焦点管理使用 `!inputInsidePopup || modal`；外部输入不因设置 Root modal=false 而关闭该策略。 |
| `node_modules/@base-ui/react/floating-ui-react/components/FloatingFocusManager.js:145` | 注释与判断明确识别外部可输入 Combobox 为 untrapped，仍会对外部节点设置 aria-hidden。 |
| `node_modules/@base-ui/react/floating-ui-react/components/FloatingFocusManager.js:346` | 外部区域的 ariaHidden 条件为 modal 或 untrapped typeable combobox。 |
| `node_modules/@base-ui/react/combobox/popup/ComboboxPopup.d.ts:49` | Popup 暴露 initialFocus/finalFocus；没有用于覆盖内部焦点管理 modal 的公开属性。 |

## 动态行为与边界

在实际消费页中验证了：输入筛选后按 Tab 会关闭列表，焦点进入后续 DataTable 筛选字段且背景 aria-hidden 已撤除；Escape 关闭列表并保留输入焦点；点击背景按钮会关闭列表并执行操作。后续验证脚本保留这些回归断言，以及搜索、选择、标签移除和已选值检查。上述 DOM/键盘证据没有显示背景控件被永久锁住。

最终 0.4.1 消费页四种主题/密度的上述交互、发布包字体/控件/内容密度均通过。共检查 28 个打开/关闭状态的 axe 结果，其中 24 个无违规；四个 `multiselect-open` 状态各保留一类 `aria-hidden-focus`、11 个背景节点。报告总 `passed` 保持 false，另列 `interactionAndDensityPassed: true` 和 `automaticAccessibilityPassed: false`。这是一份有保留项的结果，不是自动可访问性全通过。

将搜索与可编辑 Chips 移进 Popup 的公开 API 原型仅保留在 `.logs/new-foundation/multi-select-popup-prototype*.tsx`。正式实现没有采用该结构：为减少一条扫描提示而改变常用选择路径，缺乏足够的产品与辅助技术验证依据。

仍未验证真实 NVDA、JAWS、VoiceOver、TalkBack 的虚拟光标、公告和触屏手势，也未用真实中文输入法完成本次消费页测试。自动扫描与 DOM 焦点检查不能代替这些验证。当前保留上游行为和扫描记录，后续应在实际辅助技术组合中确认，再决定是否向上游提交最小复现或调整组件结构。
