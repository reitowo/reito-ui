# VIRT-03 虚拟网格验收

2026-09-07，VIRT-03 已完成。新增公共 `VirtualGrid` 组件族，当前 92 族（基础 54、复杂 19、AI 19），共 649 个 Story。组件提供双轴窗口、稳定行列/单元格身份、二维定位与范围回调、token/显式固定尺寸、键盘活动单元格和加载/空/错误状态。

## 验证结果

- `npm run check`、`npm run build` 退出 0；新增 `--rui-virtual-column-width` 从 token 源生成，设计 token 审计为 216 个文件、0 个未批准项。
- **9/9** 浏览器测试：100,000 × 10,000 单元格的 DOM 少于 150；左上/中间/右下定位；稳定单元格 key；二维范围回调；方向键和 Home/End；显式行列尺寸；空/加载/错误恢复；Storybook 同页 Controls。
- 深/浅主题 × 紧凑/舒适密度的 4 个窄工作面通过 axe 和横向溢出检查。默认单元格实测为紧凑 160 × 36px、舒适 192 × 46px，均来自共享 token。
- **20/20** Story 组合：5 个 Story × 深浅主题 × 两档密度；0 页面错误、0 控制台错误、0 可访问性违规、0 页面横向溢出，审计期间源码指纹未变化。

证据：[检查](../.logs/virtual-grid/check.log)、[构建](../.logs/virtual-grid/build.log)、[交互](../.logs/virtual-grid/interactions-final.log)、[Story 扫描](../.logs/virtual-grid/story-audit.json)、[测试源码](../tests/virtual-grid.spec.ts)。

## 视觉与来源

视觉对照沿用实际检查的 [PrimeVue 5.0.1 VirtualScroller](https://primevue.dev/virtualscroller/) 浅色 Usage 工作面及 [参考截图](../.logs/virtual-list/reference-primevue.png)，能力边界参考其 grid 方向示例；窗口算法读取当前固定版本 TanStack Virtual 的 horizontal 选项。参考仅用于二维窗口、滚动尺度和可见内容密度，不复制其交替底色或样式。

检查了四张窄屏截图：[深色紧凑](../.logs/virtual-grid/dark-compact.png)、[深色舒适](../.logs/virtual-grid/dark-comfortable.png)、[浅色紧凑](../.logs/virtual-grid/light-compact.png)、[浅色舒适](../.logs/virtual-grid/light-comfortable.png)。本库使用中性工作面、细分隔线、紧凑工具栏和明确焦点边界；水平内容保留在网格自己的滚动区域。

实现继续使用已经归属的 `@tanstack/react-virtual` 3.14.10 / `virtual-core` 3.17.8（MIT），未引入新的运行依赖。宿主负责二维数据加载、缓存、选择和编辑；固定表头、列冻结、可变尺寸及 DataTable 集成不在本项范围。
