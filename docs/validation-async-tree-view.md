# TREE-03 AsyncTreeView 异步树验收

2026-09-07，TREE-03 已完成。新增 `AsyncTreeView` 组件族，当前 94 族（基础 54、复杂 21、AI 19），共 666 个 Story。

## 验证结果

- `npm run check`、`npm run build` 退出 0；目录、公开导出与设计 token 审计通过，0 个未批准项。
- **11/11** 浏览器测试：节点 busy 与加载完成、空子项、错误重试、刷新竞态、受控外部折叠取消与重新加载、异步复选级联、同页 Controls 刷新，以及四主题密度窄工作面。
- **28/28** Story 组合：7 个 Story × 深浅主题 × 两档密度；0 页面错误、0 控制台错误、0 可访问性违规、0 横向溢出，审计期间源码指纹未变化。
- 深浅主题的完成态保持 TreeView 的 24 / 32px XS 行高；loading、error 和 retry 使用共享语义色、Spinner 与 Button。

证据：[检查](../.logs/async-tree-view/check.log)、[构建](../.logs/async-tree-view/build.log)、[交互](../.logs/async-tree-view/interactions.log)、[Story 扫描](../.logs/async-tree-view/story-audit.json)、[测试源码](../tests/async-tree-view.spec.ts)。

## 竞态与边界

每个加载任务持有独立 AbortController 和请求身份。节点折叠、刷新或卸载会中止旧任务；完成回调同时检查当前任务身份和 `signal.aborted`。测试中的旧请求故意忽略取消并延迟返回，最终仍只显示新版子项。

加载失败不会伪装为空节点；错误留在对应树项并提供键盘可达的重试。刷新已展开节点时保留已有子项，避免工作面跳空。组件缓存仅存在于当前 React 实例，持久化、分页和服务端版本由宿主负责。

能力与视觉参考 [PrimeVue 5 Tree Lazy](https://primevue.dev/tree/) 与 [Nuxt UI Tree](https://ui.nuxt.com/docs/components/tree) 的文档工作面。实现、状态模型和 Graphite 样式均为本项目原创，未复制上游源码或资产。
