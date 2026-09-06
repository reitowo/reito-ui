# TREE-02 TreeView 复选验收

2026-09-07，TREE-02 已完成。`TreeView` 在保持单选默认行为的基础上新增三态复选、父子级联、独立复选、禁用传播边界、范围与批量操作；公共组件族数量不变。

## 验证结果

- `npm run check`、`npm run build` 退出 0；公开类型、目录和设计 token 审计通过，0 个未批准项。
- **11/11** 复选浏览器测试：叶项引发父项半选、父子级联往返、Shift 可见范围、Ctrl+A 批量切换、禁用分支屏障、独立模式、同页 Controls 受控回写，以及四主题密度窄工作面。
- TREE-01 的 **8/8** 单选与焦点测试保持通过，确认默认 API 和键盘模型未回归。
- **40/40** Story 组合：10 个 Story × 深浅主题 × 两档密度；0 页面错误、0 控制台错误、0 可访问性违规、0 横向溢出，审计期间源码指纹未变化。
- 复选行高实测紧凑 24px、舒适 32px，复选框、文件图标与文本保持同一行。

证据：[检查](../.logs/tree-view-checkbox/check.log)、[构建](../.logs/tree-view-checkbox/build.log)、[复选交互](../.logs/tree-view-checkbox/interactions.log)、[单选回归](../.logs/tree-view-checkbox/single-regression.log)、[Story 扫描](../.logs/tree-view-checkbox/story-audit.json)、[测试源码](../tests/tree-view-checkbox.spec.ts)。

## 行为边界

`cascade` 向下修改可变子项，向上按完整可变子项集合计算 `true` / `mixed` / `false`。禁用节点保持不可变，并阻断父级联进入该分支；其可用后代仍可单独选择。`independent` 不推导父子状态。Shift 范围使用当前可见顺序，Ctrl/Cmd+A 使用整棵树的所有可用节点。

复选框是树项内的非交互视觉标记，`treeitem` 自身提供 `aria-checked`，避免嵌套第二个 Tab 停靠点。方向键仍负责焦点，Space/Enter 复选，禁用树项不声明 `aria-checked`。

视觉比较延续 TREE-01 的 [W3C Tree View Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) 和 [PrimeVue 5 Tree](https://primevue.dev/tree/) Checkbox 文档工作面。Reito UI 保留紧凑中性行和 Graphite tokens；没有复制 PrimeVue 的主题资产、CSS 或源码。

本项未新增依赖。异步节点、服务端子项和过期请求隔离由 TREE-03 验收；树内与跨树重排由 TREE-04 验收。
