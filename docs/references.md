# Graphite / 石墨：参考依据与选型记录

基础与许可检索日期：2026-09-05；视觉参考复核日期：2026-09-06。仅采用产品方、维护者和规范组织的公开来源。以下区分“已观察的界面”“已核实的能力”和“本项目设计决策”。参考图可用于本地比对，产品资产、字体文件、主题文件或受限制组件源码不进入本库的实现与分发包。

**后续源码审计与实施：**同日进一步取得 Multica 固定提交、本机 Cursor 3.19.7 的 IDE 主题与 desktop/glass CSS，以及 Claude 官方 MCP Apps 的具体样式变量。完整证据见 [源码审计总报告](research/ui-source-analysis.md)。0.3 已实施 shadcn / Base UI / Tailwind 重建；[生成来源清单](shadcn-provenance.json)记录固定 CLI 和上游修正。以下保留 0.2 的选型历史，不应把当时“未取得完整官方 token 包”解读为“完全没有任何可分析主题或公开样式变量”。

## 设计结论

本项目以 **Cursor 的紧凑工作面与清晰任务结构**为主参考，命名为原创设计语言 **Graphite / 石墨**。Claude Desktop 用于输入区、阅读空间与条件出现的产物面板参考；Multica 用于任务、属性、状态和活动流的结构参考。

0.2 的原创取舍是中性灰阶、安静的短工具栏、轻量侧栏行、可读内容流和一体 composer。默认例工程展示 Agent 工作区，组件工作台是独立工具入口；设置、表格和其他页面仍采用适合其工作的结构。普通边界柔和，焦点明确，蓝色限于焦点、链接和必要的信息强调。尺寸与当前数值见 [design-language.md](design-language.md) 和 token 源，避免多份文档各自定义一套数值。

本次检索没有取得 Cursor 或 Claude Desktop 官方发布的、允许作为个人组件库直接使用的完整 design-token 包。因此，本项目应把产品外观作为参考，把自身 tokens、组件 API、状态矩阵和布局规则作为可维护的唯一依据。

## 已实际查看的视觉参考

以下图像已打开检查，不是仅凭产品功能文字推断样式。它们覆盖不同版本与工作场景，不能组合成一份虚构的“官方统一设计规范”。

