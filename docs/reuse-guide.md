# 复用与迁移

当前版本为 0.4.1，面向 React 19 / ESM，尚未发布 npm。0.3 的 shadcn / Base UI 重建替换了 0.2 自定义 Radix 包装 API；0.4 在其上扩展组件并调整共享密度默认值。

## 安装打包产物

在组件库执行 `npm ci`，然后 `npm run pack:library`。在消费项目同时安装两个 tarball：

```powershell
npm install <库路径>/artifacts/reito-tokens-0.4.1.tgz <库路径>/artifacts/reito-ui-0.4.1.tgz
```

应用入口只引入一次：

```tsx
import '@reito/tokens/css';
import '@reito/ui/styles.css';
import { Button, Input, Label, TooltipProvider } from '@reito/ui/basic';

export function Example() {
  return <TooltipProvider><div className="reito-root">
    <Label htmlFor="project-name">工程名称</Label>
    <Input id="project-name" defaultValue="我的工作区" />
    <Button variant="outline" size="sm">保存草稿</Button>
  </div></TooltipProvider>;
}
```

主题和密度放在 `<html data-theme="dark" data-density="compact">`，供所有 portal 继承。切换值为 dark/light、compact/comfortable；持久化由应用实现。TooltipProvider 可放在应用根，`delay` 是 Base UI 属性，不能沿用旧 `delayDuration`。

CSS 已编译，包含 Tailwind Preflight、共享密度与 Inter Variable 字体。包内控件不依赖消费项目扫描 class；中文使用系统字体。代码字体由系统等宽字体回退。全局 Preflight 会规范原生元素，请在接入已有站点时检查其布局；不要通过页面改写 `[data-slot]` 修复共享组件。

## 三层入口

```tsx
import { Button, Dialog, DialogContent, DialogTitle } from '@reito/ui/basic';
import { DataTable, SettingsSection, WorkspacePane } from '@reito/ui/complex';
import { Composer, ToolCall, ArtifactPanel } from '@reito/ui/ai';
```

根入口 `@reito/ui` 也导出三层 API，子入口便于表达依赖层次。演示 catalog 不从公共入口导出。以实际 `.d.ts`、源码和 Storybook 的组合为准，不能假设每个控件都接受通用 `size`、`tone` 或 `loading`。

若消费项目本身使用 Tailwind 4，在它的主 CSS 中导入 `@reito/tokens/tailwind` 来扩展应用自己的语义 utility。已经编译的组件 CSS 仍从 `@reito/ui/styles.css` 加载；不需要重新扫描 node_modules 来维持组件基本外观。

## 工作区增量：代码高亮

共享 `CodeBlock` 已接入 Refractor / Prism 的语法解析，传入 `language="typescript"` 等标识即可着色；不需要应用额外安装主题 CSS、注册语法或连接服务。随包依赖只注册 JavaScript、TypeScript、JSX、TSX、JSON、HTML/XML、CSS、Bash、PowerShell、Python、SQL、YAML、Markdown、Go、Rust，支持常见别名如 js/ts/html/sh/ps1/py/yml/md。语言名称忽略大小写和两端空格。

`language` 默认 text；未知语言或超过 50,000 个 UTF-16 代码单元的源码保留纯文本，以限制同步分词和 DOM 开销。代码作为 React 文本与 span 渲染，不解析源码中的 HTML；复制仍传递原始 `code`。主题由 `--rui-syntax-*` 控制，`ArtifactPanel` 的代码视图自动复用。该增量目前在工作区源码，已有 0.4.1 tarball 未重打包；重新分发时须更新 UI 与 tokens 版本，不能覆盖同名旧包。

## 0.3 → 0.4：内容密度与组件扩展

0.4 当前提供基础 56、复杂 22、AI 19 个组件族。基础层中的 50 族来自固定 CLI 生成，Toast、MultiSelect、NumberField、Meter、InputTags 与 AsyncCombobox 是本库实现的 6 族；具体契约见 [组件分层](component-layering.md)。

