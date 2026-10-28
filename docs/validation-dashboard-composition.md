# Dashboard 命名与完整导航验证

## 变更

使用 DashboardGroup／Sidebar／Panel／Navbar 与明确的侧栏区域、菜单及控制组件。
移除 Shell 源码与导出、AppShell 实现；WorkspacePreset 更名为 WorkspaceLayout，
两栏状态明确为 useResizableWorkspaceState。没有旧组件兼容别名。
迁移、区域树与 API 边界见 [组件与迁移](dashboard-composition.md)。

## 实际验证

- `npm run check`：命名目录、recipe、格式、tokens、分层和各 workspace 类型检查通过。
- `npm run build`：UI、Lab、Storybook、Workbench 构建通过；最后修改后分别重建 UI 与示例。
- `npm run test:composition`：30 项通过。消费编译包，无应用 CSS、源码别名或 Tailwind 插件。
- 五个相关工作台测试文件：69 项通过，42 秒；包括交互、持久状态、滚动、窄容器及可访问性。
- 最后截图同步后，Dashboard 与嵌入窄容器 7 项再跑通过，18.7 秒；是同一测试范围的重复验证。
- 两种主题、三种密度；实际导航行占满可用宽度，身份固定底部，桌面折叠保留正文草稿。
- 窄屏及桌面内窄容器使用抽屉，正文不被挤窄；Escape 恢复焦点，导航选择关闭菜单。
- 编译导出检查确认旧三个入口不存在，新 Dashboard 与工作区入口可导入。

## 失败与修复

- 初次 token 审计发现条件定位重复书写 z-10，超过既有一处审阅例外；提取共用层级类后审计通过。
- 第一轮组合检查 23 项通过、7 项失败；测试未先打开权限档位页签就操作隐藏草稿。
  修正测试进入对应页签后，同范围 30 项通过。
- 原工作台第一轮 67 项通过、2 项失败：Story 的自定义 SelectInput 仍按原生 select 操作，
  示例文件名又被命名替换误改，导致原搜索词失配。改用公开下拉选项交互并恢复示例文件身份，
  重建示例后同范围 69 项通过。
- 展开导航的截图等待实际宽度恢复，避免把过渡中的画面当作最终布局；最后 7 项通过。
- 最后类型检查发现将 Playwright 的 exact 选项用于 Story 的 Testing Library；改用锚定名称正则。

截图只包含编译包的本地示例，无真实业务请求。候选 API 清理未公开发包或部署消费项目。
