# Toolbar

`Toolbar` 用于桌面工作面中的一组相关命令。它组合共享 Button、Separator 与 DropdownMenu，并为每个分组提供可访问名称。

```tsx
<Toolbar
  label="编辑操作"
  groups={[
    { id: 'history', label: '历史', items: [
      { id: 'undo', label: '撤销', icon: <Undo2 />, shortcut: 'Control+Z', overflow: 'never', onSelect: undo },
    ] },
    { id: 'format', label: '格式', items: [
      { id: 'bold', label: '加粗', icon: <Bold />, kind: 'toggle', pressed: bold, onPressedChange: setBold },
    ] },
  ]}
  overflow="menu"
  maxVisibleItems={3}
  status="已保存"
/>
```

同一个 Toolbar 中的 group 与 item ID 应保持唯一。字符串标签会自动成为可访问名称、title 和菜单类型查找文本；标签是 ReactNode 时提供 `textValue`。`shortcut` 使用 ARIA 键名，例如 `Control+B`，只描述宿主已绑定的快捷键，不注册全局监听。

`kind="toggle"` 使用受控的 `pressed / onPressedChange`，行内按钮暴露 `aria-pressed`，移入菜单后使用 CheckboxItem。`loading` 会禁用当前动作并暴露 `aria-busy`；整栏 `disabled` 禁用行内动作与溢出入口。

## 溢出策略

- `overflow="scroll"` 保留所有动作，工具项区域可以横向滚动，适合编辑器等需要稳定位置的工具栏。
- `overflow="menu"` 用 `maxVisibleItems` 决定行内容量。`overflow="never"` 的关键动作优先保留，并占用容量；`auto` 按声明顺序填入剩余位置；`always` 始终放入菜单。宿主可按容器查询或自身布局状态切换容量，不依赖首次测量后的跳动。

溢出菜单沿用 Base UI 的方向键、Home/End、类型查找、Escape 和焦点恢复。行内可用按钮及菜单触发器组成一个 roving focus 组：Tab 进入当前停靠点，左右方向键移动，Home/End 到达首尾；禁用项会被跳过。`status` 是尾部静态槽，动态播报应由宿主传入自己的 `output` 或 live region。

工具栏保持短、弱边界和紧凑控件。需要表单输入、标题或多行说明时，将这些内容放在工作面自己的 header，而不是继续塞入 Toolbar。
