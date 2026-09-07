# Reito UI · Graphite / 石墨

Graphite 是面向个人桌面工具的原创设计语言：中性灰阶、紧凑控件、可读内容和安静的窗口结构。Cursor 提供任务、会话与审查工作区的主参考，Claude Desktop 提供输入区与阅读空间的参考，Multica 提供任务信息结构参考。这里的颜色、尺寸、字体栈和 API 由本项目定义，**不是三款产品的官方 tokens，也不是像素复刻**。已实际查看的官方图像、官网演示及各自的证据边界见 [references.md](references.md)。

0.4 的 Lab 是基础、复杂、AI 三层组件目录，当前提供 67 / 29 / 19 个组件族；Workbench 则将共享组件组合成 Agent、文件与差异、设置工作面。基础包含 50 个官方 shadcn / Base UI base-nova 生成族及 17 个本地组合族，复杂与 AI 在其上组合。组件库仍服务于设置、表格、表单、导航、弹层和其他桌面场景；例工程的结构不要求每个消费项目都变成聊天产品。

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

## Token 来源与分层

唯一源文件是 `packages/tokens/src/tokens.json`。`npm run tokens:build` 生成 `packages/tokens/dist/tokens.css`，不要手改生成文件。该 JSON 使用 DTCG 2025.10 的类型和值表达；`themes` 与 `density` 是项目自己的组织方式，不能称为 DTCG 官方主题标准。

1. **Primitive**：`palette` 存储原始色值；`foundation` 定义字体、间距、圆角、动效和布局尺寸。
2. **Semantic**：`themes.dark` / `themes.light` 将颜色映射到用途；`density` 提供控件尺寸、内容间距、单元格内距和会话空间。生成 `--rui-*` CSS 变量与 Tailwind `@theme` 桥接，两者共享同一数值来源。
3. **Component**：组件的 slot 和 variant 消费语义变量，例如按钮使用 `--rui-primary` 与 `--rui-on-primary`。当前没有独立的 component-token JSON 层；仅当多个组件确实需要独立调节同一角色时，再添加受管理的别名。

标准 Tailwind 的 spacing、字号、行高、字重、圆角、阴影与动画通过生成桥接消费同一份 token。`p-2`、`gap-3`、`text-sm` 不等于绕过 token：前提是对应尺度已经桥接。`text-sm` 继续表示 14px 界面字号，`text-base` 表示 16px 阅读字号；已有 `--rui-text-sm` 是 13px 的小控件角色，两者名称不同，不能直接互换。

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
| 强调 / 强调底 / 焦点 | `--rui-accent` / `--rui-accent-soft` / `--rui-focus` | 蓝色限于焦点、链接和确需强调的信息；普通导航选中优先使用中性状态底色。焦点轮廓不能仅由 hover 代替。 |
| 成功 / 警告 / 失败 | `--rui-success` / `--rui-warning` / `--rui-danger` | 配对使用对应 `-soft` 底色，并以文字或图标补充意义。 |

当前深色画布 / 侧栏面板 / 悬浮层分别为 `#1f1f1f` / `#181818` / `#262626`；浅色分别为 `#fafaf8` / `#f2f2f0` / `#ffffff`。composer 在两种主题下分别为 `#262626` 与 `#ffffff`。这些是本项目 token 源中的原创值，深色通过中性灰阶明度区别层级，浅色以轻微暖白与中性文字保持舒适。组件和业务 CSS 应引用 token，不能复制这里的色值或从参考截图采样后写入页面。

## 字体、密度与尺度

CSS 实际随附开源 Inter Variable 字体，UI 默认14px；Segoe UI 和中文系统字体补足字符覆盖。字体规则由公共包统一定义，Lab、Storybook 和消费工程不分别设置。代码使用 Cascadia Code、SFMono-Regular、Consolas 等等宽字体回退。

| 项目 | 当前 token 值 | 规则 |
| --- | --- | --- |
| 辅助文字 / 紧凑 UI / 常规 UI / 阅读正文 | 12 / 13 / 14 / 16 px | 数字按浏览器根字号 16 px 折算；不要为塞入文字继续缩小正文。 |
| 常规 / 中等 / 半粗字重 | 400 / 500 / 600 | 控件与正文优先 400，主要导航和标题按层级使用 500；600 用于需要明确强调的内容，避免每个标签都加粗。 |
| 紧凑：XS / SM / default / LG 控件 | 24 / 28 / 32 / 36 px | 小控件用于次级工具栏；频繁操作优先普通尺寸。 |
| 舒适：XS / SM / default / LG 控件 | 32 / 36 / 40 / 44 px | 调整尺寸与间距，不靠放大整个页面实现。 |
| 既有布局：紧凑 / 舒适行高角色 | 36 / 46 px | `--rui-row-height` 保留为布局角色；不是 DataTable 所有数据行的固定高度。 |
| 既有布局：紧凑 / 舒适面板内距 | 16 / 24 px | `--rui-panel-padding` 保留；通用组件内容区使用下表的 `--rui-content-padding`。 |
| 间距尺度 | 0、4、8、12、16、20、24、32、40、48、64 px | 使用 `--rui-space-*`；特殊布局尺寸先登记为共享 token。 |
| 小 / 中 / 大圆角 / composer | 6 / 8 / 12 / 14 px | 控件、容器与对话框使用稳定层级；composer 有独立角色，圆形状态元素可用 full。 |
| 边框 / 焦点轮廓 | 1 / 2 px | 细分隔与明确焦点承担不同功能。 |
| 快速 / 常规动效 | 120 / 180 ms | 只提示状态变化；尊重 `prefers-reduced-motion`。 |

