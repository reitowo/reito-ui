# 全组件 Token 审计

2026-09-06，工作区源码，覆盖 **88 个组件族、197 个源文件**：基础 primitives/basic、复杂、AI、Lab、Workbench、Storybook 示例与主题配置。结论是原实现确实存在未桥接的 Tailwind 默认尺度、原始视觉值和局部覆盖，已集中修正，并把审计纳入 `npm run check`。

## 已修正的问题

| 原问题 | 现在的统一入口 |
| --- | --- |
| Tailwind 的 spacing、字体、字重、行高、圆角、阴影和动画仍部分使用上游默认值 | `tokens.json` → 生成的 `@theme` 桥接；普通 `p-2` / `text-sm` 等继续可用 |
| Button、Input、Select 等先写固定高度，再由全局 `[data-slot]` 规则覆盖 | 组件 variant 直接引用 density token，删除全局高度补偿块 |
| InputGroupButton 只改 data-size，底层 Button 仍使用 default size | 传入真实 size，图标和按钮高度一同切换 |
| 3px 焦点环、0.8rem 小字、Switch 任意 px、Sidebar 私有宽度、固定动画时间 | 原创 foundation 角色，焦点为 2px，小控件字号为 13px，侧栏为共享宽度 |
| 遮罩黑色和 Slider 白色、禁用透明度在控件中写死 | `overlay`、`control-thumb`、`opacity-disabled` |
| Popup 偏移与 Tooltip 延迟需要纯数字 | 生成 `@reito/tokens/metrics`，从同一 token 源取得默认值 |
| Composer 没用自己的背景与圆角，Attachment 按钮覆盖尺寸，Calendar 控件密度不同步 | 分别采用 composer 角色、真实 icon-sm 和统一日历单元格尺寸 |
| 表格页码选择、复杂示例内容、AI 内距仍有局部固定值 | NativeSelect 与 content/cell/empty 等角色 |
| Lab 字号、字重、边缘留白、图标尺寸；Workbench 面板宽度；Storybook 画布 padding 独立定义 | 共享字体、spacing、layout tokens；Lab 10/11px 辅助字统一为 12px，550 字重归为 500 |

保持界面 14px、阅读 16px 的既有分工。`text-sm` 是 14px 的 Tailwind 语义桥接；`--rui-text-sm` 是原有 13px 小控件角色，不按名称相似直接互换。普通尺度只需接入一次桥接，不把每个 `p-2` 都展开成长 CSS 表达式。

源码均为本库对原有 shadcn/Base UI 生成组件的本地修改；上游来源和许可保持 [原始来源记录](shadcn-provenance.json)，本次不把这些修改声称为上游默认行为。

## 构建期与运行时

- **运行时 CSS 变量**：颜色、字体、间距、圆角、阴影、控件高度、动画时间。浏览器测试实际覆盖修改 token 后 Input/Button 的字号、高度、圆角、padding、字重变化，以及 Composer 背景/圆角变化。
- **构建期容器尺度**：`foundation.container-*` 生成 `--container-*` 的具体值。容器查询不能使用运行时 `var()`；检查器要求生成常量与源 token 完全匹配。视觉复查发现并修复过此问题，新增宽/窄工作台分栏回归。
- **数字 API 默认值**：`tokenMetrics` 将 rem 按 16px 基准换成 px，将 duration 换成 ms。CSS 运行时覆盖不影响这组 JS 默认值；调用方仍可传入 sideOffset/delay 等 props。修改源 token 并重建会统一更新两份输出。
- **动画**：除普通 transition 外，显式接管 tw-animate-css 的 enter/exit、accordion/collapsible 和 caret/spin/pulse 默认时长与 easing。保留第三方用于运行状态的 `--tw-*` 参数。

## 保留值与检查边界

**25 条逐项审核的例外，对应 28 处使用**，见 [精确例外清单](design-token-policy.json)：固定示例窗口 420/480px、CSS/JS 响应断点、组件内部局部层叠次序、reduced-motion 的 0.01ms 技术最小值。每条限制文件、表达式、出现次数并说明原因；删除后留下的过期例外、新增出现次数、未知 token、原始颜色或桥接缺失会失败。没有整仓快照放行。

另有结构值不伪装成视觉 token：0、百分比、分栏比例、网格轨道、细线、旋转、语义色的透明混合、平台 Canvas/CanvasText 系统色、第三方锚点变量。标准 spacing/font 等会核对桥接；它们属于已受 token 管理的尺度。

8 项运行时表达式已逐项查看：Lab 开合/选中 class，有限语义色数组的色块引用，TokenUsage 进度百分比，响应宽度计算，AspectRatio 比例，Sidebar 骨架随机宽度，ToggleGroup 数字 spacing。均为已知状态、合法名称集合或数据几何；静态扫描仍把它们显示为 runtime，不声称已穷尽所有调用方动态输入。

运行 `npm run tokens:audit`，生成 [完整逐项清单](../.logs/design-token-audit/inventory.md) 和 [机器可读 JSON](../.logs/design-token-audit/inventory.json)。扫描为 AST/CSS 源码检查，不能自动判定每次语义角色选择是否合适，也不能代替视觉与交互验证。

## 验证

执行结果、截图和限制见 [本轮验证](validation-token-audit.md)。这次变更尚未覆盖旧的 0.4.1 tarball；复用新行为需要消费当前源码，或在完成后续版本发布流程后安装新包。
