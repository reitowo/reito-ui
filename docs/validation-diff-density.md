# DiffViewer 行高修正

2026-09-06，Windows / Edge，Node 24.11.1。用户在 DiffViewer / 参数调试中反馈行号过高。

原代码行复用了数据表格上下 6/10px 的 cell padding，代码又单独使用 19.5px 行高，行号继承 16px 行高与界面字体。实际普通行在紧凑/舒适模式分别约 31.5/39.5px。现在共享 DiffViewer 的代码区使用等宽字体、`--rui-line-interface` 20px 行高与 token 桥接的 `py-0`；行号、符号、代码和并排空侧均顶部对齐。

同时修正并排换行的列宽。原 `table-fixed` 首行只有两个跨列表头，六列被均分，行号与符号栏抢占代码宽度；现在 colgroup 固定 gutter，并把剩余宽度交给代码。1440px 视口中，长行示例的并排行高由约 324.5px 降为 120.5px，代码仍完整换行。普通单行保持 20px；紧邻折叠边框的行可能计入 0.5px 边框。

## 验证证据

- `npm run check`、`npm run build` 均通过，见 [检查日志](../.logs/diff-density/check.log) 和 [构建日志](../.logs/diff-density/build.log)。
- 差异查看、产物恢复和四种主题密度的工作台无障碍相关交互 **6/6** 通过，见 [页面测试](../.logs/diff-density/ui.log)。
- 最终静态 Storybook 扫描 **468/468** 通过，覆盖 88 个参数调试入口和 Button、Empty、DiffViewer 全部相关预设，共 117 Story；包含统一/并排/换行自动交互，页面/控制台错误、axe 违规和页面横向溢出均为 0，源码指纹一致。见 [报告](../.logs/diff-density/story-audit.json)。
- [修改前度量](../.logs/diff-density/before-metrics.json)与[修改后度量](../.logs/diff-density/after-metrics.json)：16 组 dark/light × compact/comfortable × unified/split × 普通/长行；代码与行号同字体、同 20px 行高、零纵向 padding、首行对齐，无页面横向溢出。
- [宿主验证](../.logs/diff-density/hosts.json)：Lab / Workbench 的 8 组主题密度组合均消费相同 20px 源码行；960×720 的长行可通过键盘局部横向滚动，开启并排换行后没有页面级溢出。
- 本次修改位于 `packages/ui/src/complex/diff-viewer.tsx`，没有在 Storybook 或应用页面加专属覆盖。已有源码内容、增删语义、布局切换、换行开关和可聚焦滚动区域保留。

## 视觉比较

实际查看了用户的完整 Storybook 页面 [修改前](../.logs/diff-density/before.png)，并比较 [修改后页面](../.logs/diff-density/after.png)、[统一视图](../.logs/diff-density/after-playground-unified.png)、[并排换行](../.logs/diff-density/after-wrapped-split.png)、[Lab](../.logs/diff-density/lab-after.png) 和 [Workbench](../.logs/diff-density/workbench-after.png)。普通代码行现在连续排列；长行的行号留在第一行，与相邻代码基线一致。

已打开的场景参考为 [Cursor 2.0 官方截图](../.logs/references/audit-cursor-2.jpg)，来源 [Cursor 2.0](https://cursor.com/blog/2-0)，来源记录保留于 [references.md](references.md)。其右侧文件审查采用连续代码行与对齐行号。浅色本库 [当前截图](../.logs/diff-density/after-light.png) 用于比较行节奏与结构；字号、边界与增删底色仍使用 Graphite 自身定义。截图比例不同，不声称复制其精确尺寸。DiffViewer 仍是宿主提供差异数据的展示组件，没有编辑器或 diff 计算能力。

这次修正不覆盖已有 0.4.1 tarball。
