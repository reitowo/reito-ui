# 组件补齐进度账本

基线：[2026-09-06 组件能力对照](research/component-gap-audit-2026-09-06.md)。本账本跟踪该报告的新增组件、已有增强、AI 适配、组合与应用候选；不按组件宣传数量计覆盖率。更新日期：2026-09-07。

共 **103 个稳定验收/评估项**：88 个建设验收项、15 个后续评估项；**67 项完成，0 项进行中，36 项待完成**。这些项不是组件数量，单个组件的高级能力会分项验收。`FORM-01`–`FORM-04`、`VIRT-01`–`VIRT-03`、`TREE-01`–`TREE-04`、`TABLE-01`–`TABLE-07`、`TAGS-01`–`TAGS-02`、`SELECT-01`–`SELECT-03`、`COLOR-01`、`DATE-01`、`TIME-01`、`DATETIME-01`、`DATERANGE-01`–`DATERANGE-02`、`PASSWORD-01`、`MASK-01`、`LISTBOX-01`–`LISTBOX-02`、`METERGROUP-01`、`RATING-01`、`KNOB-01`、`TREESELECT-01`、`CASCADER-01`、`TREETABLE-01`–`TREETABLE-02`、`TRANSFER-01`、`SORTABLE-01`、`RESOURCE-01`–`RESOURCE-02`、`LOG-01`、`UPLOAD-01`–`UPLOAD-02`、`PROPERTIES-01`–`PROPERTIES-02`、`GALLERY-01`–`GALLERY-02`、`CAROUSEL-01`、`COMPARE-01`、`ORGCHART-01`、`TERMINAL-01`、`EDIT-01`–`EDIT-06`、`MARKDOWN-01`–`MARKDOWN-02`、`COMBO-SPLIT-01`、`COMBO-CONFIRM-01`、`COMBO-USER-01` 与 `COMBO-BANNER-01` 已完成，下一项为 `COMBO-TOOLBAR-01`。阶段表示依赖顺序，不表示已承诺的发布日期；应用级与后续评估项需形成明确范围后再实施。

## 维护与完成规则

- ID 创建后保留；调整顺序、阶段或名称时不重编号。合并/取消须保留原行并写明原因与承接 ID，避免遗失范围。
- 表中 `Story` 的 `待关联`、`证据` 的 `待记录` 都是占位，不是完成证据。复用现有 Story 时填写实际 Story ID / 链接与覆盖的交互；实现证据填写公开导出、源码、测试和验证报告路径。
- 每项只有在自己的验收边界和以下共同门槛均满足后才能标完成。一个组件有多个 ID 时，完成基础项不代表高级项完成；有界首版不能宣称已完整对齐参考库。
- 每个交付组件/增强提供可调 props 的 Playground；适用的空、加载、错误、禁用、只读状态及受控使用示例必须可发现。覆盖深/浅主题 × 紧凑/舒适密度、窄工作面、键盘、焦点和适用的中文 IME。
- 遵循 React + Base UI / shadcn + Graphite tokens；公共 API、导出与目录同步。实际记录 `npm run check`、`npm run build` 和相关交互检查；token 变化运行构建与审计，不以历史结果代替本次验证。
- 视觉改动记录所检查的参考工作上下文、来源、主题与剩余差异；构建、交互或可访问性检查不替代视觉比较。宿主网络、存储、AI、PTY 等集成与本地演示分开标明。
- 验收项不是采购清单。Vue API、PRO 和 roadmap 只提供能力参考；使用第三方实现前核实目标框架、版本、许可与可用性。

## 阶段 1：共享状态、可访问行为与数据规模

Form 为第一项；虚拟化、Tree 和表格状态可在 Form 基础稳定后按依赖并行推进。

