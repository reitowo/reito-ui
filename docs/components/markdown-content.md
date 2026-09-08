# MarkdownContent / RichMessage

`MarkdownContent` 是 AI 层的只读 CommonMark/GFM 文档面。它负责把宿主已经取得的 Markdown 字符串变成语义化 React 内容，并复用 `CodeBlock` 展示 fenced code。它不负责请求模型、编辑文档、抓取链接或执行代码。

```tsx
<MarkdownContent
  value={'## 检查结果\n\n- [x] 类型检查\n- [ ] 发布'}
  onCodeCopy={(code, language) => recordCopy(code, language)}
/>
```

默认支持标题、段落、强调、删除线、有序/无序/任务列表、引用、链接、图片、表格、分隔线、行内代码与 fenced code。表格在自身容器横向滚动，代码块保持原始文本并按语言高亮；高亮只是展示，不计算 diff，也不执行源码。

## 与消息组合

`RichMessage` 复用 `Message` 的角色、流式状态、actions 和本地示例标记，并把 Markdown 内容放进正文。附加的工具调用、引用或产物可作为 `children` 紧随正文组合：

```tsx
<RichMessage
  from="assistant"
  content={answer}
  streaming={isStreaming}
  actions={<MessageActions text={answer} />}
  markdownProps={{ externalLinkTarget: '_blank' }}
>
  {artifact ? <ArtifactPanel {...artifact} /> : null}
</RichMessage>
```

Workbench 例工程直接使用这个公共组件。`RichMessage` 不拥有消息数组、请求生命周期或模型状态；宿主继续持有稳定消息 ID、重试、分支、停止和持久化。

## 内容处理与安全边界

- `htmlPolicy="escape"` 是默认值：原始 HTML 作为文字显示，不执行。`htmlPolicy="remove"` 会移除标签但保留可解析的文本内容。
- 默认 URL 转换会过滤危险的 `javascript:` 等协议。外部 HTTP/HTTPS/mailto 链接默认使用新窗口并附加 `noopener noreferrer`；相对链接保留当前上下文。`externalLinkTarget="_self"` 可改变外部链接打开方式。
- `allowedElements` 与 `disallowedElements` 不能同时提供；`allowElement` 可执行更细的 AST 节点筛选，`unwrapDisallowed` 决定被过滤元素的子内容是否保留。
- `components` 可替换任何标准节点；`renderCodeBlock` 可接管 fenced code。自定义渲染器必须继续提供正确的语义、可访问名称、焦点和 URL 策略。
- `remarkPlugins` 在 GFM 之后运行，`rehypePlugins` 作用于 HTML AST。提供自定义插件或 `urlTransform` 会改变默认内容边界，宿主需要审查插件、协议和生成属性。当前包没有安装原始 HTML 执行插件。

```tsx
<MarkdownContent
  value={markdown}
  allowedElements={['p', 'strong', 'em', 'a', 'code', 'pre']}
  unwrapDisallowed
  components={{
    a: props => <WorkspaceLink {...props} />,
  }}
  renderCodeBlock={({ code, language }) => (
    <CodeBlock code={code} language={language} onCopy={saveAudit} />
  )}
/>
```

`onCodeCopy` 收到未高亮、未变形的 fenced code 原文及归一化语言名。若传入 `renderCodeBlock`，复制行为也由自定义渲染器负责。

## 流式 Markdown

宿主把已经累积的完整 source 持续传给 `value`，并在仍会追加内容时设置 `streaming`。组件不会连接传输层，也不接收 token 事件：

```tsx
<RichMessage
  from="assistant"
  content={accumulatedSource}
  streaming={run.status === 'streaming'}
  markdownProps={{
    streamKey: run.id,
    completeIncompleteMarkdown: true,
  }}
/>
```

- `streaming` 会设置 `aria-busy`，并对尾部未闭合的强调、斜体、删除线、行内代码和链接做仅用于当前渲染的临时补全。传入的 `value` 不会被修改，回调和持久化仍应使用宿主原文。
- 半成品链接只显示链接文字，不生成可点击的临时 URL；不完整图片默认暂不渲染。完整 URL 仍经过静态模式相同的 URL 转换与协议过滤。
- CommonMark 会把未闭合 fenced code 当作代码块；`CodeBlock` 因此能持续显示、高亮并复制当前 fence 内的准确源码。复制不会包含 opening fence，也不会包含临时合成的闭合标记。
- 表格必须等分隔行完整后才获得 table 语义，因此尾部会在这一刻从普通文字替换成表格。前面已经稳定的标题和段落保持原节点身份；表格和代码的尺寸变化只发生在各自局部容器。
- `completeIncompleteMarkdown={false}` 关闭临时补全，适合调试或必须逐字展示标记的界面。`streamingOptions` 细调 remend 规则；自定义 handler 也属于宿主审查范围。
- 同一轮生成保持相同 `streamKey`，让追加内容沿用已稳定节点；重新生成、切换分支或以非追加 source 替换当前回答时更换 key，明确卸载旧节点及其局部状态。

`RichMessage` 会把自己的 `streaming` 状态自动传给 `MarkdownContent`；`markdownProps.streaming` 仍可显式覆盖。逐 token 使用 `aria-live` 会让屏幕阅读器重复朗读，所以组件只暴露 busy 状态，完成通知由会话宿主在合适粒度提供。

## 范围

当前提供同步 CommonMark + GFM 阅读渲染和追加式流的尾部恢复。MDX、数学公式、图表语法、任意原始 HTML、异步插件 Suspense 和富文本编辑不在范围；编辑使用 `RichTextEditor`。任意位置补丁、服务端 token 顺序修复、跨消息节点迁移和流式虚拟长列表由宿主或后续专门组件处理。
