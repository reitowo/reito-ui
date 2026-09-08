# COMBO-INLINE-01 · InlineEdit 验收记录

## 范围

新增复杂层 `InlineEdit`，从 PropertyList 的文本/数字编辑事务中提炼单值契约：显示与编辑槽、受控值和编辑模式、草稿、提交/取消、同步校验、可取消异步保存、失败恢复、中文输入法保护、焦点恢复、只读与禁用。

Storybook 提供 12 个同族 Story；Playground 在同一画布公开 `label / value / kind / editing / disabled / readOnly / required / min / max / saveBehavior / customDisplay` 11 项 Controls。其他 Story 覆盖数字范围、必填错误、异步失败、异步 pending/取消、禁用、只读、空值、自定义显示/编辑槽和键盘提交。

## 交互与视觉

`npx playwright test tests/inline-edit.spec.ts`：12/12 项一次性通过。覆盖提交、Escape 取消、同步/数字校验、异步失败、pending 中止、只读/禁用、两个插槽、同页 Controls，以及深/浅主题 × 紧凑/舒适密度的 axe 与页面溢出。

实际查看 PrimeVue 5.0.1 [Inplace](https://primevue.org/inplace/) 当前浅色桌面文档，视口 1280 × 900；截图为 `.logs/references/primevue-inplace-2026-09-07.png`。参考展示 display/content 两态、受控 active、显示按钮键盘入口和关闭入口。Reito UI 使用自己的 React 单值事务、Graphite Input/Button/Field 和语义 tokens，增加显式保存/取消、校验、AbortSignal、失败保留草稿和焦点恢复；没有复制 Vue API、默认 polite live region、CSS、品牌色、字体、图标或资源。

## 仓库检查

- `npm run check`：通过。目录共 128 个组件族（基础 70 / 复杂 38 / AI 20）；103 个功能源码使用语义色；298 个文件经 token 审计，0 个未批准项；TypeScript 工作区检查全部通过。
- `npm run build`：通过。tokens、catalog、UI、Lab、Storybook 和 Workbench 均完成生产构建；Vite 仅报告已有的大 chunk 建议。
- InlineEdit 的 12 个 Story × 深浅主题 × 两种密度共 48 次独立组合审计：48/48 通过，0 页面错误、0 可访问性违规、0 横向溢出。
