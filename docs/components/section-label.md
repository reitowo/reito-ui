# SectionLabel

`SectionLabel` 是高密列表中的轻量分组标签，例如事件轨迹里的 “TURN 1” 或日期边界。它使用 `text-2xs`、半粗字重与次级颜色，大写由 CSS 完成，可访问名称保留原文。

```tsx
<SectionLabel>Turn 1</SectionLabel>
<SectionLabel trailing="12 条" divider>今天</SectionLabel>
```

默认渲染 `h3`；`as` 可改为其他标题层级，纯视觉分组时用 `div`。`trailing` 放置同排的简短计数，`divider` 在标签后延伸一条细线。它不是页面 eyebrow 或宣传标题。
