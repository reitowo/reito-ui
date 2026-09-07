# GALLERY-01 ImageGallery 验收

2026-09-07，GALLERY-01 完成。新增独立 `ImageGallery` 组件族，包含受控活动项、页面内主图、缩略图、模态放大、前后导航、加载/失败/重试、集合边界、键盘和焦点恢复。

- Playwright 13 项通过，覆盖 Story 交互回归、受控缩略图、roving focus、左右/Home/End、非循环边界、循环切换、稳定加载态、失败重试、空/禁用、同页 Controls，以及四主题密度窄屏。
- 本族 10 个 Story 在 dark/light × compact/comfortable 共 40 次组合中全部通过；页面错误、控制台错误、可访问性违规和页面级水平溢出均为 0，审计期间源码指纹未变化。
- 视觉检查使用 420 × 800 的窄工作面 Story。16:9 主图、两行说明与 64px 缩略图保持紧凑；dark/compact 与 light/comfortable 均复用共享边框、状态、焦点、内容间距与时长 token。
- 能力核对 PrimeVue Galleria 的活动项、缩略图 tab、前后导航和模态语义，以及 PrimeVue Image 的预览按钮、对话框和关闭焦点约束。Reito UI 使用 Base UI Dialog 和自己的 Graphite 结构，不复制上游模板、CSS、图像或源码。
- 全库为 116 个组件族（基础 68、复杂 29、AI 19）和 1087 个 Story；`npm run check` 与 `npm run build` 通过。构建只保留既有 chunk size 提示。

证据：[源码](../packages/ui/src/basic/image-gallery.tsx)、[Story](../apps/storybook/stories/basic/image-gallery.stories.tsx)、[交互测试](../tests/image-gallery.spec.ts)、[Story 审计](../.logs/image-gallery/storybook-audit.json)、[测试日志](../.logs/image-gallery/tests.log)、[四组合截图](../.logs/image-gallery)、[用法](components/image-gallery.md)。