| 来源与类型 | 实际观察 | 用于 Graphite 的判断 |
| --- | --- | --- |
| [Cursor 2.0 发布文章，2025-10-29](https://cursor.com/blog/2-0) · [官方应用截图](https://cursor.com/marketing-static/_next/image?q=70&url=https%3A%2F%2Fptht05hbb1ssoooe.public.blob.vercel-storage.com%2Fassets%2Fblog%2F2-0-1.jpg&w=1920) | 浅色界面中，会话与 diff 以细线分栏；正文直接排在工作面上；composer 位于会话底部，附带模式与模型工具。 | 让任务内容、阅读与审查成为主体，减轻非必要的卡片和窗口装饰。该图不证明当前暗色主题的准确颜色。 |
| [Cursor Agents Window 文档](https://cursor.com/docs/agent/agents-window) · [官方应用截图](https://cursor.com/docs-static/_next/image?dpl=dpl_BE7JrPtMFjyJpGDLW3rL4fSbTdWR&q=75&url=%2Fdocs-static%2Fimages%2Fagent%2Fopen-editor-window-final.png&w=1920) | 图中会话、变更视图和命令弹层共同工作；上方工具栏短而克制。弹层背景变暗，因此不能从背景像素推断普通表面的颜色。 | 主任务与上下文按需组合，命令入口保留清楚的键盘语义；不把常驻三栏当作所有场景的要求。 |
| [Cursor 产品页](https://cursor.com/product) · 官网交互演示，实际渲染查看暗色 | 演示侧栏按任务状态分组，行含标题与次级状态；选中底色轻微。会话底部是 composer，右侧是产物；展示的暗色偏暖黑，蓝色使用很少。 | 参考任务行节奏与内容层级。它是营销页面中的交互演示，不是安装版桌面应用截图，更不是可直接提取的官方 tokens。 |
| [Claude Desktop 导览](https://academy.claude.com/tutorials/navigating-the-claude-desktop-app) · [Chat 官方图](https://academy.claude.com/assets/media/6fcef3fffebbdcc24dfe51c43e57196dcec0402c986c32bb803a2bd6a6fcdffc.png) | 近暖白画布、大面积留白、居中宽 composer；附件、模型与发送位于同一输入容器底部，招呼语使用衬线字。 | 吸收输入区整体性与阅读空间。默认仍遵循 Cursor 方向，不把 Claude 品牌字体、招呼语或标志推广成全库要求。 |
| 同一 Claude Desktop 导览 · [Code 官方图](https://academy.claude.com/assets/media/40fbc77a34b0790f53acda7cc3b7ed0476ac386e6ca57f6131800573f424fb32.png) | 输入下方附着仓库与环境选择；模式切换位于窗口上方。 | 上下文控件应贴近相关输入，场景不同可调整组合；不照搬点阵背景或品牌角色。 |

本次未取得可靠的 Cursor 桌面暗色截图来确认其精确色值。Graphite 的深色灰阶、浅色暖白、圆角与密度均为本项目原创选择，不使用截图采样值作为“官方 tokens”。图像优化地址可能随部署变化，失效时从关联官方页面重新取得；本地调研图放在 `.logs/references/`，不作为组件包资产。

风格确认需比对相同的工作场景：Agent 页面与任务会话比较，设置页与表单结构比较。单组件状态、构建和无障碍测试另行验证。能运行、有很多组件或通过测试，均不能代替整体视觉相似度的判断。

## 产品参考：事实与取舍

| 参考 | 已核实事实 | Graphite 的原创取舍 |
| --- | --- | --- |
| Cursor | 官方主题文档支持浅色、深色、跟随系统和主题预览；2.0 公告与 Agents Window 文档均保留任务工作面与经典 IDE 的不同入口。 | 让主题、侧栏、主工作区、辅助面板、命令入口和密度成为系统级能力；按工作内容选择组合，不把某一版本的窗口布局当作永久规范。 |
| Multica | 官网展示任务看板、属性编辑、人与 agent 的统一活动流、任务状态和运行进度。 | 采用紧凑行、属性列表、状态标签、时间线和可展开执行详情等通用模式，自己实现布局和样式。 |
| Claude Desktop | 官方 Artifacts 文档说明：独立内容在主会话右侧的专用窗口中查看、迭代、切换版本、复制或下载。 | 将阅读与操作面板分开；输入区、消息内容、产物预览各自承担明确职责。保留阅读空间，不把所有内容都压成 IDE 字号。 |

来源：[Cursor 主题与外观](https://cursor.com/help/customization/themes)、[Cursor 2.0 产品公告，2025-10-29](https://cursor.com/blog/2-0)、[Multica 产品页](https://multica.ai/)、[Claude Artifacts 官方说明](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)。

### Multica 源码的具体限制

检索时仓库的 `LICENSE` 明确是 **Multica License：Apache License 2.0 加 Part I 附加条件**，不是纯 Apache-2.0。Part I 对向第三方提供 hosted service、商业嵌入和派生 UI 的品牌保留另有条件，且明确覆盖 `apps/web/`、`packages/ui/` 等 UI 源码，以及把这些代码抽到其他包或仓库的情形。本项目不以提取 Multica UI 代码或主题文件的方式建立可独立复用的组件库。

来源：[Multica 仓库](https://github.com/multica-ai/multica)、[检索时的 LICENSE 原文](https://raw.githubusercontent.com/multica-ai/multica/main/LICENSE)。该链接指向可变主分支；以后若确实需要引入代码，应核对拟引入版本的完整许可。

## 组件基础的选择

**当前实施（本地源码核对，0.4）：**本库已采用固定 shadcn CLI 的 Base UI / `base-nova` 基础与 Tailwind 4，包含 50 个官方 CLI 生成族和 17 个本地组合族，复杂与 AI 层消费这套基础。具体来源与本地修正见 [生成来源清单](shadcn-provenance.json)；公开分层见 [组件契约](component-layering.md)。这是当前仓库实施情况，不是对以下外部文档的一次新联网复核。Radix 仍是早期评估过的候选，表中“第一版”指 0.2 阶段，不代表当前推荐迁回 Radix。

下表保留**0.2 早期候选评估与历史判断**，原来源链接不变。

| 候选 | 官方定位和已核实能力 | 适用判断 |
| --- | --- | --- |
| Radix Primitives | 无预设样式的 React 基础组件，封装复杂交互和无障碍行为；样式由使用方控制，状态可经 `data-state` 表达。MIT。 | 推荐作为第一版交互基础，在自己的组件边界内包装 Dialog、Menu、Popover、Tabs、Tooltip 等；品牌和密度由 Graphite tokens 控制。 |
| Base UI | 无样式、不携带 CSS；可组合、遵循 WAI-ARIA 模式；官方组件目录含 Combobox、Autocomplete、Number Field 等。MIT。 | 可作为另一套统一基础，尤其在复杂表单占比较高时评估。不要只为个别小组件随意混入第二套弹层/焦点体系。 |
| React Aria | 无样式的交互基础，官方强调输入方式支持、国际化、日期和数字本地化。Apache-2.0。 | 如果后续需求重心变为复杂表格、日期、选择和多语言，值得重新评估；第一版不需要同时引入所有候选。 |
| shadcn/ui | 官方定位包括开放组件源码、组合接口、registry schema 和 CLI 分发；用户取得并修改组件源码。MIT。 | 适合参考“如何分发自己的组件”，但它与 headless primitive 不在同一层。先建立一个统一包与 token 来源，避免多个项目复制后各自改出不同版本。 |

来源：[Radix Primitives](https://www.radix-ui.com/primitives)、[Radix 样式机制](https://www.radix-ui.com/primitives/docs/guides/styling)、[Radix 许可](https://raw.githubusercontent.com/radix-ui/primitives/main/LICENSE)、[Base UI 官方概览与组件目录](https://base-ui.com/react/overview/about)、[Base UI 许可](https://raw.githubusercontent.com/mui/base-ui/master/LICENSE)、[React Aria](https://react-aria.adobe.com/)、[React Aria 许可](https://raw.githubusercontent.com/adobe/react-spectrum/main/LICENSE)、[shadcn/ui 定位与分发](https://ui.shadcn.com/docs)、[shadcn/ui 许可](https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md)。

## CodeBlock 语法引擎（2026-09-06 工作区增量）

使用固定版本 `refractor@5.0.0` 的 core 与选定语言注册。Refractor 基于 Prism，输出 HAST 节点，可用于 React 等虚拟 DOM；本库仅把文本和 token span 转为 React 节点，不使用 HTML 注入。API、exports 与许可同时检查了官方 README 和安装包。源码与文档：[Refractor](https://github.com/wooorm/refractor)、[MIT 许可](https://github.com/wooorm/refractor/blob/main/license)。安装包的 license 保留 Titus Wormer 和 Lea Verou 的声明，随运行依赖分发；记录也见 `packages/ui/THIRD_PARTY_NOTICES.md`。

语法主题是本库在 `tokens.json` 定义的原创深浅色角色，没有复制 Prism、Cursor 或 Claude 的主题 CSS，也不属于这些产品的官方设计参数。

## Tokens：格式与架构分开

**已核实：**DTCG 的首个稳定版本是 2025.10，发布于 2025-10-28；格式模块定义跨工具交换 tokens 的 JSON 表达，包括类型、值、描述、组和引用。规范自己明确声明它不是 W3C Standard。

**本项目决策：**以版本化 JSON 为源，生成 CSS 自定义属性和供文档展示的数据。原始色阶/尺寸 → 语义角色 → 必要的组件级别名；业务组件优先消费语义角色。深浅主题只切换语义值，密度只切换尺寸与间距。不要仅因 JSON 使用了 `$type` / `$value` 就声称完全符合规范，构建和校验必须支持实际采用的类型与引用。

具体角色建议覆盖 canvas、panel、elevated、hover、selected、text、muted、border、focus、accent、success、warning、danger，以及 spacing、radius、typography、control-size、motion、z-index。这些名字与分层是 Graphite 的架构选择，格式规范没有替项目决定风格或组件 API。

来源：[DTCG 技术报告列表](https://www.designtokens.org/technical-reports/)、[DTCG 2025.10 Format Module](https://www.designtokens.org/tr/2025.10/format/)。

## Storybook：成为验收与复用入口

**已核实：**Storybook 的 globals、toolbar 与 decorator 可共同控制全局渲染上下文；Controls 可修改组件参数；`play` 在 story 渲染后执行交互；a11y addon 基于 axe-core，可配合测试执行，并以 `parameters.a11y.test: 'error'` 让违规导致测试失败。自动无障碍检查只覆盖部分问题，不能替代键盘和视觉检查。

**本项目决策：**Storybook 用 Foundations、Components、Patterns 等目录组织可发现的例子，具体目录以当前工程为准。toolbar 统一控制深浅主题与紧凑/舒适密度；语言内容按实际能力验证，不据此声称完整国际化。每个组件展示实际支持的默认、hover、focus-visible、active、disabled、loading、error、empty 等状态。弹层必须验证打开后焦点、Escape 关闭、焦点回到触发器；输入区验证提交、禁用与错误反馈；整页验证长中文、长文件名、小视口与 200% 缩放。

Storybook 用来逐个确认组件和状态；例工程必须直接消费同一组件包，展示完整工作流和面板组合。只做截图画廊无法证明组件可复用；只做单组件也无法证明多个面板放在一起仍有一致的间距与层级。

来源：[Toolbars & globals](https://storybook.js.org/docs/essentials/toolbars-and-globals)、[Controls](https://storybook.js.org/docs/api/doc-blocks/doc-block-controls)、[Play function](https://storybook.js.org/docs/writing-stories/play-function)、[Accessibility tests](https://storybook.js.org/docs/writing-tests/accessibility-testing)。

## 给 agent 的约束建议

以下是本项目原创工作约束，供项目 Skill 与开发说明引用：

1. 先查看已有组件、tokens、对应 story，再添加页面；已有能力优先组合。
2. 全局视觉调整只改共享 token、组件 variant 或布局原语；不要在单页写补丁覆盖。
3. 不在业务组件中新增十六进制颜色、任意阴影、孤立字号或未登记的间距。
4. 新交互组件必须有明确语义、可见键盘焦点、状态 story 和至少一个真实组合示例。
5. 紧凑度、主题、弹层容器和滚动归属由统一机制处理；中文与窄屏是正常输入。
6. Skill 负责约束与入口，自动检查负责可检测规则；不能把一份 prose Skill 当作已经执行的验证。
7. 视觉调整先实际查看参考与本地完整工作面，比较结构、灰阶、边界、字重、输入区与阅读空间。普通控件弱边界、可见焦点与准确交互分别检查。
8. 提交前报告实际执行过的构建、交互、无障碍和视觉检查，保留未验证事项；测试通过不能作为外观接近参考产品的证明。

本文件记录参考与建议，不代表这些组件、检查或能力已在工程中实现；实际完成状态以当前源码、Storybook 和验证记录为准。

## 组件能力对照（2026-09-06）

[Nuxt UI / PrimeReact / PrimeVue 缺口清单](research/component-gap-audit-2026-09-06.md)记录当前 88 个本地组件族与三家官方 API 的对应、缺少的富功能组件、已有组件的增强点和建议顺序。对照版本为 Nuxt UI 4.11.0、PrimeReact 11.1.0、PrimeVue 5.0.1；组件、组合示例、商业扩展与 roadmap 分开标注。

本次只借鉴公开 API 和交互能力，没有复制源码、样式或资源。许可来源：[Nuxt UI v4.11.0 MIT](https://github.com/nuxt/ui/blob/v4.11.0/LICENSE.md)、[PrimeReact v11 迁移与 Pro 边界](https://primereact.dev/docs/styled/guides/migration/updating-to-v11)、[PrimeVue v5 Community / Commercial 许可与迁移](https://primevue.dev/migration/v5/)。Nuxt 的 Vue 实现仅用于设计参考；不会直接作为 React 组件依赖。

## Form 行为引擎（2026-09-06 工作区增量）

新增 Form 使用固定的 `react-hook-form@7.87.0`、`@hookform/resolvers@5.9.1` 和 `@standard-schema/spec@1.1.0`，均已读取安装包 MIT 许可。`zod@4.5.4` 仅用于开发期 catalog / Storybook 演示，不在 UI 运行依赖内；消费方可选择支持 Standard Schema 的验证库。来源：[React Hook Form](https://github.com/react-hook-form/react-hook-form)、[resolvers](https://github.com/react-hook-form/resolvers)、[Standard Schema](https://github.com/standard-schema/standard-schema)、[Zod](https://github.com/colinhacks/zod)。

本库的适配器保留字段路径和输入/输出类型，将无路径 schema 错误从 RHF 会清除的 `root` 移到保留的 `_form`，并把 validator 异常转为可重试的全表单错误。对应复现和源码见 [Form 文档](components/form.md)；外观继续使用现有 Field 与 Graphite tokens。

### VirtualList · 2026-09-06

Uses @tanstack/react-virtual 3.14.10 with virtual-core 3.17.8 (MIT); versions and license read from installed packages. API reference: https://tanstack.com/virtual/latest/docs/framework/react/react-virtual and https://tanstack.com/virtual/latest/docs/api/virtualizer. The installed TypeScript APIs are authoritative where latest documentation differs. Neutral rows use this library's original tokens; no upstream CSS copied.

### VirtualGrid · 2026-09-07

Uses the same fixed TanStack Virtual packages for independent horizontal and vertical windows. Capability and visual comparison uses the grid direction example on https://primevue.dev/virtualscroller/ and the installed TanStack `horizontal` API. Reito UI adds original Graphite tokens, ARIA grid structure and keyboard activity; no upstream CSS or example source copied.

### TreeView · 2026-09-07

Behavior follows the W3C WAI-ARIA APG Tree View Pattern at https://www.w3.org/WAI/ARIA/apg/patterns/treeview/. Capability and light documentation-surface comparison uses PrimeVue 5 Tree at https://primevue.dev/tree/, including Basic, Controlled, Checkbox and Accessibility sections. TREE-02 adds an original tri-state normalization model, disabled cascade barriers, range selection and batch selection. Reito UI keeps its own compact Graphite rows and implements the React state/keyboard model locally; no PrimeVue source, CSS or assets copied.

### AsyncTreeView · 2026-09-07

Capability comparison uses PrimeVue 5 Tree Lazy at https://primevue.dev/tree/ and Nuxt UI Tree documentation at https://ui.nuxt.com/docs/components/tree. Reito UI composes its own TreeView with AbortController cancellation, refresh keys, request-identity stale guards and node-level status controls; no upstream source, CSS or assets copied.

### ReorderableTreeView · 2026-09-07

Capability comparison uses the DragDrop and Multiple sections of PrimeVue 5 Tree at https://primevue.dev/tree/. Reito UI adds original controlled move helpers, scope matching, cycle and disabled-target guards, native pointer drop zones, Alt+Arrow equivalents and focus restoration; no upstream source, CSS or assets copied.

### DataTable 受控远程状态 · 2026-09-07

行为引擎使用固定的 `@tanstack/react-table@8.21.3`（MIT，许可已从安装包读取）。官方分页文档明确 manual pagination 接收已经分页的数据，并需要 `rowCount` 或 `pageCount` 得知远程总量；排序文档要求客户端/服务端筛选、排序和分页保持一致，受控排序通过 state 与回调交给宿主；行选择文档说明受控 selection 可以保留当前 `data` 中不存在的稳定 ID。来源：[Pagination Guide](https://tanstack.com/table/v8/docs/guide/pagination)、[Sorting Guide](https://tanstack.com/table/v8/docs/guide/sorting)、[Row Selection Guide](https://tanstack.com/table/v8/docs/guide/row-selection)。

Reito UI 用单一 `manual` 边界统一这三项远程处理，并新增本地/受控双模式、筛选与排序回到第 1 页、跨页选择计数和当前页全选范围。Graphite 的紧凑表格布局、状态文案、Story 和宿主契约均为本项目实现；未复制 TanStack、PrimeReact 或 PrimeVue 的 CSS、示例源码或资源。

### DataTable 列筛选 · 2026-09-07

TanStack Table v8 的 [Column Filtering Guide](https://tanstack.com/table/v8/docs/guide/column-filtering) 定义了多列筛选状态、受控回调、manual server-side filtering 和列级 filter functions；安装版本 8.21.3 的类型与 API 已同时核对。PrimeVue 5 [DataTable Filter](https://primevue.dev/datatable/) 用 filter model 和自定义 editor 支持行内/菜单两种表现、匹配方式、清除/应用与远程 lazy 数据，作为能力范围和轻色表面视觉参考。

Reito UI 选择紧凑表头菜单，公开自己的 `text` / `select` / `number` / `date` 判别联合与稳定 JSON 子句。不同列是 AND，同列枚举值是 OR，区间包含端点；网络、数据库表达式和时区解释留给宿主。没有复制参考实现的源码、CSS、模板或资源。

### DataTable 列管理 · 2026-09-07

实现核对 TanStack Table v8 的 [Visibility](https://tanstack.com/table/v8/docs/guide/column-visibility)、[Ordering](https://tanstack.com/table/v8/docs/guide/column-ordering)、[Sizing](https://tanstack.com/table/v8/docs/guide/column-sizing) 与 [Pinning](https://tanstack.com/table/v8/docs/guide/column-pinning) 状态/API。Reito UI 用原有 Graphite tokens 实现管理菜单、sticky 单表布局、指针 separator 和键盘操作；未复制上游示例代码或 CSS。

### DataTable 行展开与分组 · 2026-09-07

实现核对 TanStack Table v8 的 [Expanding Guide](https://tanstack.com/table/v8/docs/guide/expanding) 与 [Grouping Guide](https://tanstack.com/table/v8/docs/guide/grouping)：展开状态是 `true | Record<rowId, boolean>`，层级数据由 `getSubRows` 提供，自定义详情可通过 `getRowCanExpand` 开放；行分组由有序字段数组、grouped/aggregated/placeholder 单元格状态与列聚合函数组成。Reito UI 在此行为引擎上实现自己的紧凑菜单、组头/汇总插槽、稳定叶行选择和 Graphite 样式；未复制上游示例代码、CSS 或资源。

### DataTable 单元格与行编辑 · 2026-09-07

能力范围核对 PrimeVue 5 [DataTable Editing](https://primevue.dev/datatable/) 的 cell / row 两种模式、editor 插槽、完成/保存事件、稳定 dataKey 与行编辑按钮可访问名称。Reito UI 实现独立的 React 草稿事务：同步列校验、异步宿主提交、失败保留与重试、受控草稿、IME 保护和焦点归还；数据成功写回仍由宿主负责。编辑器复用本库 Input / NativeSelect 与 Graphite tokens，没有复制上游源码、CSS、模板或资源。

### DataTable 导出与视图偏好 · 2026-09-07

状态边界核对 TanStack Table v8 [Fully Controlled](https://tanstack.com/table/v8/docs/framework/react/examples/fully-controlled) 示例：table state 可由宿主统一接管，再从该状态派生行为。导出能力范围核对 PrimeVue 5 [DataTable](https://primevue.dev/datatable/) 的 CSV 导出与表格状态能力。Reito UI 不复制实现，而是公开带范围、格式、可见列、稳定 ID、查询和远程数据标记的宿主请求，并定义带 schema 版本和列兼容校验的原创视图快照；组件不访问 DOM、localStorage 或网络。

### DataTable 行虚拟化 · 2026-09-07

实现核对 TanStack Virtual [Virtualizer API](https://tanstack.com/virtual/latest/docs/api/virtualizer)：总量、滚动元素、估算尺寸、稳定 item key、overscan、动态 `measureElement`、可见范围与 `scrollToIndex` 构成虚拟窗口契约；安装版本 3.13.23 的类型和运行时也已核对。PrimeVue 5 [DataTable Virtual Scroll](https://primevue.dev/datatable/) 作为表格大数据、lazy 页边界与固定列组合的能力范围参考。Reito UI 复用自己的 Table 行模型、Graphite tokens 与固定列规则，公开稳定行 ID 定位和范围回调，并把详情/汇总作为独立测量项；未复制上游示例源码、CSS、模板或资源。

### InputTags · 2026-09-07

能力范围核对 Nuxt UI 4 [InputTags](https://ui.nuxt.com/docs/components/input-tags) 的任意标签、分隔符、重复值、数量上限与拖放/删除方向，以及 PrimeVue 3 [Chips](https://v3.primevue.org/chips/) 的受控数组、分隔输入、模板与键盘说明。Reito UI 实现独立的 React 受控/非受控契约、三种去重策略、批量粘贴、IME、原位编辑、标签级状态、删除焦点恢复、原生重复表单值和 Graphite 紧凑 tokens；未复制上游源码、CSS、模板或资源。

TAGS-02 的建议查询复用本库 AsyncCombobox 的 AbortSignal / 请求序号状态机，并按 Base UI [Combobox](https://base-ui.com/react/components/combobox) 的输入、listbox 和活动项语义实现可选弹层；异步创建保持宿主回调边界。它不是 Nuxt 或 PrimeVue 组件的 React 移植。

### AsyncCombobox · 2026-09-07

能力范围核对 Nuxt UI 4 [SelectMenu](https://ui.nuxt.com/docs/components/select-menu) 的可搜索高级选择器、PrimeVue [AutoComplete](https://v3.primevue.org/autocomplete/) 的 suggestions / complete 查询边界，以及当前安装 Base UI 1.8 的 [Combobox](https://base-ui.com/react/components/combobox) 受控输入、筛选和键盘契约。Reito UI 把数据获取留给宿主 `loadOptions`，本地实现 AbortSignal 取消、请求序号保护、重试、状态呈现和标签缓存；未复制上游源码、CSS、模板或资源。

### AsyncMultiSelect · 2026-09-07

能力范围继续核对 Nuxt UI 4 [SelectMenu](https://ui.nuxt.com/docs/components/select-menu) 的 multiple / searchable 组合、PrimeVue 3 [AutoComplete Multiple](https://v3.primevue.org/autocomplete/) 的多值 chips 与查询建议，以及 Base UI [Combobox](https://base-ui.com/react/components/combobox) 的 multiple、Chips、Value 和原生表单契约。Reito UI 与 AsyncCombobox 共享原创请求状态机，另行实现受控多值、选择后查询清空、已选标签生命周期缓存和紧凑 Graphite chips；未复制上游源码、CSS、模板或资源。

SELECT-02 继续核对 Nuxt UI 4 [SelectMenu](https://ui.nuxt.com/docs/components/select-menu) 的可搜索多选与创建定位、PrimeVue 5 [MultiSelect](https://primevue.org/multiselect/) 的分组、全选/半选、禁用选项和 header/footer 批量动作，以及 PrimeReact [MultiSelect](https://primereact.org/multiselect/) 的 grouped / optionDisabled / selectAll 能力边界。Reito UI 定义自己的扁平 `group` 选项模型、当前结果范围、禁用值保留规则和宿主创建回调，并复用 Base UI Combobox 语义与 Graphite tokens；未复制上游源码、CSS、模板或资源。

SELECT-03 核对 Base UI 1.8 [Combobox](https://base-ui.com/react/components/combobox) 的 `virtualized`、外部筛选窗口与已选记录保留规则，TanStack Virtual [Virtualizer API](https://tanstack.com/virtual/latest/docs/api/virtualizer) 的稳定 key、overscan、`rangeExtractor`、`scrollToIndex`、动态 `measureElement` 和滚动位置校正，以及 PrimeVue 5 [MultiSelect](https://primevue.org/multiselect/) 的大集合 virtual scroller 能力范围。Reito UI 把活动项保持在实际渲染范围，用可变 DOM 高度校正滚动锚点，并将增量请求、取消、过期响应隔离与重试定义为宿主 API；未复制上游源码、CSS、模板或资源。

### ColorPicker / ColorInput · 2026-09-07

能力范围核对 Nuxt UI [ColorPicker](https://ui.nuxt.com/docs/components/color-picker) 的表单选择器定位，以及 PrimeVue [ColorPicker](https://v3.primevue.org/colorpicker/) 的受控值、弹出/内联模式和 HEX/RGB/HSB 格式。Reito UI 实现独立 React 契约，选择 HEX/RGB/HSL 文本输出，并增加无效草稿恢复、透明度边界、可见 RGB(A) 通道、预设、原生表单值和提交事件。颜色空间端点与色相渐变进入本库 token 源；未复制上游源码、CSS、模板或资源。

### InputDate · 2026-09-07

能力范围核对 Nuxt UI [InputDate](https://ui.nuxt.com/docs/components/input-date) 的分段日期输入定位、PrimeVue 3 [Calendar](https://v3.primevue.org/calendar/) 的受控值、格式、locale、手工输入与日期上下限，以及 Base UI [Input](https://base-ui.com/react/components/input) 的可访问名称要求。Reito UI 实现独立的本地日历日 React 契约、locale 顺序推导、提交值恢复、范围/禁用日校验、分段键盘操作、Calendar 联动和 `YYYY-MM-DD` 表单序列化；未复制上游源码、CSS、模板或资源。

### InputTime · 2026-09-07

能力范围核对 Nuxt UI [InputTime](https://ui.nuxt.com/docs/components/input-time) 的专用时间输入定位，以及 PrimeVue 5 [DatePicker Time](https://primevue.dev/datepicker/#time) 的 timeOnly、12/24 小时格式和时间微调按钮可访问名称。Reito UI 使用独立的纯时间对象、分段输入、步进/范围状态机、AM/PM 映射和稳定表单值；没有复制上游源码、CSS、模板或资源。

### DateTimePicker · 2026-09-07

能力范围核对 Nuxt UI [InputDate](https://ui.nuxt.com/docs/components/input-date) 与 [InputTime](https://ui.nuxt.com/docs/components/input-time) 的专用分段字段，以及 PrimeVue 5 [DatePicker](https://primevue.dev/datepicker/) 的 `showTime`、`hourFormat`、日期上下限和输入可访问性。Reito UI 直接组合自己的 InputDate / InputTime 状态机，公开无时区的本地日期时间对象、跨日边界、完整值提交和稳定表单文本；未复制上游源码、CSS、模板或资源。

### DateRangePicker 预设与 locale · 2026-09-07

DATERANGE-01 核对 Nuxt UI [Calendar](https://ui.nuxt.com/docs/components/calendar) 的 range 选择定位、PrimeVue 5 [DatePicker](https://primevue.dev/datepicker/) 的 range / locale / minDate / maxDate 能力，以及 React DayPicker [Range Mode](https://daypicker.dev/selections/range-mode) 和 [PropsBase locale](https://daypicker.dev/api/react/interfaces/PropsBase) 的范围、禁用日与本地化契约。Reito UI 定义自己的预设回调、超界禁用、草稿提交和可替换格式/文案 API，保留现有清除语义与 Graphite tokens；未复制上游源码、CSS、模板或资源。

### PasswordInput · 2026-09-07

能力范围核对 PrimeVue 3 [Password](https://v3.primevue.org/password/) 的强度、显隐、可替换反馈和 `aria-live` 说明，以及 Base UI [Input](https://base-ui.com/react/components/input) 与 [Forms](https://base-ui.com/react/handbook/forms) 的可访问名称、描述、错误和 ref 要求。Reito UI 使用宿主传入的规则与强度算法，保留原生 password、autocomplete 和 FormData 语义；未复制上游源码、CSS、模板或资源。

### InputMask · 2026-09-07

能力范围核对 PrimeVue 3 [InputMask](https://v3.primevue.org/inputmask/) 的 `9 / a / *` 槽位、格式字面量、`?` 可选尾段、slot placeholder、未完成值策略与原生输入可访问名称。Reito UI 公开独立 raw/display 值与三个格式工具，实现 React 受控/非受控状态、格式化粘贴、格式符删除、光标恢复、Unicode composition 和 raw FormData；未复制上游源码、CSS、模板或资源。

### Listbox · 2026-09-07

能力范围核对 Nuxt UI 4 [Listbox](https://ui.nuxt.com/docs/components/listbox) 与 PrimeVue 5 [Listbox](https://primevue.org/listbox/) 的常驻单/多选、分组、搜索、禁用、模板化选项和虚拟滚动；键盘与焦点语义按 W3C WAI-ARIA APG [Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) 实现。窗口化复用已安装 TanStack Virtual 的 [Virtualizer API](https://tanstack.com/virtual/latest/docs/api/virtualizer)，保留活动索引并公开渲染/可见范围。Reito UI 使用独立 React 状态、`aria-activedescendant`、Shift 连选、批量选择、受控活动项、重复表单值、宿主加载边界与 Graphite 紧凑 tokens；富选项不允许嵌入交互控件，未复制上游源码、CSS、模板或资源。

### MeterGroup / ProgressGroup · 2026-09-07

能力范围核对 PrimeVue 5 [MeterGroup](https://primevue.org/metergroup/) 的多段测量、标签模板与 meter 语义，以及 Nuxt UI [ProgressGroup](https://ui.nuxt.com/docs/components/progress-group) 的多段任务进度定位。范围属性按 W3C WAI-ARIA APG [Range-Related Properties](https://www.w3.org/WAI/ARIA/apg/practices/range-related-properties/) 和 [Meter Example](https://www.w3.org/WAI/ARIA/apg/patterns/meter/examples/meter/) 处理：测量量始终提供当前值，不确定任务进度可以省略当前值。Reito UI 使用独立 React 结构、Graphite tokens、可读图例、零值与超额反馈；没有复制上游源码、CSS、模板或资源。

### Rating · 2026-09-07

能力范围核对 Nuxt UI [InputRating 发布说明](https://github.com/nuxt/ui/releases) 的步长、长度、清除、悬停预览和自定义图标，以及 PrimeVue 5 [Rating](https://primevue.dev/rating/) 的半星、受控值、级数、只读/禁用、表单与原生 radio 键盘模型。Reito UI 采用独立 React 受控/非受控状态、隐藏原生 radio 选项、Graphite 三档尺寸和语义色；没有复制上游源码、CSS、模板或资源。横向评分是组件契约，纵向展示由宿主布局组合。

### Knob · 2026-09-07

能力范围核对 PrimeVue 5 [Knob](https://primevue.dev/knob/) 的受控值、min/max/step、格式化、尺寸、轨道、颜色、外部控制、只读/禁用、表单和 slider 键盘模型。Reito UI 实现独立 React 环形指针映射与 270° SVG 轨道，提供 Graphite 三档尺寸/线宽和语义色；没有复制上游源码、CSS、模板或资源。Slider 继续负责线性单值/范围，NumberField 负责精确文本编辑。
