# Reito UI → shadcn/ui / Tailwind v4 迁移审计

审计日期：2026-09-06。对象：本仓库 `@reito/ui` / `@reito/tokens` 0.2.0。本文只包含研究、源码核对和迁移建议，没有安装 Tailwind、执行 shadcn CLI 或修改组件实现。

**建议以官方 Base UI + base-nova 建立新的可组合基础层，再迁移当前例工程。保留旧 API 只作为有期限的过渡。** 当前 0.2 是本任务原型，没有已知生产下游，不应为了保存 30 个旧导出而永久限制新的组件结构。这个选择依据维护方向、组合能力和当前迁移成本；不能由此推断 Base UI 的外观天然更接近 Cursor 或 Claude Desktop。

当前实现也有应保留的资产：原创语义 tokens、四种主题/密度组合、Storybook 状态样例、中文 IME 防误提交、对话框焦点回到触发处、本地示例和实际验证记录。已有的 Radix 交互并非“伪组件”；应逐项复核、迁移这些行为，避免只替换 JSX 后丢失它们。

## 1. 官方现状：先纠正几个会影响选型的事实

| 核实项 | 当前官方事实 | 对本项目的意义 |
| --- | --- | --- |
| 默认底层 | 2026 年 7 月起，新项目默认 Base UI；Radix 仍被支持，官方明确现有可用的 Radix 项目不必迁移。 | 新基础层可明确选择 Base UI；若未来发现生产下游依赖现有 Radix 行为，应重新评估范围。[官方公告](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default) |
| shadcn 的交付方式 | shadcn 提供可编辑组件源码、组合约定与代码分发平台；不是安装一个黑盒运行时包就能获得所有界面规范。 | 自己仍要拥有组件改动、版本、行为检查、tokens 和产品布局。[官方介绍](https://ui.shadcn.com/docs) |
| Monorepo | CLI 能按 workspace 配置把基础组件放入共享包、业务块放入应用；参与 CLI 安装的 workspace 需正确配置 `components.json`、aliases 和共享 CSS。Tailwind v4 的 `tailwind.config` 留空。 | 当前 npm workspaces 可以延续，无需只为 shadcn 改包管理器或换成 Turborepo。[Monorepo](https://ui.shadcn.com/docs/monorepo) |
| Registry | Registry 能分发组件、hooks、页面、规则、CSS 和配置；item 可以声明源码与包依赖。 | 可用于分享 Reito 的模板和 patterns；它与 npm 二进制制品包承担不同职责。[Registry](https://ui.shadcn.com/docs/registry)、[item schema](https://ui.shadcn.com/docs/registry/registry-item-json) |
| Tailwind 主题 | `@theme` 注册可生成 utility 的主题变量；引用运行时变量时使用 `@theme inline`。普通 `:root` 变量本身不等于 utility 注册。 | 可以从现有 JSON 生成桥接文件，保留主题/密度运行时切换。[Theme variables](https://tailwindcss.com/docs/theme) |
| Tailwind 扫描 | `node_modules` 默认不扫描；`@source` 可显式注册共享包路径，路径相对样式文件。源码中的 utility 应为完整可识别字符串。 | 源码分发模式需要扫描契约；已编译 CSS 模式不需要消费端再扫描库组件。[Source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files) |
| 全局 reset | Tailwind 默认导入 Preflight，也允许只导入 theme/utilities 而不导入 Preflight。 | 库不能偷偷重置宿主整个页面；应用和包需明确谁负责基础样式。[Preflight](https://tailwindcss.com/docs/preflight) |
| 当前生成代码 | 当前 Base UI Button 使用 `@base-ui/react/button`、CVA 和 `cn`；官方代码中的 `data-slot` 是部件识别接口。官方 CLI 也已有从旧 merge helper 迁往 `cn` 的说明。 | 不要照搬几年前的安装文章，把固定的旧依赖组合误称为最新规范。[Button 源码](https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/bases/base/ui/button.tsx)、[CLI](https://ui.shadcn.com/docs/cli) |

特别需要注意：当前官方仓库的 `registry/bases/*` 文件是生成材料。Button 引用 `cn-button-*` 样式钩子，Dialog 还含 `IconPlaceholder`；nova 的样式在单独文件中。**直接下载一个内部 TSX 文件并改 import，不能视为完成 shadcn 安装。** 后续实施应使用固定版本 CLI / 已解析 registry 产物，记录 preset、底层库、依赖和版权通知，再审查生成结果。[Base Dialog 源码](https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/bases/base/ui/dialog.tsx)、[nova 样式源码](https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/styles/style-nova.css)

## 2. 当前代码里已经存在什么

在 [components.tsx:2](C:/Users/reito/Documents/ChatGPT/design/packages/ui/src/components.tsx:2) 中，Accordion、Checkbox、Dialog、DropdownMenu、Select、Switch、Tabs、Tooltip 共 8 类交互原语确实来自 `radix-ui`。包依赖位于 [package.json:31](C:/Users/reito/Documents/ChatGPT/design/packages/ui/package.json:31)。其余组件采用原生元素或本地组合；例如 CommandPalette 是本地过滤与键盘逻辑，Progress 是带 ARIA 的本地进度条，ToolCall 使用原生 `details`。

因此，“已有 Radix，所以已经等同 shadcn”与“没有 shadcn，所以所有交互都在手写”都不准确。主要差异在共享组合 API、样式与布局所有权、工具链契约和扩展方式。

## 3. 七个实质问题

### A. 组件字体和图标规范没有完全随包交付，已出现跨宿主差异

组件公共字体选择器只列出部分 class；Field label 自己只定义字号、颜色和字重。Lab 则额外设置 body 字体、所有表单元素继承字体、全局 SVG 描边和全局 box-sizing。证据：[components.css:3](C:/Users/reito/Documents/ChatGPT/design/packages/ui/src/components.css:3)、[components.css:83](C:/Users/reito/Documents/ChatGPT/design/packages/ui/src/components.css:83)、[app.css:1](C:/Users/reito/Documents/ChatGPT/design/apps/lab/src/app.css:1)、[main.tsx:3](C:/Users/reito/Documents/ChatGPT/design/apps/lab/src/main.tsx:3)。

根任务使用真实 Edge 比较 Lab、Storybook 和仅加载两份发布 CSS 的独立消费页；原始数据为 [host-style-comparison.json](C:/Users/reito/Documents/ChatGPT/design/.logs/research/host-style-comparison.json)。此次比较均为 dark + compact：

| 同一类元素 | Lab | Storybook | 0.2 tarball 消费页 |
| --- | --- | --- | --- |
| Button / Input 字号、高度 | 14px / 30px | 14px / 30px | 14px / 30px |
| Button 图标描边 | 1.65px | 2px | 2px |
| 图标 box-sizing | border-box | content-box | content-box |
| Field label computed font-family | Reito sans 字体栈 | Reito sans 字体栈 | Times New Roman |
| Field label 行高 / 高度 | 19.5px / 19.5px | normal / 17px | normal / 17px |

这证明了局部真实漂移，不能夸大为所有尺寸都失败。tarball 是已生成的 0.2 制品，本轮未为研究重建；相关 label/font/svg 源码规则一致。改进是让字体、行高、图标尺度/描边和必要的局部 normalization 成为基础层契约，并在不导入 Lab CSS 的消费页中检验。引入 Tailwind 后也必须指定 Preflight 的所有者，不能依靠宿主碰巧补齐。

### B. 可复用布局仍留在应用，且页面直接改写组件内部样式

[app.css:21](C:/Users/reito/Documents/ChatGPT/design/apps/lab/src/app.css:21) 的 shell、[app.css:30](C:/Users/reito/Documents/ChatGPT/design/apps/lab/src/app.css:30) 的 `.titlebar-tools .rui-button`、[app.css:36](C:/Users/reito/Documents/ChatGPT/design/apps/lab/src/app.css:36) 的 Kbd 改写、[app.css:41](C:/Users/reito/Documents/ChatGPT/design/apps/lab/src/app.css:41) 的 NavItem 改写，分别决定窗口结构、图标按钮尺寸和侧栏局部外观。另一套阅读列、滚动归属和 composer dock 在 [AgentWorkspace.css:43](C:/Users/reito/Documents/ChatGPT/design/apps/lab/src/AgentWorkspace.css:43)、[AgentWorkspace.css:86](C:/Users/reito/Documents/ChatGPT/design/apps/lab/src/AgentWorkspace.css:86)。这些能力均未从公共包导出。

后果是消费项目只能重新拼侧栏、顶部工具栏和阅读区，或复制例工程 CSS。应把通用尺寸和结构提成布局 primitives，把具体会话/产物行为留给 patterns；例如显式的 `icon-sm` Button 尺寸能取代页面选择器改内部宽高。完整 shadcn Sidebar 可以做来源参考，但直接套 Sidebar 不会自动解决桌面三栏的滚动与折叠规则。[官方 Sidebar](https://ui.shadcn.com/docs/components/base/sidebar)

### C. 高层 props 过早封闭了组件结构

[Select:107](C:/Users/reito/Documents/ChatGPT/design/packages/ui/src/components.tsx:107) 只接受简单 `options`，DropdownMenu 的 [items:168](C:/Users/reito/Documents/ChatGPT/design/packages/ui/src/components.tsx:168) 不能表达 checkbox/radio 项、分组和子菜单；[Tabs:150](C:/Users/reito/Documents/ChatGPT/design/packages/ui/src/components.tsx:150) 由 `items` 统一生成；[Accordion:229](C:/Users/reito/Documents/ChatGPT/design/packages/ui/src/components.tsx:229) 固定 multiple。它们是可用的便捷封装，但新需求容易变成不断加特殊 props。

[Dialog:181](C:/Users/reito/Documents/ChatGPT/design/packages/ui/src/components.tsx:181) 提供固定的 title/description/footer 和焦点扩展，却没有独立公开的 Trigger、Content、Title、Description、Close，关闭按钮文案固定。应先有可组合基础部件，再让需要稳定结构的产品 pattern 提供简化 props。官方 Dialog 和 Select 的组成方式可以直接体现这一分层。[Dialog](https://ui.shadcn.com/docs/components/radix/dialog)、[Select](https://ui.shadcn.com/docs/components/radix/select)

### D. 单文件混合原语、便捷封装和产品 pattern，缺少独立维护边界

[components.tsx:25](C:/Users/reito/Documents/ChatGPT/design/packages/ui/src/components.tsx:25) 的 Button 到 [components.tsx:396](C:/Users/reito/Documents/ChatGPT/design/packages/ui/src/components.tsx:396) 的 ToolCall 都在同一文件；[index.ts:1](C:/Users/reito/Documents/ChatGPT/design/packages/ui/src/index.ts:1) 全量再导出。包仅公开根入口与 CSS，[package.json:9](C:/Users/reito/Documents/ChatGPT/design/packages/ui/package.json:9) 没有组件子路径。当前 `cx` 只是串接 class；这对普通 CSS 没有错，但不能在迁为 utility 后继续假设其会合并冲突 utility。

应按组件拆分模块，建立稳定的 `data-slot` 与 variants，保留官方生成代码与本地改动记录。这样升级单个 Dialog 时无需在包含业务 composer 的大文件里追踪边界。此处并不声称当前 ESM 无法 tree-shake；当前也没有体积实测支持这个结论。

### E. tokens 已有唯一来源，但缺少 shadcn/Tailwind 的语义桥与密度契约

[build-tokens.mjs:5](C:/Users/reito/Documents/ChatGPT/design/scripts/build-tokens.mjs:5) 从 JSON 读取唯一来源，[build-tokens.mjs:36](C:/Users/reito/Documents/ChatGPT/design/scripts/build-tokens.mjs:36) 只生成 `--rui-*` 运行时变量。目前没有 `@theme`、shadcn 运行时别名或 registry token 输出。现有检查也主要识别 `--rui-*` 和 CSS palette literals，[check-design.mjs:5](C:/Users/reito/Documents/ChatGPT/design/scripts/check-design.mjs:5) 不覆盖 TSX 中新增的任意 Tailwind palette 类或 shadcn 的语义名称。

直接引入默认 shadcn CSS 会产生第二套主题。更隐蔽的是同名含义冲突：Reito `accent` 表示蓝色信息/强调，而 shadcn 的 `accent` 通常参与菜单等交互底色；不应机械把所有同名变量一一映射。现有密度通过 control-height 驱动，官方 nova 默认 Button 尺寸则使用自己的 utility 尺度：审计快照中 default 为 `h-8`、sm 为 `h-7`，不能声称其自动继承 30/40px 的 Reito 密度。需要明确保留、采用或扩展的选择。[Theming](https://ui.shadcn.com/docs/theming)、[nova 样式](https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/styles/style-nova.css#L148)

### F. 本地复杂交互需要独立行为迁移，单换组件标签不够

[CommandPalette:333](C:/Users/reito/Documents/ChatGPT/design/packages/ui/src/components.tsx:333) 自己实现搜索、activeIndex、箭头导航和 command 选择；当前 command 类型没有分组、禁用项或可配置过滤器。这是明确的扩展限制，不代表已有键盘流程必然失效。官方 Command 使用 `cmdk`，可评估用其可组合部件承载命令列表；Base UI 版本的官方 Command 同样标明使用 `cmdk`，并非所有行为都来自 Base UI。[官方 Command](https://ui.shadcn.com/docs/components/base/command)

[ChatComposer:378](C:/Users/reito/Documents/ChatGPT/design/packages/ui/src/components.tsx:378) 的受控输入、空白拦截、IME guard、Shift+Enter 和 loading 约束要保留；官方 InputGroup 只解决输入与附属内容组合，不能替代完整聊天协议。[官方 InputGroup](https://ui.shadcn.com/docs/components/radix/input-group) 对话框的自定义焦点回退也需逐项移植，不能按 `asChild → render` 的字面替换就宣布兼容。

### G. 现有构建与消费验证有价值，但不能证明未来两条分发路径一致

Lab 的 [Vite aliases:6](C:/Users/reito/Documents/ChatGPT/design/apps/lab/vite.config.ts:6) 和 Storybook 的 [aliases:15](C:/Users/reito/Documents/ChatGPT/design/apps/storybook/.storybook/main.ts:15) 都直接读取工作区源码。包则由 [UI Vite:8](C:/Users/reito/Documents/ChatGPT/design/packages/ui/vite.config.ts:8) 生成独立 JS/CSS。已有 [验证记录:22](C:/Users/reito/Documents/ChatGPT/design/docs/validation.md:22) 包含 tarball 安装、ESM、SSR 与 NodeNext 类型检查，不能抹去这些结果；但前述 Edge 测量显示它们没有自动覆盖发布 CSS 的外观一致性。

采用 Tailwind 后，另需验证 registry 源码消费与预编译 npm CSS 消费。否则 monorepo 的源码扫描可能掩盖发布包缺少 utilities，或者应用与库同时带入 Preflight。验收应包含真正安装 tarball、无源码 alias、无 Lab CSS 的浏览器工程，而不是在原工程中再跑一次同样的检查。

## 4. 30 个旧导出的具体映射

下面是迁移设计，不是当前已存在的新 API。基础层以官方 Base UI 版本为主；表中“适配”只服务当前例工程的过渡。

| 当前导出 / 源码起点 | 新基础层或组合目标 | 迁移重点 |
| --- | --- | --- |
| Button、IconButton · `components.tsx:25` | 官方 Button、buttonVariants、Spinner | 旧 primary → 新 default；danger → destructive；旧默认 secondary 不能悄悄变成 default。旧 loading 需显式组合状态并阻止重复激活。提供 icon-sm 等真实 variant。 |
| Badge · `:42` | Badge + Reito feedback variants | neutral/info/success/warning/danger 是本地语义扩展，不能只改成官方默认色。 |
| Input、Textarea · `:46` | Input、Textarea | 保留原生属性/ref；统一字体、disabled、invalid 与密度。 |
| Field · `:64` | Field、FieldLabel、FieldDescription、FieldError、FieldGroup | 新基础层允许组合多个部件；旧自动注入 id 的 wrapper 只短期保留。 |
| Checkbox、Switch · `:80` | Checkbox / Switch + Label 或 Field | 新原语不强制捆绑 label；产品 pattern 可固定布局。 |
| Select · `:120` | Select、Trigger、Value、Content、Group、Item | 原 options API 可短期渲染新部件；新页面直接使用组成 API。 |
| Tabs · `:151` | Tabs、TabsList、TabsTrigger、TabsContent | 保留 value 语义，允许工具栏与标签列表独立排列。 |
| Tooltip · `:161` | TooltipProvider、Tooltip、Trigger、Content | Provider 提升到共享应用层；保留可读 label，Tooltip 不代替它。 |
| DropdownMenu · `:170` | DropdownMenu 各部件 | 补分组、分隔、checkbox/radio 项；受控 open 与焦点按新底层 API 验证。 |
| Dialog · `:195` | Dialog、Trigger、Content、Title、Description、Footer、Close | 主动管理有/无 trigger 和嵌套弹层焦点；局部文案可配置。 |
| Accordion · `:229` | Accordion、Item、Trigger、Content | 单开/多开及受控状态由调用方选择。 |
| Separator · `:238` | Separator | 保留方向与装饰/语义用途区分。 |
| Avatar · `:243` | Avatar、Image、Fallback | 保留中文名称/initials 策略和失败回退；不要把视觉 fallback 当成真实身份。 |
| Kbd、Skeleton、Spinner · `:251` | 对应轻量基础部件 | 图标/字体随包交付；Spinner 保留可读 loading label。 |
| Progress · `:257` | Progress + FieldLabel/数值说明 | 继续钳制非法数值；官方基础部件不必捆绑目前固定的标题行。 |
| EmptyState · `:268` | Empty 组合或 Reito EmptyState pattern | 原 title/description/action 属于便捷 pattern，可保留有价值的语义 API。 |
| Alert · `:276` | Alert、AlertTitle、AlertDescription、Action | 保留 tone 与 role 意图；引入更多反馈状态前重测对比度。 |
| Breadcrumb · `:284` | Breadcrumb 各部件 | 链接应交给宿主路由渲染；保留当前页语义。 |
| NavItem · `:294` | SidebarMenuButton 或 NavigationItem pattern | 支持真实链接与当前页语义；页面不再改写私有 icon/active 样式。 |
| StatusDot · `:303` | Reito Feedback primitive | 没有必要为了“全用 shadcn”删除已明确的小语义组件。 |
| CodeBlock · `:307` | Reito CodeBlock pattern | 复制失败、长行滚动和语言标签保留；语法高亮是单独能力。 |
| Panel · `:327` | Card 各部件或 WorkspacePane | 有卡片语义才用 Card；主工作区面板使用布局 primitive，避免全面卡片化。 |
| CommandPalette · `:333` | CommandDialog + cmdk 组成部件 | 中文 IME、分组、禁用项、跨 dialog 焦点与空态独立验收。 |
| ChatComposer · `:378` | InputGroup + Textarea + Reito Composer pattern | 保留发送状态机与中文输入；toolbar、hint 是 pattern slots。 |
| ToolCall · `:396` | Collapsible + Reito ToolStep pattern | 默认安静行，展开详情；状态文字、图标与可控展开属于产品 pattern。 |

Base UI 链接语义需要特别复核：当前官方 Button 文档明确建议真实导航链接使用普通 `<a>` 配合 `buttonVariants`，而不是把 Base UI Button `render` 成 `<a>` 后保留 button role。因此不能把 Radix 的每个 `asChild` 使用点机械替换为 `render`。[官方 Button / As Link](https://ui.shadcn.com/docs/components/base/button#as-link)

## 5. 推荐的 tokens 主源与桥接

**继续以 `packages/tokens/src/tokens.json` 为唯一可编辑的设计数据源。** 其优点是已经能供非 Tailwind 消费者、文档和未来 registry 使用。新增生成目标，不新增第二套手工色表：

```text
tokens.json
  ├─ tokens.css              运行时 --rui-*，dark/light 与 density
  ├─ shadcn-theme.css        运行时 shadcn 语义别名 + @theme inline
  └─ registry token metadata 由同源数据生成的安装/设计信息
```

首个桥接映射应明确写成规则并验证：

| shadcn 角色 | Reito 候选来源 | 必须说明的差别 |
| --- | --- | --- |
| background / foreground | bg / text | 主画布与正文。 |
| card / card-foreground | elevated / text | 卡片局部层级，不应迫使每个 Pane 使用 elevated。 |
| popover / popover-foreground | elevated / text | Portal 从文档根取得同一主题。 |
| primary / primary-foreground | primary / on-primary | 中性反转的主动作。 |
| secondary / secondary-foreground | hover / text | 低强调动作底色；须与 nova 实际透明度叠加一起看。 |
| muted / muted-foreground | hover / text-muted | 这是桥接选择，需在列表、空态和 disabled 上验证。 |
| accent / accent-foreground | hover / text | 交互强调面采用中性底；信息蓝保留单独 info/accent-text 角色。 |
| border / input / ring | border / border / focus | 普通边界、输入边界与焦点分开；需要更强边界时显式使用 border-strong。 |
| destructive | danger | nova 快照使用透明底加 destructive 文本；应测实际叠色。若未来采用实心危险按钮，再定义成对的 foreground，不能直接假设白字合格。 |
| sidebar / sidebar-foreground | surface / text-secondary | 背景与导航文字，active 仍使用明确的 sidebar-accent 配对。 |
| radius、font、spacing、density | foundation / density | 不按同名盲映射：Reito text-sm=13px，而 Tailwind 默认 text-sm=14px；必须在新基础层明确采用的 typography 尺度。 |

桥接文件可由生成器产生以下形式；这是本项目的方案示意，尚未实现：

```css
/* Generated: runtime aliases remain owned by the token package. */
:root, [data-theme] {
  --background: var(--rui-bg);
  --foreground: var(--rui-text);
  --primary: var(--rui-primary);
  --primary-foreground: var(--rui-on-primary);
}
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
}
```

主题变量、Tailwind utility 命名空间和 selector 是三件事；`data-theme` 切换还需与 Tailwind 的 dark variant 定义对齐，不能只生成颜色而忽略组件里的 `dark:` 类。首轮应以 stock nova 的 typography / geometry 获得可比较基线，之后再将“紧凑 / 舒适”作为共享受控扩展。不要第一步就把所有旧 CSS 尺寸强压回 nova，导致新基础层退回旧设计。

生成器可以继续输出 sRGB；Tailwind 支持 OKLCH 并不意味着项目必须为追随默认值立刻转换所有原色。若采用 OKLCH 主源，则应先扩展生成器和对比度检查，而不是在 globals.css 中另写一份值。当前 [generator:17](C:/Users/reito/Documents/ChatGPT/design/scripts/build-tokens.mjs:17) 明确只接受 sRGB。

## 6. 分发：推荐 npm 预编译 CSS 为主，registry 为辅

以下是基于官方 Tailwind 扫描、主题共享和 Preflight 机制作出的工程方案，不是官方保证任意第三方包都能自动工作的承诺。

| 路径 | 谁编译组件 utility | 消费契约 | 推荐用途 |
| --- | --- | --- | --- |
| npm / tarball 预编译包 | `@reito/ui` 自己构建 | 加载 tokens 与发布 CSS；无需安装 Tailwind 或扫描库源码 | 默认跨工程复用，集中升级与可复现发布 |
| shadcn registry 源码 | 消费工程 | 安装声明的依赖、theme bridge、生成规则；共享 monorepo / node_modules 源码需显式 `@source` | 模板与产品 patterns、本来就需要拥有并修改源码的项目 |

预编译包应交付可直接被浏览器使用的 CSS，不把未处理的 `@theme` / `@apply` 当成运行时样式。库仅编译自身已知 classes，使用稳定前缀或明确的作用域及 layer 顺序，避免与宿主 Tailwind 的同名 utility 相互覆盖；不要附带无说明的全局 Preflight。应用的 reset 可以是独立显式入口，但组件自身字体和关键图标规范仍应可靠。当前 shadcn 还可能依赖 `shadcn/tailwind.css` 提供状态 variants 与动画，这部分必须在库构建中处理并锁版本。[官方 CLI / eject](https://ui.shadcn.com/docs/cli#eject)

发布 CSS 中库组件需要的所有 utility 必须存在；可选择显式 source 清单/完整静态 variants，避免从例工程“碰巧”扫描到依赖。消费方自己编写的新 utility 不会凭空由库 CSS 提供，仍属于宿主自己的 Tailwind 或 CSS。源码 registry 也不要再把同一套基础组件复制到每个应用；共享 monorepo 只安装一份基础层，把应用特有块留在应用。

## 7. 目录与职责建议

```text
packages/tokens/              JSON 主源、运行时 CSS、Tailwind 桥接
packages/ui/src/components/   官方组成 API + 少量 Reito variants
packages/ui/src/layout/       WorkspaceShell、Pane、PaneHeader、Toolbar、ReadingColumn
packages/ui/src/patterns/     Composer、ToolStep、ArtifactRow、SettingsSection
packages/ui/src/legacy/       仅当前例工程所需的过渡适配
apps/lab/                    场景内容、草稿/设置状态、路由、预览交互
apps/storybook/              单件状态、组合场景、视觉决策对照
registry/                   可分发 patterns、示例与规则的定义
```

布局 primitives 只负责结构性合同：一个 pane 的滚动所有者、最小宽度、标题/动作对齐、侧栏折叠、阅读宽度与 composer dock。它们不决定“哪个 AI 模型”“任务是否完成”等业务事实。产品 patterns 才组合消息、上下文、工具步骤和产物；真实后端、持久化、发送队列和权限仍归应用。

`Sidebar`、`Resizable`、`ScrollArea` 可以按实际需要引入，不应在基础层一开始强制所有页面使用三者。原生 overflow 已满足的 pane 不必为了组件数量而再包 ScrollArea。

## 8. 选择与渐进小切片

| 方案 | 适合条件 | 本项目评价 |
| --- | --- | --- |
| 继续 Radix，自建 shadcn 风格组成 API | 已有生产使用和大量依赖其行为；目标主要是补组合能力 | 风险较小且技术上成立；不是当前缺少下游约束时的首选。 |
| 新建 Base UI + base-nova 基础层 | 原型期、希望采用官方当前基础、可重新检查行为 | **推荐。** 迁移工作主要是本仓库例工程与 stories；把长期维护成本放在新的清晰 API 上。 |
| 一次覆盖全部旧文件 | 能接受同时重审全部视觉、行为和消费接口 | 不推荐作为第一步；很难区分底层变更、视觉变更和应用组合带来的回归。 |

第一片建议只做“工作区设置”完整小流程：Button / Input / Field / Switch / Dialog，加一个由公开 Pane/Toolbar 组合的页面。这个切片能同时验证基础样式、表单错误、disabled/loading、Portal 主题和关闭焦点，足以检查新基础层是否独立于 Lab 全局样式。先不搬整套 Agent 页面，也不把 Command、消息流和所有菜单一起改。

实施顺序：

1. 固定 CLI、Base UI、Tailwind、nova preset 和依赖版本；保存生成输入、来源与本地修改说明。只在独立基础层目录生成，审查产物再接入。
2. 扩展 token 生成目标和校验，先做桥接；保留一页 stock nova 与 Reito theme 的对照，分别确认体系与个人外观。
3. 新代码使用 `@reito/ui/components/*` 的可组合 API。旧根入口暂时留给未迁移的例工程，必要 wrapper 放进 legacy；不做自动根据 props 猜旧/新 Dialog 意义的兼容逻辑。
4. 验证设置切片：深浅 × 两密度、中文长文本、键盘、Portal 和 200% 缩放；在真实 tarball 消费页重测本文暴露的 label 字体/行高与 icon 描边，同时确认原本一致的 Button/Input 尺寸没有无意漂移。
5. 用户确认基础层和该流程后，再迁移导航、菜单、Command、Composer 等 patterns；每次移走一组例工程，删除对应 legacy wrapper。
6. 当前仓库所有调用点迁完、无已知下游后，在下一次明确版本升级中收敛旧根导出，移除未使用的 Radix 依赖。目标是删除迁移适配，不是永久同时维护两套底层和两套 Dialog API。

新基础层验收应记录实际版本、registry 输入、完整页面截图、四组合行为、打包消费页面和剩余限制。现有 70 stories / 30 组件是旧版本覆盖范围，不应成为新组成 API 的数量上限；反过来，导出数增加也不能作为设计质量提升的证据。

## 9. 审计证据与未执行项

本次实际完成：读取仓库组件/应用 CSS/包配置/token generator/验证记录；访问官方当前文档；查看并保存固定提交的源码参考；读取根任务最新 Edge 跨宿主测量。没有执行安装、CLI 自动迁移、UI 改写、构建或完整测试，以上方案尚未实现。

官方源码参考锁定提交：`7c9eaba1c0a6404c990c144a654792e3313c650d`。本地只读参考快照保存在 `.logs/research/shadcn/`：

| 快照 | SHA-256 |
| --- | --- |
| base-button.tsx | `74f982d7ad7a764e3c95a519fc063a671e66ad758ea31dc89d747838e20c2487` |
| base-dialog.tsx | `aba6df6cbf51a1edcc22e415a3a46a666fc8cb66729e47b3ed2ecd97f166adff` |
| style-nova.css | `5d5751579c015b61e77cf0822862a43ac79f3e6fed236a17624be8e6d1ebea1d` |

同时保存了该提交的 LICENSE.md；后续使用官方实现应保留其 MIT 版权与许可通知。`.logs` 快照不属于产品运行代码；网页链接提供可复核来源，后续实施仍应核实固定版本实际生成内容。
