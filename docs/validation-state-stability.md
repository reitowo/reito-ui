# 交互尺寸稳定性复查

日期：2026-10-10。依据：用户提供的 Rating 点击后高度变化截图、当前组件总览的深色紧凑工作面，以及 docs/design-language.md 的共享规则。本次检查没有重新宣称与 Cursor 像素一致。

## 已修正

| 组件 / 共用层 | 原因 | 修正 |
| --- | --- | --- |
| Rating | 选中后才出现清除按钮，星形与按钮高度不同；清除后失去焦点 | XS 操作行最小高度；空值时保留并禁用清除按钮；清除后聚焦首个评分项；离开星形区或清除时取消悬停预览 |
| Listbox | 最后一个选项清除后，按钮从标题操作区消失 | 空值时禁用清除，保持操作布局和焦点归位 |
| MultiSelectActions | 清空后清除操作消失 | 操作栏保留禁用的清除按钮；禁用选项仍不可清除 |
| ComboboxChips | 标签 24/32px + 8px 纵向内距 + 2px 边框超过输入的 32/40px | 内距扣除边框；单行有值和空值保持 32/40px |
| OneTimeCode | 复制反馈单独插入一行 | 短反馈进入已有值和操作行；锁定、过期、轮换后的隐藏与异步旧请求边界不变 |
| MessageActions | 操作反馈出现时增加状态行 | 使用 line-interface 预留一行，成功、撤回和错误反馈共用 |
| PermissionRequest | 允许/拒绝后，按钮行变成更矮的普通文字 | 结果行使用 button-height 最小高度和居中对齐 |
| Calendar | 每月周数不同，切月增加或减少一行 | 默认 fixedWeeks=true，连续 12 个月保持六周；显式 false 仍允许按月份收缩 |
| CodeBlock | “复制”变成“已复制”挤动工具栏 | 文字槽保留最长默认反馈宽度，图标与可访问名称继续反映状态 |
| InlineEdit | 保存中更长的文案挤动取消按钮 | 保存文字保持，忙碌图标与 aria-label 表示请求；取消位置不变 |
| SettingsSection 共用示例 | 保存文字缩短，结果段落临时插入 | 共用示例使用稳定文字槽和一行状态区，Lab、Storybook、总览共用 |

所有尺寸来自既有 token 或 token 算式，未新增页面专用覆盖。Listbox 的紧凑富选项测试预期从 36px 修正为 35px，匹配此前已应用的 13px 字号、12px 描述行高、2px 间隔和 8px 总纵向内距；没有改动该选项的布局来迎合旧断言。

## 检查范围与限制

- 139 个组件族全部载入，初始尺寸记录完整。默认交互扫描为 dark/compact：114 项执行一种安全的默认操作，98 项预览高度不变，16 项按内容语义改变高度；25 项是静态内容或需要 hover、拖动、文件输入、链接等专门操作，记录其初始布局，没有假装执行了交互。
- 单独回归覆盖 dark/light × compact/comfortable：Rating 选中/清除/悬停/焦点、Listbox 清除、OneTimeCode 复制、MessageActions 反馈与撤回、PermissionRequest 决策、MultiSelect 去除最后标签、Calendar 连续切 12 个月、CodeBlock 复制宽度、SettingsSection 保存反馈。
- 四种主题和密度的整目录几何检查验证共享按钮高度、图标、面板内距与行内操作尺寸。
- 对条件操作和反馈源码做模式扫描，复核本次出现的布局变化。默认扫描不是每个组件的全部 props、全部状态和全部异步竞态；输入 ArrowUp 没有含义时，只能证明该键未改变布局，不能证明所有文本编辑路径。
- 详细错误、正文展开、进入编辑器、增删内容允许增加空间；不能通过裁切信息强制整块高度不变。检查使用同一 DOM 元素的句柄，避免列表移除后把下一个元素误当成原控件。

## 验证

