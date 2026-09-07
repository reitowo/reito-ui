# RichTextEditor 媒体与宿主补全验收

日期：2026-09-07

## 范围

EDIT-06 在既有 Tiptap schema、受控值和历史栈上增加 Image 节点、地址插入、宿主图片上传生命周期，以及 provider-neutral 的文本补全审阅。所有 Story Provider 都是本地延时函数；没有连接上传服务器、模型服务或 Tiptap Content AI。

## 行为与数据边界

- 固定版本 `@tiptap/extension-image@3.31.3` 提供真正的 image 节点，以及 JSON/HTML/Markdown 解析和序列化。地址与上传结果只接受 HTTP、HTTPS、Blob 或相对地址，base64 默认关闭；替代文字进入节点属性。
- `uploadImage(file, { signal, onProgress })` 由宿主实现。组件在调用前检查 `imageAccept / imageMaxSize`，展示进度，支持取消与重试；关闭、取消、卸载和新请求会 abort 并隔离迟到结果。组件不推断网络协议、鉴权、分片或服务端清理。
- `requestCompletion({ snapshot, selection, selectedText, signal })` 只产生文本候选。没有 Provider 时入口不渲染；加载可取消，失败可重试，拒绝不改变文档，接受才写入历史事务。建议生成后宿主若替换文档，旧候选不能应用。
- `onExtensionError` 统一回传 image-upload 或 completion 错误。只读/禁用不执行媒体或补全动作。首版不声明图片 caption/resize/crop、富 diff、多候选、流式 token 或协作建议。

## 自动验证

- `npx playwright test tests/rich-text-editor.spec.ts`：86/86 通过，其中 23 项覆盖本阶段媒体/补全行为和四套主题/密度视觉状态，其余为 EDIT-01～05 回归。
- 新增断言覆盖地址插入、裸相对路径、危险地址拒绝、三格式 image 输出、文件类型/大小校验、上传进度、成功、取消、迟到结果隔离、失败重试、只读图片，以及补全加载、纯文本插入、接受、拒绝、取消、失败重试、Provider 缺失和宿主替换后的过期保护。
- Playground 在同一 Story 公开 19 项 Controls；新增 `imageUploadPreset` 与 `completionPreset`，可切换 success、failure、none，工具栏另有 media 预设，无需离开当前 Story。
- 对生产构建后的静态 Storybook 执行本族 52 个 Story × dark/light × compact/comfortable 共 208 个组合：208/208 通过，page error、console error、WCAG 2A/2AA/2.1AA 违规和页面级横向溢出均为 0；报告为 `.logs/rich-text-editor/storybook-audit-edit-06-static.json`。
- `npm run check` 与 `npm run build`：通过；构建只报告既有大 chunk 提示。

## 视觉检查

参考工作上下文是 Nuxt UI Editor 的紧凑固定工具栏、Tiptap Image/FileHandler 的能力说明，以及本项目已确认的 Cursor 向 Graphite 桌面工作面。检查 `.logs/rich-text-editor/media-dark-compact.png`、`media-light-comfortable.png`、`completion-dark-compact.png` 和 `completion-light-comfortable.png`：图片 Popover 使用现有 XS 控件、内容 padding、语义边界和输入；补全审阅面直接附着正文底边，使用 muted、border、foreground 和 destructive 角色。两者都没有独立色阶、固定像素高度、品牌标志或新增卡片层级，四套组合无页面横向溢出。

与更完整编辑器的差异是当前图片没有 resize/caption/crop/图库和自动粘贴上传；补全没有 inline ghost text、流式 diff、多候选或协作状态。这些能力需要新的验收项或宿主产品范围，不能由 EDIT-06 的回调首版推断为已支持。
