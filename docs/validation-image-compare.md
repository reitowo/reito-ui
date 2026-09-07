# ImageCompare 验收

日期：2026-09-07

## 范围

COMPARE-01 新增独立图像对比组件，覆盖受控 0–100 比例、横/纵方向、原生 range 键盘、Pointer Events 点击/拖动、响应式比例、两侧加载/失败/重试和禁用状态。

## 自动验证

- `npx playwright test tests/image-compare.spec.ts --workers=1`：16 项通过。
- 行为覆盖 range 数值语义、方向键/Home/End/PageUp/PageDown、横纵指针坐标、连续拖动、受控回写、细步进、标签、两侧加载、失败侧重试回调、禁用和尺寸变化。
- 深色/浅色主题 × 紧凑/舒适密度均执行可访问性与 420 × 480 窄工作面截图检查。
- Storybook 本族 15 个 Story × 4 组主题密度，共 60 次组合审计通过；审计期间源码指纹保持不变。
- `npm run check` 与 `npm run build` 通过；生产构建仅保留既有的 chunk size 提示。

## 视觉检查

检查 `narrow` 的深色/紧凑与浅色/舒适截图。两图严格共享舞台边界，分隔柄居中于 50% 线，标签保持在各自角落，比例读数在舞台下方单行显示。颜色、边界、圆角、字号、内距和焦点均来自 Graphite 语义 token。

## 参考与边界

能力与键盘范围对照 PrimeVue ImageCompare。Reito UI 使用独立 React 状态和图层结构，没有复制 Vue 模板、源码、CSS 或示例图片。当前只支持两张同舞台图像；文本差异继续由 DiffViewer 负责。