这次升级保留原有控件高度，将内容内距、表格单元格和 AI 内容间距改为共享密度角色。compact / comfortable 的内容内距为 12 / 20px、普通内容间距 12 / 16px、小间距 8 / 12px、表格单元格横向内距 10 / 16px、纵向内距 6 / 10px。完整 token 表见 [设计语言](design-language.md#字体密度与尺度)。这些默认值会改变已有页面的排布，升级时应重新检查表格、嵌套面板和消息流；不要在消费页面补回旧固定 padding。

容器使用 `p-[var(--rui-content-padding)]`，内容组合使用 `gap-[var(--rui-content-gap)]`。已有外框中的代码预览使用 `CodeBlock variant="embedded"`，由外层承载边界、由 CodeBlock 保留代码文本内距，避免两层内容 padding 叠加。控件尺寸与内容密度是不同角色，不能通过缩小 UI 字号替代间距调整。

各项实测变化和截图见 [0.4 密度记录](density-v04.md)。

## 0.2 → 0.3：历史 API 迁移

| 旧用法 | 新用法 |
| --- | --- |
| `Button variant="primary"` / `danger` | `default` / `destructive` |
| `IconButton` | `Button size="icon|icon-sm|icon-xs"` 加 `aria-label` |
| 一体 `Dialog title=...` | `Dialog` + `DialogTrigger` + `DialogContent` + Header/Title/Description/Footer |
| 一体 `Field label=...` | `Field` + `FieldLabel` + 控件 + `FieldDescription` / `FieldError` |
| `ChatComposer` | AI 层 `Composer`，`onSubmit` 支持 Promise，失败保留草稿 |
| `Panel` / `NavItem` | `WorkspacePane` / `Sidebar` 组合，按应用需要选择 |
| `CommandPalette` | 基础 `CommandDialog` 或复杂 `CommandSearch`，两者职责不同 |
| `asChild` 的 Radix 组合 | 阅读相应 Base UI `render` API，不机械替换 |
| `rui-*` 组件选择器 | 不从页面依赖内部选择器，使用公开 props、className、语义 tokens |

组件高度 XS/SM/default/LG：compact 为 24/28/32/36px，comfortable 为 32/36/40/44px（16px 根字号）。基础 Button 的尺寸由共享样式与 `data-size` 控制；图标按钮宽高同步。日历单元格等专用控件保持各自组合契约。

0.3 之前的工作文件已备份到 `.logs/v0.2-before-shadcn`，旧组件实现不作为并行公开 API 保留。消费工程应逐项迁移并检查自己的流程。

## 扩展与验收

先选层：可跨业务组合的原语进入基础；有数据/表单/布局契约的组合进入复杂；与 AI 会话、上下文和执行有关的组合进入 AI。新组件需要实际导出类型、共享 Demo、可发现 stories、适用状态和交互验证。保持基础 → 复杂 / AI 的依赖方向；基础不依赖业务层。

新增组件后，将 Demo 注册到对应 `catalog.tsx`，补充该层 stories，再运行 `npm run catalog:build`。生成的 `apps/lab/src/catalog-manifest.json` 连接族、计数和实际 story ID；`npm run check` 包含 `catalog:check`，会发现目录漂移。Lab 深链格式为 `?layer=complex&component=diff-viewer`，不要另外维护一份手写 Storybook ID 映射。

用 `npm run dev` 打开 5173 的 Lab 逐组件确认；用 `npm run dev:workbench` 打开 5175 的 Agent / 文件与差异 / 设置组合例工程，检查组件进入实际工作流后的布局。Workbench 使用本地示例状态；它不是模型客户端或文件系统编辑器。

Storybook 按“基础 / 复杂 / AI → 组件 → 参数调试”浏览。在同一个 Canvas 下方的 Controls 调整 variant、size、状态或内容，预览会实时变化；左侧独立变体是可分享的预设，总览对比与交互场景另列。顶部 Theme / Density 对当前示例及其弹层统一生效。每个族的 Playground 需显式提供可用参数、真实 render 绑定和双向状态同步；组合示例参数与公共 props 分组说明。运行 `catalog:build` 后，Lab 深链优先指向 Playground。

`npm run test:storybook:controls` 检查全部 Playground 的显式参数配置、目录入口与代表组件的真实 Controls 操作。它会验证参数修改后画面更新、组件交互回写参数，以及全过程保持当前 Story；主题与密度覆盖 Button 的四种组合。组件 iframe 的完整四组合无障碍与溢出检查仍由 `test:storybook` 执行。

更新 tokens 后运行 `npm run tokens:build`，同时生成 CSS、Tailwind 桥接与数字 API 的 `@reito/tokens/metrics`。`npm run tokens:audit` 可单独检查所有组件和示例中的视觉硬编码，已纳入 `npm run check`；查看 [全组件审计与允许例外](token-audit.md)。完成 `npm run check`、相关 Playwright / Storybook 检查、`npm run build` 后再打包；根构建包含 UI、Lab、Storybook 和 Workbench。Storybook 四组合扫描包含页面错误、console error、交互 play、完整 iframe body 的 axe（包括仍打开的 portal）和页面溢出；它不等于完整手工无障碍验收。各次实际结果记录在 [validation.md](validation.md)，这些流程说明不代表本次检查已经通过。

打包时 UI 与 tokens 精确版本必须同步。第三方声明随 UI 包发布，禁止把 Multica 受限源码、产品品牌素材或私有字体夹入包中。
