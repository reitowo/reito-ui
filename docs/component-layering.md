# 组件分层与组合契约

Reito UI 0.4 工作区按应用场景提供 **70 个基础组件族、40 个复杂组件族、20 个 AI 组件族**，共 130 族。Storybook 将核心样式、尺寸和适用状态拆为独立 stories，当前数量见[生成目录](../apps/lab/src/catalog-manifest.json)。这里按组件族计数：`Conversation / Message` 属于一个族，`MarkdownContent / RichMessage` 属于一个族，`AppShell / WorkspacePane / ResizableWorkspace / WorkspacePreset` 属于一个族；计数不等于 JavaScript 导出数量。Lab 和 Storybook 使用同一份组件源码，目录中的演示数据与交互示例单独维护。

| 需要解决的问题 | 使用层 | 发布包入口 | 这一层负责什么 |
| --- | --- | --- | --- |
| 按钮、表单字段、菜单、弹层、Tabs 等通用交互 | 基础 70 | `@reito/ui/basic` | 50 个官方 shadcn Base UI / base-nova 生成族，加 20 个本地组合族；统一主题、尺寸和必要修复。 |
| 本地数据表/树表格、筛选、层级选择、属性编辑、设置、分栏等通用工作流 | 复杂 40 | `@reito/ui/complex` | 组合基础控件，提供明确的数据、状态和回调契约。 |
| 草稿、消息、上下文、工具状态、权限选择、产物等 AI 工作面 | AI 20 | `@reito/ui/ai` | AI 场景的呈现和交互；模型请求、执行与业务状态由宿主接管。 |

`@reito/ui` 根入口同时导出三层。新页面可以按上表选择子入口，让依赖用途清晰。`basic/catalog.tsx`、`complex/catalog.tsx` 和 `ai/catalog.tsx` 供仓库 Lab 使用，不属于发布包公共 API。

所有层都消费同一份语义主题。颜色、字体和密度的主源是 [`packages/tokens/src/tokens.json`](../packages/tokens/src/tokens.json)，基础组件不再使用旧版 `components.tsx` API。常规控件保留实际 Base UI 的 `render`、受控值和组合结构；日历、命令搜索、分栏分别依赖 React DayPicker、cmdk、react-resizable-panels，静态展示组件使用普通语义元素。不能把全部基础组件都描述成 Base UI 包装器。

## 基础层：70 个组件族

基础公共入口见 [`basic.ts`](../packages/ui/src/basic.ts)。以下 50 个官方生成族按使用用途分组，导出位于 [`primitives/index.ts`](../packages/ui/src/primitives/index.ts)；后表列出 0.4 新增的 20 个本地组合族，不能将它们标为 CLI 生成源码。

| 用途 | 组件族 |
| --- | --- |
| 操作 | Button、ButtonGroup、Toggle、ToggleGroup |
| 表单 | Input、Textarea、Label、Field、InputGroup、InputOTP、Checkbox、RadioGroup、Switch、Slider、Select、NativeSelect、Combobox |
| 弹层与提示 | Dialog、AlertDialog、Sheet、Popover、HoverCard、Tooltip |
| 导航与展开 | Tabs、Accordion、Collapsible、Breadcrumb、NavigationMenu、Menubar、ContextMenu、DropdownMenu、Pagination、Sidebar |
| 数据与选择 | Table、Calendar、Command |
| 信息展示 | Alert、Avatar、Badge、Card、Empty、Item、Kbd、Progress、Skeleton、Spinner |
| 布局 | AspectRatio、Resizable、ScrollArea、Separator |

