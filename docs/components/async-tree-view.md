# AsyncTreeView 异步树

`@reito/ui/complex` 导出 `AsyncTreeView`、`AsyncTreeViewProps`、`AsyncTreeViewNode` 和 `AsyncTreeLoadContext`。它在 `TreeView` 上管理按需子节点，适合远端目录、资源空间和大型树的渐进加载。

```tsx
<AsyncTreeView
  nodes={[{ id: 'workspace', label: 'workspace', loadable: true }]}
  defaultExpanded={['workspace']}
  loadChildren={(node, { signal }) => api.children(node.id, { signal })}
/>
```

`loadable: true` 把节点声明为可按需加载的分支。首次展开调用 `loadChildren`；成功结果在实例内缓存，空数组显示节点级空态。失败保留错误并提供可聚焦的重试按钮。加载中的树项声明 `aria-busy`，状态文案、错误和重试均不改变 XS 行高的默认节奏。

`expanded / defaultExpanded / onExpandedChange` 与基础树一致。受控宿主从外部折叠时，组件会中止该节点的活动请求；重新展开重新加载。改变 `refreshKey` 会刷新当前展开的 `loadable` 节点，同时保留已经显示的子项。每次请求具有独立身份，即使旧 Promise 忽略 `AbortSignal` 并晚于新请求完成，也不能覆盖新结果。

`loadingLabel`、`retryLabel`、`emptyMessage` 和 `loadErrorLabel` 控制内置文案。选择、复选级联、范围与批量能力直接继承 `TreeView`；已复选的异步父节点在子项载入后继续向下规范化。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-asynctreeview-异步树--playground) 在同一 Canvas 中调整展开节点、刷新键和状态文案；另有加载、空子项、错误重试、刷新竞态、折叠取消和加载后复选预设。[Lab](http://127.0.0.1:5173/?layer=complex&component=async-tree-view) 使用同一公共组件。
