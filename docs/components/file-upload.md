# FileUpload 文件上传

`@reito/ui/complex` 导出 `FileUpload`、`QueuedFile`、`FileUploadStatus`、`FileUploadTransport` 与 `FileUploadTransportContext`。组件负责文件选择、本地校验和队列生命周期；上传地址、鉴权、分片、重试策略与真实网络请求由宿主的 `transport` 实现。

```tsx
<FileUpload
  value={files}
  onValueChange={setFiles}
  accept=".md,.json"
  maxSize={10 * 1024 * 1024}
  maxFiles={5}
  transport={async (item, { signal, onProgress }) => {
    await uploadFile(item.file, {
      signal,
      onProgress: ({ percent }) => onProgress(percent),
    });
  }}
/>
```

| 参数 | 契约 |
| --- | --- |
| `value / onValueChange` | 可受控的 `QueuedFile[]`。状态包括 `queued`、`uploading`、`success`、`error` 和 `canceled`；省略状态等价于 `queued`。 |
| `transport` | 宿主上传回调。组件传入当前项、`AbortSignal` 和归一化为 0–100 的进度回调；成功 resolve，失败 reject。组件不推断 HTTP、云存储或分片协议。 |
| 开始 / 取消 / 重试 | 等待和已取消项可以开始；上传中可取消并触发 AbortSignal；失败项保留文件、错误与重试入口。上传中不显示移除，避免队列与 transport 生命周期分离。 |
| `progress` | `uploading` 项显示逐文件 Progress。宿主也可直接传入受控进度；无效值会归一化到 0–100。 |
| `preview` | 默认 `true`。图片文件使用临时对象 URL 显示紧凑缩略图；设为 `false` 时所有文件使用通用文件表示，也不会创建对象 URL。 |
| `accept / maxSize / maxFiles` | 添加前校验 MIME/后缀、单文件大小、数量和同名同尺寸同修改时间的重复项。浏览器 `accept` 只辅助选择，组件仍执行自己的校验。 |
| `disabled` | 禁用隐藏 input、选择按钮和已有文件操作；当前 transport 不会因为 disabled 变化自动取消，宿主可保留或主动更新队列。 |

图片缩略图只表示本地文件可预览，与 queued、uploading、success 等上传状态彼此独立。图片解码失败时回退到明确的不可预览图标；非图片文件一直使用通用文件图标。文件移除、替换或组件卸载会释放对应对象 URL；取消上传保留队列项和缩略图，之后仍可重新开始或移除。

组件卸载、移除上传项或点击取消时会 abort 自己创建的控制器；迟到的进度、成功或错误不会覆盖取消后的状态。未提供 `transport` 时仍可作为本地受控文件队列使用。FileUpload 只提供队列内缩略图，全屏查看、缩放和图库导航由后续独立 Gallery 组件负责。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-fileupload-文件上传--playground) 在同一 Story 调整状态、进度、错误、预览、文件类型、校验和 transport；[图片与文件预览](http://127.0.0.1:6006/?path=/story/复杂-fileupload-文件上传--image-preview)、[失败回退](http://127.0.0.1:6006/?path=/story/复杂-fileupload-文件上传--preview-fallback)、[上传完成](http://127.0.0.1:6006/?path=/story/复杂-fileupload-文件上传--interactive)、[取消](http://127.0.0.1:6006/?path=/story/复杂-fileupload-文件上传--cancel-action) 与[失败重试](http://127.0.0.1:6006/?path=/story/复杂-fileupload-文件上传--retry-action)均为本地示例。[Lab](http://127.0.0.1:5173/?layer=complex&component=file-upload) 不连接外部服务。

## 在 Composer 中复用

`variant="compact"` 保留队列与校验，只移除独立的大拖放画布。`ref` 接受 `FileUploadHandle`，其 `addFiles(File[])` 与文件 input 使用同一校验入口，可由父级粘贴或拖放事件调用。未配置 transport 时，紧凑模式显示“本地文件”，不会暗示已经上传。

受控宿主移除、替换文件对象或改变上传中状态时，组件中止对应旧 transport；迟到进度不会再修改新队列。普通 `variant="default"` 继续作为独立文件上传工作面。
