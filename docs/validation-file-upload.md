# UPLOAD-01 FileUpload 生命周期验收

2026-09-07，UPLOAD-01 已完成。FileUpload 在原有 accept、大小、数量、重复与拖放校验上增加受控文件状态、逐文件进度、宿主 transport、开始、Abort 取消、失败保留与重试。

- FileUpload Playwright 12 项通过，覆盖本地添加、模拟 transport 与进度、成功、取消、失败重试、受控进度、逐文件错误、原有四类校验、移除、禁用、同页 Controls，以及四种主题密度窄屏。
- 本族 13 个 Story 在 dark/light × compact/comfortable 共 52 次组合中全部通过；2 个 play Story 完成，页面错误、控制台错误、可访问性违规和页面级水平溢出均为 0。
- 视觉对照使用现有 Graphite 本地队列作为结构基线，并检查 420 × 800 的 dark/light、compact/comfortable 截图。拖放面保留空态 token，队列改用共享 cell padding、软边界、Progress 和语义错误/成功色；窄面板中长文件名截断，生命周期动作保持在同一行。
- 能力范围核对 PrimeVue FileUpload 的 drag/drop、multi、progress、validation、cancel 与 custom upload，以及 Web AbortController 的取消语义。Reito UI 的状态机、React API、Graphite 布局和本地示例为项目实现；不复制上游源码、CSS、模板或资源。
- transport Story 仅使用定时器模拟进度，不发送网络请求；图片缩略图、对象 URL 释放和预览失败回退属于 UPLOAD-02。
- 全库为 115 个组件族（基础 67、复杂 29、AI 19）和 1058 个 Story；`npm run check` 与 `npm run build` 通过。构建只保留既有 chunk size 提示。

证据：[源码](../packages/ui/src/complex/file-upload.tsx)、[Story](../apps/storybook/stories/complex/FileUpload.stories.tsx)、[交互测试](../tests/file-upload.spec.ts)、[Story 审计](../.logs/file-upload/storybook-audit.json)、[测试日志](../.logs/file-upload/tests.log)、[四组合截图](../.logs/file-upload)、[用法](components/file-upload.md)。
