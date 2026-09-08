# CONTENT-NAV-01 · 文档导航联动验收

## 范围

新增 `ContentNavigation`，用稳定章节 ID 组合层级 TreeView 与 WorkspacePreset 正文滚动区。目录选择、用户滚动和外部受控值双向同步，回调通过 `navigation / scroll` 说明来源；程序化滚动忽略经过的中间章节，到达滚动底部时选择最后一章。覆盖嵌套目录、禁用项、长标题、空章节、空文档、宽布局目录显隐和窄布局面板切换。`WorkspacePane` 新增可选 `bodyRef`，供组合组件取得既有滚动区；TreeView 新增独立 `currentId`，将当前位置表达为 `aria-current="location"`，不改变选择契约。

本族共 12 个 Story：参数调试、默认、嵌套、受控路由、滚动同步、长标题、空章节、空文档、禁用项、窄布局、隐藏目录和键盘交互。Playground 在同一页面公开布局模式、当前位置、目录显隐、活动面板、滚动方式、标题/空态文字及四个内容状态开关。

## 交互与视觉

`npx playwright test tests/content-navigation.spec.ts`：15/15 通过。覆盖 tree/article/current 语义、TreeView 方向键选择、外部路由定位、阅读滚动同步、嵌套当前位置、长标题、两类空态、禁用项、宽窄布局、同页 Controls，以及深/浅主题 × 紧凑/舒适密度的 axe 与横向溢出。

实际查看 Nuxt UI 4.11.1 当前 [ContentNavigation](https://ui.nuxt.com/docs/components/content-navigation) 与 [ContentToc](https://ui.nuxt.com/docs/components/content-toc)。截图为 `.logs/references/nuxt-ui-content-navigation-2026-09-08.png` 与 `.logs/references/nuxt-ui-content-toc-2026-09-08.png`。

参考页将页面层级导航与自动高亮的页内目录分为两个组件。Reito UI 面向紧凑桌面工作面，将两种职责组合在一个宿主中立组件里：目录使用共享树行高和弱选中面，正文使用 14px 小号界面正文、内容间距与单一当前章节边线；正文是主要视觉表面，没有逐章卡片。实查 760 × 760 的四套本地截图，目录与正文边界柔和、当前项清楚、长内容只在正文内部滚动，未出现页面横向溢出。与 Nuxt UI 的文档站布局仍有产品结构差异，Reito 保留 Graphite 密度、自己的三槽工作区和 React 状态契约，不声明视觉等同。

## 仓库检查

- `npm run check`：通过。目录共 130 个组件族（基础 70 / 复杂 40 / AI 20）；token 审计 0 个未批准项；TypeScript 工作区检查全部通过。
- `npm run build`：通过。tokens、catalog、UI、Lab、Storybook 和 Workbench 均完成生产构建；Vite 仅报告已有的大 chunk 建议。
- ContentNavigation 的 12 个 Story × 深浅主题 × 两种密度共 48 次组合审计：48/48 通过，0 页面错误、0 可访问性违规、0 横向溢出。TreeView 与 WorkspacePreset 共 24 项相关回归同时通过。

用法见 [ContentNavigation 文档导航](components/content-navigation.md)。
