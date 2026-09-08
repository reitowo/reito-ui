# VirtualConversation 验收（AI-VIRTUAL-01）

## 交付范围

公开 VirtualConversation，按宿主提供的稳定 key 渲染动态高度消息窗口。支持真实流式 StructuredMessage 文本更新、历史前插锚点、用户上滚暂停跟随、回到最新、关闭跟随、历史加载失败与重试，以及已有 DOM 的选区保留。宿主负责数据请求、会话切换和模型连接。

VirtualList 共享修复：测量更新不再在 React 生命周期嵌套 flushSync；初次末尾定位允许用户输入中断；密度锚点在异步测量稳定窗口内保留与校正。普通列表继续保留原有行边界。

## 证据

- 19 项交互/回归通过：12 项 VirtualConversation（含四主题密度窄屏、同页 Controls），7 项动态 VirtualList（含稳定 key、聚焦回收、前插/增长、密度锚点）。日志 `.logs/virtual-conversation-final-regression.log`。
- 6 个 Story × 4 个主题密度，共 24 组审计通过。无页面/控制台错误、WCAG 违规、横向溢出；报告 `.logs/virtual-conversation-audit-final.json`。
- 千条消息示例 DOM 行数低于 50；保留选区与焦点时允许额外行，非恒定硬上限。
- `npm run check` 与 `npm run build` 均通过；日志 `.logs/virtual-conversation-check-final.log`、`.logs/virtual-conversation-build-final.log`。构建保留现有 chunk 体积提示。

## 视觉检查与边界

已查看 `.logs/virtual-conversation/dark-compact.png` 与 `light-comfortable.png`（390px）。对照本任务用户提供的 Conversation 深色工作面：保留轻量角色文字、自然正文与无逐条卡片结构；新增历史与回到底部入口。浅色为同一 token 系统验证，未获得对应产品浅色像素参考。独立滚动示例并不证明完整 Cursor / Claude 页面像素相似。

不连接真实 AI/历史服务。浏览器选区仅涵盖已渲染 DOM，不能跨未渲染历史全文复制。切换整个会话时宿主应更换组件 key。
