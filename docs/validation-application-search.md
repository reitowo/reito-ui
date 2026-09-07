# SHELL-SEARCH-01 · 应用搜索验收

## 范围

`CommandSearch` 增加当前工作范围、动作标签、加载/错误/重试和整体禁用状态。新增 `ApplicationSearch` 将它组合为受控或非受控 Dialog，提供 `mod+k` 全局快捷键、中文 IME 保护、异步动作 pending/失败恢复、关闭成功策略与焦点归还。结果分组、查询传输、搜索源和命令副作用继续由宿主注入。

Storybook 的 CommandSearch 族共 13 个 Story。Playground 在同一页面公开 inline/Dialog、打开状态、快捷键、当前范围、查询、加载、错误、禁用、标签、占位、空态、动作结果和空 groups；独立 Story 覆盖应用 Dialog、快捷键与焦点、动作失败、宿主异步搜索源和现有命令状态。

## 交互与视觉

`npx playwright test tests/application-search.spec.ts`：11/11 通过。覆盖跨资源分组与动作标签、当前范围、Ctrl+K 打开、Escape 关闭与焦点归还、IME 快捷键保护、异步动作 pending/成功/失败/重试、宿主注入的加载/结果/错误、同页 Controls，以及深/浅主题 × 紧凑/舒适密度的 axe 与页面溢出。

实际查看 Nuxt UI 4.11.1 当前 [DashboardSearch](https://ui.nuxt.com/docs/components/dashboard-search) 与 [CommandPalette](https://ui.nuxt.com/docs/components/command-palette)。截图为 `.logs/references/nuxt-ui-dashboard-search-4.11.1-2026-09-08.png`、`.logs/references/nuxt-ui-command-palette-4.11.1-2026-09-08.png` 和 `.logs/references/nuxt-ui-dashboard-search-open-4.11.1-2026-09-08.png`。

参考用于核对顶部居中的搜索 Dialog、输入、分组结果、描述、行尾快捷键、受控状态和全局入口。Reito UI 保留更窄、更紧凑的 Graphite 工作面，增加当前范围行和显式动作标签；Dialog 使用柔和圆角与语义边界。实现没有复制 Vue API、源码、CSS、品牌色、字体、图标或资源。

在 1440 × 1000 实际比较 dark/compact 与 light/comfortable：搜索面维持单层结构，输入和上下文行较短，文件、任务与动作在同一个滚动列表中，长说明截断且不产生横向滚动。浅色和舒适密度只改变 token 映射，不改变信息层级。Nuxt UI 的文档示例更宽并更靠近视口顶部；本组件为桌面工作区保留紧凑宽度，因此只对齐交互结构与密度方向，不声明产品视觉等同。

## 仓库检查

- `npm run check`：通过。目录共 129 个组件族（基础 70 / 复杂 39 / AI 20）；104 个功能源码使用语义色；300 个文件经 token 审计，0 个未批准项；TypeScript 工作区检查全部通过。
- `npm run build`：通过。tokens、catalog、UI、Lab、Storybook 和 Workbench 均完成生产构建；Vite 仅报告已有的大 chunk 建议。
- 13 个 Story × 深浅主题 × 两种密度共 52 次组合审计：52/52 通过，0 页面错误、0 可访问性违规、0 横向溢出。
