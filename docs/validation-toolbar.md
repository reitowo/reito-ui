# COMBO-TOOLBAR-01 · Toolbar 验收记录

## 范围

新增复杂层 `Toolbar`，覆盖带名称的操作分组、action/toggle 状态、disabled/loading、快捷键元数据、尾部状态、滚动与菜单两种溢出策略，以及行内 roving focus。低频操作移入菜单后仍可由鼠标和键盘访问。

Storybook 提供 11 个同族 Story；Playground 在同一画布公开 `label / size / overflow / maxVisibleItems / showLabels / disabled / bold / busy / status` 9 项 Controls。其他 Story 分别展示分组、pressed 状态、菜单溢出、横向滚动、禁用/忙碌、标签与状态、键盘导航和宿主状态内容。

## 交互与视觉

`npx playwright test tests/toolbar.spec.ts`：11/11 通过。验证分组名称、单一 Tab 停靠点、受控 `aria-pressed`、跳过禁用项的左右/Home/End 导航、溢出菜单与 Escape 焦点恢复、横向滚动可达性、loading/disabled、同页 Controls，以及深/浅主题 × 紧凑/舒适密度的 axe 检查和无页面横向溢出。截图保存在 `.logs/toolbar/`。

实际查看 Nuxt UI 4.11.1 [DashboardToolbar](https://ui.nuxt.com/docs/components/dashboard-toolbar) 与 PrimeVue 5.0.1 [Toolbar](https://primevue.org/toolbar/) 当前浅色桌面文档，视口 1280 × 900；截图为 `.logs/references/nuxt-ui-dashboard-toolbar-2026-09-07.png` 与 `.logs/references/primevue-toolbar-2026-09-07.png`。两者都把工具栏作为短横向操作容器；Nuxt 放在 DashboardNavbar 下，PrimeVue 公开 start/center/end 内容槽。

Reito UI 使用自己的 React 数据契约、Graphite Button/Separator/DropdownMenu 和语义 tokens。它把状态按钮、显式溢出优先级、横向滚动与 roving focus 收进同一公共组件。与参考仍保留的差异是：本组件不绑定 DashboardPanel，不提供任意 center 内容槽，也不复制 Vue API、CSS、品牌色、图标、字体或示例资源。

## 仓库检查

- `npm run check`：通过。tokens 与 catalog 同步；102 个功能源文件只使用语义色；100 对颜色对比通过；296 文件 token 审计 0 个未批准项；UI、Lab、Storybook、Workbench 类型检查通过。
- `npm run build`：通过。tokens、catalog、UI 包、Lab、Storybook 与 Workbench 均完成生产构建。现有 Vite chunk size 提示不影响产物生成。
- `node scripts/check-storybook.mjs --base-url http://127.0.0.1:6007 --story-ids <本族 11 个 ID>`：44/44 通过；1 个自动 play Story，0 页面错误、0 控制台错误、0 axe 违规、0 全页横向溢出。报告为 `.logs/toolbar/storybook-audit.json`。
