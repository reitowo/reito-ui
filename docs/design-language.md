# Reito UI · Graphite / 石墨

Graphite 是面向个人桌面工具的原创设计语言：中性灰阶、紧凑控件、可读内容和安静的窗口结构。Cursor 提供任务、会话与审查工作区的主参考，Claude Desktop 提供输入区与阅读空间的参考，Multica 提供任务信息结构参考。这里的颜色、尺寸、字体栈和 API 由本项目定义，**不是三款产品的官方 tokens，也不是像素复刻**。已实际查看的官方图像、官网演示及各自的证据边界见 [references.md](references.md)。

0.4 的 Lab 是基础、复杂、AI 三层组件目录，当前提供 70 / 39 / 20 个组件族；Workbench 则将共享组件组合成 Agent、文件与差异、设置工作面。基础包含 50 个官方 shadcn / Base UI base-nova 生成族及 20 个本地组合族，复杂与 AI 在其上组合。组件库仍服务于设置、表格、表单、导航、弹层和其他桌面场景；例工程的结构不要求每个消费项目都变成聊天产品。

## 当前组合契约（0.6 候选）

[页面组合与默认主题](composition.md)定义应用与库的职责、默认尺寸和升级边界。
Dashboard 组件管理完整导航与滚动；Stack、Inline、Grid、Text、Heading、Page、Panel 支持无应用 CSS 的工作台组合。
默认 Button、Input、Select 使用相同高度与字号；Card、Panel、Empty 使用 surface 圆角。
下文历史测量保留其日期，当前默认值以 tokens.json 和上述契约为准。

## 先确认什么

先在例工程确认**工作场景与整体结构**：主任务是否清楚、阅读是否舒适、侧栏和工具栏是否安静、输入与辅助面板是否处于合理位置。涉及风格调整时，先实际查看同一工作场景的参考图，再比较颜色、边界、字重、节奏与布局；不能仅凭产品功能文案推断视觉。

随后在 Storybook 依次检查 **基础 → 复杂 → AI**，确认主题、密度、组件状态和组合行为，再回到例工程查看共享改动。全局问题应改 tokens、共享组件或布局原语，不应由某一个页面临时覆盖。

## 工作面的视觉结构

- **内容承担主视觉。** 会话与审查页围绕当前任务组织；正文直接进入可读的信息流，工具调用与产物按需要展开。避免把每段正文都包成卡片。
- **窗口结构安静。** 采用短标题栏和必要的工具栏。统计条、大型页面宣传标题、全大写 eyebrow、装饰性文件 Tab 不作为通用桌面身份；真实文件页和数据页面可以使用有功能的 tabs 或统计。
- **侧栏以行组织。** 导航或任务标题为主，状态、时间和分组名降低视觉权重，选中优先使用中性底色。品牌区、分组与底部工具不挤占任务列表。
- **输入区是会话里的主要柔和容器。** 多行输入、上下文、模式或模型选择和发送动作属于同一 composer；内部工具保持轻量。圆角的差异表达角色，普通行与面板不需要跟 composer 一样柔和。
- **上下文随工作出现。** 产物预览、diff 与检查器在需要时打开；关闭后把空间还给主任务。组件工作台的参数与确认工具服务于组件检查，不应永久附着在每个业务示例旁边。
- **布局服从用途。** 设置页保留清晰表单组，数据页使用表格与筛选，文档页保留阅读结构。复用的是灰阶、尺度、控件与层级，不是某一张聊天截图。
- **短信息默认同排。** 浮层列表中的名称、路径、状态与计数优先以紧凑单行呈现，只有长描述才显式使用多行。使用共享 [PopoverList](components/popover.md) 组合，避免消费页重复添加标题、分隔线和纵向内距。

## Token 来源与分层

组件源码的职责划分与可读性规则见 [组件源码组织](component-source-policy.md)：局部布局保留简短 utility，长样式按布局、状态和尺寸分组，整套文档排版放在作用域明确的组件 CSS 中；复杂 JSX 应展开，重复渲染按职责提取。token 化不要求把所有样式写成 JSX 字符串。

唯一源文件是 `packages/tokens/src/tokens.json`。`npm run tokens:build` 生成 `packages/tokens/dist/tokens.css`，不要手改生成文件。该 JSON 使用 DTCG 2025.10 的类型和值表达；`themes` 与 `density` 是项目自己的组织方式，不能称为 DTCG 官方主题标准。

1. **Primitive**：`palette` 存储原始色值；`foundation` 定义字体、间距、圆角、动效和布局尺寸。
2. **Semantic**：`themes.dark` / `themes.light` 将颜色映射到用途；`density` 提供控件尺寸、内容间距、单元格内距和会话空间。生成 `--rui-*` CSS 变量与 Tailwind `@theme` 桥接，两者共享同一数值来源。
3. **Component**：组件的 slot 和 variant 消费语义变量，例如按钮使用 `--rui-primary` 与 `--rui-on-primary`。`components` 提供 Button、Input、Menu、Card 的组件默认别名，引用共享语义角色；默认继承，确有角色差异时独立覆盖。`ReitoThemeProvider tokens` 支持运行时和局部微调，具体键与继承规则见 [组件 token](component-tokens.md)。

标准 Tailwind 的 spacing、字号、行高、字重、圆角、阴影与动画通过生成桥接消费同一份 token。`p-2`、`gap-3`、`text-sm` 不等于绕过 token：前提是对应尺度已经桥接。2026-10-09 起，`text-sm` 通过 `font-interface` 映射为 13px 界面字号，`text-base` 仍为 16px 阅读字号；`--rui-text-md` 保留 14px 的独立文字尺度。Input / Textarea 不再根据窄视口切换到 16px，嵌入组件预览和窄工作面使用同一界面字号。

容器查询尺寸在构建时从 `foundation.container-*` 解析为常量，避免 `@container (min-width: var(...))` 无效；改 token 后重建即可。只接收数字的弹层偏移与提示延迟使用生成的 `@reito/tokens/metrics`，以 16px 根字号换算 rem、以毫秒输出 duration。这些数字是构建期默认值，CSS 运行时覆盖不会改写 JS 数字；使用方仍可通过对应 props 覆盖。其他视觉角色保持运行时 CSS 变量。

`npm run check` 包含 `tokens:audit`，对基础原语、复杂、AI、Lab、Workbench 和 Storybook 的视觉源码检查原始颜色、任意尺寸、未定义 token 与缺失桥接。明确的示例画布、响应断点、局部层叠和 reduced-motion 技术值逐项登记在 [例外清单](design-token-policy.json)；比例、内容百分比、系统颜色和第三方锚点变量按用途保留。完整结果见 [全组件 Token 审计](token-audit.md)。

## 语义角色

