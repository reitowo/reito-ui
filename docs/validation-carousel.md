# Carousel 验收

日期：2026-09-07

## 范围

CAROUSEL-01 新增通用 React 内容轮播，覆盖受控活动页、按钮和指示器、多项可见、键盘、Pointer Events 拖动、ResizeObserver 对齐、首尾循环、非活动内容隔离，以及可暂停自动播放。

## 自动验证

- `npx playwright test tests/carousel.spec.ts --workers=1`：16 项通过。
- 行为覆盖前后边界、指示器 roving focus、region 键盘、受控回写、多项分页、指针拖动、循环、自动播放暂停、焦点暂缓、尺寸变化重对齐、非活动交互内容 Tab 隔离、单项/空态/禁用状态。
- 深色/浅色主题 × 紧凑/舒适密度均执行可访问性与 420 × 520 窄工作面截图检查。
- Storybook 本族 15 个 Story × 4 组主题密度，共 60 次组合审计通过；审计期间源码指纹保持不变。
- `npm run check` 与 `npm run build` 通过；生产构建仅保留既有的 chunk size 提示。

## 视觉检查

检查 `narrow` 的深色/紧凑与浅色/舒适截图。单张内容完整收在视口内，不泄露下一张边缘；按钮、指示器和页码保持单行，紧凑密度没有额外卡片套层。颜色、边界、圆角、字号和间距均来自 Graphite 语义 token。

## 参考与边界

能力范围对照 PrimeVue Carousel 的页导航、循环、响应式与可访问结构，以及 Nuxt UI Carousel 的滑动定位。实现没有引入 Embla，也没有复制 Vue 模板、源码或样式；当前范围不包含纵向轮播或克隆轨道式无缝循环。
