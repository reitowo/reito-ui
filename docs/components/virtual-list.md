# VirtualList 虚拟列表

`@reito/ui/complex` 导出 `VirtualList`、`VirtualListProps`、`VirtualListHandle` 和 `VirtualListRange`。由 TanStack Virtual 计算可见窗口，Graphite 提供密度、边界与列表语义。

```tsx
const ref = useRef<VirtualListHandle>(null);
<VirtualList ref={ref} label="任务" count={total}
  getItem={index => cache.get(index)}
  getItemKey={index => stableKeys[index]}
  renderItem={task => <span className="truncate">{task.name}</span>}
  onRangeChange={({ startIndex, endIndex }) => {
    if (startIndex >= 0) loadRange(startIndex, endIndex);
  }} />
// 0-based index; alignment defaults to auto.
ref.current?.scrollToIndex(500, 'center');
```

| 参数 | 契约 |
| --- | --- |
| count | 已知总项数，包括尚未加载的项；非有限数按 0 处理，负数归零，小数取整。 |
| getItem(index) | 返回该项；undefined 呈现占位。组件不执行网络请求。 |
| getItemKey(index) | 必填，返回稳定且唯一的业务 key；排序或插入时同一项继续使用相同 key。未加载项也需预先定义稳定 key。示例不可变序列用其序号作为身份。 |
| renderItem / renderPlaceholder | 行内容/未加载内容；当前固定行高由共享 row-height token 决定，内容应适配一行。 |
| overscan | 视口前后额外渲染行数，默认 4，允许 0。 |
| onRangeChange | 渲染范围 startIndex/endIndex（包含 overscan）与可见范围 visibleStartIndex/visibleEndIndex，均为 0-based 闭区间；没有范围时四项为 -1。宿主负责请求去重、取消、缓存和过期结果处理。 |
| ref.scrollToIndex | start/center/end/auto 对齐；下标限制在有效范围，空列表和非有限下标不滚动。 |
| loading / error / onRetry | 初始加载、错误和宿主重试；有数据时 loading 通过 aria-busy 呈现，现有项保持可见。 |
| className / viewportClassName | 外框与滚动视口的 class；默认视口 h-80，可用 h-64、h-96 或消费方共享布局尺度调整，不覆盖行高。 |

根列表可键盘聚焦，Home/End 定位首尾；行使用 listitem、aria-posinset 和 aria-setsize 标明完整序列的位置。它是内容列表，不是假定可选择的 listbox，不自动赋予业务选择行为。

当前 VIRT-01 覆盖固定高度窗口、定位和范围加载契约。动态高度、插入删除时的滚动锚点、活动行回收及动态密度切换的锚点保护在 VIRT-02 单独验收；二维网格属于 VIRT-03。固定行模式不要放置会自行增高的多行内容。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-virtuallist-虚拟列表--playground) 可调整数量、overscan、状态、稀疏加载及视口大小；[Lab](http://127.0.0.1:5173/?layer=complex&component=virtual-list) 使用同一示例。已固定 React 适配器 3.14.10、core 3.17.8，MIT 声明见包内 THIRD_PARTY_NOTICES。
