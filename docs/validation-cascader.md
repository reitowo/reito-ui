# CASCADER-01 Cascader 验收

2026-09-07，CASCADER-01 已完成。新增 `Cascader`，覆盖任意深度逐级面板、完整受控路径、叶节点/任意层级边界、完整路径/末级显示、禁用分支、清除、整体与节点级加载错误、lazy 重试、焦点恢复、富选项和稳定 JSON 表单值。全库增为 111 个组件族（基础 67、复杂 25、AI 19），共 965 个 Story。

- Playwright 17 项通过：叶节点完整路径提交、分支不误提交、显式分支选择、末级显示、受控回写、上下左右与 Enter、父级返回、Escape 焦点恢复、禁用分支、清除、空/加载/错误、lazy 加载与重试、JSON FormData、字段错误和同页 Controls；其中四项为主题/密度组合检查。
- 本族 15 个 Story 在 dark/light × compact/comfortable 共 60 次组合中全部通过；页面错误、自动可访问性违规与水平溢出均为 0。
- 440px 工作面四种主题/密度截图均人工查看。多列内容在弹层内部横向滚动，页面本身不溢出；XS 选项行和零额外面板内距保持桌面工具密度。
- 视觉与交互能力对照 PrimeVue 3 CascadeSelect 官方文档。Reito 使用并列列式 listbox 让路径变化保持可见，并用独立分支提交操作消除叶节点边界歧义；其结构、颜色、尺寸与源码均为本项目实现。

证据：[检查](../.logs/cascader/check.log)、[构建](../.logs/cascader/build.log)、[交互测试](../.logs/cascader/tests.log)、[Story 扫描](../.logs/cascader/storybook-audit.json)、[四组合截图](../.logs/cascader)、[源码](../packages/ui/src/complex/cascader.tsx)、[Story](../apps/storybook/stories/complex/Cascader.stories.tsx)、[用法](components/cascader.md)。
