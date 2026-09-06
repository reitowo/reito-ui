# TREE-01 TreeView 基础验收

2026-09-07，TREE-01 已完成。新增公共 `TreeView` 组件族，当前 93 族（基础 54、复杂 20、AI 19），共 655 个 Story。`DisclosureTree` 的原生 Tab/summary 契约保持不变。

## 验证结果

- `npm run check`、`npm run build` 退出 0；目录、公开导出和设计 token 审计通过，0 个未批准项。
- **8/8** 浏览器测试：ARIA 层级和位置、受控展开/选择、上下左右/Home/End、禁用节点、祖先折叠后的焦点恢复、同页 Controls，以及四主题密度窄工作面。
- 深/浅主题 × 紧凑/舒适密度的 4 个窄工作面通过 axe 和页面横向溢出检查；行高实测 24 / 32px，来自 `--rui-control-height-xs`。
- **24/24** Story 组合：6 个 Story × 深浅主题 × 两档密度；0 页面错误、0 控制台错误、0 可访问性违规、0 横向溢出，审计期间源码指纹未变化。

证据：[检查](../.logs/tree-view/check-final.log)、[构建](../.logs/tree-view/build-final.log)、[交互](../.logs/tree-view/interactions-final.log)、[Story 扫描](../.logs/tree-view/story-audit.json)、[测试源码](../tests/tree-view.spec.ts)。

## 视觉与来源

行为依据 [W3C WAI-ARIA APG Tree View Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) 的单选纵向树键盘和角色要求；能力与视觉工作面检查 [PrimeVue 5 Tree](https://primevue.dev/tree/) 的 Basic、Controlled 与 Accessibility 说明。检查日为 2026-09-07，参考页面为浅色文档工作面。

四张窄屏结果：[深色紧凑](../.logs/tree-view/dark-compact.png)、[深色舒适](../.logs/tree-view/dark-comfortable.png)、[浅色紧凑](../.logs/tree-view/light-compact.png)、[浅色舒适](../.logs/tree-view/light-comfortable.png)。Reito UI 保留 Cursor 风格的轻量文件行、细层级线和中性选中面；未采用 PrimeVue 的主题资产、复选外观或宽卡片容器。

本项是原创 React 实现，没有新增运行依赖。节点数据、路由/文件打开和持久化由宿主负责；多选复选、异步加载和重排仍按 TREE-02 至 TREE-04 分项验收。
