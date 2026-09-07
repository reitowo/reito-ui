# DATERANGE-02 DateTimeRangePicker 验收

2026-09-07，DATERANGE-02 已完成。新增 `DateTimeRangePicker`，复用两个已验收的 `DateTimePicker`，覆盖分钟/秒精度、12/24 小时显示、同日与跨日起止、倒置和全局上下限校验、完整提交回调、IANA 时区元数据以及固定键序 JSON / FormData。全库增为 109 个组件族（基础 67、复杂 23、AI 19），共 935 个 Story。

- Playwright 14 项通过：跨日与倒置、修正后提交、首尾边界时间、秒精度、时区序列化与无效时区、缺失端点、12 小时、只读、禁用、必填、原生表单和同页 Controls。
- 本族 16 个 Story 在 dark/light × compact/comfortable 共 64 次组合中全部通过；页面错误、自动可访问性违规与水平溢出均为 0。
- 480px 窄工作面检查四种主题/密度；紧凑和舒适控件高度分别保持 32px / 40px，起止字段在窄面板垂直排列，桌面宽度下并排。
- 视觉参考检查 PrimeVue 5.0.1 DatePicker 官方浅色演示中的 range、time 和 min/max 场景。Reito 保留 Graphite 的低对比边界和分段字段，并选择始终可见的双端点结构；与其单弹层 DatePicker 的布局、品牌颜色和图标不同。深浅主题、两种密度及 480px 截图均人工查看，剩余差异属于上述结构选择。
- 时区契约按 MDN `datetime-local` 边界处理：本地日期时间本身不包含时区。组件只校验并序列化显式 IANA 标识，不推断浏览器时区，也不处理 DST 歧义或生成 UTC offset。

证据：[检查](../.logs/date-time-range-picker/check.log)、[构建](../.logs/date-time-range-picker/build.log)、[交互测试](../.logs/date-time-range-picker/tests.log)、[Story 扫描](../.logs/date-time-range-picker/storybook-audit.json)、[四组合截图](../.logs/date-time-range-picker)、[源码](../packages/ui/src/complex/date-time-range-picker.tsx)、[Story](../apps/storybook/stories/complex/DateTimeRangePicker.stories.tsx)、[用法](components/date-time-range-picker.md)。