0.3 → 0.4 调整的是共享内容密度：正文区域、表格和 AI 组件通过同一组角色收紧空白，UI 字号与控件高度保持上述尺度。以下数值仍以 16px 根字号折算；不要把 rem 数值误作不可缩放的像素上限。

| 内容角色 | CSS token | compact | comfortable |
| --- | --- | ---: | ---: |
| 通用内容内距 | `--rui-content-padding` | 12px | 20px |
| 内容间距 | `--rui-content-gap` | 12px | 16px |
| 小内容间距 | `--rui-content-gap-sm` | 8px | 12px |
| 单元格横向内距 | `--rui-cell-padding-x` | 10px | 16px |
| 单元格纵向内距 | `--rui-cell-padding-y` | 6px | 10px |
| 表头纵向内距 | `--rui-table-head-padding-y` | 4px | 6px |
| 表头高度角色 | `--rui-table-head-height` | 36px | 48px |
| 消息间距 | `--rui-message-gap` | 16px | 24px |
| Composer 输入最小高度 | `--rui-composer-input-height` | 80px | 112px |
| 空态内距 | `--rui-empty-padding` | 24px | 40px |
| 预览内距 | `--rui-preview-padding` | 16px | 24px |

组件内容容器使用 `p-[var(--rui-content-padding)]`，相邻内容使用相应 gap 角色，表格使用 cell 角色。当前 Lab 示例中，compact 数据行由 46px 收至 34px，AI 内容内距由 16px 收至 12px；前者是该示例的观察值，长文本和高控件仍会增加实际行高。已有产物容器中的代码使用 `CodeBlock variant="embedded"`，让外层提供边界、代码区域负责文本内距，避免重复嵌套 padding。

对应视口、前后量度和截图见 [0.4 密度记录](density-v04.md)。

代码使用真实语法高亮：`CodeBlock` 根据 `language` 解析源码，`--rui-syntax-*` 为注释、关键字、字符串、数字、函数、类型、属性、运算符和标点提供独立的深浅主题颜色。语法色只用于代码内容，不推广为普通控件或导航色。正文、复制和换行保持源码；高亮颜色不能代替 diff 的增删语义。Artifact 代码视图复用同一 CodeBlock 和 token。

ContextPill 的普通、可移除和禁用变体共享 SM 最小高度（紧凑 28px / 舒适 36px），内部移除按钮使用 `icon-xs`（24px / 32px），不叠加纵向 padding。按钮通过标准尺寸参与密度切换，不能用局部 `h-*` 覆盖共享按钮高度。长名称可截断，但保留完整 title 和可达的移除按钮；尺寸修正的实际量度见 [ContextPill 验证](validation-context-pill.md)。

TaskQueue 采用共享对齐的图标、任务信息、状态、操作四列，标题与说明在同一主行，行内使用 cell 内距和 XS 按钮。说明与长标题可截断，保留完整文本和悬停提示；错误详情完整换行。根据队列自身宽度切换操作文字，窄面板使用带完整可访问名称与提示的图标按钮，不让操作掉到下一行。

DisclosureTree 使用 XS 最小行高（紧凑 24px / 舒适 32px），取消额外行间空白，文件名和辅助说明在同一行。目录树自身提供 4px 边缘空间，嵌入面板时不再叠加内容内距；长名称和说明截断显示，完整文字保留在可访问名称与 title 中。字号保持 14px，原生 details/summary 的 Tab、Enter、Space 行为不变。文件导航与预览组合默认采用 30% / 70% 分栏，让文件内容承担主视觉；通用 ResizableWorkspace 的默认比例保持其独立契约。

DiffViewer 的代码、行号和增删符号统一使用等宽字体及 `--rui-line-interface`（20px）行高，代码行不叠加数据表格的纵向 cell padding；两种密度保持相同源码行距，横向内距与工具栏继续跟随密度。换行后行号对齐首行；统一和并排布局使用 colgroup 固定行号、符号栏，让代码使用剩余宽度，避免并排换行时将六列均分。

主题与密度放在 `document.documentElement`，即 `<html data-theme="dark" data-density="compact">`。可选值分别为 `dark | light`、`compact | comfortable`。默认是 dark + compact。Base UI 弹层会 portal 到文档中，只给应用内部 div 换主题会使菜单、提示和对话框继承错误；不要补写弹层专用颜色来修复。

## 桌面布局与阅读空间

初始布局 token 为侧栏 224 px、检查器 272 px、阅读宽度 720 px、画布最大宽度 1480 px、标题栏 42 px、状态栏 28 px。它们是默认值，不是强迫所有页面保持多栏的最小宽度。

工作区区分导航、主任务、上下文三个职责，不要求三个面板同时常驻。窄屏和缩放时先折叠辅助面板，主内容保留可用宽度；每个滚动区域有明确归属。长文件名可省略显示但需要可取得完整名称；正文允许自然换行；代码或数据表需要横向滚动时，应局限在自身容器。

阅读页可以降低信息密度：使用 16 px 正文、稳定行高与受控阅读宽度。属性面板和表格仍可保持紧凑。页面可选择已有布局和语义角色，不能各自发明主题。

桌面对话的 `Message` 正文默认使用 `--rui-font-interface`（14px）与 24px 行高，用户、助手和系统消息共享这一尺度，角色标签为 12px。两种密度只调整消息间距与容器内距；独立长文阅读页仍可选择 16px 阅读字号。Lab 和 Workbench 通过共享 Message 保持一致，不在宿主中覆盖正文。

组件组合表达结构：WorkspacePane 提供 title / actions / children；Dialog 使用 DialogContent / DialogTitle / DialogDescription 等子组件。先查实际类型；不要假设每个组件都有通用 `header`、`size` 或 `tone` 属性。

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
