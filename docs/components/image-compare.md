# ImageCompare 图像对比

`ImageCompare` 将两张图像叠放在同一舞台，通过原生 range 语义和指针拖动调整分隔比例。它面向视觉前后对比，不复用文本 `DiffViewer`。

```tsx
<ImageCompare
  before={{ src: beforeUrl, alt: '调整前的工作区', label: '调整前' }}
  after={{ src: afterUrl, alt: '调整后的工作区', label: '调整后' }}
  position={position}
  onPositionChange={setPosition}
  orientation="horizontal"
/>
```

| 能力 | 契约 |
| --- | --- |
| 图像来源 | `before` 与 `after` 各自提供 `src`、有意义的 `alt`、可选标签和受控 loading/error。组件不下载、缓存或生成图像。 |
| 比例状态 | `position` / `onPositionChange` 控制对比前图层占比，范围固定为 0–100；`defaultPosition` 提供非受控初值，非法数值会归一到边界。 |
| 方向 | `horizontal` 以 x 坐标和竖向分隔柄计算比例；`vertical` 以 y 坐标和横向分隔柄计算比例。触摸行为保留与拖动轴垂直的页面滚动。 |
| 键盘 | 透明原生 `input[type=range]` 保留 Tab、方向键、Home、End、PageUp/PageDown 与 `step` 语义；视觉柄在焦点时显示共享焦点环。 |
| 图片适配 | `objectFit="cover | contain"` 控制两图的同尺寸适配；`aspectRatio` 控制响应式舞台比例。两图始终共享同一裁剪边界。 |
| 加载与失败 | 两侧独立报告加载/失败。传入 `onRetry(side, source)` 后，失败侧在舞台下方显示稳定的重试操作，避免按钮被另一图层遮挡。 |
| 禁用 | `disabled` 同时禁用 range 和指针更新，并通过 `aria-disabled` 暴露状态。 |

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/基础-imagecompare-图像对比--playground) 可在同一 Story 调整比例、方向、步进、适配方式、舞台比例、标签和禁用状态。受控、纵向、加载、单侧/双侧失败、窄工作面均有独立 Story。
