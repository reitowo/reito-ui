# Storybook 实时参数调试

2026-09-06，Windows / Edge，Node 24.11.1。用户需要在同一预览中调整 props。原有不少 Story 的 render 固定内容，Empty 当前页面没有可用 Controls；Button 的枚举类型没有正确推断，样式显示为文本编辑器。

88 个组件族各新增一个“参数调试”Playground，使用显式 args、argTypes 与可见字段列表。枚举使用下拉框、布尔使用开关、文本与数值使用相应编辑器；受控状态通过 useArgs 双向同步。颜色与大小使用真实语义 API，组合参数注明对应子组件或插槽，不为组件虚构 color / size。

Playground 排在每族第一项，Lab 深链指向它，底部 Controls 默认开启。原 526 个 Story ID 全部保留，总数为 614。Empty 的原有单项预设（包括用户打开的 NoResults）也使用同一 args 组合，当前页面即可调整标题、描述、图标、媒体样式和边框。

参数边界同步修正包括：Accordion 单选时拒绝双项展开，ResourceList 按选择模式保留合法选中项，MessageBranch 索引跟随分支数量夹取，DisclosureTree 的选项覆盖 tokens.md。DataTable 初始分页大小等 default 参数明确说明修改时重建示例。

## 实际验证

| 检查 | 结果 | 证据 |
| --- | --- | --- |
| `npm run check` | 包括随后 DiffViewer 修正，通过；200 文件 Token 审计无未批准项，28 处精确例外 | [最新日志](../.logs/diff-density/check.log) |
| `npm run build` | 包括随后 DiffViewer 修正，UI / Lab / Storybook / Workbench 生产构建通过；保留构建器大 chunk 提示 | [最新日志](../.logs/diff-density/build.log) |
| `npm run test:ui` | 45/45 通过 | [日志](../.logs/storybook-controls/ui.log) |
| Controls 配置 | 最终复测 88/88 Playground 均有显式控件类型、初始值与有效 Lab 深链 | [完整报告](../.logs/storybook-controls/controls-after-review.json) |
| 真实 Controls | 最终复测 13/13 场景通过：Button 四种主题/密度；Empty 两个入口；Collapsible、Tabs、Select、Popover、ToolCall、CodeBlock、DataTable | [完整报告](../.logs/storybook-controls/controls-after-review.json) |
| 新增和直接受影响 Story | 最终 117 Story × dark/light × compact/comfortable = 468/468，通过页面/控制台错误、完整 iframe axe、主题密度和横向溢出检查，源码指纹一致 | [扫描报告](../.logs/diff-density/story-audit.json) |
| 原有链接与入口排序 | 526 个旧链接保留；88 个族均以 Playground 排在首位 | [导航报告](../.logs/storybook-controls/navigation.json) |
| 独立边界与 Docs 复测 | 8/8 通过：Accordion、MessageBranch、ResourceList、DisclosureTree、Pagination、ToggleGroup；Button Docs 参数编辑与 Popover Docs 隔离、全局主题密度 | [六项报告](../.logs/storybook-controls/independent-controls-review.json)、[额外两项](../.logs/storybook-controls/independent-extra-normalization.json) |

独立复查发现 Accordion 的组合枚举在规范化到原值后，Storybook 原生选择控件仍保留无效选项；最终改为实际 `value: string[]` 的复选 Controls 并验证单选/多选切换。MessageBranch / Pagination 的数值输入在聚焦时保留用户的编辑缓存，底层参数和画布已经规范化；完成编辑、失焦后输入框同步。这是原生 Storybook 行为，参数描述已说明，源码没有计时器补丁。此前失败与最终复测均保留。

最初 436 组扫描之后，又完成 Accordion 等参数边界修正以及用户随后反馈的 DiffViewer 行高调整。最终 468 组扫描覆盖全部 88 个 Playground 以及 Button、Empty、DiffViewer 的其他预设，包含 DiffViewer 的一个自动 play；13 组真实 manager Controls 操作与 8 项独立边界/Docs 操作另行通过。本轮没有重跑其余未改行为的 Story；此前全量与复测结果见 [独立变体报告](validation-storybook-variants.md)。这不是全部 614 Story 的全量验收，也不代表完整手工无障碍认证。

## 页面比较

实际查看本轮开始时用户所在的 Empty / NoResults 完整 Storybook 页面，来源是本地 `http://127.0.0.1:6006/?path=/story/基础-empty--no-results`，并与修改后的生产预览比较。主题为 dark、密度 compact；Storybook 自身 manager 保留原生浅色外观。之前面板提示没有 Controls；现在同页显示可编辑字段，操作后内容和图标立即改变。Button 的 variant / size 也显示为下拉框，修改后颜色与实际高度变化。

基线截图 1280×800，修改后截图 1440×1000，故截图仅用于确认控件组织与同页调参，不能用于逐像素尺寸差异判定；Button 的实际高度和背景色变化另由浏览器计算样式断言验证。组件样式仍消费原有 token，本轮没有调整 Graphite 的视觉尺度或声称更接近 Cursor / Claude。

- [原 Empty 页面](../.logs/storybook-controls/before-empty.png)
- [当前 Empty 同页调参](../.logs/storybook-controls/empty-current-controls.png)
- [Button 样式与尺寸 Controls](../.logs/storybook-controls/button-controls.png)

本轮只更新工作区源码与文档，已有 0.4.1 tarball 保留原样。