- npm run check：通过。341 个视觉文件、0 个未批准的 token 例外、102 组对比度检查、所有工作区类型检查通过。
- npm run build：完整构建通过（tokens、UI、Lab、Storybook、Workbench）。Vite 仍提示部分产物大于 500kB；这次尺寸修复没有消除目录产物体积问题。
- 相关回归：88 个唯一用例通过，含 50 项 Listbox / 多选 / InlineEdit / 四组合状态稳定性，10 项 OneTimeCode 安全与异步回调，15 项 Rating 行为与可访问性，4 项全目录几何，1 项 139 组件族默认扫描，以及 8 项高亮与 Markdown 复制源码回归。InlineEdit 忙碌宽度和取消位置在追加断言后单独重跑通过。
- Rating 最新增加悬停退出与清除预览回归，Rating + 四组合尺寸稳定性最终 19 项重跑通过。
- CI 配置新增 state-stability.spec.ts 和 catalog-state-probes.spec.ts；当前发现 205 项 / 26 个文件。这是配置的总用例数，本轮未声称完整执行所有 205 项。
- 浏览器实测当前总览：dark/compact，Rating 操作行评分前、清除后和重新选择均为 24px；空值清除禁用、键盘焦点回到首个评分项。与用户原截图相比，清除按钮不再出现/消失挤动操作行；阅读正文和真实展开仍按内容排版。
- 四组合 Rating 截图：.logs/rating-stable-{theme}-{density}.png；默认扫描 JSON：.logs/catalog-state-probes.json。

## 139 项默认扫描记录

“静态/专门操作”只表示记录了初始布局。下表尺寸单位为 CSS px，来自当前 1440×1000 的默认检查视口。完整 JSON 在 .logs/catalog-state-probes.json，重跑 tests/catalog-state-probes.spec.ts 会重新生成。

