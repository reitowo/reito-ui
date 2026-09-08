# CONTENT-RECIPE-01 · Content 工作面配方验收

## 范围

新增 Storybook 应用配方，直接组合 ResourceView、ContentNavigation、MarkdownContent、Toolbar、ApplicationSearch、WorkspacePreset 与 AppShell。配方用一个受控状态源连接文档集合、当前文档、当前章节、列表/网格布局、应用搜索、收藏、上一篇/下一篇以及两层宽窄面板。索引和正文分别覆盖 ready / empty / loading / error，失败恢复不会丢失当前选择。它是示例层代码，不新增公共导出或组件族。

本配方共 11 个 Story：参数调试、内容阅读工作面、窄屏文档选择与阅读、网格文档库、空文档库、文档库加载中、文档索引失败与恢复、空正文、正文加载中、正文失败与恢复，以及选择/定位/收藏交互。Playground 在同一页面公开标题、两类数据状态、文档/章节、查询、列表/网格、两层布局与活动面板、搜索、收藏和空态文字。

## 交互与视觉

`npx playwright test tests/content-recipe.spec.ts`：13/13 通过。覆盖七个现有能力的真实组合、文档选择与章节重置、窄屏两级面板切换、索引/正文失败恢复、空/加载边界、应用搜索、交互 Story、同页 Controls，以及深/浅主题 × 紧凑/舒适密度的 axe 与横向溢出。

配方的 11 个 Story × 深浅主题 × 两种密度共 44 次 Storybook 审计：44/44 通过，0 页面错误、0 可访问性违规、0 横向溢出。审计报告为 `.logs/content-recipe/storybook-audit.json`；实际检查 `.logs/content-recipe/dark-compact.png`、`.logs/content-recipe/light-comfortable.png` 与 `.logs/content-recipe/narrow-dark-compact.png`。ContentNavigation、ResourceView、ResourceList 与 MarkdownContent 的 82 项相关回归全部通过。

实际查看 Nuxt UI 4.11.1 当前 ContentNavigation、ContentToc、ContentSearch 和 ContentSurround。官方内容页用全局文档树、主要阅读栏、右侧页内目录和正文后的上一篇/下一篇建立层级；ContentSurround 默认以两块较宽链接卡承载标题和说明。Reito UI 面向紧凑桌面工作面，把文档集合放入可切换左槽、目录放入阅读器内槽，相邻文档使用固定的轻量底栏。与官网相比，本配方保留更多本地集合控制和双层窄屏切换，不复制 Nuxt Content 数据接口或营销站布局。

## 仓库检查

- `npm run tokens:audit`：通过，0 个未批准项。
- `npm run check`：通过。目录仍为 130 个组件族（基础 70 / 复杂 40 / AI 20）；Content recipe 不计为组件族。
- `npm run build`：通过。tokens、catalog、UI、Lab、Storybook 和 Workbench 均完成生产构建。
- Storybook 当前共 1352 个 Story，其中 1333 个属于组件族目录，Dashboard 与 Content 两个应用配方共增加 19 个 Story。

复用方式见 [Content 工作面配方](recipes/content-workspace.md)。
