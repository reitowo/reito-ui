# Dashboard 工作面配方

Dashboard 配方展示怎样用现有 Reito UI 能力搭出紧凑桌面工作台。它直接组合 `Sidebar`、`AppShell`、`WorkspacePreset`、`DataTable`、`Form` 与 `ApplicationSearch`，没有增加名为 Dashboard 的公共组件，也不计入组件族数量。

Storybook 入口为 `复杂 / DashboardRecipe 工作面配方`。参数调试 Story 可在同一 Canvas 中修改标题、宽窄布局、当前页面、侧栏、检查器、活动面板、表格状态、搜索弹层和空态文案；其余预设用于分享与回归：任务工作面、窄屏、偏好恢复、空、加载、错误和完整交互。

## 组合职责

- `SidebarProvider / Sidebar` 保存应用导航的展开状态；移动端选择页面后关闭覆盖层。
- `AppShell` 提供短标题栏、主工作区和状态栏，不展示装饰性统计条。
- `WorkspacePreset` 在宽容器并列主任务与检查器，在窄容器切换唯一活动面板。
- `DataTable` 呈现任务、筛选、加载、空与保留缓存的失败状态。
- `Form` 管理新建任务的校验、提交和重置。
- `ApplicationSearch` 在页面、任务与动作之间搜索，并把选择结果交回本地宿主状态。
- `useWorkspaceLayoutState / useWorkspacePresetState` 演示版本化偏好恢复；真实账号同步仍由应用负责。

## 本地交互边界

Story 中新增、完成、搜索和重置任务都只修改浏览器内的 React 状态。偏好示例只写入 Story 专用的 `localStorage` key。它没有连接服务端、账号、数据库或外部搜索，也不表示真实数据已保存。

要在产品中复用这套结构，可从 [`DashboardRecipe.stories.tsx`](../../apps/storybook/stories/complex/DashboardRecipe.stories.tsx) 复制组合关系，再把任务数组、Form 提交、搜索命令和偏好 adapter 换成宿主实现。基础与复杂组件继续从发布包导入，不复制组件源码或覆盖主题值。

## 布局规则

主任务表面占据剩余空间；导航行保持轻量，标题栏只保留当前工作所需动作。表格和工作区各自拥有明确滚动区域。窄布局先收起辅助面板，再由同一工具栏切换内容与检查器。间距、行高、圆角、边界、焦点和动效全部消费 Graphite tokens；页面组合不写孤立颜色或密度值。

验证记录见 [DASHBOARD-RECIPE-01 验收](../validation-dashboard-recipe.md)。