| 组件 | 本次操作 | 前 → 后高度 | 结果解释 |
| --- | --- | ---: | --- |
| basic/scroll-top | 滚到示例末尾 | 364 → 364 | 操作前后预览高度不变 |
| basic/one-time-code | 复制JumpServer 验证码 | 316 → 316 | 操作前后预览高度不变 |
| basic/button | 保存更改 | 144 → 144 | 操作前后预览高度不变 |
| basic/button-group | 上一页 | 96 → 96 | 操作前后预览高度不变 |
| basic/badge | 静态/专门操作 | 96 → — | 初始布局记录；未执行默认交互 |
| basic/input | 输入键盘探测 | 297.375 → 297.375 | 操作前后预览高度不变 |
| basic/input-tags | 编辑标签 React | 148.5 → 148.5 | 操作前后预览高度不变 |
| basic/color-picker | 打开颜色选择器 | 149.375 → 149.375 | 操作前后预览高度不变 |
| basic/input-date | 交付日期年 | 149.375 → 149.375 | 操作前后预览高度不变 |
| basic/input-time | 提醒时间时 | 149.375 → 149.375 | 操作前后预览高度不变 |
| basic/date-time-picker | 日期年 | 175.375 → 175.375 | 操作前后预览高度不变 |
| basic/password-input | 输入键盘探测 | 213.375 → 213.375 | 操作前后预览高度不变 |
| basic/input-mask | 输入键盘探测 | 149.375 → 149.375 | 操作前后预览高度不变 |
| basic/listbox | 清除 | 361.5 → 361.5 | 操作前后预览高度不变 |
| basic/textarea | 任务说明 | 211.5 → 211.5 | 操作前后预览高度不变 |
| basic/label | 输入键盘探测 | 96 → 96 | 操作前后预览高度不变 |
| basic/field | 输入键盘探测 | 253.25 → 253.25 | 操作前后预览高度不变 |
| basic/input-group | 搜索组件 | 188 → 188 | 操作前后预览高度不变 |
| basic/checkbox | 输入键盘探测 | 120 → 120 | 操作前后预览高度不变 |
| basic/switch | 输入键盘探测 | 96 → 96 | 操作前后预览高度不变 |
| basic/radio-group | 输入键盘探测 | 131.5 → 131.5 | 操作前后预览高度不变 |
| basic/slider | 上下文预算 | 96 → 96 | 操作前后预览高度不变 |
| basic/toggle | 粗体 | 96 → 96 | 操作前后预览高度不变 |
| basic/toggle-group | 粗体 | 96 → 96 | 操作前后预览高度不变 |
| basic/select | 选择执行位置 | 148 → 148 | 操作前后预览高度不变 |
| basic/combobox | 查找技术栈 | 100 → 100 | 操作前后预览高度不变 |
| basic/async-combobox | 异步查找技术栈 | 148.5 → 148.5 | 操作前后预览高度不变 |
| basic/async-multi-select | 移除React | 148.5 → 148.5 | 操作前后预览高度不变 |
| basic/accordion | 如何统一主题？ | 190 → 160 | 折叠正文 |
| basic/collapsible | 展开 3 个文件 | 96 → 154 | 展开文件内容 |
| basic/tabs | 预览 | 122 → 122 | 操作前后预览高度不变 |
| basic/dialog | 编辑项目 | 96 → 96 | 操作前后预览高度不变 |
| basic/alert-dialog | 归档示例任务 | 96 → 96 | 操作前后预览高度不变 |
| basic/dropdown-menu | 任务操作 | 96 → 96 | 操作前后预览高度不变 |
| basic/context-menu | 静态/专门操作 | 176 → — | 初始布局记录；未执行默认交互 |
| basic/popover | 查看请求路径 | 96 → 96 | 操作前后预览高度不变 |
| basic/tooltip | 新增任务 | 96 → 96 | 操作前后预览高度不变 |
| basic/hover-card | 静态/专门操作 | 96 → — | 初始布局记录；未执行默认交互 |
| basic/sheet | 打开任务详情 | 96 → 96 | 操作前后预览高度不变 |
| basic/card | 打开工作区 | 163 → 163 | 操作前后预览高度不变 |
| basic/alert | 静态/专门操作 | 172 → — | 初始布局记录；未执行默认交互 |
| basic/empty | 创建任务 | 219.125 → 219.125 | 操作前后预览高度不变 |
| basic/avatar | 静态/专门操作 | 96 → — | 初始布局记录；未执行默认交互 |
| basic/skeleton | 静态/专门操作 | 96 → — | 初始布局记录；未执行默认交互 |
| basic/spinner | 静态/专门操作 | 96 → — | 初始布局记录；未执行默认交互 |
| basic/separator | 静态/专门操作 | 105 → — | 初始布局记录；未执行默认交互 |
| basic/scroll-area | 静态/专门操作 | 224 → — | 初始布局记录；未执行默认交互 |
| basic/progress | 增加进度 | 112 → 112 | 操作前后预览高度不变 |
| basic/table | 静态/专门操作 | 201.5 → — | 初始布局记录；未执行默认交互 |
| basic/pagination | 静态/专门操作 | 96 → — | 初始布局记录；未执行默认交互 |
| basic/breadcrumb | 静态/专门操作 | 96 → — | 初始布局记录；未执行默认交互 |
| basic/command | 搜索命令 | 246 → 246 | 操作前后预览高度不变 |
| basic/resizable | 静态/专门操作 | 210 → — | 初始布局记录；未执行默认交互 |
| basic/calendar | Go to the Previous Month | 358 → 358 | 操作前后预览高度不变 |
| basic/sidebar | 搜索任务 | 354 → 354 | 操作前后预览高度不变 |
| basic/aspect-ratio | 静态/专门操作 | 284 → — | 初始布局记录；未执行默认交互 |
| basic/image-gallery | 放大预览：山形工作区占位图 | 469.75 → 469.75 | 操作前后预览高度不变 |
| basic/carousel | 下一页 | 212 → 212 | 操作前后预览高度不变 |
| basic/image-compare | 图像前后对比 | 360.875 → 360.875 | 操作前后预览高度不变 |
| basic/input-otp | 六位验证码 | 99.5 → 99.5 | 操作前后预览高度不变 |
| basic/item | 添加 | 96 → 96 | 操作前后预览高度不变 |
| basic/kbd | 静态/专门操作 | 96 → — | 初始布局记录；未执行默认交互 |
| basic/native-select | 静态/专门操作 | 183 → — | 初始布局记录；未执行默认交互 |
| basic/navigation-menu | 组件文档 | 103.5 → 103.5 | 操作前后预览高度不变 |
| basic/menubar | 文件 | 97.5 → 97.5 | 操作前后预览高度不变 |
| basic/toast | 显示通知 | 96 → 96 | 操作前后预览高度不变 |
| basic/multi-select | 移除React | 148.5 → 148.5 | 操作前后预览高度不变 |
| basic/number-field | 减少并发任务数 | 148.5 → 148.5 | 操作前后预览高度不变 |
| basic/meter | 增加示例值 | 137.5 → 137.5 | 操作前后预览高度不变 |
| basic/meter-group | 静态/专门操作 | 139.5 → — | 初始布局记录；未执行默认交互 |
| basic/rating | 清除本次回答质量 | 147.5 → 147.5 | 操作前后预览高度不变 |
| basic/knob | 62% | 243 → 243 | 操作前后预览高度不变 |
| complex/kanban | 筛选卡片 | 338 → 338 | 操作前后预览高度不变 |
| complex/scheduler | 日 | 584 → 584 | 操作前后预览高度不变 |
| complex/chart | 已完成 | 384 → 384 | 操作前后预览高度不变 |
| complex/overlay-provider | 打开设置浮层 | 96 → 96 | 操作前后预览高度不变 |
| complex/inline-edit | 编辑工作区名称 | 96 → 116 | 从显示态进入编辑器和保存/取消操作 |
| complex/toolbar | 撤销 | 96 → 96 | 操作前后预览高度不变 |
| complex/banner | 查看 | 110 → 110 | 操作前后预览高度不变 |
| complex/user-info | 发送本地示例消息 | 108 → 108 | 操作前后预览高度不变 |
| complex/confirm-popover | 删除草稿 | 96 → 96 | 操作前后预览高度不变 |
| complex/split-button | 保存 | 96 → 96 | 操作前后预览高度不变 |
| complex/form | 提交结果 | 464.375 → 464.375 | 操作前后预览高度不变 |
| complex/async-form | 重置当前记录 | 355.125 → 355.125 | 操作前后预览高度不变 |
| complex/virtual-list | 回到首项 | 418 → 418 | 操作前后预览高度不变 |
| complex/virtual-grid | 定位左上 | 418 → 418 | 操作前后预览高度不变 |
| complex/tree-view | 静态/专门操作 | 273 → — | 初始布局记录；未执行默认交互 |
| complex/async-tree-view | 静态/专门操作 | 136 → — | 初始布局记录；未执行默认交互 |
| complex/reorderable-tree-view | 静态/专门操作 | 232 → — | 初始布局记录；未执行默认交互 |
| complex/tree-select | button.tsx | 133 → 133 | 操作前后预览高度不变 |
| complex/cascader | 前端 / React / 组件库 | 133 → 133 | 操作前后预览高度不变 |
| complex/tree-table | 选择全部层级行 | 309 → 309 | 操作前后预览高度不变 |
| complex/transfer | 搜索可用权限 | 319.875 → 319.875 | 操作前后预览高度不变 |
| complex/sortable-list | 置顶 | 361.5 → 361.5 | 操作前后预览高度不变 |
| complex/organization-chart | 折叠 Reito | 352.5 → 167.5 | 折叠组织层级 |
| complex/terminal-prompt | 清除命令记录 | 351 → 351 | 操作前后预览高度不变 |
| complex/rich-text-editor | 粗体 | 371 → 371 | 操作前后预览高度不变 |
| complex/data-table | 筛选本地任务 | 319 → 319 | 操作前后预览高度不变 |
| complex/disclosure-tree | src | 273 → 153 | 折叠目录子项 |
| complex/search-filter-bar | 筛选本地任务 | 379 → 379 | 操作前后预览高度不变 |
| complex/date-range-picker | 日期范围：2026/09/01 — 2026/09/07 | 112 → 112 | 操作前后预览高度不变 |
| complex/date-time-range-picker | 开始日期年 | 237.375 → 285.375 | 年份变更触发范围校验信息 |
| complex/file-upload | 静态/专门操作 | 232 → — | 初始布局记录；未执行默认交互 |
| complex/property-list | 编辑工作区名称 | 325.5 → 349.5 | 进入属性编辑器 |
| complex/timeline | 静态/专门操作 | 284.5 → — | 初始布局记录；未执行默认交互 |
| complex/stepper | 1填写信息确认工作区名称 | 242 → 242 | 操作前后预览高度不变 |
| complex/settings-section | 保存设置保存设置 | 291.625 → 291.625 | 操作前后预览高度不变 |
| complex/workspace | src | 512 → 512 | 操作前后预览高度不变 |
| complex/command-search | 搜索命令 | 422 → 422 | 操作前后预览高度不变 |
| complex/content-navigation | 目录 | 544 → 544 | 操作前后预览高度不变 |
| complex/diff-viewer | 统一视图 | 252 → 252 | 操作前后预览高度不变 |
| complex/log-viewer | 搜索日志 | 410 → 410 | 操作前后预览高度不变 |
| complex/key-value-editor | 添加键值 | 295 → 392 | 新增一行键值 |
| complex/resource-list | 搜索项目资源 | 439 → 439 | 操作前后预览高度不变 |
| complex/resource-view | 搜索组件资源 | 640 → 640 | 操作前后预览高度不变 |
| ai/composer | 移除当前工作区 | 266 → 230 | 移除上下文内容 |
| ai/conversation | 开始本地流式示例 | 416 → 416 | 操作前后预览高度不变 |
| ai/reasoning | 过程说明4s | 168 → 128 | 收起过程正文 |
| ai/tool-call | 读取设计规范已完成 · 示例 0.2s | 191 → 267 | 展开工具详情 |
| ai/plan-steps | 确认共享令牌 | 217.5 → 217.5 | 操作前后预览高度不变 |
| ai/attachments | 移除附件design-language.md | 204 → 146 | 删除附件条目 |
| ai/context-pill | 移除design-language.md | 96 → 124 | 删除上下文后显示恢复操作 |
| ai/model-selector | 选择模型 | 142 → 142 | 操作前后预览高度不变 |
| ai/suggestions | 检查共享样式 | 266 → 266 | 操作前后预览高度不变 |
| ai/sources | 静态/专门操作 | 204 → — | 初始布局记录；未执行默认交互 |
| ai/permission | 拒绝 | 246 → 246 | 操作前后预览高度不变 |
| ai/artifact | 关闭产物WorkspaceSettings.tsx | 292 → 96 | 关闭产物正文 |
| ai/code-block | 复制代码 | 219 → 219 | 操作前后预览高度不变 |
| ai/markdown-content | 复制代码 | 279 → 279 | 操作前后预览高度不变 |
| ai/virtual-conversation | 静态/专门操作 | 352 → — | 初始布局记录；未执行默认交互 |
| ai/chat-palette | 打开命令与对话 | 96 → 96 | 操作前后预览高度不变 |
| ai/chat-overlay | 打开助手 | 96 → 96 | 操作前后预览高度不变 |
| ai/message-parts | 检查设计令牌失败 | 626 → 574 | 收起工具执行详情 |
| ai/token-usage | 静态/专门操作 | 188 → — | 初始布局记录；未执行默认交互 |
| ai/agent-task | 打开任务检查工作区布局 | 199 → 231 | 打开任务详情 |
| ai/message-actions | 复制消息 | 174 → 174 | 操作前后预览高度不变 |
| ai/message-branch | 下一分支 | 120 → 120 | 操作前后预览高度不变 |
| ai/task-queue | 筛选任务队列 | 301 → 301 | 操作前后预览高度不变 |
| ai/checkpoint | 输入键盘探测 | 300 → 300 | 操作前后预览高度不变 |
