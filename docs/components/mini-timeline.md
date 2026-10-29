# MiniTimeline

`MiniTimeline` 是按通道排列的小刻度事件总览，适合放在高密轨迹、日志或任务流的顶部。每个事件占一列，只在所属通道显示一个刻度；`markers` 在上方标注轮次等位置。

```tsx
<MiniTimeline
  label="编辑轨迹"
  lanes={[{ id: 'open', label: 'open' }, { id: 'read', label: 'read' }, { id: 'write', label: 'write' }]}
  events={events}
  markers={[{ index: 9, label: 'T1' }]}
  value={selectedId}
  onValueChange={setSelectedId}
/>
```

`tone` 支持 neutral/info/success/warning/danger，颜色同时由刻度的可访问名称（`通道 · label`）和 title 说明。整条时间线只有一个 Tab 停靠点：左右方向键与 Home/End 移动焦点，Enter/Space 选择；选中列在其他通道显示 info-soft 底色。`value/defaultValue/onValueChange` 支持受控与非受控。事件很多时组件在自身容器内横向滚动。
