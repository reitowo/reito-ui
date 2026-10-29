# 全组件边距与操作尺寸排查

日期：2026-10-10。对象：用户标注的深色紧凑 AgentTaskCard / MessageActions，以及同一总览中的全部139个目录族。按139个族逐一记录默认状态，dark/light × compact/comfortable四组合；不代表每个组件所有变体和异步状态均完成视觉验收。

## 范围和规则

- 扫描 packages/ui/src 的视觉源码，静态候选记录 .logs/surface-action-inventory.json；最终 token 审计另覆盖341个视觉文件。
- 四组合实际DOM记录 .logs/component-geometry-{theme}-{density}.json。深色紧凑本次采样605个 Button、Toggle、Tabs、Menubar、Select 控件。关闭的浮层不在默认采样中，受影响浮层通过独立交互检查验证。
- 紧凑面板：横12 /16px、纵8 /12px。操作区上方的内分隔间隔与外层纵向内距使用同一 compact-surface-padding-y。相关内容间距仍用content-gap / content-gap-sm，不把内容gap误当作边缘padding。
- 普通操作：默认文字和图标24 /32px，13px文字、12px图标；SM文字 / 图标28 /36px、14px图标；MD32 /40px、16px图标。Toggle默认继承同一高度，Tabs/Menu触发器同高，带框Tabs外层保留嵌套内距。
- 输入框和字段选择器按form control高度；同排字段 / 操作明确匹配尺寸。代码、阅读、数据单元格、空态和拖动内容保持各自角色。

## 修复的问题

AgentTaskCard原外层四边12px、操作区pt8px，导致按钮下方与分隔线上方不同。改为外层12 /8px、操作区pt8px；舒适16 /12px和pt12px。MessageActions原icon-sm28px、16px图标，改为默认icon24px和12px图标。PermissionRequest、TokenUsage、Checkpoint、ToolCall卡片、ArtifactPanel及若干复杂浮层存在同类问题，按上述规则修复。

Composer、ModelSelector(compact)、TaskQueue和Artifact的工具栏选择器明确用XS；SM表单行继续用SM按钮 / 选择器。DataTable列管理与保存视图中的SM选择器和删除 / 移动图标动作匹配SM。Button的icon-sm图标原16px、文字sm内图标14px，现统一14px。

额外发现：TreeTable的table-expander-size在两种密度都24px，舒适模式没有跟随XS动作32px。该密度token现引用对应control-height-xs，DataTable / TreeTable共享受益，不改变折叠 / 选择逻辑。

## 有意保留的用途差异

42个自然高度 / 专用格子目标不套普通按钮高度：35个日历日期格使用cell-size；4个Kanban标题允许换行与拖动；3个Stepper步骤包含说明，按内容高度展开。测试只对这三种具体内容目标保留用途例外。既有Kanban草稿实现没有修改。

ContextPill仍为28 /36px外壳，容纳24 /32px移除动作和边框，不叠加纵向padding。表格行、编辑器、阅读区域的content / cell角色不统一压成24px或8px。Toggle / Select显式SM、MD、LG也保留；此排查没有声称所有形状必须相同。

## 逐族记录

