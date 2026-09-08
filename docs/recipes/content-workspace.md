# Content 工作面配方

Content 配方把文档集合、页内目录、Markdown 阅读、应用搜索和相邻文档操作放进一个桌面工作面。它直接组合 `ResourceView`、`ContentNavigation`、`MarkdownContent`、`Toolbar`、`ApplicationSearch`、`WorkspacePreset` 与 `AppShell`，不增加公共 Content 原语，也不计入组件族数量。

Storybook 入口为 `复杂 / ContentRecipe 内容工作面配方`。参数调试 Story 可在同一 Canvas 中修改文档列表状态、正文状态、当前文档/章节、查询、列表/网格布局、两层宽窄布局、活动面板、搜索弹层、收藏状态和空态文案。固定预设覆盖默认、窄屏、网格集合、文档库空/加载/失败、正文空/加载/失败及完整交互。

## 组合职责

- `ResourceView` 持有同一个文档集合的查询、排序、单选及列表/网格投影；选中稳定文档 ID 后由配方切换阅读面。
- `ContentNavigation` 同步页内目录、当前章节和正文滚动，窄布局在目录与正文之间切换。
- `MarkdownContent` 渲染宿主提供的 CommonMark/GFM 内容，代码与表格保留局部滚动。
- `ApplicationSearch` 聚合文档、当前章节和相关动作，选择结果写回同一受控文档/章节状态。
- `Toolbar` 提供搜索、上一篇、下一篇、收藏与复制链接；底部相邻文档导航复用同一选择函数。
- `WorkspacePreset` 的外层在文档库和阅读器之间响应式切换，内层只管理页内目录与正文。

## 状态与宿主边界

文档索引失败时，当前已打开正文继续可读；正文失败时保留文档选择并提供重试。集合和正文分别表达空、加载和错误，避免把索引请求与内容请求合并成一个模糊状态。Story 中所有文档、搜索、收藏、复制和跳转都只修改本地 React 状态，没有读取文件、抓取网页或写入服务端。

接入产品时，可从 [`ContentRecipe.stories.tsx`](../../apps/storybook/stories/complex/ContentRecipe.stories.tsx) 复用组合关系，把文档索引、Markdown source、搜索命令、收藏和路由写入替换为宿主实现。宿主应保留稳定文档与章节 ID，并决定 URL 历史、缓存、请求取消及错误恢复策略。

## 布局规则

阅读正文是主要表面。文档集合与页内目录保持轻量并可关闭；相邻文档动作固定在阅读面底部，不在正文中插入装饰卡片。窄工作面先在文档库和阅读器间切换，进入阅读器后再在目录与正文间切换。间距、边界、阅读宽度、焦点和控件高度继续消费 Graphite tokens。

验证记录见 [CONTENT-RECIPE-01 验收](../validation-content-recipe.md)。
