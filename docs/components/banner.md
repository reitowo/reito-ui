# Banner

`Banner` 复用基础 `Alert`，用于应用工作区内简短、可操作、可关闭的通知。

```tsx
<Banner title="组件索引可以更新" description="这是本地通知。" tone="info" action={{ label: '查看', onSelect: openDetails }} onDismiss={hideNotice} />
```

`tone` 支持 neutral/info/success/warning/danger；图标、背景和边界均使用语义 tokens。`action` 可独立 disabled/loading，`onDismiss` 才会显示带标签的关闭按钮。`open/defaultOpen/onOpenChange` 支持受控或非受控关闭。

默认 `live="off"` 生成带名称的 region，适合页面初始已有的静态通知。只有通知在用户操作后动态出现并确实需要播报时使用 `polite`（status）或 `assertive`（alert）。状态不能只靠色彩表达。

长文字自然换行；窄容器中的动作保持可达。Banner 传达当前工作所需的信息，不用于统计条、宣传横幅或装饰性品牌区域。
