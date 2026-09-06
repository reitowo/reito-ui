# DATE-01 InputDate 验收

2026-09-07，DATE-01 已完成。新增 `InputDate`，覆盖 locale 日期顺序、显式顺序覆盖、本地日历日解析、受控/非受控值、合法性与范围、禁用日期、键盘分段操作、清除、Calendar 联动、提交事件、只读/禁用和原生表单值。当前共 100 个组件族（基础 59、复杂 22、AI 19），764 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **15/15** 交互通过：三种 locale 顺序、无效日期与恢复、闰日、范围/禁用日、分段键盘调整、日历联动、清除焦点、Escape 焦点回收、FormData、只读/禁用、同页 Controls，以及四种主题/密度。
- **60/60** Story 组合通过：15 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- compact / comfortable 字段实测为 32 / 40px；dark/compact 与 light/comfortable 截图人工检查确认分段、操作按钮和日历弹层使用同一密度与主题表面。
- 日期值按本地年/月/日构造并以 `YYYY-MM-DD` 提交，不经过 UTC；时刻、时区、日期范围和多月选择不属于本组件。
- 能力范围核对 Nuxt UI InputDate、PrimeVue Calendar 和 Base UI 表单可访问名称要求；React API、状态机、分段键盘行为与 Graphite 样式为本项目实现。

证据：[检查](../.logs/input-date/check.log)、[构建](../.logs/input-date/build.log)、[交互](../tests/input-date.spec.ts)、[Story 扫描](../.logs/storybook-input-date.json)、[四组合截图](../.logs/input-date)、[组件源码](../packages/ui/src/basic/input-date.tsx)、[用法](components/input-date.md)。
