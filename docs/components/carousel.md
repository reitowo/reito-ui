# Carousel 轮播

`Carousel` 用于在有限工作面中分页展示同类内容。它接受任意数据和 React 渲染函数，不假定内容是图片或商品卡片。

```tsx
<Carousel
  items={steps}
  getItemId={step => step.id}
  renderItem={step => <TaskStep step={step} />}
  activeIndex={activeIndex}
  onActiveIndexChange={setActiveIndex}
  itemsPerView={2}
  itemsPerMove={2}
/>
```

| 能力 | 契约 |
| --- | --- |
| 数据与标识 | `items` 是唯一内容来源；`getItemId(item, index)` 提供稳定键，`renderItem` 负责内容。组件不克隆或改写条目。 |
| 页模型 | `itemsPerView` 定义同时可见项，`itemsPerMove` 定义每次移动量。活动索引表示当前页的首项，并归一到最近的有效页；末页始终对齐集合末端。 |
| 受控状态 | `activeIndex` / `onActiveIndexChange` 控制活动页，`defaultActiveIndex` 提供非受控初值。`paused` / `onPausedChange` 对自动播放使用相同模式。 |
| 导航 | 前后按钮和页指示器可分别隐藏。轮播 region 支持左右方向键与 Home/End；指示器使用 roving focus，并支持同一组按键。`loop` 决定边界禁用或首尾循环。 |
| 手势与尺寸 | 视口使用 Pointer Events 处理水平拖动，保留纵向触摸滚动；拖动超过有界阈值后移动一页。ResizeObserver 在容器尺寸变化后把当前页重新对齐。 |
| 可访问内容 | 每项是带序号名称的 slide group；非活动项使用 `aria-hidden` 和 `inert`，其交互内容不会进入 Tab 顺序。自动播放期间 live region 为 `off`，停止后恢复 `polite`。 |
| 自动播放 | `autoplayInterval > 0` 才启用，并显示暂停/继续按钮；内部最短间隔为 250ms。悬停或焦点进入时暂缓，显式暂停状态由宿主决定是否受控。 |
| 动效 | 程序导航使用平滑滚动；系统请求 reduced motion 时直接定位。组件不提供无限克隆轨道，`loop` 在页边界重新定位。 |

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/基础-carousel-轮播--playground) 可在同一 Story 调整活动索引、可见项、移动量、循环、按钮、指示器、自动播放、暂停和禁用状态。受控、多项、交互内容、单项、空态、窄工作面与自动播放均有独立 Story。
