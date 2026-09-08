# AI-COMPOSER-02 附件验收

通过 `attachmentOptions` 启用 Composer 文件选择、文件粘贴和拖入，统一进入 `ComposerDraft.attachments`。复用 FileUpload 的校验、进度、取消、重试和预览生命周期，新增 compact 展示及 `FileUploadHandle.addFiles` 导入接口。附件仅交给结构化回调；纯附件可发送，有 transport 时未成功的文件阻止发送。上传执行与远程文件标识由宿主提供。

## 验证记录

- `npm run check`：通过，`.logs/composer-attachments-check.log`。
- 首轮附件 4 项 + Composer 15 项 + FileUpload 17 项：36/36 通过。
- 加入同页 Controls、失败保留、取消、普通文字粘贴、受控移除及共享上传中止逻辑后：附件 8 项 + FileUpload 17 项，25/25 通过。
- 最终本地文件状态文案调整后，附件专项 8/8 再次通过；日志 `.logs/composer-attachments-final-tests.log`。
- Composer 24 个 Story 与 FileUpload 18 个 Story，合计 42 × 四种主题密度 = 168/168 通过，0 页面错误、0 axe 违规、0 横向溢出；`.logs/composer-attachments-audit.json`，审计期间源码未变化。该审计先于最后的“本地文件”文案修正，之后专项测试及四种窄屏截图重新运行。
- 360px 四种主题密度均验证加入文件后的页面无横向溢出，截图 `.logs/composer-attachments-*.png`；实际查看深色紧凑和浅色舒适。文件名截断仍有 title，移除按钮可见。

Playground `ai-composer--attachment-playground` 提供格式、数量、大小、预览、禁用、发送失败六个参数。测试在相同 Story 路径实际改变数量、禁用和失败参数，并确认发送失败保留原附件、恢复成功后清空。

## 视觉参考与边界

实际查看 Nuxt UI ChatPrompt 的 With an Editor 深色参考，见 [来源记录](references.md)。输入、文件与操作置于同一容器；本实现采用紧凑文件行和校验提示，不复制 Vue/Tiptap 代码或品牌样式。相较参考，本地队列明确呈现文件大小和状态。

粘贴和拖放测试使用浏览器 DataTransfer/ClipboardEvent/DragEvent；普通文字粘贴仅验证事件未被拦截。未声称真实系统剪贴板或外部上传端点已经联调。File 对象必须由宿主上传或读取，不能以 JSON 文件名当成远程内容。真实中文 IME 的限制延续 Composer 基础验收。
`npm run build` 最终通过，日志 `.logs/composer-attachments-build.log`；保留已有的大 chunk 提示。