| 角色 | CSS token | 使用边界 |
| --- | --- | --- |
| 画布 / 面板 / 悬浮层 | `--rui-bg` / `--rui-surface` / `--rui-elevated` | 以轻微明度变化和细线区分层级，避免每一段都变成独立卡片。 |
| 悬停 / 按下 | `--rui-hover` / `--rui-active` | 表示交互状态；不要代替业务成功或失败。 |
| 正文 / 次级 / 辅助文字 | `--rui-text` / `--rui-text-secondary` / `--rui-text-muted` | 辅助色仍承载可读信息；禁用态由组件规则处理。 |
| 分隔 / 强边界 | `--rui-border` / `--rui-border-strong` | 普通面板和控件默认使用柔和边界；只有需要额外识别的交互边缘才使用强边界，不把所有输入与按钮永久描成亮框。 |
| 主操作 | `--rui-primary` / `--rui-on-primary` | 中性色反转；一个操作组内主操作应明确且克制。 |
| 会话输入容器 | `--rui-composer-bg` / `--rui-radius-composer` | 统一输入、上下文与操作的视觉容器；不推广为所有内容卡片的默认样式。 |
| 强调 / 强调底 / 焦点 | `--rui-accent` / `--rui-accent-soft` / `--rui-focus` | 蓝色用于链接和确需强调的信息；普通导航选中优先使用中性状态底色。键盘焦点使用中性灰和独立focus-width，不采用左侧色条。 |
| 成功 / 警告 / 失败 | `--rui-success` / `--rui-warning` / `--rui-danger` | 配对使用对应 `-soft` 底色，并以文字或图标补充意义。 |

当前深色画布 / 侧栏面板 / 悬浮层分别为 `#141414` / `#181818` / `#181818`；浅色分别为 `#fafaf8` / `#f2f2f0` / `#ffffff`。composer 在两种主题下分别为 `#181818` 与 `#ffffff`。2026-10-09 调整减少深色容器之间的亮度跳变，浮层通过共享阴影和边界区分。组件和业务 CSS 应引用 token，不能将参考产品的取样值写入页面。

表单错误状态使用共享 `.rui-validation`：错误色沿控件内边缘向内淡出，普通边界保持柔和；组合输入由外层提供高亮，内部控制不叠加。blur、inset spread 和强度来自 token；键盘焦点继续独立显示中性细线。具体数值、参考与验证见 [内边缘错误渐变](validation-inset-glow.md)。

## 字体、密度与尺度

普通页面使用 Page 统一页头到内容的距离：紧凑 16px、舒适 20px、dense 12px，来自 section-gap。
标题与说明使用 compact-surface-gap；Tabs 导航到面板使用 content-gap。
这些间距各有一个所有者，页面不通过重复 margin 或指示线溢出来补齐。
line Tabs 是有完整底边的页面导航，标签保持自然宽度；default Tabs 保留分段控件外观。
两种样式的长标签在导航内部滚动，键盘聚焦和完整名称都保持可达。详情见[页面组合](composition.md)。

CSS 实际随附开源 Inter Variable 字体，UI 默认13px；Segoe UI 和中文系统字体补足字符覆盖。字体规则由公共包统一定义，Lab、Storybook 和消费工程不分别设置。代码使用 Cascadia Code、SFMono-Regular、Consolas 等等宽字体回退。

