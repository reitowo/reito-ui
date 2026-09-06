# 从产品源码到个人组件库：审计结论与重建方案

2026-09-06。本轮完成源码与静态资源审计、跨宿主样式实测和迁移设计；没有执行组件库迁移，也没有再次改动运行中的例工程。

> 后续实施状态：用户随后授权继续，0.3 已采用固定 shadcn / Base UI / Tailwind 重建并扩充为基础50、复杂11、AI15个组件族。下文保留迁移前的审计证据；当前用法以 [复用指南](../reuse-guide.md) 与 [分层组件](../component-layering.md) 为准。

## 结论

建议用 **shadcn/ui + Tailwind CSS 4** 重建基础组件层，保留个人 tokens、Storybook 和例工程。当前 0.2 的主要问题是组合接口、布局复用和样式宿主契约不足，继续叠加页面 CSS 会扩大维护成本。

在尚无已知生产消费项目的情况下，主候选为 **Base UI + base-nova**，从官方生成的组件开始，记录版本与来源，再统一改主题和密度。Multica 的实际源码证实这条路线可用于桌面工作台，但“同一个上游库”不保证外观相同。现有 Radix 也是有效基础；若优先减少迁移量，可以选择 shadcn 的 Radix 版本，不能把 Base UI 描述成视觉更像的充分条件。

证据详见：[Multica 源码审计](multica-source-audit.md)、[Cursor 安装资源与上游审计](cursor-ui-audit.md)、[Claude 公开契约与组件拆解](claude-ui-audit.md)、[当前库与 shadcn 迁移审计](shadcn-migration-audit.md)。

## 三款产品实际能分析到哪一层

| 产品 | 实际取得的证据 | 关键结论 | 不能混淆的边界 |
| --- | --- | --- | --- |
| Multica | 官方仓库固定 commit `7a438bd5b8bf39afd54259a7eb0971390e50a8ef`；包、配置、tokens、组件、业务 views | 确实是 shadcn `base-nova` + Tailwind 4 + Base UI；共享基础 UI 和产品视图分层 | 可读源码不等于可以无条件抽出其 UI 独立分发；LICENSE 含额外条件 |
| Cursor | 本机 3.19.7 的 product/package 元数据、IDE 主题 JSON、desktop/glass CSS；VS Code 上游源码对照 | 既有 VS Code 工作台体系，也有 Cursor 专属会话与工具样式；不能当成一套 shadcn React 组件 | 安装包 CSS 证明某条规则存在，不证明当前所有页面都应用该规则；IDE 主题不等于 Agents Window 全部样式 |
| Claude Desktop | 官方界面图、Code Desktop 行为文档、MCP Apps 样式规范与官方 Figma kit 入口 | 能还原场景、组件职责和部分官方主题契约 | 本轮未取得完整 Desktop 组件源码；没有确认内部采用 shadcn/Radix/Base UI；MCP Apps tokens 只代表内嵌契约 |

对源码或安装包的读法应是：**产品版本 → 工作场景 → 具体文件 / CSS selector → 状态 → 视觉与行为**。不能从产品名直接猜一组灰色，也不能从一张截图猜内部依赖。

## 为什么当前库显得不够规范

当前已经使用 Radix，而不是完全从零实现交互。但这一点没有解决以下问题：

1. **组合能力被封装收窄。** Select 主要接收 `options`，Tabs 接收 `items`，DropdownMenu 接收扁平列表，Dialog 接收固定标题/正文/页脚。复杂菜单分组、可定制 Trigger、嵌套内容、局部样式和布局容易迫使宿主继续加 props 或覆盖 CSS。
2. **基础组件和产品 pattern 混在一个公共实现文件。** Button / Input 与 ChatComposer / CommandPalette / ToolCall 没有清楚分层；工作区外壳、侧栏、分栏又主要留在例工程中，下一项目无法靠包直接复用。
3. **主题统一了，宿主样式却没统一。** Lab 的全局 SVG、字体、line-height 和局部 `.rui-*` 覆盖与 Storybook 的 theme frame 不同。消费者仅导入两份发布 CSS 时还会漏掉部分字体规则。
4. **状态契约偏演示。** Composer 的本地文本提交可以工作，但还没有产品级的附件上传、异步失败恢复、流式输出停止、上下文对象与草稿模型；这些不应通过换一个 textarea 样式假装完成。
5. **验证覆盖与结论不匹配。** 现有检查能发现 token 引用、指定对比度、操作和溢出问题；它没有验证跨宿主视觉一致性、上游接口对齐、组件组合能力或是否接近参考产品。

源代码位置和迁移映射在 [shadcn 迁移审计](shadcn-migration-audit.md)。这不是宣称所有现有组件都失效；例如下述实测中 Button / Input 的字号和高度保持一致。

### 本轮复现的差异

Microsoft Edge，深色、compact、根字号 16px；比较 Lab 的组件区、Storybook 的 Button/Field story 和 0.2.0 tarball 仅导入两份 CSS 的消费页面。

| 同一组件属性 | Lab | Storybook | tarball 消费页 |
| --- | --- | --- | --- |
| Button 字号 / 高度 | 14 / 30px | 14 / 30px | 14 / 30px |
| Input 字号 / 高度 | 14 / 30px | 14 / 30px | 14 / 30px |
| Button 内 SVG 描边 | 1.65px | 2px | 2px |
| Field label 字体 | 项目 sans 栈 | 项目 sans 栈 | Times New Roman |
| Field label 行高 | 19.5px | normal | normal |

