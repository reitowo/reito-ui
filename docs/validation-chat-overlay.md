# AI-OVERLAY-01 ChatOverlay 验收

新增公开 ChatOverlay，复用 Dialog、Conversation 和 Composer。DialogContent 的 `keepMounted` 默认 false；此组合选择保留挂载，并以关闭状态隐藏弹层及遮罩。关闭不隐式停止宿主任务，草稿、错误和附件状态保留。

## 验证

- `npm run check`：最终通过，`.logs/chat-overlay-check.log`。
- `npm run build`：最终通过，`.logs/chat-overlay-build.log`。UI、Lab、Storybook、Workbench 完成构建，保留已有的大 chunk 提示。
- `tests/chat-overlay.spec.ts` 8 项 + `tests/overlay-provider.spec.ts` 18 项，26/26 通过，`.logs/chat-overlay-tests.log`。
- 验证 Escape 关闭与入口焦点恢复，重新打开保留草稿，发送成功更新宿主消息，停止生成不关闭弹层；同页 Controls 改标题与受控开关，失败后关闭/重开仍可重试。
- 360×480 四种主题密度验证关闭及发送按钮在视口中，弹层不超出边界；实际查看深色舒适和浅色舒适截图 `.logs/chat-overlay-*-*.png`。
- 7 个 Story × 四种主题密度，28/28 通过，0 页面错误、0 axe 违规、0 横向溢出，`.logs/chat-overlay-audit.json`。

## 参考与差异

查看 Nuxt UI v4.11.1 ChatPalette 文档的 Within a Modal 深色示例（1100×760）：用户与助手消息直接排列在阅读区域，消息区与底部输入区按文档的组合结构分开。实际参考截图和页面查看记录位于 `.logs/chat-overlay-reference*.png`；该网页示例是内联展示，未据此声称已经验证其真实弹层焦点行为。

本地保持独立消息滚动区与底部 Composer。增加明确标题与关闭按钮，使用 Graphite 灰阶和中文文案；没有复制参考头像、绿色品牌色或 Vue 代码。当前提供对话弹层；命令与会话切换由后续 AI-PALETTE-01 实现。

示例没有模型服务。关闭保留挂载不等于持久化；宿主移除 ChatOverlay 后需自行保留消息和受控草稿。原生系统 IME 仍沿用 Composer 验收中的未验证边界。
参考页的 textarea 定位超时，未验证参考输入交互；视觉判断只使用已显示的消息区域和本地截图。
