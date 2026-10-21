# JumpToLatest

`JumpToLatest` 是阅读者离开日志、轨迹或会话底部后出现的浮动“回到最新”胶囊。宿主判断是否在底部、负责滚动；组件只呈现入口。`Conversation` 复用它。

```tsx
<div className="relative">
  <div ref={viewport} onScroll={measure} className="h-full overflow-y-auto">…</div>
  <JumpToLatest visible={!atEnd} count={unread} aria-controls={viewportId} onClick={jumpToEnd} />
</div>
```

默认 `floating` 定位到最近的 relative 容器底部，`placement` 为 `end` 或 `center`；`floating={false}` 时在文档流中渲染。`count` 追加未读数，`visible={false}` 时不渲染。胶囊使用主操作语义色与 XS 控件高度，随密度缩放。