| ID | 验收项 / 边界 | 依赖 | 状态 | Story | 证据 |
| --- | --- | --- | --- | --- | --- |
| FORM-01 | Form 管理与适配：schema / resolver、字段注册与值/dirty/touched/error 状态、提交/重置、Field 标签与错误关联；公开受控契约及非原生控件适配 | — | ✅ 完成 | [Playground](http://127.0.0.1:6006/?path=/story/复杂-form-表单管理--playground)；本族 10 个 Story | [验收](validation-form.md)：check/build、18 项交互、40 组 Story、10 项 Controls、16 组视口；[用法](components/form.md) |
| FORM-02 | 跨字段与异步校验：触发时机、pending、提交期间行为、宿主错误回填、过期结果处理、失败后恢复；不能仅用 Promise 延迟冒充完整异步契约 | FORM-01 | ✅ 完成 | 复杂-asyncform-异步表单--playground / --manual-responses；另有禁用与失败预设 | [AsyncForm 验收](validation-async-form.md)：20 项新增测试、18 项 Form 回归、20 次 Story 组合通过；check/build 通过 |
| FORM-03 | FieldArray / 嵌套字段：稳定项 ID、添加/删除/重排、路径错误与 touched/dirty 保持、数组重置；不能用 index 误关联字段状态 | FORM-01、FORM-02 | ✅ 完成 | 复杂-form-表单管理--array-playground；空/只读/禁用与移动预设 | [数组验收](validation-form-array.md)：28 项交互、20 次 Story 组合、同页 Controls、四主题密度窄屏；check/build 通过 |
| FORM-04 | 动态表单配方：配置映射字段与条件显示、默认值与校验生命周期；明确是示例配方或公开引擎，不把参考库 Dynamic 示例称为内置 FormBuilder | FORM-03 | ✅ 完成 | 复杂-form-表单管理--dynamic-playground；团队/清除/禁用/失败预设 | [动态配方验收](validation-dynamic-form.md)：30 项测试、20 次 Story 组合、同页 Controls、四主题密度；check/build 通过 |
| VIRT-01 | VirtualList：可见窗口、稳定 key、overscan、scrollTo、加载范围/总量边界、空/错误、列表语义；用大数据和 DOM 数量证据验证窗口化 | — | ✅ 完成 | 复杂-virtuallist-虚拟列表--playground；空/加载/错误/稀疏预设 | [虚拟列表验收](validation-virtual-list.md)：8 项交互、20 次 Story 组合、10 万项 DOM 有界；check/build 通过 |
| VIRT-02 | 动态高度与更新：测量变化、插入/追加/删除的滚动锚点、焦点回收、密度变化、流式内容增高；禁止跳行或丢失活动项 | VIRT-01 | ✅ 完成 | 复杂-virtuallist-虚拟列表--dynamic-rows | [动态虚拟列表验收](validation-virtual-list-dynamic.md)：15 项交互、24 次 Story 组合、稳定 key 锚点与焦点回收；check/build 通过 |
| VIRT-03 | VirtualGrid：双轴或网格窗口、行列定位、尺寸变化、稳定单元格标识与范围加载契约；不可仅换成 CSS grid | VIRT-01 | ✅ 完成 | 复杂-virtualgrid-虚拟网格--playground；空/加载/错误/紧凑大数据预设 | [虚拟网格验收](validation-virtual-grid.md)：9 项交互、20 次 Story 组合、十亿单元格二维窗口 DOM 有界；check/build 通过 |
| TREE-01 | TreeView 基础：ARIA tree/treeitem、受控展开/选择、上下左右/Home/End 导航、禁用节点、焦点恢复；保留原 DisclosureTree 的原生导航定位 | — | ✅ 完成 | 复杂-treeview-树形导航--playground；禁用/折叠/窄宽度/焦点恢复预设 | [TreeView 验收](validation-tree-view.md)：8 项交互、24 次 Story 组合、ARIA 树键盘与焦点恢复；check/build 通过 |
| TREE-02 | 树多选/复选：级联、半选、父子关系、禁用节点传播规则、批量与范围选择、受控值一致性 | TREE-01 | ✅ 完成 | 复杂-treeview-树形导航--playground；半选/级联/独立/禁用边界预设 | [TreeView 复选验收](validation-tree-view-checkbox.md)：11 项交互、40 次 Story 组合、受控回写与三态 ARIA；check/build 通过 |
| TREE-03 | 异步树：按需子节点、节点级 loading/error/retry、空子节点、展开中刷新和过期响应处理；加载与选择语义明确 | TREE-01、TREE-02 | ✅ 完成 | 复杂-asynctreeview-异步树--playground；加载/空/错误重试/刷新竞态/取消/复选预设 | [异步树验收](validation-async-tree-view.md)：11 项交互、28 次 Story 组合、受控取消与过期响应隔离；check/build 通过 |
| TREE-04 | 树重排：树内/允许的跨树移动、受控顺序、禁止环与无效落点、键盘等价操作、移动后选择/焦点保持 | TREE-02 | ✅ 完成 | 复杂-reorderabletreeview-树重排--playground；键盘/环路/禁用/窄宽度/跨树预设 | [树重排验收](validation-reorderable-tree-view.md)：9 项交互、24 次 Story 组合、焦点恢复与跨树 scope；check/build 通过 |
| TABLE-01 | DataTable 受控与远程：sorting/filter/pagination 对外状态、manual 数据模式、total/count、稳定 ID 与跨页选择范围；保留已有客户端能力 | — | ✅ 完成 | 复杂-datatable-数据表格--remote-controlled / --playground；另有本地/空/加载/错误预设 | [DataTable 验收](validation-data-table-controlled.md)：10 项交互、32 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/data-table.md) |
| TABLE-02 | 列筛选：文本/数字/日期等匹配、清空与组合规则、服务端序列化边界；不能仅增加无效筛选按钮 | TABLE-01、FORM-01 | ✅ 完成 | 复杂-datatable-数据表格--column-filters / --remote-column-filters / --playground | [列筛选验收](validation-data-table-column-filters.md)：11 项新增交互、10 项远程回归、40 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/data-table.md#列筛选) |
| TABLE-03 | 列管理：显隐/顺序/宽度/固定列、受控状态、分组表头兼容、横滚与键盘操作；不把已支持的分组表头记为新增 | TABLE-01 | ✅ 完成 | 复杂-datatable-数据表格--column-management / --playground | [列管理验收](validation-data-table-column-management.md)：11 项交互、44 次 Story 组合、分组表头与四主题密度；check/build 通过；[用法](components/data-table.md#列管理) |
| TABLE-04 | 行展开与行分组：受控展开、组头/汇总插槽、分组筛选/排序/选择一致性；区分已有列分组表头与新增行分组 | TABLE-01 | ✅ 完成 | 复杂-datatable-数据表格--row-expansion / --row-grouping / --playground | [行展开与分组验收](validation-data-table-row-groups.md)：14 项交互、52 次 Story 组合、四主题密度窄屏；TABLE-01～03 回归与 check/build 通过；[用法](components/data-table.md#行展开与行分组) |
| TABLE-05 | 单元格/行编辑：草稿、提交/取消、同步/异步错误、焦点和键盘流、失败保留/重试、宿主数据更新；自定义 cell 插槽不算完整编辑器 | TABLE-01、FORM-02 | ✅ 完成 | 复杂-datatable-数据表格--row-editing / --cell-editing / --editing-failure / --controlled-editing / --playground | [编辑验收](validation-data-table-editing.md)：15 项交互、68 次 Story 组合、TABLE-01～04 的 46 项回归、四主题密度窄屏；check/build 通过；[用法](components/data-table.md#单元格与行编辑) |
| TABLE-06 | 导出与视图偏好：明确导出数据范围/格式、宿主回调、列与查询状态保存/恢复及失效策略；不从页面 DOM 推导完整数据 | TABLE-02、TABLE-03 | ✅ 完成 | 复杂-datatable-数据表格--export-scopes / --remote-export / --saved-views / --playground | [导出与视图验收](validation-data-table-preferences.md)：12 项交互、80 次 Story 组合、TABLE-01～05 的 61 项回归、四主题密度窄屏；check/build 通过；[用法](components/data-table.md#导出与视图偏好) |
| TABLE-07 | 表格虚拟化：与分页/远程模式、固定列、选择、展开兼容；滚动定位与加载边界有大数据交互证据 | TABLE-01、TABLE-03、VIRT-01 | ✅ 完成 | 复杂-datatable-数据表格--virtual-rows / --virtual-remote-page / --virtual-pinned-expansion / --playground | [虚拟表格验收](validation-data-table-virtual.md)：11 项交互、92 次 Story 组合、5 万行 DOM 有界、TABLE-01～06 回归、四主题密度窄屏；check/build 通过；[用法](components/data-table.md#表格行虚拟化) |

## 阶段 2：高频输入与选择

SELECT-01～03、TAGS-02、COLOR-01、DATE-01、TIME-01、DATETIME-01、DATERANGE-01～02、PASSWORD-01、MASK-01、LISTBOX-01～02、METERGROUP-01、RATING-01、KNOB-01、TREESELECT-01、CASCADER-01、TREETABLE-01～02、TRANSFER-01、SORTABLE-01、RESOURCE-01～02、LOG-01、UPLOAD-01～02、PROPERTIES-01～02、GALLERY-01～02、CAROUSEL-01、COMPARE-01、ORGCHART-01、TERMINAL-01、EDIT-01～06、MARKDOWN-01～02、COMBO-SPLIT-01、COMBO-CONFIRM-01、COMBO-USER-01 与 COMBO-BANNER-01 已完成，下一项为 COMBO-TOOLBAR-01。

| ID | 验收项 / 边界 | 依赖 | 状态 | Story | 证据 |
| --- | --- | --- | --- | --- | --- |
| TAGS-01 | InputTags：任意标签创建、分隔输入、去重策略/上限、编辑/删除、受控值；与仅选择 options 的 MultiSelect 分开 | FORM-01 | ✅ 完成 | 基础-inputtags--playground；另有创建/分隔/去重/上限/编辑/只读/禁用/错误/表单预设 | [InputTags 验收](validation-input-tags.md)：16 项交互、52 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/input-tags.md) |
| TAGS-02 | 标签高级输入：粘贴拆分、中文 IME、动态建议/创建状态、错误与禁用标签、键盘标签导航 | TAGS-01、SELECT-01 | ✅ 完成 | 基础-inputtags--playground；批量粘贴/IME/建议/异步创建/标签状态/键盘预设，本族共 23 个 Story | [高级验收](validation-input-tags-advanced.md)：16 项新增、16 项回归、92 次 Story 组合；check/build 通过；[用法](components/input-tags.md) |
| COLOR-01 | ColorPicker / ColorInput：色板/区域/通道/文本输入、支持格式转换、透明度边界、无效输入、键盘和提交事件；组件 chrome 使用 token | FORM-01 | ✅ 完成 | 基础-colorpicker--playground；另有弹出/内联/文本/格式/透明度/预设/错误/键盘/表单预设 | [ColorPicker 验收](validation-color-picker.md)：13 项交互、60 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/color-picker.md) |
| DATE-01 | InputDate：日期分段或明确等效输入、locale/格式、合法性/范围、键盘、清除与日历联动；不重复建设 Calendar 已透传的多选/多月 | FORM-01 | ✅ 完成 | 基础-inputdate--playground；另有 locale/空值/范围/禁用日/错误/键盘/日历/清除/只读/禁用/表单预设 | [InputDate 验收](validation-input-date.md)：15 项交互、60 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/input-date.md) |
| TIME-01 | InputTime：时间分段、小时制/精度/步进、上下限、空值与键盘；明确时间值不默认携带任意日期 | FORM-01 | ✅ 完成 | 基础-inputtime--playground；另有 12/24 小时/秒/步进/范围/错误/键盘/空值/清除/只读/禁用/表单预设 | [InputTime 验收](validation-input-time.md)：15 项交互、60 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/input-time.md) |
| DATETIME-01 | DateTimePicker：日期与时间一致提交、跨日边界、格式/locale；明确 date-only、local datetime 与带时区值的支持边界 | DATE-01、TIME-01 | ✅ 完成 | 基础-datetimepicker--playground；本族 15 个 Story | [DateTimePicker 验收](validation-date-time-picker.md)：15 项测试、60 次 Story 组合、跨日边界与稳定 FormData；check/build 通过；[用法](components/date-time-picker.md) |
| PASSWORD-01 | PasswordInput：显隐按钮与可访问名称、规则/强度反馈和宿主校验接点、错误关联；普通 Input password 能力继续保留 | FORM-01 | ✅ 完成 | 基础-passwordinput--playground；本族 15 个 Story | [PasswordInput 验收](validation-password-input.md)：14 项测试、60 次 Story 组合、规则/强度与稳定原生表单；check/build 通过；[用法](components/password-input.md) |
| MASK-01 | InputMask：格式/占位、raw/display 值、可选段与不完整值策略、粘贴/删除/光标/IME；不能只拦截 keydown | FORM-01 | ✅ 完成 | 基础-inputmask--playground；本族 17 个 Story | [InputMask 验收](validation-input-mask.md)：16 项测试、68 次 Story 组合、粘贴/删除/IME 与 raw FormData；check/build 通过；[用法](components/input-mask.md) |
| LISTBOX-01 | 常驻 Listbox：单/多选、分组/搜索、富选项、禁用、范围选择与焦点语义；与弹出 Select 区分 | — | ✅ 完成 | 基础-listbox--playground；本族 25 个 Story，基础阶段见独立预设 | [Listbox 验收](validation-listbox.md)：20 项交互、68 次基础 Story 组合、四主题密度窄屏；[用法](components/listbox.md) |
| LISTBOX-02 | Listbox 虚拟化：活动项导航、选中项定位、筛选后焦点、非可见选项与加载错误的契约 | LISTBOX-01、VIRT-01 | ✅ 完成 | 基础-listbox--virtual-large / --virtual-selected-position / --virtual-search / --loading-empty / --load-error / --playground | [虚拟 Listbox 验收](validation-listbox-virtual.md)：12 项新增与 20 项回归、100 次全族 Story 组合、5 万项 DOM 有界；check/build 通过；[用法](components/listbox.md#虚拟化与加载边界) |
| METERGROUP-01 | MeterGroup / ProgressGroup：多段占比、图例/标签、总量/越界/零值语义、可读文本；测量量与任务进度明确区分 | — | ✅ 完成 | 基础-metergroup--playground；本族 15 个 Story | [验收](validation-meter-group.md)：13 项交互/语义测试、60 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/meter-group.md) |
| RATING-01 | Rating：展示/编辑、清除、支持精度/级数、只读/禁用、键盘和反馈语义；不把赞踩直接当评分 | FORM-01 | ✅ 完成 | 基础-rating--playground；本族 16 个 Story | [验收](validation-rating.md)：15 项交互/语义测试、64 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/rating.md) |
| KNOB-01 | Knob：圆形数字交互、min/max/step、读数、键盘、只读/禁用与受控值；明确相对 Slider/NumberField 的场景价值 | FORM-01 | ✅ 完成 | 基础-knob--playground；本族 16 个 Story | [验收](validation-knob.md)：13 项交互/语义测试、64 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/knob.md) |
| SELECT-01 | Combobox / MultiSelect 异步配方：输入与查询受控、loading/error/empty/retry、过期结果、选项缓存/选中标签保留；不宣称内置外部搜索 | — | ✅ 完成 | 基础-asynccombobox--playground、基础-asyncmultiselect--playground；两族合计 23 个 Story | [最终验收](validation-async-multi-select.md)：16 项多选交互、13 项单选回归、48 次多选 Story 组合；check/build 通过；[单选阶段](validation-async-combobox.md)、[多选用法](components/async-multi-select.md) |
| SELECT-02 | 选择增强：创建新项、分组、全选范围/部分选中、禁用项、批量操作；统一高层 API 而非仅示例内临时状态 | SELECT-01 | ✅ 完成 | 基础-multiselect--playground、基础-asyncmultiselect--playground；两族 30 个 Story | [验收](validation-select-enhancements.md)：30 项增强/回归测试、120 次 Story 组合、四主题密度窄屏；check/build 通过；[同步用法](components/multi-select.md)、[异步用法](components/async-multi-select.md) |
| SELECT-03 | 选择器虚拟化：键盘活动项与 popup 定位、远程加载、已有选择保持、选项尺寸变化 | SELECT-01、VIRT-01 | ✅ 完成 | 基础-multiselect--virtual-large / --virtual-variable-rows / --virtual-range；基础-asyncmultiselect--virtual-remote-pages / --virtual-load-failure；两族 35 个 Story | [验收](validation-select-virtualization.md)：44 项交互/回归、140 次 Story 组合、5 万项 DOM 有界、四主题密度窄屏；check/build 通过；[同步用法](components/multi-select.md)、[异步用法](components/async-multi-select.md) |
| DATERANGE-01 | DateRangePicker 预设与 locale：常用范围、可配置格式/locale、草稿/应用/取消、预设与上下限一致 | DATE-01 | ✅ 完成 | 复杂-daterangepicker-日期范围--playground；预设/locale/边界/草稿等 11 个 Story | [验收](validation-date-range-picker.md)：13 项交互与视觉测试、44 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/date-range-picker.md) |
| DATERANGE-02 | 日期范围时间组合：起止时刻精度、时区支持边界、跨日/倒置/上下限验证、序列化与提交 | DATERANGE-01、DATETIME-01 | ✅ 完成 | 复杂-datetimerangepicker-日期时间范围--playground；跨日/同日/倒置/边界/秒/时区/表单等 16 个 Story | [验收](validation-date-time-range-picker.md)：14 项交互、64 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/date-time-range-picker.md) |

