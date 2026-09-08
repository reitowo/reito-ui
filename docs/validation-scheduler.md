# Scheduler 验收（APP-SCHEDULER-01）

交付日/周/月排程、全天和跨日事件、重叠时间展示、鼠标移动与时长调整、键盘等价编辑、只读、加载、空态、宿主保存失败回退和重试。事件持久化由宿主 onEventChange 完成；图形预览不代表服务端保存。

- 12 项模型/交互测试通过：视图切换、日期边界、编辑、移动、调整、键盘、只读、Controls 重试恢复和空日历键盘滚动。`.logs/scheduler-regression.log`。
- 4 项主题/密度窄屏编辑测试通过；标题布局修正后重跑也通过。`.logs/scheduler-narrow-final.log`。
- 7 个 Story × 4 个主题密度，共 28 组审计通过，无页面/控制台错误、可访问性违规或横向溢出。`.logs/scheduler-audit-final.json`。
- 最新 `npm run check`、`npm run build` 通过。`.logs/scheduler-check-final.log`、`.logs/scheduler-build-final.log`；构建仍有已有 bundle 体积提示。

已查看 FullCalendar 7 官方浅色周视图 https://fullcalendar.io/docs/timegrid-standard-view-demo ，对比本地深色紧凑周视图及四种窄屏编辑截图。保留顶部日期列、全天区域、垂直时间轴及重叠事件布局；Graphite 改用灰阶事件、紧凑控件、共享高度 token、较轻分隔，并以本库表单编辑。原始官方示例更高、蓝色事件更突出，不声称像素复刻。

限制：支持 UTC / 本地显示，其他 IANA 时区转换及周期事件展开由宿主处理；不含 Premium 资源时间线。date/view/events 为宿主受控输入，示例仅本地交互。正式使用应提供对应日期/视图回调和保存函数。