| 本地 Base UI 组合族及实际导出 | 关键契约与边界 |
| --- | --- |
| [`ToastProvider / useToastManager / createToastManager`](../packages/ui/src/basic/feedback.tsx) | 用 Provider 声明通知区域，在其范围内通过 manager 新增、更新和关闭通知。Provider 支持 `viewportLabel / viewportClassName / closeLabel`，保留 Base UI 管理器、计时和焦点语义。通知中的实际业务操作由宿主提供。 |
| [`MultiSelect`](../packages/ui/src/basic/multi-select.tsx) | 必填 `label / options`，选项使用 `value / label / disabled`；`value / onValueChange` 可受控，未受控时支持 `defaultValue`。基于 Combobox 的多值选择、过滤和 chip 移除，支持 `loading / error / description / disabled`。 |
| [`InputTags`](../packages/ui/src/basic/input-tags.tsx) | 必填 `label`；`value / onValueChange` 可受控，未受控时支持 `defaultValue`。支持分隔输入、批量粘贴、IME、本地/异步建议、异步创建、重复/数量规则、原位编辑、标签级禁用/错误、键盘 chip 导航和原生重复表单值。只允许选择既有 options 时使用 MultiSelect。 |
| [`AsyncCombobox`](../packages/ui/src/basic/async-combobox.tsx) | 必填 `label / loadOptions`；`query / onQueryChange` 与 `value / onValueChange` 分别可受控。宿主 loader 接收 AbortSignal；组件防止过期结果覆盖、呈现 idle/loading/error/empty/retry，并缓存单选标签。它不内置网络端点或业务搜索。 |
| [`AsyncMultiSelect`](../packages/ui/src/basic/async-multi-select.tsx) | 必填 `label / loadOptions`；查询和值分别受控或非受控。复用异步取消、过期保护和状态机，以 chips 呈现多值，并缓存已选标签，使远程结果翻页或过滤后仍能解析已有选择。原生表单使用重复同名值。 |
| [`ColorPicker / ColorInput`](../packages/ui/src/basic/color-picker.tsx) | 必填 `label`；文本接受 HEX/RGB/HSL 并按 `format` 规范化，支持透明度、无效草稿恢复和提交事件。ColorPicker 增加弹出/内联色板、区域、色相/透明度、RGB(A) 通道、预设和键盘路径；颜色值由宿主管理，chrome 消费共享 tokens。 |
| [`InputDate`](../packages/ui/src/basic/input-date.tsx) | 必填 `label`；值是不携带时区的本地日历日。按 locale 或显式顺序显示年月日分段，支持合法性/范围/禁用日、键盘调整、清除、Calendar 联动、提交事件与 `YYYY-MM-DD` 表单值；多选、多月和范围继续由 Calendar / DateRangePicker 负责。 |
| [`InputTime`](../packages/ui/src/basic/input-time.tsx) | 必填 `label`；使用独立 `{ hour, minute, second? }` 时间值。支持 12/24 小时显示、分钟/秒精度和步进、范围、键盘调整、清除、提交恢复及 `HH:mm[:ss]` 表单值；不创建任意日期或解释时区。 |
| [`DateTimePicker`](../packages/ui/src/basic/date-time-picker.tsx) | 必填 `label`；组合 InputDate 与 InputTime 为无时区的本地日期时间。只提交完整合法值，支持跨日边界、locale、两种小时制、分钟/秒精度及 `YYYY-MM-DDTHH:mm[:ss]` 表单值；UTC / IANA 时区转换由宿主负责。 |
| [`PasswordInput`](../packages/ui/src/basic/password-input.tsx) | 必填 `label`；在原生密码输入上增加可访问显隐、宿主规则与内联强度反馈。默认强度按规则结果计算，允许宿主替换算法或关闭反馈；转发 ref、autocomplete 与表单属性，业务错误由宿主传入。 |
| [`InputMask`](../packages/ui/src/basic/input-mask.tsx) | 必填 `label / mask`；公开 raw 值并格式化 display 值。支持数字/字母/字母数字与自定义槽位、可选尾段、粘贴、字面量删除、IME、三种未完成策略和 raw FormData；日期与数字语义校验使用专门字段。 |
| [`Listbox`](../packages/ui/src/basic/listbox.tsx) | 必填 `label / options`；常驻单选或多选列表，焦点留在列表并通过 `aria-activedescendant` 暴露活动项。支持受控选择/活动项/搜索、分组、图标与说明、禁用项、Shift 范围、批量选择、清除和重复同名 FormData；`virtual` 提供大数据窗口、远端选择定位、活动项保留与范围回调，loading/error/retry 由宿主驱动。 |
| [`NumberField`](../packages/ui/src/basic/number-field.tsx) | 必填 `label`，其余值、范围、步进、格式与提交事件采用 Base UI NumberField Root 契约。支持 `description / error / incrementLabel / decrementLabel`；宿主应允许输入过程中的 `null`，不能把空输入强制解释成 0。 |
| [`Meter`](../packages/ui/src/basic/meter.tsx) | 必填 `label`，数值与范围采用 Base UI Meter Root 契约；支持 `description / valueLabel`，`tone` 为 `default / success / warning / danger`。表示容量、配额或质量等有界测量；异步任务进度使用 Progress。 |
| [`MeterGroup / ProgressGroup`](../packages/ui/src/basic/meter-group.tsx) | 必填 `label / items`，每段有稳定 ID、标签、数值和可选说明/色调；总值由非负有限段相加。MeterGroup 表示容量、配额或分类构成，ProgressGroup 表示任务进度并支持 `indeterminate`。超额保留真实文字并将 ARIA 当前值限制在上限，零值、图例位置和隐藏图例均有明确契约。 |
| [`Rating`](../packages/ui/src/basic/rating.tsx) | 必填 `label`，`value / onValueChange` 可受控，未受控时使用 `defaultValue`；空值为 `null`。支持 1 / 0.5 / 0.25 步长、1–20 级、三档尺寸、语义色、清除、悬停预览、自定义图标、只读/禁用/必填/错误和原生 radio 表单值。赞踩等离散反馈继续使用明确动作，不自动映射为评分。 |
| [`Knob`](../packages/ui/src/basic/knob.tsx) | 必填 `label`，`value / onValueChange` 可受控，未受控时使用 `defaultValue`；支持 min/max/step、环形指针拖动、方向键/Home/End/Page 键、提交回调、三档尺寸/线宽、语义色、范围文字、格式化、只读/禁用/错误和隐藏表单值。范围输入仍使用 Slider，精确文本编辑使用 NumberField。 |