## 阶段 3：树形数据、集合、上传与媒体

| ID | 验收项 / 边界 | 依赖 | 状态 | Story | 证据 |
| --- | --- | --- | --- | --- | --- |
| TREESELECT-01 | TreeSelect：弹层树搜索、单/多/复选/半选、清除、受控值、lazy 节点、焦点开关恢复；复用 Tree 模型 | TREE-02、TREE-03、SELECT-01 | ✅ 完成 | 复杂-treeselect-树选择--playground；单选/复选/半选/搜索投影/空态/禁用/错误/lazy/重试/焦点/表单预设 | [TreeSelect 验收](validation-tree-select.md)：17 项交互、60 次 Story 组合、ARIA 与溢出均通过；check/build 通过 |
| CASCADER-01 | Cascader：任意支持层级的逐级选择、路径值/叶选择边界、disabled/loading/error、清除与键盘；不将平面分组称为级联 | FORM-01、TREE-01 | ✅ 完成 | 复杂-cascader-级联选择--playground；叶节点/任意层级/受控/禁用/空态/加载/错误/lazy/重试/表单/富内容预设 | [Cascader 验收](validation-cascader.md)：17 项交互、60 次 Story 组合、ARIA 与溢出均通过；check/build 通过 |
| TREETABLE-01 | TreeTable 基础：层级与列模型、展开、树行键盘、复选/半选、稳定行 ID；树表语义与普通表格一致整合 | TREE-02、TABLE-01 | ✅ 完成 | 复杂-treetable-树表格--playground；单选/级联/半选/独立/折叠/受控/禁用/空态/加载/错误/窄容器预设 | [TreeTable 基础验收](validation-tree-table.md)：17 项交互、60 次 Story 组合、treegrid ARIA 与溢出均通过；check/build 通过 |
| TREETABLE-02 | TreeTable 高级：列筛选/管理、父子筛选规则、根分页/子节点 lazy、错误重试、选择与更新一致性 | TREETABLE-01、TREE-03、TABLE-02、TABLE-03 | ✅ 完成 | 复杂-treetable-树表格--playground；父子筛选、列视图、根分页、受控视图、lazy/重试/选择预设，本族 25 个 Story | [高级验收](validation-tree-table-advanced.md)：15 项高级交互与 17 项基础回归、100 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/tree-table.md) |
| TRANSFER-01 | PickList / Transfer：source/target 受控转移、双侧搜索、批量/全部范围、禁用项、键盘和空态；保持项唯一与顺序 | LISTBOX-01 | ✅ 完成 | 复杂-transfer-穿梭选择--playground；受控/批量/键盘/禁用/空态/窄布局预设，本族 15 个 Story | [验收](validation-transfer.md)：14 项交互、60 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/transfer.md) |
| SORTABLE-01 | OrderList / SortableList：手动受控顺序、拖拽及键盘上移/下移/置顶/置底、批量/禁用、焦点与重排反馈 | LISTBOX-01 | ✅ 完成 | 复杂-sortablelist-排序列表--playground；受控/批量/键盘/拖放/禁用/窄布局预设，本族 13 个 Story | [验收](validation-sortable-list.md)：14 项交互、52 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/sortable-list.md) |
| RESOURCE-01 | ResourceList 数据规模：虚拟化、增量加载、总量/加载边界、查询变化和跨窗口选择保持 | VIRT-01、SELECT-01 | ✅ 完成 | 复杂-resourcelist-资源列表--playground；虚拟化、手动/滚动增量、加载错误、查询替换、跨窗口选择、窄宽度等 15 个 Story | [验收](validation-resource-list.md)：15 项交互、四主题密度与窄屏；check/build 通过；[用法](components/resource-list.md) |
| RESOURCE-02 | DataView / ResourceGrid：同集合列表/网格切换，共享搜索/选择/分页/动作及受控视图偏好，网格不能另存一份业务状态 | RESOURCE-01、VIRT-03 | ✅ 完成 | 复杂-resourceview-资源视图--playground；状态连续性、本地/远程分页、单/多选、自定义网格、共享动作、窄宽度等 16 个 Story | [验收](validation-resource-view.md)：15 项交互、四主题密度与窄屏；check/build 通过；[用法](components/resource-view.md) |
| LOG-01 | LogViewer 大数据：虚拟化、增量追加/加载、等级查询、暂停/恢复跟随、可配置视图偏好；动态长行与追加不跳动 | VIRT-02 | ✅ 完成 | 复杂-logviewer-日志查看--playground；1 万条/跟随追加/暂停追加/前插历史/长行/偏好/状态预设，本族 19 个 Story | [验收](validation-log-viewer.md)：14 项交互与 15 项 VirtualList 回归、76 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/log-viewer.md) |
| UPLOAD-01 | FileUpload 生命周期：queued/uploading/success/error、受控进度、开始/取消/重试、单文件错误、transport 回调；保留本地校验并由宿主执行网络 | — | ✅ 完成 | 复杂-fileupload-文件上传--playground；上传/进度/成功/错误/取消/重试/校验/禁用/窄屏预设，本族 13 个 Story | [验收](validation-file-upload.md)：12 项交互、52 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/file-upload.md) |
| UPLOAD-02 | 文件预览：图片缩略图/失败回退、移除与取消一致、对象 URL 等资源释放、非图片文件表示；预览不暗示上传完成 | UPLOAD-01 | ✅ 完成 | 复杂-fileupload-文件上传--playground；缩略图/混合文件/失败回退/关闭预览/替换释放/窄屏预设，本族 18 个 Story | [验收](validation-file-upload-preview.md)：17 项交互、72 次 Story 组合、对象 URL 生命周期、四主题密度窄屏；check/build 通过；[用法](components/file-upload.md) |
| PROPERTIES-01 | PropertyList / KeyValueEditor 丰富字段：字段类型适配、嵌套数据、只读/禁用、路径与草稿更新；继续复用 Field 控件 | FORM-03、DATE-01、LISTBOX-01 | ✅ 完成 | 复杂-propertylist-属性编辑--playground（14 个 Story）；复杂-keyvalueeditor-键值编辑--playground（当前 16 个 Story） | [PropertyList 验收](validation-property-list-fields.md)：13 项交互、建设时 48 次 Story 组合；[KeyValueEditor 验收](validation-key-value-editor-fields.md)：11 项交互、建设时 56 次 Story 组合；四主题密度窄屏、check/build 通过 |
| PROPERTIES-02 | 属性/键值提交：跨字段校验、批量提交、取消/重置、异步错误定位和失败恢复；不把各行临时保存当事务提交 | PROPERTIES-01、FORM-02 | ✅ 完成 | 复杂-propertylist-属性编辑--transactional / --submit-failure / --playground；复杂-keyvalueeditor-键值编辑--transactional / --submit-failure / --playground | [PropertyList 事务验收](validation-property-list-transactions.md)：23 项交互、56 次 Story 组合；[KeyValueEditor 事务验收](validation-key-value-editor-transactions.md)：21 项交互、64 次 Story 组合；四主题密度窄屏、check/build 通过 |
| GALLERY-01 | ImagePreview / Gallery 基础：缩略图、放大、前后切换、加载/失败/重试、键盘与焦点恢复；不是 AttachmentList 或 AspectRatio 的别名 | — | ✅ 完成 | 基础-imagegallery-图片画廊--playground；打开导航、单图、空、加载、失败重试、隐藏缩略图、循环、禁用、窄屏共 10 个 Story | [验收](validation-image-gallery.md)：13 项交互、40 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/image-gallery.md) |
| GALLERY-02 | 图像查看操作：缩放/定位、旋转/翻转、全屏、下载回调的支持边界，换图/退出后状态与资源复位 | GALLERY-01 | ✅ 完成 | 基础-imagegallery-图片画廊--viewer-tools / --download-action / --tools-hidden / --playground；本族共 13 个 Story | [高级查看器验收](validation-image-gallery-viewer.md)：13 项新增、13 项基础回归、52 次 Story 组合、四主题密度；check/build 通过；[用法](components/image-gallery.md) |
| CAROUSEL-01 | Carousel：按钮/指示器、活动页状态、键盘/触摸拖动、尺寸变化和可访问内容；自动播放若提供须可暂停 | — | ✅ 完成 | 基础-carousel-轮播--playground；默认、受控、多项、循环、自动播放、交互内容、单项、空态、禁用、窄屏等共 15 个 Story | [验收](validation-carousel.md)：16 项交互、60 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/carousel.md) |
| COMPARE-01 | ImageCompare：前后图重叠滑块、受控比例、横/纵方向、键盘范围、图像尺寸/错误处理；与文本 DiffViewer 分开 | GALLERY-01 | ✅ 完成 | 基础-imagecompare-图像对比--playground；横向、受控、纵向、适配、加载、单侧/双侧失败、禁用、窄屏等共 15 个 Story | [验收](validation-image-compare.md)：16 项交互、60 次 Story 组合、四主题密度窄屏；check/build 通过；[用法](components/image-compare.md) |
| ORGCHART-01 | OrganizationChart：层级关系布局、节点模板、折叠/选择、长内容与键盘；明确仅层级图，非任意图编辑器 | TREE-01 | ✅ 完成 | 复杂-organizationchart-组织结构图--playground；受控、模板、初始折叠、固定展开、禁用、多根、长内容、窄屏与空态共 12 个 Story | [验收](validation-organization-chart.md)：16 项交互、48 次 Story 组合、四主题密度窄屏、六项 Controls；check/build 通过；[用法](components/organization-chart.md) |
| TERMINAL-01 | TerminalPrompt：命令输入、历史、宿主响应/错误列表、提交/取消和 IME；执行、进程与 PTY 适配留给宿主，演示不伪装真实命令执行 | — | ✅ 完成 | 复杂-terminalprompt-命令交互--playground；交互、异步/失败、运行取消、历史、混合状态、长输出、跟随、空/错误/只读/禁用、窄屏等共 18 个 Story | [验收](validation-terminal-prompt.md)：19 项交互、72 次 Story 组合、四主题密度窄屏、11 项 Controls；check/build 通过；[用法](components/terminal-prompt.md) |

