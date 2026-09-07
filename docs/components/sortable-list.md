# SortableList 排序列表

SortableList 用稳定 ID 数组表示业务顺序，适合任务、字段和步骤的手动排序。

```tsx
<SortableList items={items} order={order} onOrderChange={setOrder} selected={selected} onSelectedChange={setSelected} />
```

order / defaultOrder 会去重、忽略未知 ID，并把 items 中遗漏的项目按输入顺序补到末尾。onOrderChange 同时返回 move 与 moved，供宿主保存或回滚。disabled 项保持位置，并作为按钮、键盘和拖放都不可跨越的边界。

空格或 Enter 选择活动项，方向键移动焦点。Alt+上下移动一格，Alt+Home/End 在当前禁用边界内置顶或置底；工具栏提供相同的批量动作。draggable 启用原生同段拖放，拖后焦点回到移动项。readOnly 和 disabled 阻止选择与排序。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-sortablelist-排序列表--playground) 可在同一 Canvas 中调整顺序、选择、拖放和状态。[Lab](http://127.0.0.1:5173/?layer=complex&component=sortable-list) 使用相同实现。