| 项目 | 当前 token 值 | 规则 |
| --- | --- | --- |
| 辅助文字 / 紧凑 UI / 常规 UI / 阅读正文 | 12 / 13 / 14 / 16 px | 数字按浏览器根字号 16 px 折算；不要为塞入文字继续缩小正文。 |
| 常规 / 中等 / 半粗字重 | 400 / 500 / 600 | 控件与正文优先 400，主要导航和标题按层级使用 500；600 用于需要明确强调的内容，避免每个标签都加粗。 |
| 紧凑：XS / SM / default / LG 控件 | 24 / 28 / 32 / 36 px | 默认 Button、Input、Select 共用同一控件尺度。 |
| 舒适：XS / SM / default / LG 控件 | 28 / 32 / 36 / 40 px | 比紧凑增加一级 4px，保留相同界面字号。 |
| 既有布局：紧凑 / 舒适行高角色 | 36 / 40 px | `--rui-row-height` 保留为布局角色；不是 DataTable 所有数据行的固定高度。 |
| 既有布局：紧凑 / 舒适面板内距 | 16 / 20 px | `--rui-panel-padding` 保留；通用组件内容区使用下表的 `--rui-content-padding`。 |
| 间距尺度 | 0、4、8、12、16、20、24、32、40、48、64 px | 使用 `--rui-space-*`；特殊布局尺寸先登记为共享 token。 |
| 小 / 中 / 大圆角 / composer | 6 / 8 / 12 / 14 px | 均为基准 `--rui-radius`（默认 4px）的 1.5 / 2 / 3 / 3.5 倍，改基准即整体缩放（见[主题说明](theme-guide.md#全局圆角---rui-radius)）。控件、容器与对话框使用稳定层级；composer 有独立角色，圆形状态元素可用 full。 |
| 边框 / 普通键盘焦点 / 强轮廓 | 1 / 1 / 2 px | 普通focus-width与outline-width分开；结构提示保留强轮廓角色；表单错误使用内边缘渐变。 |
| 快速 / 常规动效 | 120 / 180 ms | 既有过渡仍用这两个时长；只提示状态变化。 |
| 动效时长 / 较长动效 | 150 / 300 ms | `--rui-motion-duration` 与 `--rui-motion-duration-lg`。菜单等弹层进入和退出使用较短时长、`--rui-motion-easing` 和 `--rui-motion-popup-scale`（0.96）；按钮按下位移为 `--rui-motion-press-distance`（1px）。`prefers-reduced-motion` 把这两个时长设为 0ms，并把弹层缩放设为 1。 |

0.3 → 0.4 调整的是共享内容密度：正文区域、表格和 AI 组件通过同一组角色收紧空白，UI 字号与控件高度保持上述尺度。以下数值仍以 16px 根字号折算；不要把 rem 数值误作不可缩放的像素上限。

| 内容角色 | CSS token | compact | comfortable | dense |
| --- | --- | ---: | ---: | ---: |
| 通用内容内距 | `--rui-content-padding` | 12px | 16px | 8px |
| 紧凑面板左右内距 | `--rui-compact-surface-padding-x` | 12px | 16px | 8px |
| 紧凑面板上下内距 | `--rui-compact-surface-padding-y` | 8px | 10px | 4px |
| 紧凑面板相关文字间隔 | `--rui-compact-surface-gap` | 4px | 6px | 2px |
| 菜单条目左右内距 | `--rui-menu-item-padding-x` | 12px | 16px | 8px |
| 菜单条目上下内距 | `--rui-menu-item-padding-y` | 4px | 6px | 2px |
| 内容间距 | `--rui-content-gap` | 12px | 16px | 8px |
| 小内容间距 | `--rui-content-gap-sm` | 8px | 10px | 6px |
| 单元格横向内距 | `--rui-cell-padding-x` | 10px | 12px | 8px |
| 单元格纵向内距 | `--rui-cell-padding-y` | 6px | 8px | 2px |
| 表头纵向内距 | `--rui-table-head-padding-y` | 4px | 6px | 2px |
| 表头高度角色 | `--rui-table-head-height` | 36px | 40px | 24px |
| 消息间距 | `--rui-message-gap` | 16px | 20px | 8px |
| Composer 输入最小高度 | `--rui-composer-input-height` | 80px | 96px | 64px |
| 空态内距 | `--rui-empty-padding` | 24px | 32px | 16px |
| 预览内距 | `--rui-preview-padding` | 16px | 20px | 8px |

2026-10-11 舒适密度按桌面工作面收敛：控件比紧凑增加 4px，相关内容间距增加 2px，通用内容内距增加 4px；卡片区域保留 20 / 16px 横纵内距，字体与圆角不随密度放大。Lab 的密度选项并入共享主题菜单，首页、总览、详情和配色示例共用持久化选择；默认仍为紧凑。下文带日期的旧实测记录保留历史值，当前舒适契约以上表及 [舒适密度验证](validation-comfortable-density.md) 为准。

组件内容容器使用 `p-[var(--rui-content-padding)]`，相邻内容使用相应 gap 角色，表格使用 cell 角色。当前 Lab 示例中，compact 数据行由 46px 收至 34px，AI 内容内距由 16px 收至 12px；前者是该示例的观察值，长文本和高控件仍会增加实际行高。已有产物容器中的代码使用 `CodeBlock variant="embedded"`，让外层提供边界、代码区域负责文本内距，避免重复嵌套 padding。

对应视口、前后量度和截图见 [0.4 密度记录](density-v04.md)。

代码使用真实语法高亮：`CodeBlock` 根据 `language` 解析源码，`--rui-syntax-*` 为注释、关键字、字符串、数字、函数、类型、属性、运算符和标点提供独立的深浅主题颜色。语法色只用于代码内容，不推广为普通控件或导航色。正文、复制和换行保持源码；高亮颜色不能代替 diff 的增删语义。Artifact 代码视图复用同一 CodeBlock 和 token。

ContextPill 的普通、可移除和禁用变体共享 SM 最小高度（紧凑 28px / 舒适 36px），内部移除按钮使用 `icon-xs`（24px / 32px），不叠加纵向 padding。按钮通过标准尺寸参与密度切换，不能用局部 `h-*` 覆盖共享按钮高度。长名称可截断，但保留完整 title 和可达的移除按钮；尺寸修正的实际量度见 [ContextPill 验证](validation-context-pill.md)。

TaskQueue 采用共享对齐的图标、任务信息、状态、操作四列，标题与说明在同一主行，行内使用 cell 内距和 XS 按钮。说明与长标题可截断，保留完整文本和悬停提示；错误详情完整换行。根据队列自身宽度切换操作文字，窄面板使用带完整可访问名称与提示的图标按钮，不让操作掉到下一行。

DisclosureTree 使用 XS 最小行高（紧凑 24px / 舒适 32px），取消额外行间空白，文件名和辅助说明在同一行。目录树自身提供 4px 边缘空间，嵌入面板时不再叠加内容内距；长名称和说明截断显示，完整文字保留在可访问名称与 title 中。字号保持 14px，原生 details/summary 的 Tab、Enter、Space 行为不变。文件导航与预览组合默认采用 30% / 70% 分栏，让文件内容承担主视觉；通用 ResizableWorkspace 的默认比例保持其独立契约。

DiffViewer 的代码、行号和增删符号统一使用等宽字体及 `--rui-line-interface`（20px）行高，代码行不叠加数据表格的纵向 cell padding；两种密度保持相同源码行距，横向内距与工具栏继续跟随密度。换行后行号对齐首行；统一和并排布局使用 colgroup 固定行号、符号栏，让代码使用剩余宽度，避免并排换行时将六列均分。

OrganizationChart 使用 160px 紧凑节点、共享行高与内容间距，连接线只使用 `border-border`。宽层级在组件容器内横向滚动，不扩大页面；节点名称单行截断、说明最多两行，完整文本继续通过 `title` 和可访问名称提供。节点模板只能替换卡片内容，不能绕开统一焦点、选择与禁用状态。

TerminalPrompt 默认输出区高度为 `--rui-terminal-height`（256px），标题栏使用 SM、输入使用 XS 控件高度，命令与响应行使用 cell padding。命令、输出和提示符使用统一等宽字体；状态、错误、边界和焦点仍使用语义 token。长输出只在输出区滚动，底部提示符保持可见；消费应用需要更高面板时通过 `viewportClassName` 组合已有尺寸 token。

RichTextEditor 的正文直接构成编辑工作面，默认最小高度为 `--rui-editor-min-height`（224px）。正文使用界面小号字与宽松行高，标题只提高一到两级，段落/列表/引用/代码间距全部来自 content/space tokens；不套用面向博客的超大标题或固定像素 prose 规则。JSON、HTML、Markdown 共用同一 schema 文档树，格式标签只说明宿主序列化契约。编辑区使用弱边界，焦点和错误分别使用 ring/destructive 语义角色。

编辑器固定工具栏使用 XS 图标按钮、弱底色和单一底边界，保持一行并在窄面板内横向滚动。相邻能力用短分隔线分组，激活格式使用 secondary 语义面；禁用历史和链接动作保持可辨但降低强调。链接输入进入 Popover，不改变编辑器外框或把正文推成多层卡片。格式按钮必须从当前 Tiptap 选区计算状态，初始加载与宿主替换不写入用户撤销历史。

任务列表沿用正文的小号字、内容间距与原生复选框语义，不使用表格行高或额外卡片；嵌套层级只增加 token 缩进。段落对齐和 Emoji 与 marks、结构、历史使用同一行工具栏和同一文档事务。工具栏只展示可执行动作，格式保真度由宿主序列化格式决定：JSON 保存完整扩展属性，HTML 保存可表达的结构与样式，Markdown 对没有等价语法的属性允许有记录的损失。

编辑建议菜单沿用 Popover 的语义表面、容器宽度、阴影与 XS/SM 控件角色，不创建另一套命令面板样式。菜单锚定当前文字触发范围，编辑器继续持有焦点和键盘输入；活动项使用 accent 语义面，禁用项仍可读。`/` 只承担顶层行首结构转换，`@` 只承担空白边界后的 inline 提及；异步结果必须可取消并隔离旧查询，组合输入期间不执行选择。

块句柄占用正文左侧一个 XS 控件槽位，只在可编辑内容的块悬停范围出现；它不是常驻工具栏装饰。点击句柄或工具栏块入口打开同一紧凑菜单，移动、转换和删除都写入编辑器事务与历史。当前块使用焦点 ring 的语义角色标出，边界动作直接禁用。块菜单继续消费 control-height、space、container、border、muted、accent、destructive 与 ring tokens，不使用组件内固定颜色或独立密度数值。

编辑器媒体入口仍是一枚 XS 工具栏按钮。地址、替代文字、上传进度和失败恢复放在同一个紧凑 Popover 中；图片本身直接进入文档流，使用内容间距、弱边界和响应式最大宽度，不套独立卡片。宿主补全在正文底部附着一条弱底色审阅面，候选内容与接受/拒绝动作保持可见，加载、错误和重试不覆盖正文。所有 Story 中的上传与补全都明确标为本地模拟，组件不显示外部模型品牌或虚构在线状态。

主题与密度放在 `document.documentElement`，即 `<html data-theme="dark" data-density="compact">`。可选值分别为 `dark | light`、`compact | comfortable | dense`。默认是 dark + compact；dense 见下文“高密模式”。Base UI 弹层会 portal 到文档中，只给应用内部 div 换主题会使菜单、提示和对话框继承错误；不要补写弹层专用颜色来修复。

## 桌面布局与阅读空间

普通页面按 Shell、Page、Panel 的区域接口组合，Header／Content／Footer 带所属区域。
滚动、页面边缘、面板内距分别由 Shell.Content、Page inset、Panel.Content 持有；详细规则见 [页面组合](composition.md)。

密度是样式能力，不是默认产品功能。消费应用默认使用 compact，不应自动在标题栏、工具栏或设置页加入「紧凑 / 舒适」切换；只有用户明确要求时才提供入口。Lab 和 Storybook 为检查组件保留密度工具，Workbench 业务示例不默认展示该入口。两种密度的 token 支持和验证要求不变。

初始布局 token 为侧栏 224 px、检查器 272 px、阅读宽度 720 px、画布最大宽度 1480 px、标题栏 42 px、状态栏 28 px。它们是默认值，不是强迫所有页面保持多栏的最小宽度。

工作区区分导航、主任务、上下文三个职责，不要求三个面板同时常驻。窄屏和缩放时先折叠辅助面板，主内容保留可用宽度；每个滚动区域有明确归属。长文件名可省略显示但需要可取得完整名称；正文允许自然换行；代码或数据表需要横向滚动时，应局限在自身容器。

Conversation、WorkspacePane、ScrollArea、TabsContent 与 Table 的滚动容器使用同一rui-scroll-focus：鼠标阅读和选择文字不加焦点装饰，键盘聚焦使用1px中性内描边，不使用左侧色条；子按钮获得焦点时不连带点亮父面板。Table保留原生滚动停靠点，TabsContent保留Base UI面板语义。边线使用outline和负offset，不改变布局，不会被不透明表格内容遮住，滚动后仍对称可见。系统强制颜色模式使用Highlight内描边。

宿主的通用焦点后备规则应放在 `@layer base`，或明确排除已由共享组件管理焦点的元素。未分层的 `[tabindex]:focus-visible` 等规则会覆盖组件样式，让整块阅读面板重新出现外描边；不要以 `!important` 或移除键盘停靠点来对抗这种层叠冲突。

阅读页可以降低信息密度：使用 16 px 正文、稳定行高与受控阅读宽度。属性面板和表格仍可保持紧凑。页面可选择已有布局和语义角色，不能各自发明主题。

桌面对话的 `Message` 正文默认使用 `--rui-font-interface`（14px）与 24px 行高，用户、助手和系统消息共享这一尺度，角色标签为 12px。两种密度只调整消息间距与容器内距；独立长文阅读页仍可选择 16px 阅读字号。Lab 和 Workbench 通过共享 Message 保持一致，不在宿主中覆盖正文。

`MarkdownContent` 延续同一 14px / 24px 消息尺度，标题只提高一到两级，段落、列表、引用和任务项使用共享 space/content tokens。表格和代码块各自在局部容器滚动，不能扩大消息或页面；fenced code 直接复用单层 `CodeBlock` 外框，不能再叠加 Markdown `pre` 的边界和内距。Markdown 正文保持自然文档流，不为每个段落、列表或引用创建卡片。`RichMessage` 只把该文档流放入共享 `Message` 角色、流式状态和操作结构，工具与产物继续作为相邻组合节点。

流式 Markdown 继续渲染完整文档树，只对文本尾部未闭合的强调、行内代码、删除线、链接等做临时补全。已稳定的前置节点依靠追加式 source 和相同 `streamKey` 保持身份；开始新的生成或用非追加内容替换当前流时，宿主更换 `streamKey`。表格分隔行完成时允许尾部从段落变成 table，未闭合 fenced code 直接使用当前源码的 CodeBlock；这些局部变化不能引入第二层边界、页面横向溢出或复制合成的闭合标记。流式状态使用 `aria-busy` 和 Message 的“正在输出”文本，不用逐 token 的 live region 朗读。

结构化消息按稳定 part ID 组织正文、工具、来源、附件与产物。正文继续自然流动，工具与产物只使用自身已有表面，不给每个 part 再包一层卡片。`pending / streaming / complete / error` 是展示层统一状态；请求、工具执行、重试与持久化由宿主持有。错误保留已接收内容，未知类型使用轻量可读占位并允许宿主替换渲染器，不能把不透明 payload 直接显示给用户。Provider 专用类型先在应用适配层转换，不进入 Graphite 公共 API。

SplitButton 由共享 ButtonGroup、Button 与 DropdownMenu 组合。主操作和菜单触发器使用同一尺寸与外轮廓，只保留一条轻接缝；整组、两个按钮和单个条目的 disabled/loading 分别表达，不用局部高度或颜色修补。菜单 loading 时仍可打开查看状态，空菜单说明原因。标签、`aria-keyshortcuts` 与可见快捷键只描述宿主绑定，实际全局快捷键由应用处理；菜单继续使用 Base UI 的方向键、类型查找、Escape 与焦点恢复。

ConfirmPopover 使用 modal Popover 在局部触发器旁完成短确认。取消、Escape 与成功提交关闭后恢复触发器焦点；取消按钮先取得默认焦点。异步 pending 期间同时禁用确认与取消，并阻止重复提交和意外关闭；失败留在原位，通过 alert 说明并允许重试。宽度、内距、间隙、边界和动作尺寸来自 Graphite tokens；长条款或需要输入确认文字的流程继续使用 AlertDialog。

UserInfo 把 Avatar、名称、辅助说明、可读状态和独立宿主动作组织为一条紧凑静态行。名称与说明在窄处截断并保留完整 title，不通过缩小字号挤入；状态文字与语义色点同时出现。动作分别持有焦点、loading 与 disabled，整行不伪装成可点击容器，避免与内部按钮形成嵌套交互。行内距、间隙、头像和按钮尺寸随共享 density/control tokens 变化。

Banner 复用 Alert 的表面和 Button 动作，承载与当前工作直接相关的短通知。默认静态通知是带名称的 region；动态到达且需要播报时才选择 polite/status 或 assertive/alert。长内容换行，动作和关闭入口在窄处仍可达；不把 Banner 用作统计条或装饰性宣传横幅。

Toolbar 使用 XS/SM 控件、弱边界和单层背景组织短操作组。相关动作由 Separator 和可访问 group 名称分开；toggle 由受控 pressed 状态表达。窄工作面显式选择横向滚动或溢出菜单：关键动作可固定保留，低频动作进入菜单后仍可达，不能只用 CSS 隐藏。行内控件共享一个 Tab 停靠点，左右方向键与 Home/End 在可用动作间移动；菜单继续使用 Base UI 键盘与焦点恢复。动态状态由宿主提供 live region，Toolbar 尾部状态槽本身不擅自播报。

InlineEdit 只承载单个短文本或数字的显示与编辑事务。显示态是轻量按钮，编辑态使用共享 Field/Input 和 XS 保存/取消动作；同步或异步失败保留草稿，取消与成功保存把焦点还给入口。只读值直接显示，不伪装成可点击内容。自定义显示/编辑槽仍应保留组件提供的标签、错误、禁用和焦点属性；多字段与富文本继续使用专用表单或编辑器。

OverlayProvider 是声明式 Dialog、Sheet、AlertDialog 之上的可选命令式事务层。调用方获得稳定句柄和明确结果，不需要把临时浮层塞进业务全局状态；内容可更新、可打开子层，也可以批量关闭。栈中只有顶层进入可访问交互面，子层关闭后焦点回到父层入口；关闭父层会结束其上的子事务，Provider 卸载会结束全部等待。固定局部弹层仍直接组合基础组件，不要为每个 Dialog 都引入服务。

Workspace 布局偏好把 Sidebar 展开状态和分栏百分比保存在同一个版本化记录中。受控分栏只把指针或键盘产生的最终比例交给宿主保存；首次挂载、外部同步和容器缩放不能覆盖用户偏好。未知版本、损坏记录、违反最小栏宽的尺寸和不可用存储都回到明确默认值。若 `useResizableWorkspaceState` 统一持久化，应关闭 Sidebar 自带的 Cookie 写入，避免两个来源竞争。

三槽工作区预设让主工作面始终拥有剩余空间，导航与检查器使用共享宽度 token。宽容器可独立开关辅助面板；窄容器只显示一个活动槽位，并在同一短工具栏中提供可达切换。每个槽位只拥有一个滚动区域，标题和状态底栏不随内容滚动。预设层只管理槽位、显隐和窄屏选择；可调整比例仍由 `ResizableWorkspace` 负责，两个持久化记录不混用。

应用搜索使用紧凑、单层的 Command Dialog：当前工作范围位于输入和结果之前，结果按文件、任务、动作等宿主资源分组，行尾只放简短动作或快捷键提示。查询、异步数据源和命令副作用由宿主注入；组件负责加载、空、失败、重试和动作 pending 的一致反馈。全局快捷键必须忽略中文 IME 组合输入，关闭或执行成功后将焦点还给触发位置。

文档导航让目录保持轻量层级列表，正文占据主工作面并拥有唯一滚动区域。目录选择、正文滚动和宿主路由共享稳定章节 ID；程序化定位期间不能让经过的中间章节覆盖目标值，滚动到底时最后一章应成为当前位置。目录中的长标题可截断，正文标题自然换行；当前项使用轻量选中面，正文只用一条语义强调边标出当前章节，不把每章包成卡片。宽布局允许收起目录，窄布局在目录与正文之间切换。

Dashboard 工作面用现有布局和业务组件表达应用结构：轻量 Sidebar 承载主要页面，短标题栏保留搜索与当前动作，DataTable 或表单占据主工作面，检查器按需打开。宽布局允许主任务与检查器并列，窄布局只显示一个活动面板；移动导航选择完成后应关闭覆盖层。应用配方的间距、行高、边界与焦点继续来自共享 tokens，不以页面局部值修补密度。

Content 工作面把文档集合、页内目录和阅读正文分成明确层级。索引选择稳定文档 ID，目录选择稳定章节 ID，应用搜索和上一篇/下一篇复用同一受控状态；索引失败不能遮住已经打开的正文，正文失败也不能清除当前文档。宽屏可以同时显示集合、目录与正文，窄屏分两步切换集合/阅读和目录/正文。相邻文档使用轻量底栏，正文保持自然文档流与受控阅读宽度。

组件组合表达结构：WorkspacePane 提供 title / actions / children；Dialog 使用 DialogContent / DialogTitle / DialogDescription 等子组件。先查实际类型；不要假设每个组件都有通用 `header`、`size` 或 `tone` 属性。

### 紧凑确认与全组件总览（2026-10-09）

Button 使用 6px 共享控件圆角、400 字重；XS 为 13px，高度仍随密度为 24 / 32px。`variant="accent"` 使用独立的 `action-accent / on-action-accent` token；默认主要操作继续为中性色反转。强调按钮的前景/背景组合纳入设计对比度检查。

`DialogContent variant="compact"` 为短确认面板提供 8px 圆角、零外层内距、共享阴影和 container-lg 最大宽度；标题继承 13px 半粗文字。其内部 DialogHeader 自动消费 `compact-surface-padding-x/y`，`DialogFooter variant="compact"` 消费相同内距并提供同排、可换行的操作区。独立紧凑面板也可显式使用 `DialogHeader variant="compact"`。默认表单 Dialog 的布局保持原有 API。

`compact-surface-padding-x/y` 是可跨组件复用的语义角色，用于短确认、紧凑面板的标题、正文和动作行；不替代通用长表单的 `content-padding`，也不叠加在已有内距的嵌套容器上。其他组件可写 `px-[var(--rui-compact-surface-padding-x)] py-[var(--rui-compact-surface-padding-y)]`，或普通 CSS 的 `padding: var(--rui-compact-surface-padding-y) var(--rui-compact-surface-padding-x)`。修改 tokens.json 的这两个角色后重建，消费者一起变化。

2026-10-10 后续反馈明确面板左右内距应比上下大：当前 compact 为 12 / 8px，comfortable 为 16 / 12px（横 / 纵），替代此前四边等值的试调。标题与说明、相关短段落使用 `compact-surface-gap`（4 / 8px），标题和正文共用 `line-interface`（20px）；紧凑 DialogTitle 不再使用 `leading-none`。ScrollTop 的本地文档示例采用同样的内距和间隔，移除段落 `py-2` 的叠加空白。原始长文仍由阅读布局选择更松的段落节奏，不将短确认的文字间距强制用于所有文档。

Lab 的 `/overview` 集中展示完整 catalog，搜索、按层筛选与侧栏锚点均使用相同目录。每个预览直接渲染已有 Demo，不启动 iframe，不按模块显示加载遮罩；React 生成的 ID 和各组件自己的 provider 隔离本地状态，portal 在总览文档中按实际触发器打开。主题/密度在根 html 更新；筛选移除或显式重置才初始化示例。它用于快速视觉比较，全部 props 和状态仍在 Storybook 检查。记录见 [全组件总览](overview.md)。

## 状态与可操作性

对适用组件展示默认、hover、focus-visible、active、disabled、loading、invalid、empty 等状态。只有真实具备某状态的组件才建立该 story，避免为静态分隔线制造无意义的 loading。

Storybook 以“参数调试”Playground 为组件主入口：在同一个 Canvas 的 Controls 中实时调整 props，无需切换 Story。显式声明枚举选项、布尔开关、文本和数值控件；render 必须消费 args，受控状态通过 useArgs 同步，不能只修改 defaultValue 却不响应后续参数变化。颜色和尺寸使用组件实际提供的 variant / size 等语义 API，不为没有相应 API 的组件发明 color 或 size。组合示例参数与公共 props 分组说明，回调及不可编辑的 ReactNode 不伪装成可用控件。

既有独立变体作为预设保留，便于分享和覆盖测试；“总览对比”和“交互场景”另列。Playground 排在组件第一项，Lab 的 Storybook 深链优先指向它。主题与密度继续由全局工具栏调整。

Docs 聚焦默认示例、说明与 API，不自动把所有变体再次挂载到同一文档。默认打开的弹层以及完整侧栏放在独立 iframe 中，预览高度使用 container-lg token，避免遮住文档或出现多个焦点锁。各变体的独立 Canvas 仍保留完整交互。

- 图标按钮必须有可读名称；Tooltip 补充说明，不能替代 `aria-label`。
- 表单用标签和明确错误信息。状态不能只靠红绿颜色表达。
- 菜单、选择器、Tabs 和对话框保留 Base UI 的键盘与焦点语义；对话框关闭后恢复合理焦点。
- 中文输入法组合期间 Enter 不发送消息、不执行命令；Composer 中 Shift+Enter 换行。
- loading 期间阻止重复提交；空态写清原因与可行下一步。演示数据标明为本地示例，不模拟已接通外部 AI。
- reduced-motion 下不保留不必要的旋转和位移动画；长内容与缩放不能把唯一操作入口裁掉。

当前组件内部分内置文案为英文；中文业务内容可用于验证，但不应据此声称组件库已实现完整国际化。

## 交付检查门槛

以下是验收目标，不代表已经通过。构建、交互和自动无障碍检查证明的内容各不相同，均不能单独证明“看起来像参考产品”：

1. Token 校验、类型检查和生产构建退出码为 0；改变 token 后生成文件无漂移。
2. 每个新增公共组件至少一个可发现的 story；适用状态有明确示例。注册对应 catalog 后运行 `npm run catalog:build`，由 `catalog:check` 检查生成目录、计数和 Storybook 深链的一致性。
3. dark/light × compact/comfortable 共四种组合检查，弹层也继承正确主题。
4. 在 1280 × 800 和 960 × 720，以及浏览器 200% 缩放检查受影响页面；无意外页面级水平溢出、关键文本或操作丢失。
5. 新增交互有键盘验证；会话输入补充真实中文 IME 检查；对话框验证 Escape 与关闭后的焦点。
6. 受影响 story 的自动无障碍检查无未处理违规；人工检查正文和控件对比度、焦点、缩放与动态状态。自动检查不等于完整无障碍认证。
7. 例工程直接消费同一包，无组件复制或局部主题补丁；报告实际执行的命令与检查，未执行项明确保留。
8. 视觉变更至少比较一次所选工作场景的完整页面与已查看参考，记录参考 URL、截图或官网演示的类别、检查主题与视口，以及结构、灰阶、边界、字重、输入区和阅读空间仍有的差异。参考有意不采用的品牌资产或布局也需说明；不可把测试通过计数当作视觉相似度。

执行与跨项目复用见 [reuse-guide.md](reuse-guide.md)。

### Composer 结构化输入

Composer 在原生 textarea 上维护文字与提及区间，复用 ContextPill 展示引用，候选列表与发送操作属于同一输入容器。上下键保持输入焦点并滚动活动候选；Enter 优先选择候选，Shift+Enter 换行。`draft/onDraftChange` 和 `onSubmitDraft` 提供结构化契约；字符串调用继续兼容。宿主负责命令执行、上下文解析与请求，见 [Composer 使用说明](components/composer.md)。

## 面板比例、菜单行与操作圆角（2026-10-10）

面板左右内距应大于上下内距。紧凑面板角色为 compact 12 / 8 px、comfortable 16 / 12 px（横 / 纵）。Alert、Card 的内容边缘、Popover / HoverCard、紧凑 Dialog 与文档面板复用此角色；不能把横纵数值相等当成统一视觉。

ContextMenu、DropdownMenu、Menubar 的条目使用 menu-item-padding-x/y：compact 12 / 4 px、comfortable 16 / 6 px。菜单外壳仍有 4 px 边缘，普通文字距离外壳左边为 16 / 20 px；带选择指示或 inset 的条目保留额外对齐空间。

Button、Toggle、输入框附属按钮以及按钮组外端统一使用 radius-control（默认 radius-sm，6 px），与尺寸、变体、禁用或加载状态无关。Input、Textarea、NativeSelect、NumberField、InputGroup、InputOTP 与多选 Combobox 的字段外框使用同一 input radius；字段内的 chip 取 input radius − space-1 保持同心。相邻组合的内部接缝保留 0 圆角；圆形专用动作和容器仍使用各自角色。

ScrollArea 默认不添加内容内距。variant="inset" 将组件 padding-x/y 放在 Root 和 Viewport 之间：横向继承紧凑面板尺度（12 / 16px），纵向采用 space-1（4px）的薄边缘。滚动到中部或末尾后仍保留顶部 / 底部边缘。文件列表 Demo 默认使用 inset，行内不重复横向 padding；纵向使用共享 Menu 条目尺度（4 / 8px），单行高度为28 / 36px，避免滚动容器内距与表格 cell padding 叠加。Storybook 可调 variant、方向和数量。实测见 [滚动列表内距验证](validation-scroll-area-insets.md)。

## 默认按钮与 Card 区域（2026-10-10）

Button 不传 size 或指定 size="default" 时使用 button-height，compact / comfortable 为28 / 36px。默认图标按钮 size="icon" 也使用该角色。XS 保留24 / 32px；sm 为28 / 36px，新增 md 为原默认的32 / 40px，lg 为36 / 44px；图标尺寸有同样的显式选择。默认按钮字号使用 action-font-size（14px），XS 文字保留 font-interface（13px），圆角使用 radius-sm；输入框的 control-height 继续32 / 40px，不随按钮默认值改变。

Card 是 React 组合组件，Header / Content / Footer 是独立区域；data-slot 只是标记和样式钩子。Root 负责上下边缘和区域间距，Header / Content 负责横向内距，Footer 负责横纵内距和分隔。区域之间使用 content-gap-sm（8 / 12px），左右使用 compact-surface-padding-x（12 / 16px），边缘纵向使用 compact-surface-padding-y（8 / 12px）。标题 / 说明的局部间距独立保持4px，不将全部区域间距叠进每个子组件。

## 同排操作与内分隔（2026-10-10）

紧凑卡片外层纵向padding和内部操作区分隔后的纵向padding使用同一compact-surface-padding-y；不要以content-gap-sm替代边缘内距。AgentTaskCard、确认浮层等内分隔可以保留横向缩进，但分隔线上方内容gap与分隔线下方操作padding各有角色。

默认Toggle、Tabs触发器、Menubar触发器和普通Button共享button-height；带框Tabs外层另加control-inset，line变体直接使用动作高度。Button icon-sm内图标与SM文字按钮一致。SelectTrigger 的 xs/sm/default 使用对应控件尺度，默认与 Button、Input 对齐。Table展开器在两种密度使用相应XS动作高度。

全目录记录与专用尺寸例外见 [边距与操作审计](validation-surfaces-and-actions.md)。

## 树行焦点（2026-10-10）

TreeView 的键盘焦点只作用于当前 treeitem 的直接 tree-item-row；不要用父节点 group-focus 给所有后代行施加样式。普通选中为中性背景；键盘当前行采用hover语义轻底和focus-width宽的中性细内描边（focus，默认映射text-muted），不使用左侧条或蓝色焦点圈，鼠标点击没有焦点外圈。父目录、子项、禁用行不会因祖先聚焦而连带高亮。

DisclosureTree 使用同样的键盘焦点样式，保留原生summary的展开和Tab顺序。强制颜色模式用系统Highlight内描边替代可能消失的阴影，仍只标记当前行。验证见 [树行焦点修复](validation-tree-focus.md)。

## 全库中性焦点（2026-10-10）

普通控件的focus颜色在tokens.json映射到对应主题的text-muted；focus-width独立定义为1px。Button/Input/Select、复合输入、Toggle、菜单、Sidebar、滚动面板等消费同一角色。错误aria-invalid、拖放目标和结构边界保留outline-width角色，不因焦点收细而被削弱。组织图采用直接子节点的键盘样式，避免父级group-focus影响后代。ContentNavigation当前章节以轻灰背景表达，取消左边条。详见 [中性焦点规则](validation-neutral-focus.md)。

## 交互状态的尺寸稳定性

同一控件的未选、已选、悬停、加载和短反馈状态共享高度、圆角与图标尺度。可清除控件在没有值时禁用清除按钮，避免按钮出现或消失改变行高；操作行至少容纳共享 XS 控件。清除后将键盘焦点移回仍可用的输入或选择项。

复制成功等短反馈在已有操作行或预留的一行状态区显示。按钮的成功文字占用稳定的文字槽；异步保存通过同尺寸图标和可访问名称表示忙碌，避免把取消操作挤走。多选标签的高度计算包含边框和纵向内距，单行有值和空值应同高。Calendar 默认六周，切月不改变日期面板高度；需要按月份内容收缩的应用可显式设置 fixedWeeks=false。

展开正文、进入编辑器、增删条目或显示需要完整阅读的校验错误可以增加内容高度，不能为追求不变高度截断信息。检查同一个 DOM 控件的尺寸，避免把移除后的另一个控件误当成原控件比较。执行范围、各组件记录及实际验证结果见 [交互尺寸复查](validation-state-stability.md)。

## 卡片区域的完整内距（2026-10-10 后续修正）

任务提案参考和 ToolCall 标注说明此前 root padding + gap + 局部 footer padding 的组合不够稳定。普通卡片与多区任务卡使用 card-padding-x/y：compact 16 / 12px，comfortable 20 / 16px；相关标题、说明和正文使用 card-text-gap：8 / 12px。短确认、菜单、Alert 等继续使用其各自角色，不用更宽的任务卡内距挤大所有控件。

Card Root 不再承担区域 gap 或上下 padding，Header、Content、Footer 各自负责横纵内距。相邻 Header 没有 border-b 时，标题与正文属于一个连续内容区：Header 不重复底部 padding，Content 顶部使用 card-text-gap；有分隔线时保留两侧完整区域 padding。正文底部至页脚分隔线、分隔线至按钮、按钮至底边都有相同纵向内距，分隔线贯穿卡片而非缩进。

AgentTaskCard 直接组合同一个 Card：状态和上下文在 Header，标题和说明在 Content，操作在 Footer。ToolCall card 使用相同卡片区域 tokens；裸字符串或自定义 children 被包进独立 content 区域，重试始终进入单独 actions 区域，不能让 inline-flex 按钮参与正文的匿名行盒。inline 变体保持轻量，并同样将内容和重试动作分开。

本段替代上文旧 Card root/gap 以及 AgentTaskCard 内缩分隔的描述。实际几何和参考比较见 [卡片区域留白验证](validation-card-regions.md)。

## 选择列表中的短说明（2026-10-10）

Listbox 默认 descriptionLayout="inline"，名称与短说明在同一行，说明使用次级字号和颜色，间隔来自 content-gap。非虚拟列表在确实放不下长内容时自然换行，不能截掉完整说明；明确需要富描述的场景可设 descriptionLayout="stacked"。虚拟列表保持固定估算行高并截断长内容，完整 label/description 仍保留在 DOM 的可访问名称中；切换布局时用同一排版探针重新测量，不能继续使用旧双行尺寸。

列表行使用 menu-item-padding-x 和 cell-padding-y（compact 12 / 6px，comfortable 16 / 10px），正常单行对应 control-height（32 / 40px）。分组标题与选项文字共享横向起点，不套卡片区域的 padding，也不增加区域分隔线。

Transfer 复用这套 Listbox，公开相同 descriptionLayout；左右标题、搜索与列表顶部对齐，中间移动按钮自身居中，避免因两侧内容数量不同而把整侧标题推到中部。验证见 [选择列表同排与留白](validation-listbox-insets.md)。

选项图标沿用 ListboxOption.icon，TransferItem 直接继承。一个列表的选项集合中有任意图标时保留统一的 space-4 图标列；无图标项保留空列，全无图标时省略。图标使用次级语义色、space-2 文本间隔和 aria-hidden，不改变 option 的可访问名称与 control-height。图标随稳定 value 对应的选项数据转移，不在消费页添加单独图标覆盖。

## 弹出选项的小幅放大（2026-10-10，历史试调）

根据 AsyncCombobox 标注，先试调展开选项的阅读尺度。输入框和普通动作仍使用原有 13px 字号及各自高度；Select、Combobox（含异步和多选组合）、DropdownMenu、ContextMenu、Menubar 的可操作条目主文字使用 menu-font-size（引用 text-md，14px），line-interface 对应的 20px 行高，上下内距 menu-item-padding-y 改为 6/8px，横向继续 12/16px。次级描述和组标签保持 12px；不把辅助说明同样放大。

普通单行展开项在紧凑模式由 28px 增为 32px；AsyncCombobox 双行项从 44px 增为 48px。Select 的旧 SM 最小高度继续提供下限，舒适模式普通选项维持 36px。菜单触发按钮、Tabs、输入字段及静态列表不消费 menu-font-size，因此不随这次试调改变。

此处替代此前菜单纵向 4/6px 的历史试调值；运行时可通过共享 token 继续调节。实际对比和检查记录见 validation-popup-density.md。

SettingsRow 的标签与辅助说明间隔在 2026-10-10 的后续文字反馈中由 space-1（4px）收至半个 spacing 单位（mt-0.5，2px），共用生成的 Tailwind 间距桥接。该调整只收紧设置行内相关文字；保留原有字号、行高、行内距及控件尺寸，所有 SettingsRow 消费者共同生效。

该文字间距试调的 dark/compact 实测：云端同步行说明 margin-top=2px，行高53.5px（旧值55.5px）；截图 .logs/settings-text-gap-dark-compact.png。settings-composition 五项回归通过，包含深浅主题 / 两种密度、标签关联、键盘、取消、保存以及加载重试。完整构建通过，最终 check 结果记录于执行日志 .logs/settings-text-gap-check.log。

## 可选动态配色（当前工作区）

Graphite / 灰白仍是库默认。消费工程可以用 ReitoThemeProvider 的 colors.primary 与 colors.neutral 选择品牌主色和命名工作面色系，Button 等基础控件可单独指定 color。颜色与 variant、尺寸、密度独立；普通导航和键盘焦点继续使用中性规则，不因品牌色增加左侧选中条。作用域、浮层继承、支持的基础组件与当前边界见 [theme-guide.md](theme-guide.md)。新增色阶及语义映射同样来自 tokens.json，运行时数据由 tokens:build 生成。

默认动作、Tabs、Toggle 和选择器触发器共享 action-font-size（14px）。默认按钮的 button-padding-x 在 compact / comfortable 为10 / 14px。主题说明页的按钮和选择器偏小反馈曾使菜单上下内距试调为8 / 10px，单行项达到36 / 40px；该菜单值已由下文的紧凑菜单修正替代，输入框继续使用其独立字段尺度。

主题菜单的后续实测发现，18 项颜色列表放大了上述纵向空白问题。菜单主文字改为 menu-font-size 引用 font-interface（13px），保留20px行高；menu-item-padding-y 在 compact / comfortable 为4 / 8px，单行菜单项为28 / 36px，横向仍为12 / 16px。下拉、右键、Menubar、Select 和 Combobox 继续消费同一组角色，不添加 Lab 专用密度覆盖。参考为用户提供的本库深色主题选单截图；实测与交互结果见 [菜单紧凑密度验证](validation-menu-density.md)。

默认 DialogFooter 与 AlertDialogFooter 使用共享 action-footer-padding-y：compact 12px、comfortable 16px，横向内距16px。默认动作区不再四边都用16px；紧凑确认变体继续消费 compact-surface-padding-x/y。新角色引用对应 card-padding-y 的密度值，由 token 源统一生成，供同类操作区复用。

## 高密模式与菜单几何（2026-10-21）

`data-density="dense"` 是 compact、comfortable 之外的第三种密度，面向事件轨迹、日志、检查器和数据表等开发工具工作面。它与另外两种密度一样只是样式能力：消费应用需要时在根节点或局部 `ReitoThemeProvider density="dense"` 上固定选择，不默认增加切换入口。参考为用户提供的深色开发工具轨迹面板截图（见 [references.md](references.md)），数值为本项目的原创取值。

为让文字随密度变化，`font-interface`、`font-caption`、`line-interface`、`line-caption` 与 `action-font-size` 从 `foundation` 移入 `density` 的三种模式；CSS 变量名不变，`text-sm` / `text-xs` 桥接继续引用它们。新增 `text-2xs`（`font-micro` / `line-micro`）用于标签与计数。

| 角色 | compact | comfortable | dense |
| --- | ---: | ---: | ---: |
| 界面字号 / 行高（`text-sm`） | 13 / 20px | 13 / 20px | 12 / 16px |
| 辅助、等宽字号 / 行高（`text-xs`） | 12 / 16px | 12 / 16px | 11 / 14px |
| 微型字号 / 行高（`text-2xs`） | 11 / 14px | 11 / 14px | 10 / 12px |
| 动作字号 `action-font-size` | 14px | 14px | 12px |
| 控件 XS / SM / default / LG | 24 / 28 / 32 / 36px | 28 / 32 / 36 / 40px | 18 / 20 / 24 / 28px |
| 图标 `icon-size` | 16px | 16px | 12px |
| 卡片内距（横 / 纵）`card-padding-x/y` | 16 / 12px | 20 / 16px | 8 / 4px |
| 卡片圆角 `card-radius` | 14px | 14px | 6px |
| 徽标高度 `badge-height` | 20px | 20px | 16px |
| 开关轨道高 / 宽 | 18.4 / 32px | 22 / 40px | 16 / 28px |
| 小开关轨道高 / 宽 | 14 / 24px | 18 / 32px | 12 / 20px |
| 开关滑块 / 小滑块 | 16 / 12px | 18 / 14px | 12 / 10px |

开关轨道、宽度和滑块随密度覆盖，compact 与原先 foundation 尺寸一致。画廊顶栏高度取 `control-height-lg`，分栏标题最小高度取 `control-height` 加 `space-2`；高密下仍是 28px 与 32px，紧凑和舒适会随控件一起长高。

dense 下的卡片使用 1px 低对比边界、无阴影；卡片内的源码与结果行放在新的语义面 `sunken`（各中性色系同步提供）：深色为 `#0f0f0f`，比卡片更深；浅色取画布色 `#fafaf8`，与偏灰的卡片形成内嵌对比，同时让默认 green / amber 状态文字保持 4.5:1 以上（更深的 `#ececea` 实测仅 4.18:1）。结果文字使用 success 等宽字，错误只使用 destructive 边界与文字，不铺红色底。数值以外的离散调整使用 `dense:` 变体（`@scope` 到最近的非 dense 密度为止），例如 CardTitle 与 CodeBlock 行高。

组件支持：`ToolCall variant="trace"` 为一行事件卡（时间、类型、标题、右对齐耗时与 XS 标签；可折叠的首行源码预览与行数；截断结果行；完整错误行）；`CodeBlock variant="inline"` 去掉工具栏，以 sunken 单层承载代码；`Badge size="xs"`、`Toggle/ToggleGroup size="xs"`；`CollapsibleTrigger variant="row"` 为整行展开触发器；Card 与 Conversation 的间距、圆角直接消费密度 token。新增 `MiniTimeline`（按通道排列的小刻度事件总览，一个 Tab 停靠点）、`SectionLabel`（如 “TURN 1” 的轻量分组标签）和 `JumpToLatest`（浮动“回到最新”胶囊，Conversation 复用）。

菜单按 Base UI v1.9 的圆角演示收敛为同心几何：弹层 `popup-radius` 8px、`popup-padding` 4px，高亮条目 `item-radius` 4px（= 8 − 4），图标间隔 `item-gap` 8px，分隔线 `separator-inset` 4px 内缩、上下 `separator-margin-y` 4px。条目横向内距改由 `components.menu.item-padding-x` → `density.*.popup-item-padding-x`（compact / comfortable / dense 为 8 / 10 / 6px），因此文字距弹层边缘为 12 / 14 / 10px；inset 条目与勾选指示器列使用 `inset-padding-x = item-padding-x + icon-size + item-gap`。高密行高仍是 `control-height-sm`（20px）。这次没有改弹层或条目内距。DropdownMenu、ContextMenu、Menubar、Select、Combobox 与 Command 共用这组 token；`density.*.menu-item-padding-x` 保留给 Listbox、ScrollArea 等非弹层列表。本段替代上文“菜单条目使用 menu-item-padding-x 12 / 16px”的弹层描述。Menubar 外框使用 popup-radius，触发器仍按 Button 规则使用 radius-sm。

按钮、菜单条目和输入框的休息、悬停、按下、禁用，以及输入框的无效和只读，改由组件状态 token 表达，例如 `--rui-component-button-primary-bg-rest`。这些颜色引用主题角色（或随主题变化的 `color-mix`），所以换主题后侧栏和弹层会一起更新。密度仍然只改变尺寸和字号，不改变这组颜色。禁用继续乘以共享的 `--rui-opacity-disabled`；只读输入保持不透明，只用底色和休息态分开。

实际量度、截图和检查记录见 [高密模式验证](validation-dense-density.md)。
