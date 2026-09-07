# DATERANGE-01 验收

2026-09-07，DATERANGE-01 已完成。`DateRangePicker` 现在覆盖内置/宿主预设、预设与上下限一致、受控草稿/应用/取消、locale、触发器格式和可替换操作文案。全库保持 108 个组件族（基础 67、复杂 22、AI 19），共 919 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计检查 256 个文件，0 个未批准项。构建仅有已知 Vite chunk-size 警告。
- **13/13** 交互与视觉测试通过：默认预设、草稿提交、取消、Escape 与焦点归还、上下限禁用、英文 locale/格式、自定义/隐藏预设、清除和同页 Controls。
- **44/44** 本族 Story 组合通过：11 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 预设只更新草稿，点击应用后才回写受控值；取消、Escape 和重新打开都从最后已应用值恢复。清除保留既有立即提交语义。
- 今天、近 7 天、近 30 天和本月基于稳定当地日计算。超出 `minDate` / `maxDate` 的预设禁用并说明原因，不截断成含义不同的范围。
- `locale` 控制 DayPicker 月份、星期、日期可访问名称与默认触发器格式；`formatDate` 在 Story 中已验证宿主格式覆盖。
- 420px 窄宽度人工检查 dark/light × compact/comfortable：预设使用 XS 控件，弹层使用共享内距，日历、双日期输入和操作栏无裁切或横向溢出。
- 当前数据模型是本地日历日，不包含时刻、时区或 UTC 序列化；这些保留给 DATERANGE-02。

证据：[检查](../.logs/date-range-picker/check.log)、[构建](../.logs/date-range-picker/build.log)、[交互测试](../.logs/date-range-picker/tests.log)、[Story 扫描](../.logs/date-range-picker/storybook-audit.json)、[四组合截图](../.logs/date-range-picker)、[源码](../packages/ui/src/complex/date-range-picker.tsx)、[Story](../apps/storybook/stories/complex/DateRangePicker.stories.tsx)、[用法](components/date-range-picker.md)。
