# ImageGallery 图片画廊

`ImageGallery` 是独立的受控图片查看组件。页面内显示当前图、说明和可选缩略图；“放大预览”打开模态查看层。它不复用附件队列状态，也不把固定比例容器当成图片加载器。

```tsx
<ImageGallery
  items={images}
  activeId={activeId}
  onActiveChange={setActiveId}
  previewOpen={previewOpen}
  onPreviewOpenChange={setPreviewOpen}
  onRetry={reloadImage}
  onDownload={requestDownload}
  onTransformChange={saveViewState}
  minZoom={0.5}
  maxZoom={4}
  zoomStep={0.25}
  showThumbnails
/>
```

| 能力 | 契约 |
| --- | --- |
| 图片数据 | 每项必须有稳定 `id`、`src` 和有意义的 `alt`；可另传 `thumbnailSrc`、标题与说明。组件不下载、缓存或生成图片。 |
| 受控状态 | `activeId` / `onActiveChange` 控制当前图；`previewOpen` / `onPreviewOpenChange` 控制模态层。对应 `default*` 属性提供非受控初值。 |
| 缩略图 | 使用 tab 模式与 roving focus；左右方向键、Home、End 会选择并聚焦对应图片。`showThumbnails={false}` 只隐藏缩略图，不改变集合。 |
| 预览导航 | 上一张/下一张与左右方向键切换图片；Home/End 到首尾。`loop` 决定边界按钮禁用或首尾循环。 |
| 加载和错误 | 原生图片事件驱动默认 loading/error；宿主也可用条目 `status` 固定展示加载或失败。`onRetry(item)` 只请求宿主重试，并重新触发内部图像加载。 |
| 焦点 | Reito UI Dialog 管理模态焦点、Escape 关闭和关闭后回到“放大预览”按钮。空与禁用状态不制造可操作入口。 |
| 查看变换 | 查看层提供有界缩放、放大后的指针拖动、90° 旋转与水平/垂直翻转。`onTransformChange(transform, item)` 报告当前状态；切换图片或关闭查看层会复位为 100%、0°、未翻转和零位移。 |
| 全屏 | 全屏按钮调用浏览器 Fullscreen API，并用 `fullscreenchange` 同步 `onFullscreenChange`；浏览器拒绝请求时不会制造假的全屏状态。关闭查看层会退出由本组件打开的全屏。 |
| 下载 | 只有传入 `onDownload(item)` 才展示下载按钮。组件报告当前条目，不推断文件名、不创建隐藏链接，也不替宿主处理鉴权、网络或存储。 |

`viewerTools={false}` 可保留模态导航并隐藏变换工具。工具栏支持 `+` / `=` 放大、`-` 缩小、`0` 复位；按住 Ctrl 或 Command 滚轮可缩放，比例大于 100% 后可以拖动画面。`minZoom` 与 `maxZoom` 即使传入顺序相反也会按数值边界归一化。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/基础-imagegallery-图片画廊--playground) 可在同一 Story 调整活动项、预览开关、缩略图、循环、查看工具、缩放边界/步长、下载入口与禁用；加载、失败、空态、窄屏和高级查看器均有独立 Story。
