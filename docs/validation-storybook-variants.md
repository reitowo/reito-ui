# Storybook 独立变体验证

2026-09-06。用户要求将变体分开展示。本次调整 Storybook 的组织与示例，组件族仍为 88 个；原有 220 条 Story 深链全部保留。

## 展示方式

- 共 526 条 stories：基础 277、复杂 92、AI 157，比原来新增 306 条。
- 核心样式、尺寸、角色和适用状态各自有可选择的 Story。一个 Story 呈现一种状态或一个完整组合场景，不生成无意义状态或所有 props 的笛卡尔积。
- 默认示例排在前面，独立变体随后，“交互示例/交互场景”和“总览对比”另列；旧 export ID 保留。Lab 的生成链接优先 Default，并跳过总览对比；当前 73 个组件族直接链接 Default。
- Docs 只展示默认示例、说明与 API，其余变体从侧栏打开。普通默认示例按内容高度布局；默认打开的弹层及完整侧栏使用一个独立 iframe，预览高度为 container-lg token（当前 512px）。
- Storybook 10.6 的内置 Docs iframe URL 不携带 globals，实测会丢失舒适密度。文档的隔离预览通过 DocsContext 与 GLOBALS_UPDATED 获取主题和密度，显式传入 iframe URL；两项工具栏切换都已实际点击验证。隔离预览的 Docs 使用只读 API 表，参数交互在对应 Canvas 中进行。

## 修正的问题

第一次全量检查为 2,084/2,104 通过，20 个失败来自 5 个新增 Story 的四种组合；无页面异常、控制台错误或页面横向溢出。

1. Combobox 未选择、空选项、错误状态暴露出公共内部图标触发器没有名称。共享 `ComboboxInput` 增加可覆盖的 `triggerLabel`，默认 `Toggle options`；示例使用中文名称，保持原有结构、尺寸和行为。
2. Command 无匹配状态原来将空提示放进 listbox。现在提示在列表外，无匹配时隐藏空列表；根组件提供实际 label，状态容器包住 cmdk 自带的 presentation 内容。新增 play 验证清空查询恢复真实命令，再次输入恢复空态。
3. Resizable 的 Group 内联 `height:100%` 覆盖示例的高度类，使纵向容器只有 3px。高度改由外层示例容器提供，内部内容自然排布；导航与预览有实际可操作控件。四组合实测 Group 为 254px、两个 pane 为 89/164px，初始无内部溢出；缩小后 PageDown 可滚动。
4. 默认打开的 Dialog、Alert Dialog、菜单和 Hover Card 曾同时 Portal 到 Docs 主文档。现在只挂载一个隔离默认示例；五类文档检查均无文档级弹层、无自动滚动跳转。

## 验证

| 检查 | 实际结果 | 证据 |
| --- | --- | --- |
| `npm run check` | 通过；198 个视觉源文件，无未批准的 token 项 | [日志](../.logs/storybook-variants/check.log) |
| `npm run build` | UI、Lab、Storybook、Workbench 全部通过；最后只修改 Story 的等待时序，再次通过 Storybook 构建 | [完整构建](../.logs/storybook-variants/build.log)、[最后构建](../.logs/storybook-variants/storybook-build-final.log) |
| 独立预览与导航 | 72 项通过；526 条索引、88 个族、220 条旧链接保持有效；按钮变体各一个实例，侧栏能切换画布 | [记录](../.logs/storybook-variants/navigation.json) |
| Docs 隔离 | 五类文档各一个默认 iframe，当前 512px；文档级 Portal 为 0，加载后 scrollY 为 0 | [记录](../.logs/storybook-variants/docs-isolation.json) |
| Docs globals | 四组合正确；实际点击工具栏从 light/comfortable 切到 dark/compact，嵌套弹层跟随 | [点击记录](../.logs/storybook-variants/live-globals.json) |
| 定向修正复查 | 20/20，通过交互与自动无障碍检查 | [记录](../.logs/storybook-variants/corrections.json) |
| Lab 目录与偏好 | 2/2，通过目录导航、搜索、主题/密度持久化 | [日志](../.logs/storybook-variants/lab-tests.log) |
| 全量静态 Storybook | 526 条 × 四组合，2,100/2,104 通过；剩余 4 项是同一新增 play 的初始角色等待问题；58 条 play，自动无障碍违规与水平溢出为 0 | [全量报告](../.logs/storybook-variants/storybook.json) |
| 最后静态复测 | 等待组合框输入注册、触发器角色稳定后再操作，Combobox 全部 6 条 × 四组合 **24/24 通过**；没有修改其它 Story 的渲染 | [最后复测](../.logs/storybook-variants/combobox-final.json) |

初次全量失败保留于 [初次报告](../.logs/storybook-variants/storybook-initial.json)。没有关闭 axe 规则或过滤违规节点。Resizable 的实际高度与键盘滚动量度见 [记录](../.logs/storybook-variants/resizable-geometry.json)。

最后一次修正仅将组合框 play 的即时角色查询改为等待查询，适应生产构建中 Base UI 输入注册的时序。其余 525 个 Story 的实现保持全量检查时的版本；该族的 6 条 Story 单独重新验证。全量和最终复测各自的源码指纹在运行期间都未变化。这里明确记录“全量 + 修正复测”，不把它改写为一次 2,104/2,104 的全量运行。

## 实际视觉检查

本次工作场景是组件检查工具。实际查看了修改前的 Storybook Button、Collapsible 深色紧凑画面（1280×800），并与修改后的相同页面比较：侧栏由单个“示例与状态”变为可单独选择的条目；Button 的默认画布只显示一个按钮，Collapsible 的收起/展开/禁用可以直接选择。组件的灰阶、字号、圆角仍来自公共实现与 tokens。

查看了 Collapsible Docs 和 Dialog Docs 的实际截图。普通 Docs 不再为每个变体堆叠整屏空白；隔离弹层局限在自己的预览内，文档保持可读。Storybook 的管理界面使用自身外观，这次没有把它改成应用工作台，也不据此宣称与 Cursor 或 Claude 像素一致。

对照截图：[修改前 Button](../.logs/storybook-variants/before-基础-button.png)、[修改后 Button](../.logs/storybook-variants/after-基础-button--default.png)、[Collapsible 展开态](../.logs/storybook-variants/after-基础-collapsible--expanded.png)、[Collapsible Docs](../.logs/storybook-variants/after-collapsible-docs.png)、[Dialog Docs](../.logs/storybook-variants/after-dialog-docs.png)。

本次未重新打包或覆盖已有 0.4.1 tarball。自动检查只覆盖所运行的示例与状态；不是所有调用方参数组合、跨浏览器或真实读屏认证。
