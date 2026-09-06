# Reito UI 与 Nuxt UI / PrimeReact / PrimeVue 的组件能力对照

核查日期：2026-09-06。结论：常用基础交互已经覆盖较多，下一阶段的主要收益来自编辑、表单、树结构与大数据展示能力。需要同时新增缺失组件、完善现有组件的可复用行为契约。

本文件保留核查时基线；后续逐项实现与验收状态以 [组件补齐账本](../component-completion.md) 为准，避免把历史缺口清单误当当前实现状态。

## 本地基线与比较口径

当前 [catalog](../../apps/lab/src/catalog-manifest.json) 为基础 54、复杂 15、AI 19，共 88 个组件族、614 个 Story。通过 TypeScript checker 核对了根入口的 402 个公开符号，**其中包含类型和子组件，不能当作 402 个组件**；[导出定位](../../.logs/component-gap-audit/public-exports.json)记录了声明源文件与行号。

本次检查公共导出、实际 props 和组合源码，不以名称不同判断缺失，也不把底层依赖有某项能力等同于本库已经提供完整交互。状态定义：

- **缺组件**：当前没有对应的可复用公开组件或行为组合。
- **需增强**：已有相应组件，但缺少高级行为、公共状态契约或配套示例。
- **补组合**：原语已经具备，可以增加一套组合 API / 示例，不必重新实现底层组件。
- **应用级**：较完整的业务工作面、专业套件或模板，单独评估。

本文是源码与官方文档研究，没有安装三个对照库、修改组件实现或重新运行 UI 测试。现有验证结果仍以各自的验证报告为准。

## 版本与来源

