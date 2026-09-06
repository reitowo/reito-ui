# VIRT-01 虚拟列表验收

2026-09-07，VIRT-01 已完成。公共 VirtualList 提供固定 token 行高的窗口化列表、稳定 key、定位、范围回调及加载/空/错误状态。目录新增一个组件族，当前 91 族（基础 54、复杂 18、AI 19）。动态高度与更新锚点仍属于 VIRT-02，网格属于 VIRT-03。

## 验证结果

- `npm run check`、`npm run build` 退出 0；tokens 审计通过。构建仅有既有分包大小提示。
- **8/8** 浏览器测试：10 万项渲染行数始终小于 30，首/中/末定位；远处稀疏范围填充；错误重试；四主题/密度的窄屏、键盘、行高和 axe；同页 Controls 的数量、overscan、空态恢复和视口大小。
- 数据量从滚动末尾的 100 项缩为 10 项仍能看到末项；恢复数据和切换空态后可继续浏览。Controls 将视口切为 small/large，实测高 256/384px，来自共享 spacing 尺度。
- **20/20** Story 组合：5 个 Story × 深浅主题 × 两档密度；0 页面错误、0 可访问性违规、0 横向溢出。本组无 play，交互使用独立测试。
- 构建后冻结源码进行验证；实际导入构建的 complex.js，确认 VirtualList 是函数导出。

证据：[检查](../.logs/virtual-list/check.log)、[构建](../.logs/virtual-list/build.log)、[交互](../.logs/virtual-list/interactions.log)、[Story 扫描](../.logs/virtual-list/story-audit.json)、[测试源码](../tests/virtual-list.spec.ts)。

## 视觉与来源

实际打开并截图检查 [PrimeVue 5.0.1 VirtualScroller](https://primevue.dev/virtualscroller/) 的浅色 Usage/Basic 工作面：[参考截图](../.logs/virtual-list/reference-primevue.png)、[采集信息](../.logs/virtual-list/reference.json)。参考以窄列表、交替底色呈现窗口化项。本库使用工作面可用宽度、柔和行分隔、局部定位按钮和可关闭/替换的宿主状态说明；不复制其交替底色、宽度和行高。

检查了四张窄屏截图：[深色紧凑](../.logs/virtual-list/dark-compact.png)、[深色舒适](../.logs/virtual-list/dark-comfortable.png)、[浅色紧凑](../.logs/virtual-list/light-compact.png)、[浅色舒适](../.logs/virtual-list/light-comfortable.png)。行高实测紧凑 36px、舒适 46px，由 --rui-row-height 测量；焦点边框、字号、间距与容器使用共享 token。蓝色边界是列表获得键盘焦点时的状态。

实现使用已安装并读取类型/许可证的 @tanstack/react-virtual 3.14.10 与 virtual-core 3.17.8；参考 [React adapter API](https://tanstack.com/virtual/latest/docs/framework/react/react-virtual) 和 [Virtualizer API](https://tanstack.com/virtual/latest/docs/api/virtualizer)，版本差异以固定包源码为准。完整 MIT 归属已加入分发 notices，未复制上游样式。使用说明见 [VirtualList](components/virtual-list.md)。
