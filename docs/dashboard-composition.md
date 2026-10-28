# Dashboard 组件与迁移

## 唯一工作台组合

| 名称 | 负责什么 |
| --- | --- |
| DashboardGroup | 宿主高度、实际可用宽度、导航状态 |
| DashboardSidebar | 桌面侧栏及窄容器弹层 |
| DashboardSidebarHeader／Content／Footer | 固定品牌、独立滚动导航、底部身份 |
| DashboardNavigationMenu | 数据驱动导航、完整行选中态、禁用和选择后关闭移动端导航 |
| DashboardSidebarToggle | 移动端打开与关闭 |
| DashboardSidebarCollapse | 桌面折叠与展开，状态与移动端分开 |
| DashboardPanel | 主区固定 header／footer 和唯一正文滚动 |
| DashboardNavbar／Body／Footer | 主区顶栏、正文及底部 |
| WorkspaceLayout | 可切换的导航、主工作面和检查器 |
| ResizableWorkspace | 可调整比例的两栏工作面 |

DashboardGroup 默认填满视口；嵌入已有高度的容器使用 height="parent"。
容器宽度由组内部观察，断点来自 container-2xl token；应用不另写窗口断点。
侧栏桌面定位相对于所属组，窄容器通过已有 Sheet 管理遮罩、焦点及 Escape。
底层 Sidebar 仍是可组合的基础组件；普通应用直接使用上述完整 Dashboard 组件。
主题、密度、控件及导航几何由库统一管理。

## 移除的旧入口

这是 0.6 候选内的破坏性清理，没有兼容别名或空壳转发。

| 原接口 | 替换方式 |
| --- | --- |
| Shell 与 Shell.* | DashboardGroup + DashboardSidebar + DashboardPanel |
| AppShell / AppShellProps | 用 Sidebar 区域及 DashboardPanel 的 header／footer 明确组装 |
| WorkspacePreset 与其类型／hook | WorkspaceLayout 及相应 WorkspaceLayout 类型／hook |
| 原两栏 useWorkspaceLayoutState 与对应状态类型 | useResizableWorkspaceState 与 ResizableWorkspace 状态类型 |

拆分布局原有 JSON 版本、运行状态和业务能力保留，改的是公开命名和区域职责。
Page／Panel 的命名区域与正文主题仍保留。迁移消费端源码后再更新包；不把候选清理当作已公开发布。

## 验证

公开编译包的示例不能依赖应用 CSS、源码别名或 Tailwind 编译器。
覆盖两种主题、三档密度、整行导航、底部身份、桌面折叠、窄屏抽屉、焦点、草稿及桌面内窄容器。
API 清理同时覆盖导出、源码、便携 skill、Lab、Storybook 和已有实际工作台示例。

## 参考

2026-10-28 只读核对 Nuxt UI v4 的原生组件接口与区域职责：

- [DashboardGroup](https://github.com/nuxt/ui/blob/v4/src/runtime/components/DashboardGroup.vue)
- [DashboardSidebar](https://github.com/nuxt/ui/blob/v4/src/runtime/components/DashboardSidebar.vue)
- [DashboardPanel](https://github.com/nuxt/ui/blob/v4/src/runtime/components/DashboardPanel.vue)
- [DashboardNavbar](https://github.com/nuxt/ui/blob/v4/src/runtime/components/DashboardNavbar.vue)

Reito 实现使用已有 React／Base UI 组件和自身主题 tokens，不复制上游 Vue 代码或样式。
