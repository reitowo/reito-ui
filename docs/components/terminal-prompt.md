# TerminalPrompt 命令交互

`TerminalPrompt` 展示调用方提供的命令和响应，并管理一个可提交的单行命令草稿。它提供终端式交互表面，但不会执行 shell、启动进程或连接 PTY。

```tsx
<TerminalPrompt
  entries={entries}
  value={draft}
  onValueChange={setDraft}
  onSubmit={command => runtime.submit(command)}
  running={run.status === 'running'}
  onCancel={() => runtime.cancel(run.id)}
  history={recentCommands}
  label="工作区命令"
/>
```

| 能力 | 契约 |
| --- | --- |
| 响应记录 | `entries` 是唯一响应来源。每项需要稳定 `id` 和 `command`，可提供 `output / prompt / time`，状态为 `running / success / error / cancelled`。`output` 是调用方内容，组件不解析退出码或日志协议。 |
| 草稿 | `value / onValueChange` 可受控，`defaultValue` 提供非受控初值。成功提交后只清除仍等于本次命令的草稿；宿主在 Promise 期间写入的新草稿不会被覆盖。 |
| 提交 | `onSubmit(command)` 可返回 Promise。空命令、禁用、只读、运行中和已有提交期间不会重复调用；拒绝后保留输入并显示错误。Enter 提交。 |
| 取消 | `running` 由宿主持有；存在 `onCancel` 时显示取消按钮，并允许输入仍有焦点时按 Escape。取消 Promise 期间防止重复，失败时保留运行状态并显示错误。组件不发送系统信号。 |
| 历史 | `history` 按最旧到最新传入；未提供时从 `entries.command` 推导。上下键浏览，越过最新项会恢复浏览前的未提交草稿；编辑历史项后开始新的草稿浏览周期。 |
| 中文输入法 | composition 生命周期、原生 `isComposing` 和 `keyCode 229` 均阻止候选确认 Enter 提交。操作系统真实输入法仍需要消费应用人工验证。 |
| 输出跟随 | `follow / onFollowChange` 可受控，`defaultFollow` 提供初值。处于底部时随新增记录滚动；上滚后暂停并显示“回到最新”。`viewportClassName` 可覆盖默认 `--rui-terminal-height`。 |
| 清除与错误 | `onClear` 只通知宿主清除记录；`error` 呈现宿主级错误。空态、只读和整体禁用有独立语义。 |

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-terminalprompt-命令交互--playground) 可在同一个 Story 调整草稿、运行、跟随、禁用、只读、提示符和所有主要文案。异步提交、提交失败、运行取消、取消失败、历史、混合状态、长输出、暂停跟随、宿主错误、空态和窄工作面均有独立 Story。

真实终端宿主需要另外处理进程生命周期、工作目录、环境变量、权限、PTY 尺寸、流式字节解码、退出码、取消信号和持久化。不要把 Storybook 的本地状态响应当作这些集成已经完成。
