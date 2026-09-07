# UPLOAD-02 FileUpload 文件预览验收

2026-09-07，UPLOAD-02 已完成。FileUpload 默认对本地图片文件创建紧凑缩略图，非图片文件使用通用文件表示，图片解码失败时回退到明确图标；`preview={false}` 可关闭对象 URL 与图片解码。

- FileUpload Playwright 17 项通过，其中 5 项直接覆盖图片/非图片表示、解码失败、取消后保留预览、移除释放对象 URL、同 ID 文件替换释放旧 URL，以及关闭预览不创建 URL；原有上传生命周期和校验继续回归。
- 本族 18 个 Story 在 dark/light × compact/comfortable 共 72 次组合中全部通过；2 个 play Story 完成，页面错误、控制台错误、可访问性违规和页面级水平溢出均为 0。
- 视觉检查使用 420 × 800 的 narrow Story，覆盖 dark/light 和 compact/comfortable。缩略图尺寸复用 `--rui-control-height-sm`，队列继续使用共享 cell padding；状态、进度与操作仍在同一行，缩略图本身不使用成功装饰，因此不会暗示上传完成。
- 能力存在性核对 Nuxt UI FileUpload 与 PrimeVue 5 FileUpload Image Preview；对象 URL 生命周期核对 MDN createObjectURL/revokeObjectURL。组件实现、Graphite 行布局、状态隔离与回退均为项目代码。
- 预览只服务于队列识别，不提供放大、缩放、前后导航或全屏层；这些能力保留给后续 GALLERY-01。
- 全库为 115 个组件族（基础 67、复杂 29、AI 19）和 1063 个 Story；`npm run check` 与 `npm run build` 通过。构建只保留既有 chunk size 提示。

证据：[源码](../packages/ui/src/complex/file-upload.tsx)、[Story](../apps/storybook/stories/complex/FileUpload.stories.tsx)、[交互测试](../tests/file-upload.spec.ts)、[Story 审计](../.logs/file-upload-preview/storybook-audit.json)、[测试日志](../.logs/file-upload/preview-tests.log)、[四组合截图](../.logs/file-upload)、[用法](components/file-upload.md)。
