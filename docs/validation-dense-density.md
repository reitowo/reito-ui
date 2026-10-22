# 高密模式与菜单几何验证 · 2026-10-21

参考：用户提供的深色开发工具“编辑轨迹”面板截图（约 1024×864，见 [references.md](references.md)）与 [Base UI Menu](https://base-ui.com/react/components/menu) 的圆角演示。截图数值是估算目标，不是官方规范；本库取值写在 `packages/tokens/src/tokens.json`。

## 实测几何

Lab `?view=dense&page=trace`（画廊锁定高密的兼容入口；公开入口为 `?view=gallery`），1024×864，深色与浅色。数值由浏览器 `getComputedStyle` / `getBoundingClientRect` 读取，并固化在 `tests/dense-density.spec.ts`。

| 项目 | 参考估算 | 实测 |
| --- | --- | --- |
| 正文 / 等宽 / 最小字号 | 12 / 11 / 10–11px | 12 / 11 / 10px（`text-sm` / `text-xs` / `text-2xs`） |
| 卡片头行 | 22–24px | 22px（4px 上内距 + 18px 行） |
| 子行（源码预览、结果） | 18–20px | 18px，圆角 4px，`sunken` 底 |
| 卡片内距 / 间距 / 圆角 | 约 8×4 / 6 / 6px | 8×4 / 6 / 6px，1px 边界，无阴影 |
| 标签高度 / 图标 | 16 / 12px | 16 / 12px |
| 错误卡 | 红边与红字 | destructive/60 边界、红色类型与标题、完整错误行；背景与普通卡相同 |

菜单（Lab DropdownMenu 示例，reduced motion）：

| 密度 | 弹层圆角 / 内距 | 条目圆角 | 条目横向内距 | 文字距弹层边缘 | 单行高度 | 分隔线内缩 / 上下 |
| --- | --- | --- | --- | --- | --- | --- |
| compact | 8 / 4px | 4px | 8px | 12px | 28px | 4 / 4px |
| comfortable | 8 / 4px | 4px | 10px | 14px | 32px | 4 / 4px |
| dense | 8 / 4px | 4px | 6px | 10px | 20px | 4 / 4px |

## 头部与元信息复查（2026-10-21 后续反馈）

用户反馈轨迹复刻顶部文字仍偏大。实测各页没有超过 12px 的文字；偏大感来自示例外框栏 12px 导航、标题旁 12px 副标题、12px 切换图标、11px 等宽时间与耗时、12px 加粗表头，以及 `dense:` 变体未生效。

- `dense:` 变体原以 `@scope` 声明，Tailwind 嵌套后变成 `(& [data-density=dense])`，只作用于自身后代，所有 `dense:` 工具类此前都不生效（含 CardTitle、CodeBlock 行高）。改为 `&:where([data-density='dense'], [data-density='dense'] *)`；代价是 dense 内再嵌套的 compact / comfortable 作用域仍会匹配。
- 现值：标题 12px 600、副标题与计数 11px、时间线通道与刻度标记 10px、分组标签 10px 600、卡片时间与耗时 10px 等宽、切换按钮图标 10px、dense 表头 11px 次级色、示例外框栏 11px 导航。
- 头部呼吸空间复查：字号保持不变；示例外框栏改回约 28px（`h-7`），各页 `PaneHeader` / 命令页菜单行约 32px（`min-h-8` + `py-1`），迷你时间线上下改为 `py-1.5`。随后顶栏改为 `control-height-lg`、分栏标题改为 `control-height + space-2`，高密下仍是 28px 与 32px，紧凑和舒适随控件长高；开关轨道与滑块改为密度 token。
- `tests/dense-density.spec.ts` 增加上述字号与外框/面板头高度断言，并检查各示例页不存在超过 12px 的文字。

## 截图

`node scripts/capture-dense-examples.mjs http://127.0.0.1:5173/ <输出目录>` 生成以下文件（PR 附件）：轨迹面板（展开源码 / 滚动到错误卡）、事件查看器、数据与检查器（行操作子菜单 / 右键菜单）、命令与设置（Menubar / 单选下拉）各深浅两版，以及 compact 下的 DropdownMenu 对比。

## 与参考的差异

- 结构一致：时间、类型、标题、右对齐耗时与标签在同一行；首行源码预览带行数，可展开为单层代码；结果行为截断的绿色等宽文字；“TURN 1” 分组；open / read / write 刻度通道；右下“回到最新”胶囊。
- 有意不同：未复刻参考的顶部文件标签栏和右侧折叠栏；名称与地址替换为“示例扩展”和 example.com；结果行使用 lucide 返回图标而非 “⇐” 字符；刻度通道的选中列用 info-soft 底色加描边。
- 浅色主题的 `sunken` 取画布色而非更深的灰：默认 green 预设文字在 `#ececea` 上仅 4.18:1，在 `#fafaf8` 上为 4.73:1。
- 等宽字体按本库字体栈回退（本机为 Cascadia Code），不使用参考产品字体。

## 已知约束

`styles.css` 的未分层 `[data-slot] { font-family }` 规则优先于 `font-mono` 工具类。带 `data-slot` 的元素（如 TableCell、CollapsibleTrigger）需要把 `font-mono` 放在内部 span 上；ToolCall trace 与 Lab 示例已按此组合。

## 检查记录

- `npm run tokens:build`、`npm run check` 通过：token 生成一致、源码规则、目录（142 族）、设计检查与对比度、token 审计 0 未批准、全部 workspace 类型检查。
- `npm run build` 通过 UI、Lab、Storybook 与 Workbench 构建。
- `tests/dense-density.spec.ts` 15 项通过：深浅主题的轨迹几何、源码预览键盘展开、MiniTimeline 单一 Tab 停靠点与 Home / 方向键 / Enter、JumpToLatest 返回底部；三种密度的菜单几何、方向键与 Escape 焦点恢复；事件、检查器、命令三页 axe（wcag2a/aa、wcag21aa）无违规、无页面横向溢出，子菜单、右键菜单、Menubar 切换可用。axe 首轮发现浅色结果行对比度不足与 Command 列表中的分隔线，已分别通过 `sunken` 取值和移除示例分隔线修正。
- 回归：menu-density、component-tokens、token-contract、token-generation、token-inspector、density、theme-density、select-input、select-placement、async-combobox、virtual-conversation 通过（需同时运行 Lab 5173 与 Storybook 6007）。token-inspector 改为按当前密度选择 `density.<mode>.font-interface`，因为该角色已从 foundation 移入 density。
- `@base-ui/react` 1.8.0 → 1.9.0 后上述测试与构建均在新版本上运行。未运行全量 Playwright 套件与 `test:storybook`。
