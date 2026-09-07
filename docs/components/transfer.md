# Transfer 穿梭选择

Transfer 用两个常驻 Listbox 在来源与目标集合之间移动项目。它适合权限、字段和成员分配；目标值是有序的稳定 ID 数组，业务数据仍由宿主持有。

```tsx
const [value, setValue] = useState(['read']);

<Transfer
  items={permissionItems}
  value={value}
  onValueChange={(next, detail) => {
    setValue(next);
    saveChange(detail.direction, detail.moved);
  }}
  sourceLabel="可用权限"
  targetLabel="已授予权限"
/>
```

value / defaultValue 决定目标集合。向右移动会按来源 items 的顺序追加，向左移动会从目标有序数组中移除；未知和重复 ID 不进入可见集合。disabled 项保留在所在侧，不参与单项或批量移动。

两侧的选择分别由 sourceSelection / targetSelection 控制，查询由 sourceQuery / targetQuery 控制，均提供 default 与 onChange 版本。搜索只改变可见结果，不改变目标值。全部移动按钮只作用于当前搜索结果中的可用项，因此宿主可以让用户先缩小范围再批量操作。

每侧 Listbox 保留上下、Home/End、Space/Enter、Shift 范围选择和 Ctrl/Cmd+A 当前结果选择。选择来源项后按 Alt+右方向键可移到目标；选择目标项后按 Alt+左方向键可移回。中间按钮提供相同的可访问名称和回调路径。窄工作面会将两侧垂直排列并把操作按钮改为横向。

disabled、readOnly 和 loading 都会阻止转移；loading 由宿主控制，只表达 items 数据尚未就绪。组件不发起请求，也不自动保存目标值。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-transfer-穿梭选择--playground) 可在同一 Canvas 中调整目标值、两侧查询、标签、搜索、批量操作与状态。[Lab](http://127.0.0.1:5173/?layer=complex&component=transfer) 使用相同实现。