| 层 | 组件族 | 默认状态检查 / 修复 |
| --- | --- | --- |
| basic | ScrollTop | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | OneTimeCode | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Button | SM文字 / 图标按钮的图标尺寸一致 |
| basic | Button Group | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Badge | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Input | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | InputTags | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | ColorPicker / ColorInput | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | InputDate | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | InputTime | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | DateTimePicker | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | PasswordInput | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | InputMask | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Listbox | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Textarea | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Label | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Field | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Input Group | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Checkbox | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Switch | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Radio Group | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Slider | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Toggle | 默认24 / 32px；MD保留原高度 |
| basic | Toggle Group | 继承统一Toggle；Controls新增MD |
| basic | Select | 工具栏XS与表单默认尺寸区分 |
| basic | Combobox | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | AsyncCombobox | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | AsyncMultiSelect | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Accordion | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Collapsible | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Tabs | 触发器24 / 32px；外框保留嵌套内距 |
| basic | Dialog | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Alert Dialog | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Dropdown Menu | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Context Menu | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Popover | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Tooltip | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Hover Card | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Sheet | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Card | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Alert | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Empty | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Avatar | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Skeleton | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Spinner | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Separator | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Scroll Area | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Progress | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Table | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Pagination | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Breadcrumb | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Command | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Resizable | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Calendar | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Sidebar | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Aspect Ratio | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | ImageGallery | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Carousel | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | ImageCompare | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Input OTP | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Item | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Kbd | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Native Select | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Navigation Menu | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Menubar | 菜单触发器与按钮同高 |
| basic | Toast | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | MultiSelect | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | NumberField | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Meter | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | MeterGroup / ProgressGroup | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Rating | 默认几何与尺寸规则已检查；按组件用途保留 |
| basic | Knob | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | Kanban 看板 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | Scheduler 排程 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | Chart 图表 | tooltip提示面内距 |
| complex | OverlayProvider 命令式浮层 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | InlineEdit 行内编辑 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | Toolbar 工具栏 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | Banner 通知条 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | User 信息行 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | ConfirmPopover 锚点确认 | 紧凑内距和Footer间隔；默认操作24 / 32px |
| complex | SplitButton 拆分按钮 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | Form 表单管理 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | AsyncForm 异步表单 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | VirtualList 虚拟列表 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | VirtualGrid 虚拟网格 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | TreeView 树形导航 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | AsyncTreeView 异步树 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | ReorderableTreeView 树重排 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | TreeSelect 树选择 | 浮层上下内距与Footer分隔间隔一致 |
| complex | Cascader 级联选择 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | TreeTable 树表格 | 舒适模式展开器24改32px |
| complex | Transfer 穿梭选择 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | SortableList 排序列表 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | OrganizationChart 组织结构图 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | TerminalPrompt 命令交互 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | RichTextEditor 富文本编辑 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | DataTable 数据表格 | 列、筛选、分组、视图浮层边缘和操作区；同排SM控件匹配 |
| complex | DisclosureTree 目录导航 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | SearchFilterBar 搜索筛选 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | DateRangePicker 日期范围 | 浮层上下内距与Footer分隔间隔一致 |
| complex | DateTimeRangePicker 日期时间范围 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | FileUpload 文件上传 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | PropertyList 属性编辑 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | Timeline 时间线 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | Stepper 分步流程 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | SettingsSection 设置分组 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | Workspace 工作区布局 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | CommandSearch 命令搜索 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | ContentNavigation 文档导航 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | DiffViewer 差异查看 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | LogViewer 日志查看 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | KeyValueEditor 键值编辑 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | ResourceList 资源列表 | 默认几何与尺寸规则已检查；按组件用途保留 |
| complex | ResourceView 资源视图 | 网格资源卡片内距 |
| ai | Composer | 发送、停止、工具和紧凑模型选择器同排 |
| ai | Conversation / Message | 默认几何与尺寸规则已检查；按组件用途保留 |
| ai | Reasoning | 默认几何与尺寸规则已检查；按组件用途保留 |
| ai | ToolCall | 卡片头部和展开正文横纵内距 |
| ai | PlanSteps | 默认几何与尺寸规则已检查；按组件用途保留 |
| ai | AttachmentList | 移除 / 重试动作大小一致 |
| ai | ContextPill | 默认几何与尺寸规则已检查；按组件用途保留 |
| ai | ModelSelector | compact模式XS；字段模式SM保留 |
| ai | PromptSuggestions | 建议动作与默认按钮一致 |
| ai | Citation / Sources | 默认几何与尺寸规则已检查；按组件用途保留 |
| ai | PermissionRequest | 紧凑面板内距与默认操作 |
| ai | ArtifactPanel | 标题、工具栏、内容边缘；tabs / select操作高度 |
| ai | CodeBlock | 默认几何与尺寸规则已检查；按组件用途保留 |
| ai | MarkdownContent / RichMessage | 默认几何与尺寸规则已检查；按组件用途保留 |
| ai | VirtualConversation | 默认几何与尺寸规则已检查；按组件用途保留 |
| ai | ChatPalette | 默认几何与尺寸规则已检查；按组件用途保留 |
| ai | ChatOverlay | 关闭操作高度 |
| ai | MessageParts / StructuredMessage | 默认几何与尺寸规则已检查；按组件用途保留 |
| ai | TokenUsage | 紧凑面板横纵内距 |
| ai | AgentTaskCard | 外层与操作区纵向内距相同；默认操作高度 |
| ai | MessageActions | 24 / 32px操作与12px图标 |
| ai | MessageBranch | 分支切换操作高度 |
| ai | TaskQueue | 筛选选择器使用XS工具栏大小 |
| ai | Checkpoint | 外层与确认浮层内距；负边距同步 |

## 验证与证据

图像 .logs/action-panel-{theme}-{density}.png 与 message-actions 记录用户标注区域。用户浏览器实际检查AgentTaskCard为8px 12px、动作pt8px，打开 / 标记完成按钮均24px；MessageActions按同一比例量度。对照用户附图与此前已检查的Cursor Web桌面控件，保留本库灰阶、13px字体、6px操作圆角，不复制产品资产或宣称官方token。

四组合全目录几何测试覆盖卡片外层、Footer、Toggle/Tabs/Menu以及Composer工具栏，检查所有普通Button实际高度；点击标记完成和反馈验证行为。运行时保留原来的表单、树表、焦点、无障碍和窄布局约束。详见本节最终命令结果更新。

最终结果：npm run check 和 npm run build 均退出0，git diff --check通过。Token审计341个文件、0项未批准；102组语义对比度检查通过。相关10个测试文件共117项最终通过，包含四组合目录几何、Composer、ContextPill、Tabs/Table焦点、表格列管理与筛选、结构化消息、TreeTable两组和ConfirmPopover。

首次68项回归中63通过：4项ContextPill测试仍使用旧Composer示例的design-language.md，现按当前workspace上下文更新定位与状态文案，保持删除后草稿不丢的断言，独立4项复测通过；1项列管理的清理阶段遇到并行Playwright共享test-results导致的trace文件ENOENT，改用独立输出目录后该项通过。UI量度测试另外发现舒适TreeTable展开器尺寸未跟随，修正token后全部4项与32项树表检查通过。ConfirmPopover13项和最终4项几何合计17项通过。上述失败及复测没有被隐去或计为一次全绿运行。

CI已登记192项、22文件，未声称远端执行。既有大chunk告警仍存在；本轮不发布npm或推送Git。未执行所有组件所有状态的人工检查、真实OS中文IME或实际浏览器200%缩放；窄视口和合成composition检查不能替代它们。
