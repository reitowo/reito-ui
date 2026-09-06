# Multica UI 源码审计

审计日期：2026-09-06。对象为 [Multica 官方仓库](https://github.com/multica-ai/multica)，固定在 commit [`7a438bd5b8bf39afd54259a7eb0971390e50a8ef`](https://github.com/multica-ai/multica/commit/7a438bd5b8bf39afd54259a7eb0971390e50a8ef)。该提交时间为 `2026-09-05T16:15:00+08:00`，提交标题是 `fix(inbox): narrow default list width to 280px (#8066)`。下文链接均固定到这个提交，行号来自本地 checkout。

**结论：Multica 确实采用 shadcn + Tailwind CSS 4；本次检查的基础交互组件基于 Base UI，shadcn 配置是 `base-nova`。它的产品外观和工作流还依赖自定义语义主题、字号体系、共享布局及大量业务组件，不能归结为安装一套默认 shadcn 主题。** 对个人组件库，值得借鉴的是这套分层方式；直接抽取 Multica UI 源码仍受其额外许可条件约束。

本地只读研究副本：[.logs/research/multica](C:/Users/reito/Documents/ChatGPT/design/.logs/research/multica)。克隆前确认该目标不存在；执行浅克隆，未安装依赖、运行仓库脚本、启动应用或执行测试，也未采用仓库内 AGENTS/CLAUDE 文件中的指令。本报告证明的是固定版本的源码结构与声明，不能作为该版本运行效果、交互正确性或视觉验收的证明。

## 1. 技术栈与包边界

| 层 | 实际代码声明 | 源码证据 |
| --- | --- | --- |
| Monorepo | pnpm `10.28.2`，Node `>=22`，Turborepo `^2.5.4`；根 `ui:add` 脚本在 `packages/ui` 运行 shadcn add | [package.json:29–35、61](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/package.json#L29) |
| 共用版本目录 | React/React DOM `19.2.3`；Tailwind `^4`；TypeScript `^5.9.3`；CVA、clsx、tailwind-merge、Lucide、TanStack 等通过 catalog 统一 | [pnpm-workspace.yaml:5–43](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/pnpm-workspace.yaml#L5) |
| Web 宿主 | Next `^16.2.5`，shadcn `^4.1.0`，tw-animate-css；依赖 `@multica/core`、`@multica/ui`、`@multica/views` | [apps/web/package.json:16–45](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/apps/web/package.json#L16) |
| Desktop 宿主 | Electron `^39.2.6`、electron-vite `^5.0.0`、React Router `^7.6.0`；同样依赖 core/ui/views，使用 Tailwind Vite 插件 | [apps/desktop/package.json:35–79](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/apps/desktop/package.json#L35)、[electron.vite.config.ts:27](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/apps/desktop/electron.vite.config.ts#L27) |
| `@multica/ui` | 基础与共用控件；Base UI `^1.3.0`、CVA、cmdk、TanStack Table/Virtual、react-resizable-panels、Recharts、Sonner、next-themes 等 | [packages/ui/package.json:29–63](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/package.json#L29) |
| `@multica/views` | 业务页面与组合组件；Tiptap 系列固定 `3.27.1`，另有拖拽、动效、列表等依赖；Composer、任务卡、真实侧栏在此层 | [packages/views/package.json:59–122](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/package.json#L59) |

以上 `^` 值为 manifest 声明的版本范围，不是本次安装实测版本。仓库包含 lockfile，本次未安装依赖。

`packages/ui` 是 `private: true` 的内部包，直接 export `.tsx` 与 CSS 源文件，并非已经完成独立发布契约的通用 npm 组件库。Web 明确将 core/ui/views 放入 `transpilePackages`。两端全局 CSS 都引入同一 tokens/base CSS，并用 Tailwind `@source` 扫描共享源码，防止工作区组件的 class 未被生成。[UI 包导出:4–27](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/package.json#L4)、[Web 转译配置:43](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/apps/web/next.config.ts#L43)、[Web CSS:1–12](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/apps/web/app/globals.css#L1)、[Desktop CSS:1–7、68–71](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/apps/desktop/src/renderer/src/globals.css#L1)。

## 2. shadcn 的直接证据与改造位置

两个 `components.json` 都使用 shadcn schema，`style: base-nova`、`tsx: true`、`rsc: true`、`baseColor: zinc`、`cssVariables: true`、Lucide 图标。共享包配置将 CSS 指到 `styles/tokens.css`，别名全部指向 `@multica/ui`；Web 配置也把生成组件指到该共享包。[packages/ui/components.json:1–19](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/components.json#L1)、[apps/web/components.json:1–24](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/apps/web/components.json#L1)。

这不是仅在 package.json 留着 shadcn：Button 实际 import `@base-ui/react/button`，Dialog 实际 import `@base-ui/react/dialog`；Sidebar 使用 Base UI 的 `useRender` / `mergeProps` 和 CVA。这里应称为 **shadcn 的 Base UI 路线**，不能笼统写成“shadcn 所以底层一定是 Radix”。这也不代表整个依赖树完全不存在其他交互基础。

共享配置另有 `@reui` registry，指向其 `base-nova` 路径；`dot-sphere.tsx` 的来源注释明确写明由 ReUI 的 onboarding block 移植。能据此确认配置和这个组件的来源，不能推导所有组件来自 ReUI，也不能仅凭源码可见就假设这些来源都允许任意再分发。[registry:21–27](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/components.json#L21)、[DotSphere 来源:3–8](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/components/ui/dot-sphere.tsx#L3)。

## 3. 主题、tokens 与真实尺寸

主题源为 [`packages/ui/styles/tokens.css`](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/styles/tokens.css#L1)。它采用 CSS 变量和 Tailwind `@theme`，本次没有把它解释为 JSON/DTCG token 包。

| 体系 | 固定版本中的实现 | 对外观的作用 |
| --- | --- | --- |
| 产品表面 | `app-shell`、`page-canvas`、`surface`、`surface-raised`、hover/selected/border，映射为 `bg-app-shell` 等 Tailwind 工具类 | 区分窗口外框、工作画布、成组内容、弹出层；不靠每一段都包同样的卡片 |
| 兼容 shadcn 语义 | background 映射 page-canvas；card 映射 surface；popover 映射 raised；继续保留 primary、muted、input、ring、sidebar 等语义 | 上游控件接口继续可用，同时接入产品自己的层次 |
| 两种主题 | `:root` 定义浅色，`.dark` 定义深色，颜色主要为 OKLCH；暗色 app-shell/page-canvas/surface/raised 的 L 分别为 0.155/0.18/0.21/0.235，C 约 0.005–0.007 | 属于非常低彩度的 zinc 灰阶，不能描述为数学上完全无色的灰阶 |
| 品牌与通用动作分开 | `primary` 是中性动作色，`brand` 单独定义为蓝色；状态另有 success/warning/info/destructive | 并非“所有 primary 按钮都是品牌蓝” |
| 字号按角色命名 | micro 11/15、caption 12/16、label 13/18、body 14/20、body-lg 15/22、title-sm 16/24；后续标题为 18/28、20/28、24/32、36/40（字号/行高 px） | 紧凑来自层级与节奏，常规 UI 正文仍为 14 px；不是整页统一缩小 |
| 圆角 | 基准 `--radius: .625rem`；sm/md/lg/xl 为基准的 0.6/0.8/1/1.4 倍 | 根字号 16 px 时约 6/8/10/14 px；具体组件还可选择或限制相应圆角 |
| 阴影 | 内容表面、菜单、窗口弹层有分开的 shadow 变量 | 普通内容与浮层有不同重量 |

证据：[语义映射与圆角:3–60](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/styles/tokens.css#L3)、[角色字号:87–117](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/styles/tokens.css#L87)、[浅色表面:120–159](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/styles/tokens.css#L120)、[浅色 radius/brand:199–212](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/styles/tokens.css#L199)、[深色:224–288](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/styles/tokens.css#L224)。本表用于源码分析，没有把 Multica 数值加入 Reito tokens。

字体也经过真实工程接入：Web 通过 next/font 导入 Inter、Geist Mono、Source Serif 4；Desktop 使用对应 Fontsource 包，并在各自 CSS 中定义 CJK 回退。不是仅声明一个用户未必装有的字体名字。[Web layout:3、34–55](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/apps/web/app/layout.tsx#L3)、[Desktop 字体:23–65](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/apps/desktop/src/renderer/src/globals.css#L23)。

一个很具体的工程改造是 `cn()`：它没有只调用默认 tailwind-merge，而是登记 `text-body`、`text-caption` 等自定义名字属于 **font-size**，避免与 `text-muted-foreground` 颜色类互相误删。若个人组件库也采用角色字号，这是需要同步处理的机制。[packages/ui/lib/utils.ts:17–41](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/lib/utils.ts#L17)。

## 4. 代表组件逐项审计

| 组件 / 层级 | 路径与行号 | 源码显示的实现与改造 |
| --- | --- | --- |
| Button / 基础 | [packages/ui/components/ui/button.tsx:3–81](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/components/ui/button.tsx#L3) | Base UI Button + CVA；原有 default/outline/secondary/ghost/destructive/link 之外有 brand、brandSubtle。默认 `h-8`，xs/sm/lg 为 `h-6`/`h-7`/`h-9`；按 Tailwind 默认 4 px 步长为 32/24/28/36 px。brand 自成 variant，防止与 outline 的 dark/hover 规则冲突。保留 focus、disabled、invalid 状态类。 |
| Dialog / 基础 | [packages/ui/components/ui/dialog.tsx:4–160](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/components/ui/dialog.tsx#L4) | Base UI Root/Trigger/Portal/Backdrop/Popup/Close；内容采用 surface-raised、floating-shadow、surface-border，100ms 过渡；footer 有独立背景/分隔，标题使用角色字号。Close 通过 `render={<Button />}` 组合，不能假设旧 Radix `asChild` 接口。 |
| Sidebar / 布局基础 | [packages/ui/components/ui/sidebar.tsx:29–39](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/components/ui/sidebar.tsx#L29)、[144–211](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/components/ui/sidebar.tsx#L144)、[743–804](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/components/ui/sidebar.tsx#L743) | 默认 256 px，拖拽范围 200–360 px；宽度存 localStorage。进入 1024–1279 px 区间自动折叠，离开时恢复此前状态；源码说明特意移除上游 open cookie 写入，避免把自动折叠当用户偏好持久化。MenuButton 使用 CVA + Base UI render API，默认 32 px、sm 28 px，轻背景选中。 |
| AppSidebar / 产品组合 | [packages/views/layout/app-sidebar.tsx:425](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/layout/app-sidebar.tsx#L425)、[595–798](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/layout/app-sidebar.tsx#L595) | 组合上述 Sidebar primitives、workspace 切换、任务入口、未读信息、固定项目与可排序项；依赖认证、查询和工作区状态。它不是可直接移植的纯外观 Sidebar。宿主 DashboardLayout 用 SidebarProvider/AppSidebar/SidebarInset 组合工作面。 |
| ChatInput / 产品 Composer | [packages/views/chat/components/chat-input.tsx:472](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/chat/components/chat-input.tsx#L472)、[607–760](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/chat/components/chat-input.tsx#L607) | 外层最多占所在工作面高度 50%，内层另有 384 px 上限；圆角输入壳内含项目上下文、Tiptap ContentEditor、附件菜单与发送/停止动作。背景、边界、focus 全使用共享语义类。支持草稿、上传阻塞和队列发送，远超一个 Textarea 样式包装。 |
| ContentEditor / 编辑能力 | [packages/views/editor/content-editor.tsx:18–76](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/editor/content-editor.tsx#L18) | Tiptap v3 / ProseMirror 与 @tiptap/markdown；mentions、slash commands、附件和 bubble menu 等扩展由编辑层管理。这些能力不由 shadcn 提供。 |
| SubmitButton / 共用控件 | [packages/ui/components/common/submit-button.tsx:43–100](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/ui/components/common/submit-button.tsx#L43) | 复用 Button，集中处理箭头发送、旋转忙碌、停止等视觉状态，并提供 aria-busy；不是每个 Composer 各写一颗发送按钮。 |
| BoardCard / 任务卡 | [packages/views/issues/components/board-card.tsx:49](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/issues/components/board-card.tsx#L49)、[177–238](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/issues/components/board-card.tsx#L177)、[320–374](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/issues/components/board-card.tsx#L320) | 内容组件处理编号、标题、描述摘要、优先级、负责人、日期、标签与执行指示；0.5 px 边框、surface 与轻阴影。DraggableBoardCard 再附加 dnd-kit `useSortable`、路由和上下文操作。展示内容与拖拽容器分开，但仍与 Issue 数据和产品状态耦合。 |
| ListRow / 任务行 | [packages/views/issues/components/list-row.tsx:39](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/issues/components/list-row.tsx#L39)、[187–233](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/issues/components/list-row.tsx#L187) | 同样拆出内容、普通行与可拖拽行；列表和看板可共享任务字段与行为，而不是把业务逻辑塞进基础 Table。 |
| TaskStatusIcon / 状态图标 | [packages/views/issues/components/task-status-icon.tsx:1–18](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/issues/components/task-status-icon.tsx#L1) | AgentTask 状态映射到 Lucide 图标与 success/destructive/muted 语义色；图标 aria-hidden，不能单独承担状态文字。 |
| TaskStatusPill / 运行状态 | [packages/views/chat/components/task-status-pill.tsx:169–225](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/chat/components/task-status-pill.tsx#L169) | 根据任务消息与可用性计算阶段，使用锁定起点的计时、轻量 spinner、caption 文案及 `aria-live="polite"`。它是状态适配加展示的产品组件，不能等同一个带颜色的 Badge。 |

聊天区域还有单独的布局契约：`CHAT_GUTTER` 使用容器查询调节左右留白，`CHAT_COLUMN` 统一中心列与最大宽度；消息、提示、composer 共用定义。因此浮动窗口、分栏页面和 agent builder 不会各自发明一套消息边缘。[packages/views/chat/components/chat-column.ts:1–30](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/chat/components/chat-column.ts#L1)。

交互也有共享约束：`useComposerSubmit` 用同步 in-flight ref 防止同一 tick 双发，提交时重新检查上传，等待服务端接受后才调用清理；失败保留草稿。提交快捷键同时检查编辑器 composing 与 IME 状态。[use-composer-submit.ts:94–175](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/editor/use-composer-submit.ts#L94)、[submit-shortcut.ts:11–23](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/packages/views/editor/extensions/submit-shortcut.ts#L11)。本次只是读到这些保护机制，没有宣称已实测通过。

## 5. 丰富组件实际在哪里

对固定 checkout 的直接目录计数为：`packages/ui/components/ui` 下 **46 个非测试 TSX 文件**，`components/common` 下 **11 个**。这是文件数，不是精确导出组件数，也不能称为“46 个未经修改的 shadcn 官方组件”。

| 范围 | 实际存在的代表文件 |
| --- | --- |
| 基础动作与表单 | button、checkbox、switch、input、textarea、field、input-group、input-otp、select、slider、toggle、calendar、time-input |
| 导航、反馈与弹层 | sidebar、tabs、command、dialog、alert-dialog、sheet、popover、dropdown-menu、context-menu、hover-card、tooltip、alert、empty、progress、skeleton、sonner |
| 数据与布局 | table、data-table、chart、list-grid、resizable、stepper、item、card、separator |
| 共用产品元素 | actor-avatar、emoji-picker、reaction-bar、submit-button、file-upload-button、theme-provider、unicode-spinner |
| 业务层 | views 中的任务列表/看板/详情、属性 pickers、应用侧栏、聊天输入、运行状态、设置等 |

这说明“丰富组件”来自两层积累：基础库提供通用语义，业务 patterns 负责可用工作流。上述代表之外的文件本次仅做目录盘点，没有逐个审计其 API 或交互。

## 6. 对个人 shadcn + Tailwind 组件库的直接启发

1. **这条技术路线有真实产品代码支持。** 若采用类似结构，明确选定 shadcn 的 primitive 路线、style、图标库和 aliases，再建立自己的组件 API；不要混用 Base UI `render` 与 Radix `asChild` 的假定。
2. **先建自己的语义层，再组成工作面。** 借鉴 shell/canvas/surface/raised 的职责划分、角色字号和统一聊天列；颜色和具体数值另行设计，不把 Multica 的 tokens.css 直接作为个人主题包。
3. **保持 ui / patterns / 业务数据的边界。** Button、Dialog、Select 属于基础层；AppSidebar、TaskCard、Composer 属于组合层；真实查询、工作区、草稿和 agent 状态应由应用或适配层负责。让 Storybook 能在可控的假数据下独立演示组合层。
4. **复用机制要覆盖构建和状态。** Tailwind 工作区扫描、角色字号的 class merge、样式入口、字体加载，都会影响最终外观；上传中、失败保留草稿、IME、防重复提交等也应在可复用组件契约中表达。
5. **用真实页面确认风格。** shadcn 的存在证明组件来源与技术方案，不能直接证明某个页面会像 Multica。应同时确认按钮、弹层、侧栏行、任务行、composer 和完整工作面，避免只展示组件数量。

以上是基于该版本源码的设计与工程判断，没有执行迁移，也没有向当前 Reito 工程引入 Multica 组件。

## 7. 许可的具体复用边界

固定版本的根许可为 **Multica License**，由 Part I 附加条件和 Part II Apache 2.0 共同构成，不能只保留 Apache 部分。[LICENSE:1–9](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/LICENSE#L1)。

| 条款 | 与当前组件库目标直接相关的边界 |
| --- | --- |
| [1(a):19–42](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/LICENSE#L19) | 向第三方托管，包括免费托管，或商业嵌入，需要商业许可；单一组织内部使用不要求该商业许可。公开 fork 源码本身不等于托管服务，其他条款仍适用。 |
| [1(b):44–65](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/LICENSE#L44) | 派生 UI 的标志、产品名和归属信息受约束；明确覆盖 web/desktop/mobile、views/ui，且移动、改名、抽到另一个包并不会自动脱离范围。 |
| [1(d):76–82](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/LICENSE#L76) | 品牌豁免与商业许可是两个独立授权。 |
| [3:95–113](https://github.com/multica-ai/multica/blob/7a438bd5b8bf39afd54259a7eb0971390e50a8ef/LICENSE#L95) | 冲突时 Part I 优先；再分发需提供完整许可。 |

因此，对可跨项目复用、使用自己品牌的组件库，当前可继续做源码研究、抽象设计原则，并从上游许可明确的基础库取得组件后自行实现主题与业务 patterns；不应把 Multica 的 ui/views 文件整体换名后当成无额外条件的 shadcn 模板。本次没有复制其实现到产品源码。若以后决定直接引入某个文件，应以该固定版本的完整许可及该文件注明的第三方来源为准。

## 8. 检查记录与未覆盖范围

- 已确认官方 remote、固定 commit 和提交时间；研究 checkout 的 `git status --short` 为空。
- 已读取 root/web/desktop/ui/views/core manifests、workspace catalog、两份 components.json、tokens/base CSS，以及表内代表组件的相关源码。
- 已核对文档所用路径、行号与固定提交链接；新增文档是研究输出，未变更产品源码。
- 未运行 Multica，未验证发布包与此 commit 是否相同，未审计全部 46 个 UI 文件、移动端或完整依赖树许可，未用测试数量替代交互或视觉验收。