需要按钮尺寸、输入焦点、菜单键盘行为或主题修复时，先改共享 token 或对应基础组件。新增产品页面应组合已有 API；选择器的 `onValueChange`、复选框的 `onCheckedChange` 等必须按实际类型使用，不能沿用旧 API 名称。

## 复杂层：40 个组件族

公共导出见 [`complex/index.ts`](../packages/ui/src/complex/index.ts)，可交互演示见 [`complex/catalog.tsx`](../packages/ui/src/complex/catalog.tsx)。

| 组件族及实际导出 | 关键契约与边界 |
| --- | --- |
| [`OverlayProvider / useOverlay`](../packages/ui/src/complex/overlay-provider.tsx) | Provider 包围调用点；`open` 返回稳定 ID、result Promise 与 close/dismiss/patch 句柄。支持 Dialog/Sheet/AlertDialog、递归栈、焦点归还、closeAll、父层关闭与卸载收口。固定局部浮层继续使用声明式基础组件。 |
| [`InlineEdit`](../packages/ui/src/complex/inline-edit.tsx) | 必填 `label / value / onValueChange`；支持文本/数字草稿、同步校验、可取消异步 `onSubmit`、受控 editing、只读/禁用与焦点恢复。`renderDisplay / renderEditor` 可替换内容，自定义编辑器应透传可访问 inputProps。 |
| [`Toolbar`](../packages/ui/src/complex/toolbar.tsx) | 必填 `label / groups`；action/toggle 项共享稳定 ID、标签、图标、快捷键、disabled/loading 和宿主回调。`scroll` 保留全部行内动作，`menu` 按容量与 never/auto/always 优先级移动动作。行内使用 roving focus，菜单复用 Base UI 键盘和焦点恢复。 |
| [`Banner`](../packages/ui/src/complex/banner.tsx) | 必填 `title`；复用 Alert/Button，支持五种语义、单动作、关闭、受控可见性和显式 off/polite/assertive live 边界。长内容与窄容器保留操作；不用于装饰统计条。 |
| [`UserInfo`](../packages/ui/src/complex/user-info.tsx) | 必填 `name`；组合 Avatar、辅助说明、文字状态与独立动作。长字符串截断并保留 title，缺头像自动生成缩写；动作可分别 disabled/loading，整行 disabled 禁用全部动作。三档尺寸和三种表面只消费共享 tokens；导航、选择与菜单由宿主组合。 |
| [`ConfirmPopover`](../packages/ui/src/complex/confirm-popover.tsx) | 必填 `trigger / title / onConfirm`；锚点 modal Popover 提供取消、Escape、焦点循环与关闭后触发器焦点恢复。Promise 确认提供 pending、重复提交保护、失败 alert 与重试；`pending / error / open` 也可由宿主控制。长条款或需要输入的确认使用 AlertDialog。 |
| [`SplitButton`](../packages/ui/src/complex/split-button.tsx) | `label / onAction` 定义默认命令，`items` 定义稳定 ID、标签、图标、快捷键、禁用/忙碌与条目回调。整组、主按钮和菜单按钮可独立禁用；主操作、菜单内容与单条目可独立 loading。`open / onOpenChange` 可控制弹层；菜单复用 Base UI 键盘、类型查找和焦点恢复。快捷键属性只声明宿主绑定，不注册全局监听。 |
| [`DataTable`](../packages/ui/src/complex/data-table.tsx) | 泛型 `data` / `columns` 与稳定 `getRowId`；本地或 manual 远程筛选、排序、分页，类型化列筛选、列管理/固定/宽度，层级展开、详情、数据行分组/聚合，带校验和失败恢复的编辑事务，范围明确的导出请求和版本化视图偏好，以及可定位、动态测量并报告加载边界的行窗口化。所有状态、持久化、文件生成、网络和缓存均可由宿主接管。 |
| [`DisclosureTree`](../packages/ui/src/complex/disclosure-tree.tsx) | `nodes` 使用稳定 `id`、`label`、可选 `children`；`value` / `onValueChange` 控制叶节点选择，`defaultExpanded` 初始化展开目录，叶节点支持 `disabled`。使用原生 `details` / `summary`；Tab 逐项移动，Enter / Space 展开。**它不是 ARIA tree，没有树控件的方向键导航模型。** |
| [`SearchFilterBar`](../packages/ui/src/complex/search-filter-bar.tsx) | `query` / `onQueryChange` 与 `selected` / `onSelectedChange` 均受控；`filters` 定义可选条件、数量和禁用项。组件发出筛选状态，宿主负责根据状态过滤数据；`resultCount` 由宿主传入。 |
| [`DateRangePicker`](../packages/ui/src/complex/date-range-picker.tsx) | `value: DateRange \| undefined` 与 `onValueChange` 必填。日历与日期输入编辑本地草稿；“应用范围”提交，“取消”或关闭丢弃草稿，“清除”提交 `undefined`。`minDate` / `maxDate` 和开始、结束顺序参与校验。使用本地日历日期，不内置时区转换。 |
| [`DateTimeRangePicker`](../packages/ui/src/complex/date-time-range-picker.tsx) | 组合两个 `DateTimePicker`，保留可修正的起止草稿并校验完整性、顺序和全局上下限。分钟/秒精度与 12/24 小时显示共享；IANA `timeZone` 只作为显式元数据进入稳定 JSON，不在组件内换算 UTC 瞬时值。 |
| [`TreeSelect`](../packages/ui/src/complex/tree-select.tsx) | 在 Popover 中复用 TreeView / AsyncTreeView 的完整节点模型。支持可搜索的单选与三态复选、受控值/展开/查询/弹层、清除、懒加载和原生表单值；筛选只改变可见投影，不丢失隐藏选择或半选计算。 |
| [`Cascader`](../packages/ui/src/complex/cascader.tsx) | 以并列层级面板浏览任意深度的选项树，值为完整稳定 ID 路径。默认只提交叶节点，可显式允许选择分支；支持受控路径、末级/完整路径显示、lazy 子项、错误重试、清除、方向键导航和 JSON 表单值。 |
| [`TreeTable`](../packages/ui/src/complex/tree-table.tsx) | 原生 table 上的 row-focused ARIA treegrid。泛型节点用全树唯一 ID 与列渲染器；支持受控展开、单选或级联/独立三态复选、禁用分支、全选、方向键导航和折叠后的焦点回退。高级筛选、根分页与 lazy 子节点属于 TREETABLE-02。 |
| [`FileUpload`](../packages/ui/src/complex/file-upload.tsx) | `value?: QueuedFile[]` / `onValueChange` 可接管文件与 queued/uploading/success/error/canceled 状态；可选宿主 `transport` 接收 AbortSignal 与进度回调。支持本地校验、开始/取消/重试，以及默认开启的图片缩略图；失败与非图片有明确回退，移除、替换和卸载释放对象 URL。**组件不内置网络、存储或全屏图库。** |
| [`PropertyList`](../packages/ui/src/complex/property-list.tsx) | `items` 提供稳定 `key`、可选嵌套 `path` 与 `text / number / boolean / select / date` 字段。`onDraftValueChange` 报告未提交草稿，`onValueChange(key, value, path)` 只在保存后提交；复用 Field、Input、Switch 与 NativeSelect。支持上下界、自定义验证、逐项禁用/只读、Escape 取消和焦点恢复；远程保存及冲突处理由宿主提供。 |
| [`Timeline`](../packages/ui/src/complex/timeline.tsx) | `events` 包含稳定 ID、标题、说明、可选时间与内容；`status` 为 `complete / current / error / pending`。按传入顺序呈现，不自动按日期重排，也不执行事件。 |
| [`Stepper`](../packages/ui/src/complex/stepper.tsx) | 必填 `steps`、`value`；可选 `onValueChange` 控制导航。每步可设 `disabled`、`error` 和说明。允许跳步及业务验证由宿主决定；它不负责保存整个流程。 |
| [`SettingsSection / SettingsRow`](../packages/ui/src/complex/settings-section.tsx) | `SettingsSection` 提供必填 `title` 与可选 `description`、`actions`、`children`。`SettingsRow` 提供 `label`、`description` 和控件区域。行标题不会自动成为内部控件的 label，宿主仍须提供 `aria-label` 或显式 `<label>` 关联。 |
| [`AppShell / WorkspacePane / ResizableWorkspace / WorkspacePreset`](../packages/ui/src/complex/workspace.tsx) | `AppShell` 提供自由窗口区域；`WorkspacePane` 提供独立滚动区。`ResizableWorkspace` 保留水平/垂直两栏、键盘调整及受控百分比。`WorkspacePreset` 组合 navigation/workspace/inspector 三槽，在宽容器显隐辅助面板、窄容器切换单一活动面板；`useWorkspacePresetState` 独立保存显隐与当前面板，`useWorkspaceLayoutState` 继续保存 Sidebar 与基础分栏比例。 |
| [`CommandSearch / ApplicationSearch`](../packages/ui/src/complex/command-search.tsx) | `CommandSearch` 是可内嵌的分组搜索面，支持当前范围、加载/失败/重试与受控查询；命令具备稳定 ID、标签、说明、关键词、禁用项、动作标签及快捷键提示。`ApplicationSearch` 将其组合为应用级 Dialog，注册可配置的全局快捷键，处理异步动作、失败恢复与焦点归还。搜索结果、查询传输和动作副作用均由宿主注入；中文 IME 的候选确认不会触发命令。 |
| [`ContentNavigation`](../packages/ui/src/complex/content-navigation.tsx) | `sections` 提供稳定 ID、标题、说明、正文和嵌套章节；目录复用 TreeView，正文复用 WorkspacePreset 的单一滚动区。`value / onValueChange` 支持路由和滚动双向同步，并用 `reason` 区分 navigation/scroll。长标题、禁用项、空文档/章节、宽窄布局和目录显隐有明确状态；Markdown 解析、路由写入和远程内容由宿主负责。 |
| [`DiffViewer`](../packages/ui/src/complex/diff-viewer.tsx) | 必填 `hunks: DiffHunk[]`，每行由宿主明确提供 `kind`、修改前后文本及行号；`view / onViewChange` 可控制 `unified / split`。提供换行切换、局部滚动、文本增删语义和 `binary / error / emptyMessage` 状态。**组件不计算 diff，也不推断修改前后行的配对。** |
| [`LogViewer`](../packages/ui/src/complex/log-viewer.tsx) | `entries: LogEntry[]` 来自宿主，级别为 `debug / info / warning / error`。`query / levels / follow` 分别可受控；本地搜索与级别筛选，上滚暂停、明确操作恢复跟随。`onClear` 请求宿主清除数据，支持 `loading / error / disabled`。它不连接日志服务，也不执行终端命令。 |
| [`KeyValueEditor`](../packages/ui/src/complex/key-value-editor.tsx) | `value: KeyValueEntry[] / onValueChange` 必填，数组与稳定 ID 保留重复键和无效草稿。值支持 `text / number / boolean / select / date`，可带嵌套 `path`、逐项禁用/只读和验证；`onDraftValueChange` 报告键或值草稿的路径。`secret` 只遮罩文本显示，`onSubmit` 支持 Promise；组件不负责安全存储或嵌套对象写回。 |
| [`ResourceList`](../packages/ui/src/complex/resource-list.tsx) | 必填 `items: ResourceItem[]`；`query / sort / selectedIds` 分别可受控。`selectionMode` 为 `none / single / multiple`，筛选不丢失已有选择，批量全选只影响当前可选结果。支持名称或更新时间排序、行操作、`loading / error / onRetry / emptyMessage`。当前提供列表布局，行操作调用宿主，不读取或修改文件。 |
| [`OrganizationChart`](../packages/ui/src/complex/organization-chart.tsx) | `nodes` 使用全图唯一稳定 ID；支持受控/非受控单选与折叠、禁用节点、内容模板和完整 ARIA tree 方向键。宽层级只在自身容器滚动，折叠后恢复到最近可见祖先。它只呈现层级关系，不提供任意节点/边编辑、拖动或缩放。 |
| [`TerminalPrompt`](../packages/ui/src/complex/terminal-prompt.tsx) | `entries` 与 `running` 由宿主持有；草稿、历史与输出跟随可受控。支持异步 `onSubmit / onCancel`、防重复、失败保留、Escape 取消和中文 IME。组件只呈现命令交互，不执行 shell、启动进程、发送信号或连接 PTY。 |
| [`RichTextEditor`](../packages/ui/src/complex/rich-text-editor.tsx) | Tiptap schema 持有真实文档树；`format` 明确 JSON/HTML/Markdown 输入输出，`value / onValueChange` 可受控并提供三格式 snapshot。内置可裁剪的紧凑工具栏，marks、普通/任务列表、段落对齐和 Emoji 都执行真实事务；链接面恢复选区，历史按钮与原生快捷键共用撤销栈。`/` 命令在顶层行首插入结构，`@` 提及支持本地/异步筛选、取消旧查询、禁用项、键盘选择/退出和三格式序列化；组合输入期间不执行建议。顶层块可用官方 DragHandle 原生拖拽、`Alt+Shift+↑/↓` 或菜单移动，并可转换结构、删除和从同一历史栈恢复。Image 扩展支持地址与宿主上传结果的三格式序列化；上传回调接收进度和 AbortSignal。可选补全 Provider 接收 snapshot、选区与 AbortSignal，结果先进入接受/拒绝审阅面，过期文档不能写回。任务列表可由 Markdown 往返；对齐只由 JSON/HTML 保留；Emoji 节点可导出为 shortcode，但当前 Markdown 解析不会恢复节点身份。严格拒绝无效 JSON，支持空、只读、禁用和宿主/解析/扩展错误。 |

