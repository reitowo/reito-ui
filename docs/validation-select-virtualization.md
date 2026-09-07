# SELECT-03 验收

2026-09-07，SELECT-03 已完成。`MultiSelect` 与 `AsyncMultiSelect` 共享选择弹层虚拟化 API，覆盖大集合 DOM 有界渲染、键盘活动项定位、可变行高测量、可见范围回调、弹层锚定、远程增量加载和已选值保留。全库保持 108 个组件族（基础 67、复杂 22、AI 19），共 914 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计检查 256 个文件，0 个未批准项。构建仅有已知 Vite chunk-size 警告。
- **44/44** 相关测试在最终源码上通过：14 项虚拟化验收、14 项选择增强回归和 16 项 AsyncMultiSelect 回归。
- **140/140** 两族 Story 组合通过：35 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 5 万本地选项打开后 DOM 选项少于 30，可直接定位到第 25001 个已选项；ArrowDown 会先滚动并挂载第 25002 项，Enter 后选中正确。
- 选项说明和虚拟分组首项使用 DOM 实测高度，上方行尺寸改变时校正滚动锚点；`onVirtualRangeChange` 分开可见范围与实际渲染范围。
- 远程页在接近窗口尾部时按 `offset` 追加，失败在弹层内保留结果并可重试；查询变化会取消旧请求。当前页外的已选记录通过 `selectedOptions` / 实例缓存继续显示稳定 chip 标签。
- 420px 窄宽度人工检查 dark/light × compact/comfortable：弹层与输入对齐，可变说明行不重叠，选中指示与文本仍在可见区。
- 虚拟模式的分组标题随该组第一个选项共同测量，当前不提供 sticky 分组头。宿主负责服务端游标或总量并更新 `hasMore`，组件不推断最终页。

证据：[检查](../.logs/select-virtualization/check.log)、[构建](../.logs/select-virtualization/build.log)、[交互与回归](../.logs/select-virtualization/tests.log)、[Story 扫描](../.logs/select-virtualization/storybook-audit.json)、[四组合截图](../.logs/multi-select-virtual)、[同步源码](../packages/ui/src/basic/multi-select.tsx)、[异步源码](../packages/ui/src/basic/async-multi-select.tsx)、[同步用法](components/multi-select.md)、[异步用法](components/async-multi-select.md)。
