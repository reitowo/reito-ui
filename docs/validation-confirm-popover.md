# COMBO-CONFIRM-01 · ConfirmPopover 验收记录

日期：2026-09-07

## 范围

新增复杂层 `ConfirmPopover` 组合，复用 Graphite `Button` 与 Base UI modal `Popover`。验收覆盖锚点位置、普通/危险确认、取消、外部 pending/error、异步成功/失败、重复提交保护、受控打开、禁用、焦点循环、Escape 和关闭后的焦点恢复。

## 行为验证

- `tests/confirm-popover.spec.ts`：13/13 通过。
- 点击、Enter 均可打开 `alertdialog`；取消或 Escape 后弹层关闭并把焦点还给触发器。
- modal 焦点在取消与确认操作之间循环，危险确认不会获得默认初始焦点。
- 异步成功期间两项操作禁用并暴露 `aria-busy`；完成后关闭。Promise 拒绝时弹层保留，错误由 `role="alert"` 说明，操作可重试。
- 外部 `pending / error`、禁用触发器以及受控 `open / onOpenChange` 均有独立场景。
- Playground 的文案、危险状态、外部 pending/disabled、位置、对齐和异步结果可在同一个 Story 中由 Controls 修改；打开与关闭双向同步。
- dark/light × compact/comfortable 四组均保持锚点对齐、无页面水平溢出，定向 WCAG 2A / 2AA / 2.1AA axe 扫描无违规。

## Storybook 与构建

本族提供 10 个 Story：Playground、默认示例、危险确认、附加详情、外部忙碌、宿主错误、异步成功、异步失败/重试、禁用与键盘/焦点。10 × 4 = 40 次冻结 Story 组合全部通过：页面错误 0、控制台错误 0、WCAG 违规 0、横向溢出 0。最终全仓 `npm run check` 与 `npm run build` 结果记录在本次提交验证中。

## 视觉对照

实际查看 PrimeVue 官方 [ConfirmPopup](https://primevue.org/confirmpopup/) 当前浅色桌面页面，视口 1280 × 900，截图保存在本地 `.logs/references/primevue-confirm-popup-2026-09-07.png`。参考页面确认了“触发器旁的小型提示面 + 图标/短说明 + 取消/确认”的局部结构，并展示弹层箭头指向触发器。

Reito UI 在 960 × 720 下检查了 Graphite dark/compact 与 light/comfortable。组件同样贴近触发器，但使用无箭头的安静浮层、清楚的标题/说明层级、单一顶部分隔和右对齐操作；紧凑模式保持短内距，舒适模式只通过共享 density tokens 扩大，不写局部固定值。

仍有意保持的差异：不复制 PrimeVue 的品牌颜色、警告图标、箭头、服务式 API、字体、圆角、阴影或 CSS。Reito UI 使用声明式 React props、Base UI 焦点管理和 Graphite 原创 tokens，并额外定义异步 pending/error、失败重试与宿主受控状态。
