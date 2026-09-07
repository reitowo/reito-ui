# Reito UI / Graphite 0.4

基于 **shadcn/ui + Base UI + Tailwind CSS 4** 的个人 React 组件库。以 Cursor 的紧凑工作界面为主要方向，按 **基础 → 复杂 → AI** 分层。提供中性深浅主题、两档密度、真实字体、Storybook 与可操作的组件例工程。

0.3 建立了 shadcn / Base UI 重建基础；0.4 持续补充高频与富功能组件，并将表格、内容区和 AI 组件的密度统一到共享 tokens。基础层包含 50 个固定版本官方 CLI 生成族和 17 个本地组合族，复杂与 AI 层在其上组合。这里的外观与 API 是本库实现，不能称作 Cursor / Claude 的官方组件。

本轮重点是 [表格与 AI 内容密度](docs/density-v04.md)：紧凑表格上下 6px、左右 10px，AI 内容内距 12px，代码产物不重复叠加留白。最终验证和 MultiSelect 打开状态的扫描限制见 [验证记录](docs/validation.md)。

## 打开与确认

```powershell
npm ci
npm run dev
# 另一个终端
npm run storybook
```

- [组件 Lab](http://127.0.0.1:5173/)：109 个组件族，按层浏览、中文搜索、主题/密度切换、逐组件确认与备注、确认记录导出、Tokens 查看与导出。
- [Storybook](http://127.0.0.1:6006/)：109 个组件族以“参数调试”为入口，在同一个预览的 Controls 中调整 props；独立变体作为预设保留。主题与密度通过工具栏统一切换；Lab 与 Storybook 复用相同组件实现，实际 story 数量见[生成目录](apps/lab/src/catalog-manifest.json)。
- [Workbench](http://127.0.0.1:5175/)：另开终端运行 `npm run dev:workbench`，查看 Agent、文件与差异、设置三个组合工作面。消息、文件与任务均为本地示例，主题和密度保存在当前浏览器。

| 层 | 组件族 | 代表内容 | 公共入口 |
| --- | ---: | --- | --- |
| 基础 | 67 | Button、表单、InputTags、AsyncCombobox、ColorPicker、InputDate、InputTime、DateTimePicker、PasswordInput、InputMask、Listbox、MeterGroup、Rating、Knob、选择、菜单、弹层、日历、布局 | `@reito/ui/basic` |
| 复杂 | 22 | Form、AsyncForm、数据表格、虚拟列表/网格、树、筛选、设置、工作区与数据工具 | `@reito/ui/complex` |
| AI | 19 | Composer、消息、工具、上下文、权限、产物；新增 MessageActions、MessageBranch、TaskQueue、Checkpoint | `@reito/ui/ai` |

“组件族”按使用用途统计，包含多个组合子组件，不等于命名导出数量。计数和 Storybook 链接来自生成的 [catalog manifest](apps/lab/src/catalog-manifest.json)。Lab 支持 [直接打开 DiffViewer](http://127.0.0.1:5173/?layer=complex&component=diff-viewer)。见 [分层、契约和组合示例](docs/component-layering.md)。

按 Nuxt UI / PrimeReact / PrimeVue 逐项补齐的状态见 [组件补齐账本](docs/component-completion.md)。新增 [Form 表单管理](docs/components/form.md) 属于当前工作区增量，已有 0.4.1 分发包保持不变。

## 带到下一工程

```powershell
npm run pack:library
```

同时安装 `artifacts/reito-tokens-0.4.1.tgz` 和 `artifacts/reito-ui-0.4.1.tgz`，然后：

```tsx
import '@reito/tokens/css';
import '@reito/ui/styles.css';
import { Button, Input } from '@reito/ui/basic';
import { DataTable } from '@reito/ui/complex';
import { Composer } from '@reito/ui/ai';
```

在 `<html>` 设置 `data-theme="dark" data-density="compact"`。包面向 React 19 / ESM，带 TypeScript 声明和已编译 CSS；消费工程无需 shadcn CLI 或 Tailwind 构建才能显示组件。CSS 包含 Tailwind Preflight 与 Inter Variable 字体，接入现有应用时一次性加载。未发布到 npm。

完整操作、Tailwind 接入、0.2 API 迁移和 0.3 → 0.4 密度变更见 [复用指南](docs/reuse-guide.md)。

## 工程结构

| 位置 | 职责 |
| --- | --- |
| `packages/tokens/src/tokens.json` | 唯一 token 数值来源；生成 `tokens.css` 与 Tailwind `@theme` 桥接 |
| `packages/ui/src/primitives` | 固定官方 shadcn / Base UI 基础组件及有记录的修正 |
| `packages/ui/src/basic` | 基础层 catalog 与 17 个本地组合族 |
| `packages/ui/src/complex`、`ai` | 组合组件、公开类型与独立示例 catalog |
| `packages/ui/src/styles.css` | 唯一共享样式入口、字体、密度、暗色变体 |
| `apps/lab`、`apps/storybook` | 消费相同实现的组件确认界面与故事 |
| `apps/workbench` | 消费公共组件的 Agent、文件与差异、设置例工程 |
| `scripts/build-catalog.mjs` | 从 catalog 和 stories 生成计数与深链；新增组件后运行 `npm run catalog:build` |
| `skills/reito-ui` | 可携带 Skill 与设计约束 |

## 来源与验证

[源码与公开样式审计](docs/research/ui-source-analysis.md)保留 Multica 固定提交、本机 Cursor 静态资源、Claude 官方公开契约的证据和边界。[shadcn 生成来源](docs/shadcn-provenance.json)记录 CLI、registry、原始/本地哈希和最小修正；[发布包第三方声明](packages/ui/THIRD_PARTY_NOTICES.md)包含实际使用的许可。

```powershell
npm run check
npm run tokens:audit
npm run test:ui
npm run build
npm run test:storybook
npm run test:storybook:controls
```

Storybook 审计需运行中的 6006 服务。Windows 测试默认使用 Edge。实际结果见 [验证记录](docs/validation.md)。

版本记录保留在相关文档中；[0.3 AI 目录截图](docs/images/v03-ai-dark.png)是历史界面，不代表 0.4 的当前密度。

AI 示例仅演示本地 UI 状态；请求、停止、授权执行、上传与模型调用由宿主实现。DataTable 是客户端表格，未实现虚拟化和服务端数据协议。完整国际化、真实 OS 输入法、屏幕阅读器和所有浏览器仍需产品验收。
