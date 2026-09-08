# VirtualConversation

复用动态 VirtualList 渲染宿主消息数组，使用稳定 getKey 与 renderMessage 组合 Message / StructuredMessage。宿主负责历史请求、消息追加和 part 更新；组件不执行模型调用。

## 参数与行为

- items、getKey、renderMessage：数据、稳定标识与消息呈现。历史前插时保持原消息 key。
- follow：默认开启。用户上滚时暂停跟随，回到最新后恢复；关闭时追加保留当前阅读位置。
- overscan：窗口外预渲染行数。聚焦行与已选中文字涉及的行额外保留。
- hasEarlier、loadingEarlier、historyError、onLoadEarlier：历史加载状态与回调，组件阻止重复请求并呈现失败重试；错误不会替换已有内容。
- label、emptyMessage、viewportClassName：无障碍名称、空态和宿主视口布局。

选择保留只覆盖实际已渲染的浏览器 DOM，不支持跨未渲染的整段历史复制。宿主更换整个会话时应更换组件 key，重置滚动与请求状态。

## Storybook

Playground 可在同页调整 follow、overscan、failHistory。另有 StreamingParts、Empty、LoadingHistory、HistoryFailure、FollowDisabled。流式示例真实增加文本，不连接外部 AI。

## 当前验证

24 组 Story × 主题/密度审计通过；无页面错误、控制台错误、WCAG 违规或横向溢出。已检查深色紧凑与浅色舒适的 390px 截图：消息自然换行、轻量角色标识、焦点边界明确；保持用户提供的 Conversation 工作面中无逐条卡片的结构，新增独立历史入口与回到底部按钮。该示例为独立滚动窗口，尚不代表完整 Cursor / Claude 页面视觉相似性。

交互覆盖历史锚点、末条增高、流式 parts、暂停跟随、文本选区回收、空态、加载、失败重试、同页 Controls 与窄屏键盘。19 项联合回归、最新 check/build 均通过，详见 [验收报告](../validation-virtual-conversation.md)。

密度回归修正：在共享列表中保留密度锚点，并等待后续 ResizeObserver 测量批次稳定后释放；避免首帧对齐后继续漂移。专项及完整联合回归通过。
