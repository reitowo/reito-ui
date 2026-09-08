# DASHBOARD-RECIPE-01 · Dashboard 工作面配方验收

## 范围

新增 Storybook 应用配方，直接组合 Sidebar、AppShell、WorkspacePreset、DataTable、Form 与 ApplicationSearch。配方包含本地任务的新建、完成、筛选、页面切换与搜索，覆盖 Sidebar 和检查器偏好恢复、移动端覆盖导航、宽窄布局以及表格的 ready / empty / loading / error 状态。它是示例层代码，不新增公共导出或组件族。

本配方共 8 个 Story：参数调试、任务工作面、窄屏工作面、布局偏好保存与恢复、空任务、任务加载中、任务失败与重试，以及新建/完成/搜索交互。Playground 在同一页面公开标题、工作区标题、布局模式、当前页面、侧栏、检查器、活动面板、数据状态、搜索弹层和空态文字。

## 交互与视觉

`npx playwright test tests/dashboard-recipe.spec.ts`：12/12 通过。覆盖六层真实组合、本地新建/完成/搜索、保留缓存的失败恢复、空/加载状态、窄面板切换、移动 Sidebar 选择后关闭、刷新恢复偏好、同页 Controls，以及深/浅主题 × 紧凑/舒适密度的 axe 与横向溢出。

配方的 8 个 Story × 深浅主题 × 两种密度共 32 次 Storybook 审计：32/32 通过，0 页面错误、0 可访问性违规、0 横向溢出。审计报告为 `.logs/dashboard-recipe/storybook-audit.json`；实际检查 `.logs/dashboard-recipe/dark-compact.png`、`.logs/dashboard-recipe/light-comfortable.png` 和 `.logs/dashboard-recipe/narrow-dark-compact.png`。

DataTable 的滚动容器补充了可聚焦 `region` 与名称，使 loading 等没有可聚焦行的状态仍可通过键盘进入滚动区域。DataTable 列筛选、列管理、受控状态、编辑、偏好、虚拟化和行分组的 84 项相关回归全部通过。

实际查看 Nuxt UI 4.11.1 当前 DashboardGroup、DashboardPanel、DashboardSidebar、DashboardSearch 与 DashboardToolbar 文档。参考工作面使用轻量导航、短工具栏、主内容面板与可折叠辅助区域。Reito UI 保留自己的 Graphite 灰阶、紧凑密度、React 状态契约和现有组件 API；本地页面没有复制 Vue context、源码、CSS、品牌色、字体、图标或资源。

## 仓库检查

- `npm run tokens:audit`：通过，0 个未批准项。
- `npm run check`：通过。目录仍为 130 个组件族（基础 70 / 复杂 40 / AI 20）；Dashboard recipe 不计为组件族。
- `npm run build`：通过。tokens、catalog、UI、Lab、Storybook 和 Workbench 均完成生产构建。
- Storybook 当前共 1341 个 Story，其中 1333 个属于组件族目录，新增 8 个为 Dashboard 应用配方。

复用方式见 [Dashboard 工作面配方](recipes/dashboard-workspace.md)。