## 阶段 4：文档与内容编辑

| ID | 验收项 / 边界 | 依赖 | 状态 | Story | 证据 |
| --- | --- | --- | --- | --- | --- |
| EDIT-01 | RichTextEditor 内容模型：Markdown/HTML/JSON 的支持格式、解析/输出与往返限制、受控值、空/只读/禁用；不以 contentEditable 外壳充数 | — | ✅ 完成 | 复杂-richtexteditor-富文本编辑--playground；Markdown/HTML/JSON、snapshot、受控替换、往返、过滤、空/只读/禁用/错误、长文与窄屏等共 17 个 Story | [验收](validation-rich-text-editor.md)：19 项交互、68 次 Story 组合、四主题密度窄屏、八项 Controls；check/build 通过；[用法](components/rich-text-editor.md) |
| EDIT-02 | 编辑基本操作：工具栏、链接、列表、格式状态、撤销/重做、快捷键、选择保留与中文 IME；操作必须改变真实文档模型 | EDIT-01 | ✅ 完成 | 复杂-richtexteditor-富文本编辑--playground；marks/structure/history/link/active-state/hidden 工具栏预设，本族共 23 个 Story | [验收](validation-rich-text-editor-editing.md)：27 项交互、92 次静态 Story 组合、四主题密度窄屏、11 项 Controls；check/build 通过；[用法](components/rich-text-editor.md#基本编辑操作) |
| EDIT-03 | 编辑扩展：任务列表、对齐、emoji 的安装/组合边界、序列化与键盘交互；按扩展声明实际支持范围 | EDIT-02 | ✅ 完成 | 复杂-richtexteditor-富文本编辑--task-list-markdown / --alignment-serialization / --emoji-serialization / --extension-toolbar / --playground；本族共 29 个 Story | [扩展验收](validation-rich-text-editor-extensions.md)：38 项交互、116 次静态 Story 组合、四主题密度、12 项 Controls；check/build 通过；[用法](components/rich-text-editor.md#任务列表对齐与-emoji) |
| EDIT-04 | Suggestion / Mention 菜单：`/` 命令与 `@` 提及、筛选、异步结果、键盘选择/退出、插入结构与触发范围 | EDIT-02、SELECT-01 | ✅ 完成 | 复杂-richtexteditor-富文本编辑--slash-commands / --mention-local / --mention-async / --mention-empty / --suggestions-off / --suggestion-narrow / --playground；本族共 35 个 Story | [建议验收](validation-rich-text-editor-suggestions.md)：49 项交互、140 次静态 Story 组合、四主题密度、15 项 Controls；check/build 通过；[用法](components/rich-text-editor.md#斜杠命令与提及) |
| EDIT-05 | 块操作：受控块拖拽/键盘移动、转换与删除、历史恢复、选择/焦点和序列化保持 | EDIT-02 | ✅ 完成 | 复杂-richtexteditor-富文本编辑--block-actions-controlled / --block-single / --block-actions-empty / --block-controls-off / --block-read-only / --block-narrow / --playground；本族共 41 个 Story | [块操作验收](validation-rich-text-editor-blocks.md)：63 项交互/回归、164 次静态 Story 组合、17 项 Controls、四主题密度窄屏；check/build 通过；[用法](components/rich-text-editor.md#块操作) |
| EDIT-06 | 编辑器媒体与宿主扩展配方：图片插入/上传状态、AI 补全等回调接点、取消/失败恢复；模拟结果与真实后端明确区分 | EDIT-02、UPLOAD-01 | ✅ 完成 | 复杂-richtexteditor-富文本编辑--image-serialization / --image-upload-cancel / --image-upload-recovery / --image-invalid / --image-read-only / --completion-review / --completion-literal-text / --completion-cancel / --completion-recovery / --completion-stale / --media-narrow / --playground；本族共 52 个 Story | [媒体与补全验收](validation-rich-text-editor-media.md)：86 项交互/回归、208 次静态 Story 组合、19 项 Controls、四主题密度窄屏；check/build 通过；[用法](components/rich-text-editor.md#图片与宿主补全) |
| MARKDOWN-01 | MarkdownContent / RichMessage：标题、列表、表格、链接、fenced code、自定义节点入口与内容处理策略；语法高亮不等于文档渲染 | — | ✅ 完成 | ai-markdowncontent-richmessage--playground / --default / --rich-assistant-message / --table / --task-list / --fenced-code / --custom-renderers / --html-escaped / --unsafe-url / --narrow；本族共 17 个 Story | [验收](validation-markdown-content.md)：24 项组件回归、14 项 Workbench 回归、68 次静态 Story 组合、8 项 Controls、四主题密度窄屏；check/build 通过；[用法](components/markdown-content.md) |
| MARKDOWN-02 | 流式 Markdown：未闭合语法、增量文本、代码/表格变形、复制保持原文、节点替换和布局稳定 | MARKDOWN-01 | ✅ 完成 | ai-markdowncontent-richmessage--streaming-playground / --incomplete-inline / --incomplete-link / --incomplete-fence / --completion-disabled / --streaming-table / --stream-replacement-key / --streaming-rich-message；本族共 25 个 Story | [验收](validation-streaming-markdown.md)：13 项流式能力/视觉、24 项 MARKDOWN-01 回归、14 项 Workbench 回归、100 次静态 Story 组合、两组可调 Controls；check/build 通过；[用法](components/markdown-content.md#流式-markdown) |

## 阶段 5：可复用组合与应用外壳配方

原语已存在的项以组合 API 和 Playground 验收；不要求添加同名底层原语。

| ID | 验收项 / 边界 | 依赖 | 状态 | Story | 证据 |
| --- | --- | --- | --- | --- | --- |
| COMBO-SPLIT-01 | SplitButton：主操作与菜单动作、各自 loading/disabled、标签、快捷键/焦点与共享边缘 | — | ✅ 完成 | 复杂-splitbutton-拆分按钮--playground / --default / --menu-with-shortcuts / --independent-disabled / --main-loading / --menu-loading / --item-loading / --empty / --keyboard-navigation；本族共 9 个 Story | [验收](validation-split-button.md)：13 项交互/视觉、36 次静态 Story 组合、可调 Controls、四主题密度；check/build 通过；[用法](components/split-button.md) |
| COMBO-CONFIRM-01 | ConfirmPopover：锚点确认、危险/取消动作、异步 pending/error、关闭及焦点回到触发器 | — | ✅ 完成 | 复杂-confirmpopover-锚点确认--playground / --default / --destructive / --with-details / --external-pending / --host-error / --async-success / --async-failure / --disabled / --keyboard-focus；本族共 10 个 Story | [验收](validation-confirm-popover.md)：13 项交互/视觉、40 次静态 Story 组合、可调 Controls、四主题密度；check/build 通过；[用法](components/confirm-popover.md) |
| COMBO-USER-01 | User 信息行：Avatar/文字/辅助状态/操作组合、长名称、缺头像与禁用动作；示例数据明确为本地 | — | ✅ 完成 | 复杂-user-信息行--playground / --default / --long-content / --missing-avatar / --status-tones / --visible-actions / --disabled-action / --loading-action / --disabled-row / --custom-trailing-content；本族共 10 个 Story | [验收](validation-user-info.md)：13 项交互/视觉、40 次静态 Story 组合、可调 Controls、四主题密度；check/build 通过；[用法](components/user-info.md) |
| COMBO-BANNER-01 | Banner：信息/动作/关闭、长内容和窄布局、live region 使用边界；复用 Alert，不增加装饰性统计条 | — | ✅ 完成 | 复杂-banner-通知条--playground 等 11 个 Story | [验收](validation-banner.md)：11 项交互/视觉、44 次 Story 组合、四主题密度；check/build 通过；[用法](components/banner.md) |
| COMBO-TOOLBAR-01 | Toolbar：操作分组、状态控件、溢出策略和适用的键盘导航，窄工作面不隐藏不可达操作 | — | 待完成 | 待关联 | 待记录 |
| COMBO-INLINE-01 | 通用 InlineEdit：显示/编辑插槽、草稿/提交/取消、异步错误、焦点与只读；由 PropertyList 文本/数字场景抽取 | FORM-02 | 待完成 | 待关联 | 待记录 |
| COMBO-OVERLAY-01 | 命令式 Overlay 配方：Dialog/Sheet/AlertDialog 的打开/结果/关闭服务、并发/嵌套与卸载边界，保留声明式控制 | — | 待完成 | 待关联 | 待记录 |
| SHELL-STATE-01 | Workspace / Sidebar 持久化：尺寸/展开状态受控、保存恢复、不可用尺寸/旧配置回退、键盘分栏不退化 | — | 待完成 | 待关联 | 待记录 |
| SHELL-SEARCH-01 | 统一应用搜索：CommandSearch 组合、跨资源结果/动作、异步状态、快捷键/IME与当前工作上下文；搜索源为宿主注入 | SELECT-01 | 待完成 | 待关联 | 待记录 |
| SHELL-PRESET-01 | 布局预设：Workspace 槽位、独立滚动、窄屏/面板隐藏、状态切换与持久化；不得覆盖基础分栏的公共契约 | SHELL-STATE-01 | 待完成 | 待关联 | 待记录 |
| CONTENT-NAV-01 | 文档导航联动：DisclosureTree/目录组合、当前位置、滚动/路由同步、长标题、键盘与空章节 | MARKDOWN-01 | 待完成 | 待关联 | 待记录 |
| DASHBOARD-RECIPE-01 | Dashboard 工作面配方：AppShell/Workspace/Sidebar/Table/Form/Search 的真实本地交互、偏好与窄布局；不作为单一原子组件计数 | SHELL-PRESET-01、SHELL-SEARCH-01、TABLE-01、FORM-01 | 待完成 | 待关联 | 待记录 |
| CONTENT-RECIPE-01 | Content 工作面配方：文档列表/导航/阅读/相关操作统一组合、空/加载/失败与视图状态；专用阅读器另行验收 | CONTENT-NAV-01、RESOURCE-02 | 待完成 | 待关联 | 待记录 |

## 阶段 6：AI 内容与工作流组合

| ID | 验收项 / 边界 | 依赖 | 状态 | Story | 证据 |
| --- | --- | --- | --- | --- | --- |
| AI-PARTS-01 | 结构化消息适配：文本/工具/引用/附件/产物 parts 映射，稳定 part ID、流式/错误/未知类型、宿主状态控制；不绑定某一真实请求服务 | MARKDOWN-02 | 待完成 | 待关联 | 待记录 |
| AI-COMPOSER-01 | 富 Composer：结构化草稿、`/` 命令、`@` 文件/人员、ContextPill 与提及值、键盘/IME/提交约定；保留字符串输入兼容边界 | EDIT-04、AI-PARTS-01 | 待完成 | 待关联 | 待记录 |
| AI-COMPOSER-02 | Composer 粘贴附件：clipboard/拖入、上下文引用、数量/大小/格式反馈、宿主上传状态、移除/取消/重试与草稿一致 | AI-COMPOSER-01、UPLOAD-01 | 待完成 | 待关联 | 待记录 |
| AI-OVERLAY-01 | ChatOverlay 组合：Dialog/Conversation/Composer 复用、开关与焦点恢复、停止/错误/重试/空态演示；请求仍由宿主控制 | AI-PARTS-01 | 待完成 | 待关联 | 待记录 |
| AI-PALETTE-01 | ChatPalette 组合：紧凑弹层、命令/会话切换、快捷键边界、焦点、停止与错误恢复；不重造消息组件 | AI-OVERLAY-01、SHELL-SEARCH-01 | 待完成 | 待关联 | 待记录 |
| AI-VIRTUAL-01 | Conversation 长列表：动态高度、流式 part 更新、历史向前加载、回到底部、用户暂停跟随、焦点/选择保持；用真实增长的示例验收 | VIRT-02、AI-PARTS-01 | 待完成 | 待关联 | 待记录 |

## 阶段 7：按实际应用立项的专业工作面

以下是候选能力的验收范围，不表示参考库全部核心内置，也不表示已经选定 PRO。实施前在证据栏先补使用场景、行为引擎/许可、数据协议与首版边界。

| ID | 验收项 / 边界 | 依赖 | 状态 | Story | 证据 |
| --- | --- | --- | --- | --- | --- |
| APP-CHART-01 | Chart：明确首批图形、数据/轴/图例/tooltip、空/加载/错误、主题与键盘/替代数据表；数据计算与图形渲染职责分开 | VIRT-01、METERGROUP-01 | 待完成 | 待关联 | 待记录 |
| APP-SCHEDULER-01 | Scheduler：日/周/月视图、事件选择/编辑、时间/重叠/全天语义、移动/调整与键盘等价、宿主保存失败恢复 | DATETIME-01、FORM-02 | 待完成 | 待关联 | 待记录 |
| APP-KANBAN-01 | TaskBoard / Kanban：列/卡片模型、受控移动/排序、键盘、过滤/加载、宿主提交/失败回滚；与 TaskQueue 列表区分 | SORTABLE-01、FORM-02 | 待完成 | 待关联 | 待记录 |
| APP-CODEEDITOR-01 | 完整代码编辑器：模型/语言服务支持边界、编辑历史、搜索、选择/光标、文件切换、主题/IME；CodeBlock 仅展示能力不算完成 | SHELL-PRESET-01 | 待完成 | 待关联 | 待记录 |
| APP-PDF-01 | PDF 阅读器：文档加载/错误、分页/缩放/搜索/选择、键盘、长文档资源策略及宿主文件入口；ArtifactPanel 插槽不是阅读引擎 | VIRT-01、SHELL-PRESET-01 | 待完成 | 待关联 | 待记录 |
| APP-DIAGRAM-01 | 任意流程/图编辑器：节点/边模型、连接/选择/移动/缩放、历史、校验、序列化与键盘；OrganizationChart 不能代替 | FORM-02、SHELL-PRESET-01 | 待完成 | 待关联 | 待记录 |

## 阶段 8：后续评估，不是已交付对标

这些项保持待完成，验收首先是书面采用/延期/不采用结论；有明确场景才转入建设阶段。PRO roadmap 行用于追踪可用性，不能以名称、宣传、计划日期或其他框架实现作为已发布证据。与阶段 7 的能力重叠不另计一次组件交付。

| ID | 评估项 / 决策边界 | 依赖 | 状态 | Story | 证据 |
| --- | --- | --- | --- | --- | --- |
| EVAL-FLOATLABEL-01 | FloatLabel：核实紧凑桌面表单的标签可读性/占位冲突与真实需求，再决定是否组合 | FORM-01 | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-IFTALABEL-01 | IftaLabel：评估内嵌顶部标签对密度、错误提示、长中文与控件一致性的收益 | FORM-01 | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-SPEEDDIAL-01 | SpeedDial：仅针对集中快捷操作场景评估键盘、触摸与低发现性；不是通用桌面默认布局 | — | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-DOCK-01 | Dock：明确应用导航价值及与 Sidebar/Toolbar 重叠，评估触摸/键盘和空间占用 | SHELL-PRESET-01 | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-MARQUEE-01 | Marquee：确认需要持续滚动内容的场景、暂停/reduced-motion 与阅读可达性，否则延期 | — | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-SCROLLTOP-01 | ScrollTop：评估长内容定位需求与现有滚动容器/返回底部区别，明确触发阈值与焦点行为 | CONTENT-RECIPE-01 | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-BLOG-01 | Blog 营销组合：有发布内容场景后定义列表/文章/作者组合，明确与 Content 配方复用 | CONTENT-RECIPE-01 | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-PRICING-01 | Pricing 营销组合：真实定价展示需求、套餐比较/周期交互与数据边界；不把营销模板计核心组件 | — | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-HERO-01 | PageHero 营销组合：评估落地页用途、内容/动作/媒体插槽；不泛化为桌面页面眉头 | — | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-FOOTER-01 | Footer 营销组合：按站点信息架构评估导航/法律信息/响应式，不影响桌面工作面默认结构 | — | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-PRO-DATAGRID-01 | PRO DataGrid roadmap：核实目标框架已发布版本/API/许可与实际场景，说明相对 TABLE-* 的新增需求 | TABLE-07 | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-PRO-SHEET-01 | PRO Sheet roadmap：核实发布与公式/单元格/选区/复制等能力范围；不把 DataTable 包装成电子表格 | TABLE-05 | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-PRO-GANTT-01 | PRO Gantt Chart roadmap：核实发布、任务依赖/时间轴/资源等需求与成本，不能用 Scheduler 代替验收 | APP-SCHEDULER-01 | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-PRO-DIAGRAM-01 | PRO Diagram roadmap：核实可用性/许可/交互后作为 APP-DIAGRAM-01 的选型证据；不重复记交付 | APP-DIAGRAM-01 范围确定 | 待完成 | 待关联（若采用） | 待记录 |
| EVAL-PRO-PDF-01 | PRO PDF Viewer roadmap：核实可用性/许可/文档能力后作为 APP-PDF-01 的选型证据；不以 roadmap 页面视为成熟产品 | APP-PDF-01 范围确定 | 待完成 | 待关联（若采用） | 待记录 |

## 证据记录模板

完成一项时，在该行证据链接指向的记录中填写：`公开 API / 源码`、`Story IDs`、`验收交互与状态`、`check / build / 相关测试实际结果`、`四种主题密度与窄工作面`、`视觉参考及差异`、`宿主集成边界 / 未覆盖内容`。暂未覆盖的高级能力保持对应 ID 待完成，不以基础项验收结果预勾。