| 对照 | 本次基线 | 使用边界 |
| --- | --- | --- |
| Nuxt UI | [v4.11.0](https://github.com/nuxt/ui/releases/tag/v4.11.0)、[组件目录](https://ui.nuxt.com/docs/components/) | Vue 组件，Nuxt 可选；用于能力和组合参考。Editor、Chat、Dashboard 与营销页面的计数不能直接和本库组件族相减。 |
| PrimeReact | [11.1.0 当前目录](https://primereact.dev/components)、[v11 迁移](https://primereact.dev/docs/styled/guides/migration/updating-to-v11) | 新版本有复合 API 和组合示例；与旧 v10 的 API / 可用性分开核实。 |
| PrimeVue | [5.0.1 当前目录](https://primevue.dev/components/)、[v5 迁移](https://primevue.dev/migration/v5/) | .org 已重定向 .dev；有组件改名、弃用与 PRO 替代，不能套用旧版清单。 |

官方宣传数量与组件目录、不同呈现层的数量并不总是同一口径，因此不计算“覆盖百分比”。

三家各有值得重点借鉴的部分：**Nuxt UI** 的 Editor / Chat / Dashboard 组合；**PrimeReact** 的复合 API、表格编辑与列管理、Tree、列表转移与排序；**PrimeVue** 的 Forms、VirtualScroller、树形数据和日期时间控件。这里是面向本库的参考重点，不是对三家整体质量的排名。

PrimeReact v11 的 TreeTable 实际是 DataTable 的 `treeMode`；TreeSelect 是 Select + Tree 组合，PickList / OrderList 使用 hook + Listbox。这些交互能力真实存在，不要求同名的独立顶层组件。其迁移文档同时明确 VirtualScroller 尚未实现，因此本次虚拟化建议以 Nuxt / PrimeVue 为参考。来源：[PrimeReact DataTable](https://primereact.dev/docs/primitive/components/datatable)、[TreeTable](https://primereact.dev/docs/primitive/components/treetable)、[Select](https://primereact.dev/docs/styled/components/select)、[PickList](https://primereact.dev/docs/styled/components/picklist)、[OrderList](https://primereact.dev/docs/styled/components/orderlist)、[v11 迁移](https://primereact.dev/docs/styled/guides/migration/updating-to-v11)。

## 已有能力：不应重复建设

| 外部常见名称 | 当前对应 | 结论 |
| --- | --- | --- |
| Modal / ConfirmDialog / Drawer / Slideover | Dialog / AlertDialog / Sheet | 主要交互已有；命令式打开服务、锚点确认可以另做组合。 |
| Splitter / DashboardPanel | Resizable / WorkspacePane / ResizableWorkspace | 已有指针和键盘分栏；应用布局持久化是增强项。 |
| AutoComplete / InputMenu / SelectMenu | Combobox / MultiSelect | Base UI Combobox 直接导出，支持输入值事件、组合和多选基础；高级异步查询与虚拟化配方待补。 |
| InputNumber | NumberField | 透传 Base UI Root props，已有 locale、format、步进、边界和提交能力。 |
| PinInput / InputOtp | InputOTP | 已有。 |
| SelectButton | ToggleGroup | 已有单选/多选的同类交互。 |
| Fieldset / FormField 的布局部分 | FieldSet / FieldLegend / Field / FieldError | 子组件已经导出；不等于已有完整表单状态管理。 |
| AvatarGroup | AvatarGroup / AvatarGroupCount | 已包含在 Avatar 族；不是缺失。 |
| 多选日期 / 日期范围 / 多个月份 | Calendar | 透传 DayPicker props，不应只按单个演示的样子判断能力。 |
| ChatPrompt / ChatMessages / ChatReasoning / ChatTool | Composer / Conversation / Reasoning / ToolCall | 核心界面与状态展示已有；结构化消息适配另评估。 |
| Inplace 的文本/数字编辑场景 | PropertyList | 已有编辑、保存、取消、同步校验；通用插槽型 InlineEdit 仍可抽取。 |
| ContentNavigation / DashboardSearch | DisclosureTree / CommandSearch + 宿主组合 | 基本导航/搜索已有，文档目录联动和统一应用搜索是组合增强。 |

本地证据：[基础导出](../../packages/ui/src/primitives/index.ts)、[Avatar](../../packages/ui/src/primitives/avatar.tsx)、[Calendar](../../packages/ui/src/primitives/calendar.tsx)、[Combobox](../../packages/ui/src/primitives/combobox.tsx)、[NumberField](../../packages/ui/src/basic/number-field.tsx)、[Workspace](../../packages/ui/src/complex/workspace.tsx)。

## 基础层：值得新增的输入和展示组件

优先级是针对本库桌面工具用途的建议：P0 为公共支撑能力，P1 为高频补全，P2 为按应用需要增加。

| 候选组件 | 状态 | 需要提供的具体能力 | 参考 | 优先级 |
| --- | --- | --- | --- | --- |
| ColorPicker / ColorInput | 缺组件 | 色板、颜色文本输入、颜色格式转换、键盘操作；适合主题与标注设置 | [Nuxt](https://ui.nuxt.com/docs/components/color-picker)、[PrimeVue InputColor](https://primevue.dev/inputcolor/) | P1 |
| InputTags | 缺组件 | 创建任意标签、分隔输入、去重、数量限制、标签键盘编辑；与只能选择现有 options 的 MultiSelect 分开 | [Nuxt](https://ui.nuxt.com/docs/components/input-tags)、[PrimeVue](https://primevue.dev/inputtags/) | P1 |
| InputDate / InputTime / DateTimePicker | 缺独立组合 | 日期分段输入、时间选择、日期与时间组合、格式和范围反馈 | [Nuxt InputDate](https://ui.nuxt.com/docs/components/input-date)、[InputTime](https://ui.nuxt.com/docs/components/input-time)、[PrimeVue DatePicker](https://primevue.dev/datepicker/) | P1 |
| PasswordInput | 缺增强组件 | 显隐切换、强度/规则反馈、可访问操作按钮；普通 Input 的 password 类型仍然可用 | [PrimeVue InputPassword](https://primevue.dev/inputpassword/) | P1 |
| InputMask | 缺组件 | 电话/编号等格式输入、占位、原始值与显示值；不只拦截按键，还要处理粘贴和输入法 | [PrimeVue Mask](https://primevue.dev/mask/) | P1 |
| Listbox | 缺独立组合 | 常驻选项列表、单选/多选、搜索、富选项和虚拟化；不等同于弹出 Select | [Nuxt Listbox](https://ui.nuxt.com/docs/components/listbox)、[PrimeVue](https://primevue.dev/listbox/) | P1 |
| MeterGroup / ProgressGroup | 缺组合 | 多段占比、图例、分类用量；已有 Meter / TokenUsage 主要是单一量度 | [Nuxt ProgressGroup](https://ui.nuxt.com/docs/components/progress-group)、[PrimeVue MeterGroup](https://primevue.dev/metergroup/) | P1 |
| Rating | 缺组件 | 可读/可编辑评分、清除、键盘输入 | [Nuxt InputRating](https://ui.nuxt.com/docs/components/input-rating)、[PrimeVue Rating](https://primevue.dev/rating/) | P2 |
| Knob | 缺组件 | 旋钮式数字输入与读数；已有 Slider / NumberField 可覆盖部分使用需求 | [PrimeVue Knob](https://primevue.dev/knob/) | P2 |

SplitButton、锚点 ConfirmPopover、User 信息行、Banner、Toolbar、通用 InlineEdit 也可补，但已有 ButtonGroup / DropdownMenu / Popover / Alert / Avatar / Field 等原语，宜先做 **组合与 Playground**。FloatLabel、IftaLabel、SpeedDial、Dock、Marquee、ScrollTop 等属于风格或场景选择，优先级低于编辑、数据和表单能力。参考：[PrimeVue SplitButton](https://primevue.dev/splitbutton/)、[ConfirmPopup](https://primevue.dev/confirmpopup/)、[当前组件目录](https://primevue.dev/components/)。

## 复杂层：缺少的富功能组件

| 候选能力 | 状态 | 面向本库的用途与首批范围 | 参考 | 优先级 |
| --- | --- | --- | --- | --- |
| VirtualList / VirtualGrid | 缺组件 | 长日志、资源列表、大选项列表只渲染可见区域；保留稳定 key、滚动定位和加载边界 | [PrimeVue VirtualScroller](https://primevue.dev/virtualscroller/)、[Nuxt ScrollArea](https://ui.nuxt.com/docs/components/scroll-area) | P0 |
| Form 管理与适配层 | 缺行为层 | schema、字段状态、跨字段/异步校验、提交与重置、统一错误关联；后续再加 FieldArray 和动态配方 | [Nuxt Form](https://ui.nuxt.com/docs/components/form)、[PrimeVue Forms](https://primevue.dev/forms/) | P0 |
| RichTextEditor | 缺组件族 | Markdown/HTML/JSON 内容，工具栏、链接、列表、历史；按需接入 / 命令、@ 提及、emoji 与块拖拽 | [Nuxt Editor](https://ui.nuxt.com/docs/components/editor) | P0 |
| TreeTable | 缺组件 | 树结构与多列表格结合：层级展开、列操作、复选与部分选中；目录详情/嵌套任务可直接复用 | [PrimeVue TreeTable](https://primevue.dev/treetable/) | P1 |
| TreeSelect | 缺组件 | 在弹层中选择树节点，搜索、多选和部分选中；复用未来 Tree 状态模型 | [PrimeVue TreeSelect](https://primevue.dev/treeselect/) | P1 |
| Cascader / CascadeSelect | 缺组件 | 按层级逐步选择分类、位置或组织 | [PrimeVue CascadeSelect](https://primevue.dev/cascadeselect/) | P1 |
| PickList / Transfer | 缺组件 | 两列表搬移、搜索、批量选择、禁用项和键盘操作 | [PrimeVue PickList](https://primevue.dev/picklist/) | P1 |
| OrderList / SortableList | 缺组件 | 手动排序、拖拽、键盘调整和受控顺序；普通排序字段不等于用户重排 | [PrimeVue OrderList](https://primevue.dev/orderlist/) | P1 |
| DataView / ResourceGrid | 需补组合 | 同一集合切换列表/网格，共享搜索、选择、分页与动作；已有 ResourceList 可作基础 | [PrimeVue DataView](https://primevue.dev/dataview/) | P1 |
| ImagePreview / Gallery | 缺组件族 | 缩略图、放大预览、前后切换、加载失败反馈；AttachmentList 目前不是图片查看器 | [PrimeVue Gallery](https://primevue.dev/gallery/) | P1 |
| Carousel | 缺组件 | 可访问轮播、按钮/指示器、触摸拖动；与 Gallery 的预览用途区分 | [Nuxt Carousel](https://ui.nuxt.com/docs/components/carousel) | P2 |
| ImageCompare | 缺组件 | 图像前后对照滑块；与文本 DiffViewer 区分 | [PrimeVue Compare](https://primevue.dev/compare/) | P2 |
| OrganizationChart | 缺组件 | 组织/层级关系图；不等同于树导航或任意流程图编辑器 | [PrimeVue OrganizationChart](https://primevue.dev/organizationchart/) | P2 |
| TerminalPrompt | 缺组件 | 命令输入、历史与响应列表；现有 LogViewer 只展示日志。真实终端还需要宿主执行/PTY适配 | [PrimeVue Terminal](https://primevue.dev/terminal/) | P2 |

Nuxt Editor 的任务列表、对齐等要按扩展接入；图片上传、AI 补全也有宿主逻辑与示例边界。上述首批范围是本库建议，不代表所有参考组件内置每项能力。

## 已有复杂组件：主要增强点

| 当前组件 | 源码实际已有 | 建议补齐的库级契约与现成操作 |
| --- | --- | --- |
| **DataTable** | TanStack Table；客户端排序、全局查询、分页、跨页选择、自定义 header/cell、分组表头 | 列筛选/显隐/顺序/宽度管理、固定列、行展开/行分组、编辑与校验、导出、虚拟化；公开受控 sorting/filter/pagination 与远程数据模式。不能把现有分组表头和底层多列排序误报为缺失。 |
| **DisclosureTree** | 原生 details/summary 展开、叶节点单选、禁用叶节点 | 完整 ARIA Tree 的方向键导航、多选/复选及半选、受控展开、异步子节点与拖拽重排。保留轻量 Disclosure 用途，新增 TreeView 更清楚。 |
| **FileUpload** | 拖入/选择、类型/大小/数量检查、本地队列、删除 | 受控上传进度、开始/取消/重试、单文件错误、预览和 transport 回调。传输由宿主实现，组件统一状态与界面。 |
| **DateRangePicker** | 日期范围、日历、开始/结束日期输入、上下限、应用/取消 | 常用范围预设、时间组合、日期/时间值语义与可配置 locale；基础 Calendar 本身已能接收更多 DayPicker props。 |
| **MultiSelect / Combobox** | 可搜索、单/多选、chips、Base UI 输入事件和原语 | 异步搜索配方、创建新项、全选/分组、虚拟化和结果加载/错误契约。底层可以扩展，不等于已经有高层通用版本。 |
| **ResourceList / LogViewer** | 本地查询、筛选、排序或等级过滤、资源选择/动作、日志跟随 | 虚拟化、增量加载契约、网格视图、受控视图偏好；按使用场景逐项加入。 |
| **PropertyList / KeyValueEditor** | 文本/数字或键值编辑、验证、保存取消 | 更多字段类型、嵌套数据、跨字段校验、批量提交与异步错误；可与 Form 适配层共用。 |
| **Workspace / Sidebar** | 布局槽、侧栏、可调整分栏、独立滚动面板 | 应用级尺寸/展开状态持久化、统一搜索和布局预设；多个基础分栏能力已经透传，不从零重写。 |

本地证据：[DataTable](../../packages/ui/src/complex/data-table.tsx)、[DisclosureTree](../../packages/ui/src/complex/disclosure-tree.tsx)、[FileUpload](../../packages/ui/src/complex/file-upload.tsx)、[DateRangePicker](../../packages/ui/src/complex/date-range-picker.tsx)、[MultiSelect](../../packages/ui/src/basic/multi-select.tsx)、[ResourceList](../../packages/ui/src/complex/resource-list.tsx)、[LogViewer](../../packages/ui/src/complex/log-viewer.tsx)、[PropertyList](../../packages/ui/src/complex/property-list.tsx)。参考：[Nuxt Table](https://ui.nuxt.com/docs/components/table)、[PrimeReact DataTable](https://primereact.dev/docs/primitive/components/datatable)、[PrimeReact Tree](https://primereact.dev/docs/primitive/components/tree)、[PrimeVue DataTable](https://primevue.dev/datatable/)、[PrimeVue Tree](https://primevue.dev/tree/)、[PrimeVue FileUpload](https://primevue.dev/fileupload/)。

## AI 层：展示已经较全，重点补内容处理与组合

| 候选 | 当前差距 | 建议 |
| --- | --- | --- |
| RichMessage / MarkdownContent | Message 接收 ReactNode，默认样式处理正文；CodeBlock 只高亮代码，Markdown 语法高亮不等于渲染文档 | 统一 Markdown 的标题、列表、表格、链接与 fenced code，支持流式未完成内容和自定义节点。 |
| 结构化消息适配 | Conversation 提供滚动/角色，ToolCall、Sources、Artifact 都是独立组件 | 提供将文本/工具/引用/附件 parts 映射到现有组件的适配示例；保留宿主对状态与请求的控制。 |
| 富 Composer | 目前是字符串草稿与 toolbar/context 插槽 | 在富文本基础上加入 / 命令、@ 文件/人员、粘贴附件、结构化上下文；现有 ContextPill 可继续复用。 |
| ChatOverlay / ChatPalette | 已有 Dialog + Conversation + Composer 原语 | 补可复用组合与焦点/停止/错误演示，不重复实现整套聊天组件。 |
| 消息与日志的长列表 | 当前靠常规 DOM 与滚动区域 | 复用 VirtualList，单独验证流式更新、回到底部与动态高度。 |

参考：[Nuxt ChatMessage](https://ui.nuxt.com/docs/components/chat-message)、[ChatMessages](https://ui.nuxt.com/docs/components/chat-messages)、[ChatPalette](https://ui.nuxt.com/docs/components/chat-palette)、[EditorMentionMenu](https://ui.nuxt.com/docs/components/editor-mention-menu)、[EditorSuggestionMenu](https://ui.nuxt.com/docs/components/editor-suggestion-menu)。Nuxt ChatMessage 默认也按 text parts 显示纯文本；Markdown 是文档通过额外 Comark 依赖和 slot 接入的组合，不能写成其 ChatMessage 开箱内建能力。本地证据：[Message](../../packages/ui/src/ai/conversation.tsx)、[Composer](../../packages/ui/src/ai/composer.tsx)、[Artifact](../../packages/ui/src/ai/artifact.tsx)。

## 应用级丰富组件与当前可用性

本库还没有 **Chart、Scheduler（日/周/月排程）、TaskBoard/Kanban**。它们可以分别服务数据监控、计划与多任务工作台，但投入明显高于输入和列表控件，建议按实际应用立项。

当前 PrimeUI PRO 提供这些方向的参考，不能把 PRO 与核心组件混算：PrimeReact v11 的 Chart/Editor 已迁出核心，而 [PrimeUI PRO](https://primeuipro.dev/) 当前说明 React 版仍在开发；PrimeVue v5 的旧 Chart/Editor 仍保留但已弃用，迁移文档计划 v6 移除并推荐 PRO 替代。引入代码前按目标版本检查许可和实际可用版本。

许可出处：Nuxt UI v4.11.0 为 [MIT](https://github.com/nuxt/ui/blob/v4.11.0/LICENSE.md)；PrimeVue v5 的 [迁移说明](https://primevue.dev/migration/v5/) 已改为 Community / Commercial 双模式，不沿用历史版本全部 MIT 的假设。本次只研究 API 和交互，没有引入三个对照库的源码或资源。

PrimeVue 当前侧栏列出的 **DataGrid、Sheet、Gantt Chart、Diagram、PDF Viewer** 带 Roadmap 标记；可记为未来研究方向，不能写成已发布的成熟对标组件。真正完整的代码编辑器、PDF 阅读器和任意流程编辑器也不是现有 CodeBlock、ArtifactPanel 或 OrganizationChart 的别名。

Nuxt 的 Blog、Pricing、PageHero、Footer 等营销组合、本库也没有标准成套版本，但对当前紧凑桌面工具的优先级较低。Dashboard 与 Content 系列更适合作为 AppShell、Workspace、CommandSearch 的应用示例和配方。

## 建议的建设顺序

1. **公共能力底座**：VirtualList、Form 适配、TreeView；同时给 DataTable 暴露完整受控状态与列管理。先让已有组件能处理真实数据规模和编辑流程。
2. **内容编辑**：RichTextEditor、MarkdownContent，再把 / 命令、@ 提及与结构化消息接入 Composer / Conversation。
3. **高频补全**：InputTags、ColorPicker、日期时间输入、上传状态适配、Gallery、TreeSelect、TreeTable、PickList / SortableList。
4. **应用驱动扩展**：Charts、Kanban、Scheduler、文档浏览和其他专业工作面。

实现时保留现有 React + shadcn / Base UI + Tailwind + Graphite tokens。Vue 两家的 API 与组合是参考资料；React 能力按当前依赖体系实现或选择适合的行为引擎，再统一样式和公共 props。

每个新增组件或增强能力都应有一个可即时调 props 的 Storybook Playground，配置适用的空、忙碌、错误和禁用状态；复杂能力增加真实行为示例，例如表格编辑失败恢复、上传取消重试、树选择传播、长列表滚动和编辑器输入法。验收覆盖四种主题/密度、窄工作面及键盘操作。
