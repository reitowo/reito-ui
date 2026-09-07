# SHELL-PRESET-01 · Workspace 布局预设验收

## 范围

新增 `WorkspacePreset`，提供 navigation、workspace 和 inspector 三个结构化槽位；每个槽位复用 `WorkspacePane` 的固定标题/底栏与独立滚动。宽布局让主工作面占用剩余空间并可分别显隐辅助面板；窄布局只显示当前活动面板；auto 模式基于组件容器宽度切换。新增 `useWorkspacePresetState`，独立保存导航显隐、检查器显隐和窄布局活动面板，支持版本 1、旧字段迁移、异常回退、跨标签页同步与不可用存储降级。`ResizableWorkspace` API 和原有状态 schema 未修改。

Workspace 族共 18 个 Story，其中新增宽工作面、窄屏切换、容器自适应、槽位独立滚动、可选辅助面板、当前状态恢复、旧状态迁移与存储不可用 8 个预设。Playground 在同一页面公开预设/基础分栏切换、auto/wide/narrow、两个辅助面板显隐、当前面板、分栏方向/比例、标题和滚动参数。

## 交互与视觉

`npx playwright test tests/workspace-preset.spec.ts`：16/16 通过。覆盖当前/旧 schema、损坏和未知版本回退、规范化序列化、宽布局显隐、刷新恢复、跨标签页状态同步、窄布局单面板切换、基于容器而非视口的响应、两个槽位滚动互不影响、可选面板、存储不可用、同页 Controls，以及深/浅主题 × 紧凑/舒适密度的 axe 与横向溢出。`tests/workspace-state.spec.ts` 原有 13/13 项同时通过；Playground 回归先在同一 Story 切换到基础分栏，再验证受控比例，证明预设没有替代底层契约。

实际查看 Nuxt UI 4.11.1 当前 [DashboardGroup](https://ui.nuxt.com/docs/components/dashboard-group)、[DashboardPanel](https://ui.nuxt.com/docs/components/dashboard-panel)、[DashboardSidebar](https://ui.nuxt.com/docs/components/dashboard-sidebar) 与 [DashboardSidebarToggle](https://ui.nuxt.com/docs/components/dashboard-sidebar-toggle)。截图为 `.logs/references/nuxt-ui-dashboard-group-4.11.1-2026-09-08.png`。

参考用于核对固定溢出边界、Sidebar/Panel 组合、响应式支持面板、显隐入口和持久化职责。Reito UI 的宽布局保持中性平直的三列工作面，导航与检查器使用共享宽度 token，主内容占据余量；窄布局保留同一 DOM 和状态，只展示一个活动槽位。实现没有复制 Vue context、源码、CSS、品牌色、字体、图标或资源。

在 1180 × 760 的 dark/compact 宽布局与 430 × 760 的四主题密度窄布局中实际检查：顶栏和面板标题保持短行，辅助列不挤压主工作面，每个内容区在固定外壳内独立滚动，底部状态固定。窄布局的三个 XS 切换按钮保持一行并无水平溢出。Nuxt UI 文档页本身是组件说明而非完整产品工作区，本次只对齐结构和行为；Reito 仍保留更紧凑的 Graphite 间距和自己的三槽 API，不声明视觉等同。

## 仓库检查

- `npm run check`：通过。目录共 129 个组件族（基础 70 / 复杂 39 / AI 20）；104 个功能源码使用语义色；300 个文件经 token 审计，0 个未批准项；TypeScript 工作区检查全部通过。
- `npm run build`：通过。tokens、catalog、UI、Lab、Storybook 和 Workbench 均完成生产构建；Vite 仅报告已有的大 chunk 建议。
- Workspace 的 18 个 Story × 深浅主题 × 两种密度共 72 次组合审计：72/72 通过，0 页面错误、0 可访问性违规、0 横向溢出。
