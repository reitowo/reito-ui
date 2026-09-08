# ChatPalette 命令与会话弹层

在 ChatOverlay 中组合 CommandSearch 与原有 Composer/Conversation。`groups/onCommand` 提供命令及异步执行；`sessions/onSessionSelect` 提供会话目录及切换。选择成功进入对话视图，失败保留搜索并显示错误。点击重试清除错误后可重新选择。异步操作期间禁用重复选择和视图切换。

`open/defaultOpen/onOpenChange` 控制弹层，`composer` 传入宿主输入与停止行为，`children` 提供当前会话内容。组件不存储多会话数据库：会话对应的消息和草稿由宿主在 onSessionSelect 内切换；默认单份草稿跨视图保留，每会话独立草稿须传入受控 ComposerDraft。

`shortcut=true` 显式注册 Mod+J；默认不注册。忽略重复按键、已处理事件、IME、输入框、contenteditable 与其他 dialog 中的按键。多个实例应由宿主只启用一个快捷键入口。

ChatOverlay 的 `size="compact"` 使用内容自然高度和 token 最大高度，消除少量命令时的留白。`navigation` 作为视图操作区，`composerVisible` 切换输入区可见性并保持挂载。ChatOverlay 默认尺寸不变。

Playground 可调标题、禁用、快捷键、失败、空列表及运行状态；另提供空、失败、运行、禁用、快捷键和异步选择场景，共 7 个 Story。所有命令和消息都是本地演示，无外部模型请求。

本轮 6 项 ChatPalette 专项和 8 项 ChatOverlay 回归通过；覆盖命令/会话选择、草稿保留、快捷键输入边界及焦点恢复、同页失败恢复、空反馈、停止、异步选择锁定与关闭后完成。四种主题密度的 360×600 截图见 `.logs/chat-palette-*.png`，实际查看深色紧凑截图。

完整结果见 [验收记录](../validation-chat-palette.md)。
