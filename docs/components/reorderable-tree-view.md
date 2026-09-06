# ReorderableTreeView 树重排

`ReorderableTreeView` 在 `TreeView` 上增加受控移动意图。`treeId` 标识实例，`scope` 决定允许的跨树边界，`onMove` 接收 source/target tree、节点和 `before | inside | after` 落点。宿主用 `moveTreeNode` 更新单树，或用 `transferTreeNode` 原子更新两棵树；两个帮助函数都返回新结构，非法移动返回 `null`。

同树移动拒绝自身、后代、缺失节点和禁用目标，防止形成环。跨树帮助函数额外拒绝 ID 冲突。`canDrop` 可加入业务规则。指针拖放在行的前/中/后三段显示语义 token 落点；相同 `scope` 才接受跨树数据。

聚焦节点后使用 Alt+↑/↓ 在同级前后移动，Alt+→ 缩进到前一同级，Alt+← 移到父节点之后。移动进节点时自动展开目标；TreeView 在节点重挂载后恢复活动焦点，受控选择 ID 保持不变。操作结果通过 polite live region 宣告。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-reorderabletreeview-树重排--playground) 在同一 Canvas 中控制选择、展开、treeId、scope 与标签；另有键盘、非法环路、禁用落点、窄宽度和跨树预设。
