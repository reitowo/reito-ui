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

## 范围

当前提供同步 CommonMark + GFM 阅读渲染。MDX、数学公式、图表语法、任意原始 HTML、异步插件 Suspense 和富文本编辑不在 MARKDOWN-01 范围；编辑使用 `RichTextEditor`。未闭合语法、增量文本、代码/表格在流式过程中的节点稳定和原文复制属于后续 `MARKDOWN-02`，现有 `streaming` 只表达消息状态。
