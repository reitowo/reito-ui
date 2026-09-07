# SHELL-STATE-01 · Workspace / Sidebar 状态验收

## 范围

`ResizableWorkspace` 新增受控 `primaryPercent`、最终布局回调和 `isUserInteraction` 元数据，同时保留非受控默认值、指针与键盘缩放。`useWorkspaceLayoutState` 统一管理 Sidebar 展开状态与主面板百分比，提供版本 1 序列化、旧记录迁移、非法值回退、存储不可用降级、跨标签页同步和重置。`SidebarProvider.persistOpen` 可关闭或配置原有 Cookie 写入。

Storybook 的 Workspace 族现有 10 个 Story，其中 Playground 在同一页面公开受控开关、当前比例、默认比例、最小比例、方向和内容参数；持久化、旧配置、非法尺寸与不可用存储分别有独立 Story。Sidebar Playground 公开 `persistOpen`。

## 交互与视觉

`npx playwright test tests/workspace-state.spec.ts`：13/13 通过。覆盖当前 schema、旧字段迁移、损坏 JSON、未知版本、非法尺寸、规范化序列化、侧栏与键盘分栏保存、刷新恢复、重置、存储不可用、Sidebar Cookie 开关、同页 Controls，以及深/浅主题 × 紧凑/舒适密度的 axe 与页面溢出。

实际查看 Nuxt UI 4.11.1 当前 [DashboardPanel](https://ui.nuxt.com/docs/components/dashboard-panel) 与 [DashboardSidebar](https://ui.nuxt.com/docs/components/dashboard-sidebar)，以及本项目固定依赖对应的 [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) 4.12.x API。截图为 `.logs/references/nuxt-ui-dashboard-panel-4.11.1-2026-09-08.png`、`.logs/references/nuxt-ui-dashboard-sidebar-4.11.1-2026-09-08.png` 和 `.logs/references/react-resizable-panels-4.12.3-2026-09-08.png`。

参考用于核对 DashboardGroup 持有保存配置、面板百分比约束、Sidebar 折叠、最终布局回调、用户输入来源和键盘 Separator。Reito UI 将侧栏与分栏放入一个原创 React 状态 schema，使用 Graphite tokens 和现有 Base UI / shadcn Sidebar；没有复制 Vue API、源码、CSS、品牌色、字体、图标或资源。

在 1440 × 1000 实际比较 dark/compact 与 light/comfortable：主工作面保持平直弱边界，侧栏行和标题栏维持紧凑高度，分隔线不扩大视觉噪声，状态文字留在底边。Nuxt UI 文档示例的主体内距更宽，Reito 继续使用桌面 compact 内容 token；参考是组件文档而非 Cursor 或 Claude Desktop 产品截图，因此本次只验证布局结构与状态行为，不据此声明产品视觉等同。

## 仓库检查

- `npm run check`：通过。目录共 129 个组件族（基础 70 / 复杂 39 / AI 20）；104 个功能源码使用语义色；300 个文件经 token 审计，0 个未批准项；TypeScript 工作区检查全部通过。
- `npm run build`：通过。tokens、catalog、UI、Lab、Storybook 和 Workbench 均完成生产构建；Vite 仅报告已有的大 chunk 建议。
- Workspace 的 10 个 Story × 深浅主题 × 两种密度共 40 次组合审计：40/40 通过，0 页面错误、0 可访问性违规、0 横向溢出。
