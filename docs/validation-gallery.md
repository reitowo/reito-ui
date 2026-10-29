# 示例 · 2026-10-22

公开站点是 Reito UI Lab（GitHub Pages：`https://reitowo.github.io/reito-ui/`）。示例索引在 `/templates`。工作台、对话和落地页是中性模板，源码在 `apps/lab/src/templates/`。南窗仍是其中一张示例，源码在 `apps/lab/src/examples/nanchuang/`，地址是 `/templates/nanchuang/<page>`（旧的 `/?view=gallery` 与 `/?view=examples&example=nanchuang` 会改写到这条路径）。这是一本虚构城市杂志的编辑室：第 42 期封面是周宁的《雨季的书店》。主编林夏、校对陈麦、美编阿禾，印刷厂江岸印务把潮了的封面退了回来。页面之间共用同一期的稿件、批注、作者和校样。应用里的刊名不出现在组件库首页。

地址用路径段，不再用 `page` 查询参数。缺省打开 `/templates/nanchuang/dashboard`。

## 页面

- 本期 `dashboard`：选题 / 改稿 / 校对 / 付印。点开稿件，移到另一栏。顶栏搜索筛不到时是空状态。
- 稿件 `files`：稿件列表和《雨季的书店》稿纸。可改、收进草稿箱，并在第一稿 / 第二稿之间切换。旁边是这一期的批注。
- 审稿 `events`：批注收件箱。按人和处理状态筛选，写回复，标成已处理。显示菜单里的自动换行会折行。
- 作者 `inspector`：名册和详情。行菜单可改栏目；右键可以再约一次，或打开这一期的稿纸。
- 校样 `trace`：印刷进度。当前状态、每一步记录、重新送印，以及向印刷厂询问（先转圈，再给出档期）。
- 发稿 `commands`：周五核对清单。本期操作里可以改这一期的标题，标题会出现在顶栏。
- 室规 `settings`：截稿提醒、校样条位置、折行、夜灯，以及密度和深浅。

顶栏是刊名、这一期标题、搜索和林夏的菜单。密度和深浅在这个菜单里，也在室规的外观一组。`?view=dense` 仍锁定高密，不提供密度切换。顶栏高度跟随 `control-height-lg`，分栏标题跟随 `control-height + space-2`。

窄屏（≤640px）把侧栏换成横向页面标签，看板改成一列，详情用返回回到列表。首页与编辑室均不横向溢出。

## 检查

- `npm run check`、`npm run build`
- `tests/gallery.spec.ts`、`tests/gallery-mobile.spec.ts`、`tests/dense-density.spec.ts`
- 部署说明见 [deployment.md](deployment.md)
