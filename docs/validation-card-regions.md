# 卡片区域留白验证

日期：2026-10-10。

## 参考与问题

实际查看用户提供的深色任务提案卡片裁图，以及本库 ToolCall 的展开错误区标注。参考的状态区、正文区、操作区有完整独立内距，分隔线贯穿卡片，标题与说明的间隔小于区域间距。未获取参考 DOM、浏览器缩放或 CSS 数值；不能把图像像素等同于 CSS px。私人任务文字和标识不复制进源码、文档或截图产物。

当前总览 dark/compact 的 Card 实测：Header 和 Content 原来只有左右 12px、上下 0；Root 的顶部 8px、区域 gap 8px、Footer 的 8px 内距分别承担不同距离。AgentTaskCard 原来整个外壳 12/8px，内部页脚仅 padding-top=8px，分隔线内缩。ToolCall 将裸字符串 children 和 inline-flex 重试按钮放在同一容器，按钮 mt=8px 参与匿名行盒，上方与下方距离不对称。这些结构都可能通过单个 padding 数值断言，但组合节奏仍不合理。

## 共享规则

| 角色 | compact | comfortable |
| --- | ---: | ---: |
| card-padding-x | 16px | 20px |
| card-padding-y | 12px | 16px |
| card-text-gap | 8px | 12px |

源头为 packages/tokens/src/tokens.json，重新生成 CSS / Tailwind bridge / metrics。短确认、Alert、菜单继续使用原来的 compact-surface 角色，本次不扩张这些小控件。

Card Root 不叠加区域 gap 或上下 padding。各分区提供横纵内距；没有分隔线的相邻 Header / Content 合并成连续内容，标题区不重复底部 padding，正文顶部使用相关文字 gap。Footer 的分隔线贯穿宽度，两侧留白完整。

AgentTaskCard 复用 CardHeader / CardContent / CardFooter，状态上下文、任务内容、操作分三区。ToolCall card 复用同组 tokens；content 包住任意 React children，retry 单独进入 actions，避免文字与按钮共用匿名行盒。行内 ToolCall 保持轻量，但也明确分开正文和操作。

## 实际验证

- npm run tokens:build：通过。
- npm run check：通过，最终补充 Token 目录展示后再次检查。
- npm run build：完整通过，包含 tokens、UI、Lab、Storybook、Workbench；Token 目录展示补充后 Lab 再次构建通过。保留原有大产物体积提示。
- git diff --check：通过。
- 12 项 Playwright 回归通过：button-card-defaults、surface-consistency、component-geometry-audit，各四种 dark/light × compact/comfortable 组合。
- 检查真实文字边缘和分隔线距离、同排区域满宽、Footer 对称内距；不只比较 slot 外框的 CSS padding。
- 修改 card-text-gap 的运行时值可以同时调整普通卡片标题到正文的距离；证明没有依赖 demo 局部覆盖。新的三个角色也在 Lab 的 Tokens 内容密度表展示。
- AgentTaskCard 完成 / 重置后整卡高度不变；ToolCall 重试会进入进行中和完成态，折叠与重新展开正常。错误操作区消失时属于内容变化，没有通过裁切错误信息强制固定高度。
- 全目录四组合几何检查覆盖 139 个组件族的默认按钮、图标和相关面板尺寸；它不等价于全库所有状态视觉验收。
- Storybook Card 新增“组合 · 分区留白”，Playground 增加 divided 控制；可以在同一 Canvas 比较连续内容和分隔区域。
- 浏览器现场复核：dark/compact，总览中的 ToolCall 正文区为 12px 16px，正文独立 48px 高，操作区另提供 12px 上下留白。任务卡与普通 Card 使用同一共享角色。

## 视觉差异与产物

本库采用自己的 Inter / 系统中文字体、13px 界面字号、24px 默认紧凑按钮、语义灰阶和原有状态图标。没有复制参考的品牌、进度条或任务内容；因此只对齐区域组织和留白关系，不声称像素复刻。

截图：.logs/task-card-regions-{theme}-{density}.png、.logs/tool-call-regions-{theme}-{density}.png、.logs/card-spacing-fixed-{theme}-{density}.png。查看了 dark/compact 任务卡、ToolCall 与 light/compact 普通 Card 的实际截图，并在当前用户浏览器的组合总览复核了深色结果。
