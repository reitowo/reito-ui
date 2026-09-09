# 剩余组件评估 · 2026-09-09

后续执行更新：ScrollTop 已按此评估进入独立建设项 BASIC-SCROLLTOP-01，并完成[验收](../validation-scroll-top.md)。下文保留作出选型时的评估记录，“尚未实现”描述的是该时点；最新交付状态以组件补齐账本为准。四项专业工作面继续延期。

本次完成 15 项书面评估，不代表新增 15 个组件。按用户最新要求，Kanban、代码编辑器、PDF 阅读器、流程图编辑器暂停建设，保留现有代码且不记为交付完成。建议下一项只建设 ScrollTop；以下成本是基于现有源码的相对工程判断，不是工期承诺。

## 交互组件

| ID | 结论 | 官方能力与现有覆盖 | 成本、理由与重新启动条件 |
| --- | --- | --- | --- |
| EVAL-FLOATLABEL-01 | 不采用为默认组件 | [FloatLabel](https://primevue.dev/floatlabel/) 提供浮动标签及 over/in/on 位置；本库 Field 已有 vertical/horizontal/responsive 和独立 Label、错误内容 | 中：需要统一空值、自动填充、焦点、选择器、长中文标签等状态。当前固定标签更适合快速扫描；如实际消费表单明确需要浮动标签再立项，不声称 Field 已等价实现浮动效果。 |
| EVAL-IFTALABEL-01 | 延期 | [IftaLabel](https://primevue.dev/iftalabel/) 把标签放在输入框内部顶部；Field 的标签在控件外 | 中：两行内容会挤占紧凑控件高度。将来有触摸表单或舒适密度表单时，用 Input/Select/日期控件一起验证长中文、错误、缩放后再采用。 |
| EVAL-SPEEDDIAL-01 | 不采用为通用组件 | [SpeedDial](https://primevue.dev/speeddial/) 是展开相关动作的浮动菜单，支持直线及环形布局；本库 SplitButton、Toolbar、DropdownMenu 提供动作入口 | 中：额外处理弹出方向、边缘碰撞、触摸和焦点返回。当前桌面动作可直接命名显示。未来画布触摸操作有需求时重评；现有菜单不是环形菜单的实现。 |
| EVAL-DOCK-01 | 延期 | [Dock](https://primevue.dev/dock/) 是可定位到四边的菜单导航，包含方向键；本库 Sidebar 和 Toolbar 覆盖常用导航/动作组织 | 中：需补选中状态、图标标签、触摸目标及窄布局，不能直接把横向 Toolbar 宣称为 Dock。多应用启动器需求明确后作为应用配方。 |
| EVAL-MARQUEE-01 | 不采用为桌面默认组件 | [Nuxt Marquee](https://ui.nuxt.com/docs/components/marquee) 提供连续滚动、反向、方向、重复及悬停暂停 | 中：持续运动会打断阅读，悬停暂停不能覆盖键盘和触摸。未来展示墙有明确需求时才建设，必须有显式暂停、焦点暂停、reduced-motion 静态回退及避免重复朗读。 |
| EVAL-SCROLLTOP-01 | 建议采用，建设待开始 | [ScrollTop](https://primevue.dev/scrolltop/) 支持窗口/父容器和阈值；本库 ContentNavigation 已有章节滚动，Conversation 是回到底部，均不是通用返回顶部 | 低至中：复用 Button，明确目标滚动容器、阈值、平滑滚动与 reduced-motion、焦点去向。独立面板只滚自己的内容，避免全局 window 假设。下一步验收见下节。 |

### ScrollTop 建设边界（尚未实现）

- 公共组件显式接收窗口或元素目标，目标更换/卸载正确清理监听；默认阈值来自 token 或受管理 metrics，允许宿主覆盖。
- 越过阈值显示；内容缩短、尺寸变化、无溢出和目标不存在时不留下无效操作。
- 原生按钮支持 Enter/Space、标签、disabled；激活后焦点转到可指定的顶部目标，避免按钮隐藏导致焦点丢失。不开自动滚动跟随。
- 支持 reduced-motion；多个面板独立，嵌套滚动不串扰。虚拟列表必须通过其公开滚动接口，不能保证未渲染内容的 DOM 定位。
- Storybook 同页 Controls：目标、阈值、行为、禁用；窗口、面板、双面板、短内容、动态内容示例。验证四种主题密度、键盘焦点、窄布局、监听清理及 check/build，再记建设完成。

## 网站组合

| ID | 结论 | 官方能力与可复用部分 | 成本及启动条件 |
| --- | --- | --- | --- |
| EVAL-BLOG-01 | 延期，优先作为配方 | [BlogPost](https://ui.nuxt.com/docs/components/blog-post) 组织文章标题、摘要、图片、日期、作者；本库 ResourceView、ContentNavigation、MarkdownContent 和 ContentRecipe 可复用列表与阅读 | 中：缺公开文章路由、发布元数据和站点语义。出现博客/更新日志站点时补配方；现有文档工作面不算博客成品。 |
| EVAL-PRICING-01 | 延期 | [PricingPlan](https://ui.nuxt.com/docs/components/pricing-plan) 组织价格、周期、特性和动作；可组合 Card、Badge、Button、Tabs/Table | 中：等待真实套餐/币种/计费周期数据。定价展示和支付、权益校验分别由展示层和宿主负责，不能拿虚构套餐当真实商业集成。 |
| EVAL-HERO-01 | 延期，站点配方 | [PageHero](https://ui.nuxt.com/docs/components/page-hero) 组织标题、描述、链接和内容插槽；现有文字、Button 与布局可复用 | 低至中：有落地页需求再建设响应式图文和动作组合；不修改桌面工作区标题默认高度，不引入品牌资产。 |
| EVAL-FOOTER-01 | 延期，站点配方 | [Footer](https://ui.nuxt.com/docs/components/footer) 提供响应式站点链接及法律信息区域；可复用 NavigationMenu、Separator 与原生 footer | 低：等待实际站点信息架构，处理链接组、长中文、键盘和窄布局。桌面状态栏用途不同，不能算覆盖。 |

## PRO 专业能力

本次重新核对 [PrimeUI PRO 官网](https://primeuipro.dev/)：官网已声明 Angular、Vue、React 可用，展示首批 Scheduler、Task Board、Text Editor、Charts。此前报告的“React 仍在开发”已过时。React 文档入口本轮 web 抓取失败，因此这里只确认官网声明，没有确认具体 npm 版本或安装成功。

[PrimeVue 当前导航](https://primevue.dev/iftalabel/) 仍将以下五项列为 Roadmap；[v5 迁移说明](https://primevue.dev/migration/v5/) 也将 Diagram、DataGrid、Gantt、PDF Viewer 列为 roadmap。官网显示未来方向不能证明单项 React 包、稳定 API 或授权已可用。未获得这五项的具体发布版本及可审阅授权合同，本轮不选入依赖、不采购。PrimeVue v5 已说明 Community/Commercial 双模式，不能沿用旧版本 MIT 推断 PRO 授权。

| ID | 决策 | 相对现有库的真正新增范围 | 成本与重新评估条件 |
| --- | --- | --- | --- |
| EVAL-PRO-DATAGRID-01 | 延期选型 | DataTable 已有 TABLE-01～07 的筛选、编辑、导出、偏好及虚拟化；跨单元格选区、剪贴板或高级分析仍需单独界定 | 高：只有业务需求超出已验收 Table 合同，且目标 React 版本/API/许可可核验，才做替换成本及数据兼容验证。 |
| EVAL-PRO-SHEET-01 | 延期 | 公式依赖、单元格类型、区域选择、填充和工作簿模型；现有 DataTable 不提供电子表格引擎 | 很高：先有实际工作簿场景，再验证公式语义、导入导出保真、性能、撤销及许可；不先包装 Table。 |
| EVAL-PRO-GANTT-01 | 延期 | 任务依赖、约束、关键路径、资源和时间轴；现有 Scheduler 的事件日历不是项目排程计算 | 很高：项目计划需求明确、目标实现已发布后核对数据/时区/依赖算法与编辑回滚。 |
| EVAL-PRO-DIAGRAM-01 | 延期，随 APP-DIAGRAM-01 | 任意节点/连线编辑、校验、序列化、撤销；OrganizationChart 仅展示层级 | 高：用户已暂停流程图建设。恢复时此项只提供选型证据，不重复计算交付，也不因 Vue 展示页推断 React API。 |
| EVAL-PRO-PDF-01 | 延期，随 APP-PDF-01 | PDF 文档引擎、文本层、检索、分页与资源管理；ArtifactPanel 只是容器 | 高：用户已暂停 PDF 建设。恢复时核对目标引擎、版本、worker、字体/文件加载和许可；此评估不等于阅读器实现。 |

## 本地核对与验证范围

已读 Field、Toolbar、ContentNavigation、Conversation 源码及 ContentRecipe 的 ResourceView/MarkdownContent 组合；建设能力参考逐项验收账本及对应源码入口。本次修改仅研究文档和状态，不改变组件视觉/API，不新增依赖，没有新增 Story。文档核对包括 15 个 EVAL ID 唯一覆盖、4 个 APP 项延期和相对文件链接；不将之前 Kanban 的测试或构建作为本次交付证明。

结论：15 项评估完成，其中 ScrollTop 建议采用但仍需建设验收，其余按上述条件保留。四项暂停建设没有被计为完成。
