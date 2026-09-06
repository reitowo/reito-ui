# Workspace 目录密度

2026-09-06，Windows / Microsoft Edge，工作区源码。用户标注 Workspace 示例文件树过大：共享 DisclosureTree 普通行原为 32px，另有 4px 行间距与目录展开留白；README 说明另占一行。示例还叠加 12px 外围 padding，并将 60% 宽度分给目录。

现在目录树共享 XS 最小行高、4px 自有边缘空间，取消行间空白并收紧层级缩进，文件名与可选说明同排。字号保持 14px；长文字截断，完整名称和说明保留在 DOM 可访问名称与 title 中。Workspace 示例移除额外目录包裹，并显式使用目录 30% / 预览 70%；通用分栏组件默认值未改。共享变更同时用于独立 DisclosureTree、Lab Workspace 和 Storybook。

## 实际结果

- `npm run check`：通过。tokens/catalog 同步、语义样式、100 对颜色与全部工作区类型检查。[最终日志](../.logs/workspace-density/check.log)。首次检查与 token 生成并发时报告生成文件不同步；生成结束后独立重跑通过，未修改 token 源。[首次日志](../.logs/workspace-density/check-initial.log)。
- `npm run build`：通过，UI、Lab、Storybook、Workbench 均构建成功。[日志](../.logs/workspace-density/build.log)。随后对最终 story 变更重建 Storybook 也通过：[日志](../.logs/workspace-density/storybook-build.log)。已有大于 500kB chunk 提示保留，未调整阈值。
- 5 个受影响 stories × dark/light × compact/comfortable：**20/20 通过**，3 个 play；无 page/console error、axe 违规或页面水平溢出，扫描前后源码指纹一致。[报告](../.logs/workspace-density/storybook.json)。新增 208px 长名称目录例，全库目录更新为 220 stories。
- 真实浏览器交互：**4/4 通过**，覆盖四种主题/密度下原生 summary 的 Enter/Space、文件选择与预览同步、Tab 跳过禁用项、指针拖动分栏及方向键调整。[测试](../tests/workspace-density.spec.ts)、[日志](../.logs/workspace-density/interaction.log)。首次 story 扫描 16/20 通过，失败为 user-event 14.6.7 不模拟 summary 的键盘默认激活；story 改为点击展开，原生键盘验证使用 Playwright，并未给组件添加替代按键逻辑。[原始报告](../.logs/workspace-density/storybook-initial.json)。
- Lab 1503×1216、1280×800、960×800，各四组合共 12 组量度通过：无目录/行/页面水平溢出，实际根主题和密度匹配。紧凑行 24px、舒适行 32px，README 同高；紧凑目录内容从约 306px 收至 200px（含自身 4px 边缘），舒适为 264px。[修改前](../.logs/workspace-density/before.json)、[修改后](../.logs/workspace-density/after.json)。

## 视觉对照

参考本次用户提供的 dark / compact Workspace 整页截图，复现 1503×1216 视口，并实际查看修改前暗色紧凑、修改后暗色紧凑和浅色舒适整页。目录成为紧凑导航列，文件预览获得主空间；文件名、状态选中与目录层级保持清楚。配色、字体、工作区外框和示例总高度沿用现有规范，预览区阅读间距未在本次调整。本次不声称与 Cursor 或 Claude 像素一致。

![紧凑目录与主预览](../.logs/workspace-density/after-dark-compact.png)

本次未重跑全库扫描、独立 tarball 消费或真实浏览器 200% 缩放；已有 0.4.1 tarball 未覆盖。