公共布局组件适合编辑器、设置页和数据页共同复用。文件目录选择哪个文件、检查器何时打开、页面路由、数据请求与保存失败后的恢复，属于产品逻辑。将这些状态留在宿主，避免把一个聊天页的布局固定成整个组件库的默认结构。

### 应用配方

[Dashboard 工作面配方](recipes/dashboard-workspace.md) 在 Storybook 中组合 Sidebar、AppShell、WorkspacePreset、DataTable、Form 与 ApplicationSearch，覆盖真实本地交互、偏好恢复和窄布局。[Content 工作面配方](recipes/content-workspace.md) 组合 ResourceView、ContentNavigation、MarkdownContent、Toolbar 与应用搜索，连接文档集合、目录、阅读和相邻操作。两者属于示例层，不新增公共 Dashboard / Content 原语，也不改变复杂层 40 个组件族的计数。

## AI 层：20 个组件族

公共导出见 [`ai/index.ts`](../packages/ui/src/ai/index.ts)，演示入口见 [`ai/catalog.tsx`](../packages/ui/src/ai/catalog.tsx)。这层没有模型客户端或后台 Agent；组件通过宿主传入的数据和回调工作。

| 组件族及实际导出 | 关键契约与边界 |
| --- | --- |
| [`Composer`](../packages/ui/src/ai/composer.tsx) | `value` / `onValueChange` 可受控，未受控时支持 `defaultValue`；必填 `onSubmit(text): void \| Promise<void>`。成功后只清除未被宿主改写的原草稿；拒绝 Promise 时保留草稿并显示错误。提交期间阻止重复发送。`running` / `onStop` 由宿主管理生成与停止，`context` / `toolbar` / `hint` 接受 ReactNode。Enter 发送、Shift + Enter 换行，IME 候选确认不发送。 |
| [`Conversation / Message`](../packages/ui/src/ai/conversation.tsx) | `Conversation` 接收 `children`、`follow`、`label`、`empty`；读者停留在底部时跟随新增内容，上滚后暂停跟随并出现“回到最新”。宿主提供容器高度和消息序列。`Message.from` 为 `user / assistant / system`，支持 `streaming`、`actions` 和 `local`；正文是 ReactNode，不自动解析 Markdown 或连接流式接口。 |
| [`Reasoning`](../packages/ui/src/ai/execution.tsx) | 展示宿主提供的过程说明，支持 `idle / running / complete`、`elapsedSeconds`、受控 `open / onOpenChange`。未传计时值时可对当前 running 状态本地计时。它不生成或获取模型内部推理。 |
| [`ToolCall`](../packages/ui/src/ai/execution.tsx) | 必填 `title` 和 `status`，状态为 `pending / running / success / error`。`variant` 为 `inline / card`，展开可受控；错误态的 `onRetry` 只调用宿主函数，不运行工具。 |
| [`PlanSteps`](../packages/ui/src/ai/execution.tsx) | `steps` 提供 ID、标题、说明及上述执行状态；可选 `onStepSelect(id)`。完成数由传入状态计算，不调度或推进步骤。 |
| [`AttachmentList`](../packages/ui/src/ai/context.tsx) | `items` 提供文件名、类型、大小说明与 `ready / uploading / error` 状态；`onRemove(id)`、`onRetry(id)` 由宿主实现。它显示元数据和状态，不选择、读取或上传实际文件。 |
| [`ContextPill`](../packages/ui/src/ai/context.tsx) | 必填 `label` 和 `children`，可选 `icon / onRemove / disabled`。显示一个上下文引用；移除只发出回调，不读取文件或修改模型上下文。 |
| [`ModelSelector`](../packages/ui/src/ai/model-selector.tsx) | `options: ModelOption[]`、`value: string \| null`、`onValueChange(string)` 必填；选项提供 `id / name / description / disabled`。`compact` 适合 composer 工具栏。模型目录、实际模型参数与可用性由宿主提供，选择本身不连接服务。 |
| [`PromptSuggestions`](../packages/ui/src/ai/context.tsx) | `items` 包含 `id / label / prompt`；`onSelect(prompt)` 返回建议文本。通常接到草稿 setter，由用户继续编辑和发送。 |
| [`Citation / Sources`](../packages/ui/src/ai/context.tsx) | `SourceItem` 提供 `id / title / href? / description?`。`Citation` 还接收 `index`；`Sources` 接收 `items`。允许 HTTP(S)、站内路径和片段链接，其余协议退回文本展示。组件不抓取网页或验证来源内容。 |
| [`PermissionRequest`](../packages/ui/src/ai/decisions.tsx) | 必填 `title / description / decision / onDecision`；`decision` 为 `pending / allowed / denied`，回调只返回允许或拒绝。**点击允许不会执行命令或授予后端权限**，宿主负责绑定准确操作、记录决定并实施授权。 |
| [`ArtifactPanel`](../packages/ui/src/ai/artifact.tsx) | `title` 与 `versions` 必填；版本提供 `id / label / status / preview / code / language / error`。`version / onVersionChange` 和 `view / onViewChange` 可受控，`onClose` 交给宿主。`preview` 是宿主提供的 ReactNode，没有沙箱，也不编译或执行 `code` 字符串。 |
| [`CodeBlock`](../packages/ui/src/ai/code-block.tsx) | 必填 `code`，可选 `language / filename / copyable / onCopy`。按语言提供真实语法高亮，保持源码与局部滚动；未知语言或超长内容回退为原样文本。默认复制使用系统剪贴板，提供失败反馈。`variant="embedded"` 用于已有产物外框，移除自身外框并保留代码文本内距。支持的语言与边界见 [复用指南](reuse-guide.md#工作区增量代码高亮)；不把语法色当作 diff。 |
| [`MarkdownContent / RichMessage`](../packages/ui/src/ai/markdown-content.tsx) | `MarkdownContent.value` 接收 CommonMark/GFM 文本，渲染标题、列表、任务、表格、链接、行内代码与 fenced code；代码块复用 `CodeBlock`。默认转义原始 HTML 并过滤危险 URL；`htmlPolicy`、元素筛选、URL 转换、remark/rehype plugins、`components` 和 `renderCodeBlock` 都是显式宿主边界。`streaming` 使用 remend 对尾部未闭合行内语法做临时补全，链接在 URL 完成前只显示文字，未闭合 fenced code 保持当前源码；`completeIncompleteMarkdown` 可关闭该处理，`streamingOptions` 调整规则，`streamKey` 在新一轮生成时明确重建文档节点。`RichMessage` 复用 `Message` 的角色、输出和操作语义，自动把 streaming 状态传给正文，并允许在 Markdown 后组合工具或产物节点。它们不请求模型、抓取链接或执行 HTML/代码。 |
| [`TokenUsage`](../packages/ui/src/ai/decisions.tsx) | `sourceLabel` 必填；`input / output / contextUsed / contextLimit` 由宿主提供。有效数值显示用量和上下文比例，未知值显示占位；不按字符数估算 token，也不查询账户额度。 |
| [`AgentTaskCard`](../packages/ui/src/ai/decisions.tsx) | 必填 `title / status`，支持执行状态和 `needs-attention`；`onOpen`、`actions`、上下文及更新时间说明由宿主提供。它是任务呈现，不启动后台任务。 |
| [`MessageActions`](../packages/ui/src/ai/message-actions.tsx) | 必填 `text` 是复制内容，不从渲染后的 DOM 提取。`onCopy / onRetry / onEdit / onFeedbackChange` 支持 Promise，操作期间防止重复提交并显示失败；`feedback` 可受控，为 `up / down / null`。未传 `onCopy` 时使用剪贴板，其余业务操作由宿主提供。 |
| [`MessageBranch`](../packages/ui/src/ai/message-branch.tsx) | 必填受控 `index / count / onIndexChange`，`index` 从 0 开始，显示时转为 1 起始。支持前后按钮、左右键、Home / End，空分支和禁用状态不切换。只选择宿主提供的版本，不创建或保存会话分支。 |
| [`TaskQueue`](../packages/ui/src/ai/task-queue.tsx) | 必填 `tasks: QueueTask[]`，状态为 `queued / running / paused / completed / failed / cancelled`。支持分组筛选，`onPause / onResume / onCancel / onRetry` 接收任务 ID 并可返回 Promise；逐任务防重复、保留错误。`onOpen` 交由宿主导航；组件不调度或运行任务。 |
| [`Checkpoint`](../packages/ui/src/ai/checkpoint.tsx) | 必填 `title / files / onRestore`，文件状态为 `added / modified / deleted`。恢复前展示确认对话框，等待宿主 Promise；失败时保留检查点与错误，成功后关闭确认。`status` 可接管 `pending / restoring / success / error`。组件不写文件，恢复范围、内容和执行由宿主定义。 |

## 两个可以直接组合的例子

以下代码使用已声明的包子入口。React 19 应用安装 `@reito/ui` 和 `@reito/tokens` 后，在应用入口导入一次示例中的两份 CSS；发布包提供预编译样式。主题与密度放在 HTML 根节点，例如 `<html data-theme="dark" data-density="compact">`，以覆盖 portal 弹层。复杂组件与 AI 组件使用同一套基础控件，不另建主题。

### 设置分组

此例保存到组件内存，包含真实受控输入、开关及保存反馈。`SettingsRow.label` 是行标题，内部控件分别提供自己的可访问名称。

```tsx
import { useState } from 'react';
import { Button, Input, Switch } from '@reito/ui/basic';
import { SettingsRow, SettingsSection } from '@reito/ui/complex';
import '@reito/tokens/css';
import '@reito/ui/styles.css';

export function WorkspaceSettings() {
  const [name, setName] = useState('Graphite');
  const [notify, setNotify] = useState(true);
  const [saved, setSaved] = useState('');

  return <div className="reito-root">
    <SettingsSection title="工作区偏好" description="本地示例"
      actions={<Button disabled={!name.trim()} onClick={() =>
        setSaved(`${name.trim()}：提醒${notify ? '开启' : '关闭'}`)
      }>保存设置</Button>}>
      <SettingsRow label="工作区名称">
        <Input aria-label="工作区名称" value={name}
          onChange={event => { setName(event.target.value); setSaved(''); }} />
      </SettingsRow>
      <SettingsRow label="完成提醒">
        <Switch aria-label="完成提醒" checked={notify}
          onCheckedChange={value => { setNotify(value); setSaved(''); }} />
      </SettingsRow>
    </SettingsSection>
    <p role="status">{saved && `此示例已保存：${saved}`}</p>
  </div>;
}
```

### Composer、上下文与模型选择

此例将建议填入草稿，允许移除或重新添加上下文，并把选中的模型 ID、上下文标识和提交文本一起交给本地回调。上下文标识是宿主数据，`ContextPill` 不读取对应文件。接入服务时，让 `onSubmit` 返回宿主请求的 Promise，并通过 `running / onStop` 接入生成与取消状态。

```tsx
import { useState } from 'react';
import { Button } from '@reito/ui/basic';
import { Composer, ContextPill, ModelSelector, PromptSuggestions,
  type ModelOption } from '@reito/ui/ai';
import '@reito/tokens/css';
import '@reito/ui/styles.css';

const models: ModelOption[] = [
  { id: 'local-demo', name: '本地演示', description: '未连接模型' },
  { id: 'unconfigured', name: '未配置服务', disabled: true },
];

export function RequestComposer() {
  const [draft, setDraft] = useState('');
  const [model, setModel] = useState('local-demo');
  const [includeGuide, setIncludeGuide] = useState(true);
  const [receipt, setReceipt] = useState('');

  return <div className="reito-root">
    <PromptSuggestions items={[
      { id: 'review', label: '检查共享样式', prompt: '检查组件的焦点与间距' },
    ]} onSelect={setDraft} />
    <Composer value={draft} onValueChange={setDraft} label="请求草稿"
      submitLabel="记录本地请求"
      context={includeGuide && <ContextPill label="design-language.md"
        onRemove={() => setIncludeGuide(false)}>design-language.md</ContextPill>}
      toolbar={<>
        <Button type="button" variant="ghost" size="sm" disabled={includeGuide}
          onClick={() => setIncludeGuide(true)}>添加规范上下文</Button>
        <ModelSelector options={models} value={model}
          onValueChange={setModel} compact />
      </>}
      onSubmit={text => {
        const contextIds = includeGuide ? ['design-language.md'] : [];
        setReceipt(JSON.stringify({ text, model, contextIds }));
      }} />
    <p role="status">{receipt ? `本地已记录：${receipt}` : '未发送外部请求'}</p>
  </div>;
}
```

需要组合数据页或工作区时，继续使用复杂层的 `AppShell`、`WorkspacePane` 和 `ResizableWorkspace`。`useWorkspaceLayoutState` 可保存本地布局偏好；账号同步、数据获取、模型认证、实际上传、执行授权、取消请求与错误恢复仍由宿主负责。

## 核对依据

本页对应 0.4 源码，组件族与 story 数量按 [生成目录](../apps/lab/src/catalog-manifest.json) 核对，API 逐项核对实际接口与 [`packages/ui/package.json`](../packages/ui/package.json) 的 `exports`。新增族应注册 catalog 与 stories，再运行 `npm run catalog:build`；`npm run check` 中的 `catalog:check` 检查漂移。两个 TSX 示例使用源码公开子入口类型检查，它们演示本地交互，不代表已经连接模型或保存服务。[Workbench](../apps/workbench/src/App.tsx) 展示 Agent、文件与差异、设置的跨层组合。完整运行与打包方法见 [reuse-guide.md](reuse-guide.md)，验证结果以该次实际运行记录为准。
