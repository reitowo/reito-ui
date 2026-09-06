# DATETIME-01 DateTimePicker 验收

2026-09-07，DATETIME-01 已完成。新增 `DateTimePicker`，组合已验收的 `InputDate` 与 `InputTime`，覆盖完整值提交、跨日与同日边界、locale、12/24 小时、分钟/秒精度、禁用日期、空值、只读/禁用、错误和原生表单值。当前共 102 个组件族（基础 61、复杂 22、AI 19），794 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **15/15** 测试通过：完整值提交、分步填写、跨日最小/最大边界、秒精度、12 小时映射、必填、禁用日期、稳定 FormData、只读/禁用、同页 Controls，以及四种主题/密度。
- **60/60** Story 组合通过：15 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- compact / comfortable 的日期与时间字段实测均为 32 / 40px；dark/compact 与 light/comfortable 截图人工检查确认组合在 480px 工作面纵向排列，标签、分段、辅助文字和输出间距一致。
- 公共文本是无时区的 `YYYY-MM-DDTHH:mm[:ss]`。UTC / IANA 转换属于宿主提交边界；组件不猜测时区，也不把 date-only 或 time-only 强制包装为日期时间。
- 能力范围核对 Nuxt UI InputDate / InputTime 和 PrimeVue DatePicker 的日期时间组合、12/24 小时与上下限；React API、组合状态和 Graphite 样式为本项目实现。

证据：[检查](../.logs/date-time-picker/check.log)、[构建](../.logs/date-time-picker/build.log)、[交互](../tests/date-time-picker.spec.ts)、[Story 扫描](../.logs/storybook-date-time-picker.json)、[四组合截图](../.logs/date-time-picker)、[组件源码](../packages/ui/src/basic/date-time-picker.tsx)、[用法](components/date-time-picker.md)。
