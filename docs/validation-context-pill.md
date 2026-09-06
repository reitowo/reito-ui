# ContextPill 等高修正

2026-09-06，Windows / Microsoft Edge，工作区源码。修正共享 `packages/ui/src/ai/context.tsx`；未更改密度 token 数值，未重打包现有 0.4.1 tarball。

## 原因与实际尺寸

旧移除按钮使用 `size="sm"` 与局部 `h-5 w-5`。共享按钮的密度高度覆盖 `h-5`，外层纵向 padding 又增加 4px，导致带按钮标签比普通标签更高。现在外层统一 SM 最小高度、去除纵向 padding，移除按钮使用 `icon-xs`。保留最小高度而非固定高度，以容纳放大或自定义内容。

以下为默认字体下的浏览器实际量度；dark/light 结果相同：

| 密度 | 修正前：普通 / 可移除 / 禁用 | 修正后：三种变体 | 修正后：移除按钮 |
| --- | --- | --- | --- |
| compact | 22 / 34 / 34px | 28px | 24 × 24px |
| comfortable | 22 / 42 / 42px | 36px | 32 × 32px |

证据：[修正前量度](../.logs/context-pill-height/before.json)、[修正后量度](../.logs/context-pill-height/after.json)。

## 视觉对照

直接参考本次用户标注的 ContextPill 页面截图（dark / compact，1503 × 1216 视口），并在同一页面、相同视口记录修正前后。实际查看修正后的 dark / compact 与 light / comfortable 整页截图：混合行边框上下沿一致，图标和文字居中，禁用按钮仍有状态差异。可移除标签因按钮而更宽，这是预期差异。页面结构、色彩、字体及图标未调整；本次不据此宣称与 Cursor 或 Claude 像素一致。

![修正后暗色紧凑](../.logs/context-pill-height/after-dark-compact.png)

## 本次检查

- `npm run check`：通过，token / 目录同步、设计约束与全部工作区类型检查。
- `npm run build`：通过，UI、Lab、Storybook、Workbench 构建；[日志](../.logs/build-context-pill.log)。
- `npm run test:ui -- tests/context-pill.spec.ts tests/density.spec.ts`：8/8 通过，dark/light × compact/comfortable。覆盖三种变体等高、按钮方形与边界、禁用按钮跳过 Tab、键盘焦点、Enter/Space 移除、Composer 删除上下文后不提交且保留草稿，以及已有表格和 AI 内容密度检查。
- Storybook：ContextPill 的 Guidelines / Removable / Disabled / LongName 与 Composer Guidelines，共 5 stories × 4 组合，20/20 通过。LongName play 验证窄容器截断、按钮可达与回调；结束状态无页面错误、console error、axe 违规或水平溢出。扫描前后源码指纹一致；[报告](../.logs/context-pill-height/storybook.json)。

这里记录本次受影响范围，未重新运行此前 856 组合的完整扫描，也不改变既有独立消费页的未通过项记录。
