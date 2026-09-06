# Claude Desktop：UI 证据与组件拆解

核查日期：2026-09-06。结论：本次取得官方界面文档、官方截图和 MCP Apps 样式契约；没有取得 Claude Desktop 完整 React 组件源码，也没有证据证明它的内部基础库是 shadcn、Radix 或 Base UI。

## 取得了什么

| 证据 | 本次核查结果 | 能说明什么 |
| --- | --- | --- |
| [官方 Desktop 导览](https://academy.claude.com/tutorials/navigating-the-claude-desktop-app) | 已读页面；本地已有的官方 Chat / Code 图像用于结构比较 | Chat / Cowork / Code 是不同工作面，不应把一张欢迎页当成整个 Desktop 规范 |
| [Claude Code Desktop 文档](https://code.claude.com/docs/en/desktop) | 下载公开 Markdown，检查 prompt、上下文、pane、diff 等段落 | 可以还原交互职责和状态，不能还原私有组件函数名或 React 技术栈 |
| [MCP Apps 设计规范](https://claude.com/docs/connectors/building/mcp-apps/design-guidelines) | 已读具体主题变量、字体、圆角表 | **官方内嵌应用样式契约**，不是整个 Desktop 的源码或完整 tokens 包 |
| [MCP Apps for Claude Figma kit](https://www.figma.com/community/file/1597641111449594397/mcp-apps-for-claude) | 链接由官方规范直接提供；抓取 Figma 内容失败 | 可作为后续设计参考入口；本次未读取其节点、变体或 Auto Layout，不声称完成 Figma 源文件审计 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | 检查公开根目录：文档、插件、examples、scripts 等 | 它不提供本次所需的 Desktop UI 源目录；不能把它称作完整桌面组件仓库 |
| 本机安装静态资源 | 常见用户安装目录、Program Files/Claude 与当前用户 Appx Claude 查询未命中 | 未取得可供版本固定的本机 Desktop 包；这不是“整台机器绝对没有安装”的证明 |
| 未登录 claude.ai 文档请求 | HTTP 403 | 没有取得可用产品 DOM/CSS；本次没有绕过或解析登录后的私有会话 |

公开文档缓存位于 `.logs/research/claude/`，没有把远端文档或私有资源放进组件分发包。

## 可以精确引用的样式值

以下仅属于 **MCP Apps host style variables**，用于说明 Claude 已公开的语义分层；不能把某个值直接标为 Desktop 侧栏或 composer 色值。

| 官方变量 | 浅色 | 深色 |
| --- | --- | --- |
| `color-background-primary` | `#FFFFFF` | `#30302E` |
| `color-background-secondary` | `#F5F4ED` | `#262624` |
| `color-background-tertiary` | `#FAF9F5` | `#141413` |
| `color-text-primary` | `#141413` | `#FAF9F5` |
| `color-text-secondary` | `#3D3D3A` | `#C2C0B6` |
| `color-border-tertiary` | `#1F1E1D` / 15% | `#DEDCD1` / 15% |

其正文尺度包含 12 / 14 / 16 / 20px，圆角尺度为 4 / 6 / 8 / 10 / 12px，常规边框变量是 0.5px。字体通过宿主变量提供。来源：[官方 Style variables](https://claude.com/docs/connectors/building/mcp-apps/design-guidelines#style-variables)。这些数值是参考证据，当前 Graphite tokens 没有因此被覆盖。

内嵌应用继承宿主主题，并利用容器尺寸与 safe area 布局；这套嵌入约束不应推广成独立桌面工作台的禁用菜单规则。[主题接入说明](https://claude.com/docs/connectors/building/mcp-apps/transparent-theming)

## 具体组件职责：已知行为与拟建接口分开

下列名字是我们拟建组件的名称，不是声称逆向恢复了 Anthropic 的内部符号。

| 拟建组件 | 已知行为 / 视觉证据 | 建议实现与必须区分的状态 |
| --- | --- | --- |
| `WorkspaceModeSwitch` | 官方导览的 Chat / Cowork / Code 入口 | ToggleGroup 或 Tabs；区分全局导航和页内 Tab，不只做三个装饰按钮 |
| `SessionSidebar` | Code 文档说明每个 session 有独立历史、目录与改动；侧栏支持并行 session | Sidebar + 可组合 SessionRow；selected / running / needs-attention / archived 是业务状态 |
| `Composer` | 官方图中输入、附件、模式、模型/发送被组织在同一工作区 | InputGroup 或编辑器适配层 + Toolbar；empty / composing / submitting / streaming / failed，各状态有明确动作 |
| `ContextAttachment` | Code 文档支持附件、拖放与文件上下文 | AttachmentChip / UploadQueue；上传中、失败、可移除；用文件对象状态而非一段装饰文本 |
| `PermissionModeSelector` | Code 文档将工作模式放在发送按钮附近，可在会话中切换 | Select 或 Dropdown；受控值与解释文案分离，UI 选择不能假装改变未接入的执行权限 |
| `ConversationStream` | 官方界面将正文与工具、附件、产物组织在内容流中 | Message / RichText / ToolCall / Attachment；滚动归属、跟随末尾、用户回看行为由 stream 管理 |
| `WorkspacePanes` | Code 文档明确支持 pane 拖放和边缘调整大小 | 简单二栏用 Resizable；需要任意停靠时单独评估 docking 库，shadcn 的 Resizable 不能代替整套工作区布局系统 |
| `DiffReviewPane` | Code 文档描述文件列表、逐行批注和提交反馈 | Diff engine + FileChangeList + CommentThread；CodeBlock 只能显示文本，不能充当 diff reviewer |
| `ArtifactPane` | Artifacts 官方说明支持独立内容、版本、复制和下载 | PaneHeader + Preview/Code tabs + VersionPicker；必须有实际预览与版本数据，避免只替换静态示例 |

行为依据：[Desktop 会话、输入与工作区](https://code.claude.com/docs/en/desktop)，[Artifacts](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)。实现建议属于本项目设计推导。

## 对这次组件库重建的价值

Claude 最值得借鉴的是内容与动作的关系、输入组件的状态模型，以及消息/工具/产物之间的职责边界。基础 Button、Menu、Dialog 应从维护良好的上游组件生成；这些上层 pattern 由自己的库实现。暖白主题可以作为独立候选进行视觉比较，不应把 Cursor 的紧凑侧栏和 Claude 的阅读区域混成一组无法解释来源的固定数值。

“精确逆向 Claude Desktop”的当前缺口是可固定版本的实际包或可检查的产品 DOM、完整交互状态，以及字体许可与跨平台渲染证据。本报告完成的是公开证据审计与组件职责还原；没有把截图推断冒充源码分析。