原始计算样式：[host-style-comparison.json](host-style-comparison.json)。这里报告 CSS 计算结果；`normal` 不被冒充成一个跨平台固定像素值，字体栈也不等于证明该栈中第一个字体已安装。问题的修复位置应在组件包及统一样式入口，而非继续针对 Lab 追加覆盖。

## 具体应该建立哪些组件

| 层级 | 组件 | 来源 / 责任 |
| --- | --- | --- |
| 基础交互 | Button、Input、Field、Checkbox、Switch、Select、Combobox、Popover、Dialog、Menu、Tooltip、Tabs | 从选定的官方 shadcn primitive 版本生成，保留可组合子部件；公开原语需要的事件、状态、ref 与 render 能力 |
| 导航与内容 | Sidebar、Breadcrumb、Command、ScrollArea、Separator、Skeleton、Avatar、Badge | 采用上游能力并维护自己的变体；Command、菜单和完整工作区导航职责分开 |
| 桌面布局 | AppShell、WorkspaceToolbar、Pane、PaneHeader、SplitLayout、SessionRow | 自己的共享布局组件；统一宽度约束、折叠、滚动归属、键盘焦点与密度 |
| Agent 交互 | Composer、ComposerToolbar、AttachmentChip、ContextPicker、Message、ToolCall、PermissionCard | 自己的产品 pattern；有业务状态机，按需选富文本/上传/流式渲染依赖 |
| 审查工作面 | ArtifactPane、FileChangeList、DiffReview、CommentThread | UI 外壳复用基础层；真正的 diff / editor / docking 引擎单独评估，不由静态 CodeBlock 代替 |

例如 Dialog 的目标接口应允许按内容组合。下例为迁移后的目标写法，当前 `@reito/ui` 尚未导出这些子组件：

```tsx
<Dialog>
  <DialogTrigger render={<Button variant="outline" />}>
    工作区设置
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>工作区设置</DialogTitle>
      <DialogDescription>调整当前工作区的编辑偏好。</DialogDescription>
    </DialogHeader>
    <WorkspaceSettingsForm />
  </DialogContent>
</Dialog>
```

`render` 对应 Base UI 路线；Radix 路线的组合机制不同。不能在一份使用说明里混用两套 API。

## 建议目录与样式契约

```text
packages/tokens/
  src/tokens.json                  # 值的唯一来源，扩充用途与角色
  dist/tokens.css                  # 生成的主题/密度与兼容变量
  dist/tailwind-theme.css          # 生成的 Tailwind/shadcn 语义映射
packages/ui/src/
  components/ui/                  # 官方生成后维护的基础组件
  layout/                         # 桌面布局、侧栏、分栏
  patterns/                       # 会话、工具、附件、产物
  compat/                         # 旧例工程的短期适配，不作为新接口
  styles/                         # 统一字体/图标/基础样式契约
apps/storybook/                    # 基础、状态、布局、产品 pattern
apps/lab/                          # 消费同一公共包的真实组合
```

这是建议结构，目录尚未按此迁移。

- 保留现有 JSON token 主源，生成 shadcn 的 `--background`、`--foreground`、`--muted`、`--border`、`--ring`、`--sidebar-*` 等映射，避免 JSON 与手写 Tailwind 主题互相漂移。
- 正文、导航、说明文字和控件分别定义角色字号及行高；密度不能只表现为按钮高度变小。
- 用 `@theme inline` 暴露语义 utilities；组件用完整静态 class 与 CVA variants，`cn()` 负责 class 合并。自定义 role utility 需要同步 class 合并配置。
- shadcn 源码采用固定 CLI / preset 生成；不要把含生成期占位符的上游 registry 模板原样复制进包。
- 同仓库源码消费与发布包消费分别写明 Tailwind 的扫描 / CSS 导入方式。发布包提供已生成组件 CSS，不能要求每个使用者猜测如何扫描 `node_modules`。Tailwind Preflight 的引入方与全局影响也要有明确契约。
- 原来的 30 个出口可临时适配现有例工程；没有真实下游时，不为保存旧接口永久牺牲新组件的组合能力。

官方实现依据与准确链接见 [迁移审计](shadcn-migration-audit.md)。

## 迁移顺序与验收

1. 固定 shadcn / Tailwind / primitive 版本和 preset；建立生成记录、许可、token bridge 与统一样式入口。
2. 先迁移 Button、Field/Input、Select、Dialog、DropdownMenu、Tooltip 及一个设置表单。并排验收实际组件、打开状态、中文内容和三个消费宿主。
3. 再建立 Sidebar / Pane / SplitLayout，迁移工作台。整体结构稳定后再建设 Composer 和 ToolCall，避免先把 30 个名字全部替换却继续沿用旧布局。
4. 将 Storybook 分成基础组件、交互状态、共享布局、产品 pattern；例工程只消费这些公共层。
5. 更新 Skill：读取上游版本与真实 API、先组合再包装、检查来源记录、禁止页面级变体漂移；保留主题/密度/键盘/输入法和视觉比对要求。

验收除了已有行为检查，还应增加代表组件在 Lab、Storybook、独立 tarball 工程的字体/行高/图标/边框与打开弹层对照；验证移除页面覆盖后仍一致。视觉比较固定产品版本、场景、主题、视口与缩放。自动检查通过后，仍需对实际完整工作面进行视觉确认。

## 本轮交付边界

已完成：三产品证据审计、当前库结构审查、跨宿主实测、组件映射、迁移层次与验收设计。没有执行 npm 依赖迁移、替换基础组件、重写 Skill 或重新发布包；旧版本测试结果仍只对应旧版本的验证范围。
