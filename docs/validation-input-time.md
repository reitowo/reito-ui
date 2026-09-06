# TIME-01 InputTime 验收

2026-09-07，TIME-01 已完成。新增 `InputTime`，覆盖独立时间值、12/24 小时制、分钟/秒精度、步进、上下限、空值、分段键盘操作、清除、提交恢复、只读/禁用和原生表单值。当前共 101 个组件族（基础 60、复杂 22、AI 19），779 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **15/15** 交互通过：24 小时提交、12 小时与 AM/PM 映射、秒精度、步进错误恢复、范围、键盘步进与焦点、午夜回绕、清除、稳定 FormData、只读/禁用、同页 Controls，以及四种主题/密度。
- **60/60** Story 组合通过：15 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- compact / comfortable 字段实测为 32 / 40px；dark/compact 与 light/comfortable 截图人工检查确认分段、分隔符、清除和时间图标保持紧凑。
- 公共值始终使用 0–23 小时对象；12 小时制只影响显示。组件不创建 Date，不解释日期或时区。
- 能力范围核对 Nuxt UI InputTime、PrimeVue DatePicker 的 timeOnly / 12–24 小时能力和 Base UI 可访问名称要求；React API、时间对象、状态机与 Graphite 样式为本项目实现。

证据：[检查](../.logs/input-time/check.log)、[构建](../.logs/input-time/build.log)、[交互](../tests/input-time.spec.ts)、[Story 扫描](../.logs/storybook-input-time.json)、[四组合截图](../.logs/input-time)、[组件源码](../packages/ui/src/basic/input-time.tsx)、[用法](components/input-time.md)。
