# TaskQueue 单行布局

2026-09-06，Windows / Microsoft Edge，工作区源码。原 TaskQueue 将操作组作为每条任务的独立 grid 子项，所以宽屏也另起一行。现在共享组件将图标、任务信息、状态和操作放在同一主行，通过共享列对齐状态和操作；标题与可选说明同排，错误详情保留完整换行。

行内使用现有 cell 内距与 XS 按钮。默认单行内容高 36px / 52px，加行分隔线为 37px / 53px。根据队列自身宽度决定动作文字是否显示，窄面板使用 24px / 32px 正方形图标按钮，保留完整 aria-label 与提示；长标题和说明保留原文及悬停提示。没有为 Lab 或 Workbench 添加页面样式覆盖。

## 本次结果

- `npm run check`、`npm run build`：通过。[检查日志](../.logs/task-queue-layout/check.log)、[构建日志](../.logs/task-queue-layout/build.log)。构建保留已有大于 500kB chunk 提示，未提高阈值。
- TaskQueue 6 stories × dark/light × compact/comfortable，24/24 通过；3 个 play 覆盖主行几何对齐、暂停/继续/取消/重试/筛选、回调错误、256px 长标题、窄容器图标动作及错误换行。[报告](../.logs/task-queue-layout/storybook.json)。结束状态无 page/console error、axe 违规或页面水平溢出，扫描期间源码指纹一致。
- Workbench 既有本地请求入队、暂停/恢复、新建会话测试 1/1 通过。[日志](../.logs/task-queue-layout/interaction.log)。
- Lab 与 Workbench 的 8 组主题/密度量度：标题与动作垂直中心偏差均为 0，按钮位于队列边界内，无页面溢出；[实际根主题与尺寸](../.logs/task-queue-layout/metrics.json)。Workbench 使用独立的 `reito-workbench-theme/density` 偏好键，量度同时断言实际根 data-theme / data-density。

## 视觉对照

参考本次用户标注的 dark / compact TaskQueue 整页截图，复现 1503×1216 视口，实际查看修改后的暗色紧凑 Lab 和浅色舒适 Workbench 队列。宽处标题、说明、状态、操作同排，各行状态列和操作列对齐；窄工作面动作仍可达。错误内容占下一行，保持可读。字体、配色和组件边界沿用现有主题，本次只修改队列布局，不据此声称与产品参考像素一致。

![暗色紧凑任务队列](../.logs/task-queue-layout/lab-dark-compact.png)

本次未重跑全库扫描、独立 tarball 或真实浏览器 200% 缩放；已有 0.4.1 tarball 保留原样。
