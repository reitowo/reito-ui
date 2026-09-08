# COMBO-OVERLAY-01 · OverlayProvider 验收记录

## 范围

新增复杂层 `OverlayProvider / useOverlay`，在现有声明式 Dialog、Sheet、AlertDialog 之上提供命令式事务。`open` 返回稳定句柄与可等待结果；支持 close、dismiss、patch、isOpen、closeAll、可调内容和底部操作、非 dismissible 模式、并发递归栈、嵌套焦点归还、父层关闭子层，以及 Provider 卸载时结束全部未决 Promise。

Storybook 提供 13 个同族 Story。Playground 在同一画布公开 kind、标题、说明、内容、确认/取消/关闭文案、Sheet 方向、危险动作、可关闭性和取消按钮 11 项 Controls；其他 Story 独立覆盖三种基础浮层、非 dismissible、嵌套、并发、patch、closeAll、父层关闭子层、卸载和句柄关闭。

## 交互与视觉

`npx playwright test tests/overlay-provider.spec.ts`：18/18 项一次性通过。覆盖 Dialog/Sheet/AlertDialog 结果、取消与 Escape 原因、非 dismissible、嵌套焦点、同事件并发栈、patch、closeAll、父层关闭子层、Provider 卸载、句柄关闭、同页 Controls，以及深/浅主题 × 紧凑/舒适密度的 axe、尺寸与页面溢出。

实际查看 Nuxt UI 4.11.1 当前 [useOverlay](https://ui.nuxt.com/docs/composables/use-overlay)、PrimeVue 当前 [DynamicDialog](https://primevue.dev/dynamicdialog/) 与 Base UI 当前 [Dialog](https://base-ui.com/react/components/dialog) 浅色桌面文档，视口 1280 × 900；截图为 `.logs/references/nuxt-ui-use-overlay-2026-09-08.png`、`.logs/references/primevue-dynamic-dialog-2026-09-08.png` 和 `.logs/references/base-ui-dialog-2026-09-08.png`。参考用于核对共享服务、实例句柄、Promise 结果、动态内容、更新、批量关闭、受控状态、焦点与嵌套语义。

Reito UI 使用自己的 React Provider、判别结果联合与 Graphite 基础浮层。与参考相比，它显式结束 Provider 卸载和父层关闭造成的未决事务，并保留调用点/父层焦点；没有复制 Vue 插件 API、源码、CSS、品牌色、字体、图标或资源。官方页面是组件文档而非桌面应用截图，因此视觉比较只确认紧凑层级、明确操作与遮罩关系；实际 dark/compact 与 light/comfortable 截图显示弹层仍使用共享语义表面、软边界和 SM 操作，没有新增独立视觉 token。

## 仓库检查

- `npm run check`：通过。目录共 129 个组件族（基础 70 / 复杂 39 / AI 20）；104 个功能源码使用语义色；300 个文件经 token 审计，0 个未批准项；TypeScript 工作区检查全部通过。
- `npm run build`：通过。tokens、catalog、UI、Lab、Storybook 和 Workbench 均完成生产构建；Vite 仅报告已有的大 chunk 建议。
- OverlayProvider 的 13 个 Story × 深浅主题 × 两种密度共 52 次独立组合审计：52/52 通过，0 页面错误、0 可访问性违规、0 横向溢出。
