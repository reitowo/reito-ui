# ChatOverlay 对话弹层

复用 Dialog、Conversation 与 Composer。`open/onOpenChange` 支持受控开关，`defaultOpen` 提供初始状态；`title/description/triggerLabel` 控制标题、说明和入口文字。`children` 放消息节点，`empty` 自定义空内容，`composer` 透传 ComposerProps，`follow` 控制会话自动跟随。`disabled` 禁用打开入口；输入禁用状态由 `composer.disabled` 控制。

关闭只隐藏工作面，不自动停止请求或清空草稿。DialogContent 新增可选 `keepMounted`，默认仍为 false；ChatOverlay 启用它以保留输入和上传队列。调用者需要结束任务时应通过 composer.onStop 或宿主逻辑处理。组件真正卸载后内部状态不再保留，需长期保存时使用受控草稿。

```tsx
<ChatOverlay
  open={open}
  onOpenChange={setOpen}
  title="审查助手"
  composer={{ draft, onDraftChange: setDraft, onSubmit: sendText,
    running, onStop: stopRequest }}
>
  {messages.map(message => <Message key={message.id} from={message.role}>
    {message.text}
  </Message>)}
</ChatOverlay>
```

Playground 的开关、标题、说明、禁用、运行、错误和空态支持同页 Controls。示例请求仅更新本地 React 状态，没有调用外部模型。[验收记录](../validation-chat-overlay.md) 包含焦点、受控开关、草稿重开、失败重试、小窗口与共享弹层回归。
