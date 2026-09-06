# 组件分层与组合契约

Reito UI 0.4 工作区按应用场景提供 **57 个基础组件族、22 个复杂组件族、19 个 AI 组件族**，共 98 族。Storybook 将核心样式、尺寸和适用状态拆为独立 stories，当前数量见[生成目录](../apps/lab/src/catalog-manifest.json)。这里按组件族计数：`Conversation / Message` 属于一个族，`AppShell / WorkspacePane / ResizableWorkspace` 属于一个族；计数不等于 JavaScript 导出数量。Lab 和 Storybook 使用同一份组件源码，目录中的演示数据与交互示例单独维护。

| 需要解决的问题 | 使用层 | 发布包入口 | 这一层负责什么 |
| --- | --- | --- | --- |
| 按钮、表单字段、菜单、弹层、Tabs 等通用交互 | 基础 57 | `@reito/ui/basic` | 50 个官方 shadcn Base UI / base-nova 生成族，加 7 个本地组合族；统一主题、尺寸和必要修复。 |
| 本地数据表、筛选、属性编辑、设置、分栏等通用工作流 | 复杂 22 | `@reito/ui/complex` | 组合基础控件，提供明确的数据、状态和回调契约。 |
| 草稿、消息、上下文、工具状态、权限选择、产物等 AI 工作面 | AI 19 | `@reito/ui/ai` | AI 场景的呈现和交互；模型请求、执行与业务状态由宿主接管。 |

`@reito/ui` 根入口同时导出三层。新页面可以按上表选择子入口，让依赖用途清晰。`basic/catalog.tsx`、`complex/catalog.tsx` 和 `ai/catalog.tsx` 供仓库 Lab 使用，不属于发布包公共 API。

所有层都消费同一份语义主题。颜色、字体和密度的主源是 [`packages/tokens/src/tokens.json`](../packages/tokens/src/tokens.json)，基础组件不再使用旧版 `components.tsx` API。常规控件保留实际 Base UI 的 `render`、受控值和组合结构；日历、命令搜索、分栏分别依赖 React DayPicker、cmdk、react-resizable-panels，静态展示组件使用普通语义元素。不能把全部基础组件都描述成 Base UI 包装器。

## 基础层：57 个组件族

基础公共入口见 [`basic.ts`](../packages/ui/src/basic.ts)。以下 50 个官方生成族按使用用途分组，导出位于 [`primitives/index.ts`](../packages/ui/src/primitives/index.ts)；后表列出 0.4 新增的 7 个本地组合族，不能将它们标为 CLI 生成源码。

| 用途 | 组件族 |
| --- | --- |
| 操作 | Button、ButtonGroup、Toggle、ToggleGroup |
| 表单 | Input、Textarea、Label、Field、InputGroup、InputOTP、Checkbox、RadioGroup、Switch、Slider、Select、NativeSelect、Combobox |
| 弹层与提示 | Dialog、AlertDialog、Sheet、Popover、HoverCard、Tooltip |
| 导航与展开 | Tabs、Accordion、Collapsible、Breadcrumb、NavigationMenu、Menubar、ContextMenu、DropdownMenu、Pagination、Sidebar |
| 数据与选择 | Table、Calendar、Command |
| 信息展示 | Alert、Avatar、Badge、Card、Empty、Item、Kbd、Progress、Skeleton、Spinner |
| 布局 | AspectRatio、Resizable、ScrollArea、Separator |

| 本地 Base UI 组合族及实际导出 | 关键契约与边界 |
| --- | --- |
| [`ToastProvider / useToastManager / createToastManager`](../packages/ui/src/basic/feedback.tsx) | 用 Provider 声明通知区域，在其范围内通过 manager 新增、更新和关闭通知。Provider 支持 `viewportLabel / viewportClassName / closeLabel`，保留 Base UI 管理器、计时和焦点语义。通知中的实际业务操作由宿主提供。 |
| [`MultiSelect`](../packages/ui/src/basic/multi-select.tsx) | 必填 `label / options`，选项使用 `value / label / disabled`；`value / onValueChange` 可受控，未受控时支持 `defaultValue`。基于 Combobox 的多值选择、过滤和 chip 移除，支持 `loading / error / description / disabled`。 |
| [`InputTags`](../packages/ui/src/basic/input-tags.tsx) | 必填 `label`；`value / onValueChange` 可受控，未受控时支持 `defaultValue`。输入任意字符串后按 Enter 或配置的分隔键创建，支持忽略/拒绝/允许重复、数量/长度上限、原位编辑、删除、只读、禁用和原生重复表单值。只允许选择既有 options 时使用 MultiSelect。 |
| [`AsyncCombobox`](../packages/ui/src/basic/async-combobox.tsx) | 必填 `label / loadOptions`；`query / onQueryChange` 与 `value / onValueChange` 分别可受控。宿主 loader 接收 AbortSignal；组件防止过期结果覆盖、呈现 idle/loading/error/empty/retry，并缓存单选标签。它不内置网络端点或业务搜索。 |
| [`AsyncMultiSelect`](../packages/ui/src/basic/async-multi-select.tsx) | 必填 `label / loadOptions`；查询和值分别受控或非受控。复用异步取消、过期保护和状态机，以 chips 呈现多值，并缓存已选标签，使远程结果翻页或过滤后仍能解析已有选择。原生表单使用重复同名值。 |
| [`NumberField`](../packages/ui/src/basic/number-field.tsx) | 必填 `label`，其余值、范围、步进、格式与提交事件采用 Base UI NumberField Root 契约。支持 `description / error / incrementLabel / decrementLabel`；宿主应允许输入过程中的 `null`，不能把空输入强制解释成 0。 |
| [`Meter`](../packages/ui/src/basic/meter.tsx) | 必填 `label`，数值与范围采用 Base UI Meter Root 契约；支持 `description / valueLabel`，`tone` 为 `default / success / warning / danger`。表示容量、配额或质量等有界测量；异步任务进度使用 Progress。 |

需要按钮尺寸、输入焦点、菜单键盘行为或主题修复时，先改共享 token 或对应基础组件。新增产品页面应组合已有 API；选择器的 `onValueChange`、复选框的 `onCheckedChange` 等必须按实际类型使用，不能沿用旧 API 名称。

## 复杂层：22 个组件族

公共导出见 [`complex/index.ts`](../packages/ui/src/complex/index.ts)，可交互演示见 [`complex/catalog.tsx`](../packages/ui/src/complex/catalog.tsx)。

| 组件族及实际导出 | 关键契约与边界 |
| --- | --- |
| [`DataTable`](../packages/ui/src/complex/data-table.tsx) | 泛型 `data` / `columns` 与稳定 `getRowId`；本地或 manual 远程筛选、排序、分页，类型化列筛选、列管理/固定/宽度，层级展开、详情、数据行分组/聚合，带校验和失败恢复的编辑事务，范围明确的导出请求和版本化视图偏好，以及可定位、动态测量并报告加载边界的行窗口化。所有状态、持久化、文件生成、网络和缓存均可由宿主接管。 |
| [`DisclosureTree`](../packages/ui/src/complex/disclosure-tree.tsx) | `nodes` 使用稳定 `id`、`label`、可选 `children`；`value` / `onValueChange` 控制叶节点选择，`defaultExpanded` 初始化展开目录，叶节点支持 `disabled`。使用原生 `details` / `summary`；Tab 逐项移动，Enter / Space 展开。**它不是 ARIA tree，没有树控件的方向键导航模型。** |
| [`SearchFilterBar`](../packages/ui/src/complex/search-filter-bar.tsx) | `query` / `onQueryChange` 与 `selected` / `onSelectedChange` 均受控；`filters` 定义可选条件、数量和禁用项。组件发出筛选状态，宿主负责根据状态过滤数据；`resultCount` 由宿主传入。 |
| [`DateRangePicker`](../packages/ui/src/complex/date-range-picker.tsx) | `value: DateRange \| undefined` 与 `onValueChange` 必填。日历与日期输入编辑本地草稿；“应用范围”提交，“取消”或关闭丢弃草稿，“清除”提交 `undefined`。`minDate` / `maxDate` 和开始、结束顺序参与校验。使用本地日历日期，不内置时区转换。 |
| [`FileUpload`](../packages/ui/src/complex/file-upload.tsx) | `value?: QueuedFile[]` / `onValueChange` 可接管队列，每项为 `{ id, file: File }`。支持 `accept`、`maxSize`（字节）、`maxFiles`、重复校验、拖放与移除；默认 10 MB、5 个。**组件只保留本地文件引用，不读取内容，也不向外部发送文件。** |
| [`PropertyList`](../packages/ui/src/complex/property-list.tsx) | `items` 提供 `key`、`label`、`value: string \| number`；宿主在 `onValueChange(key, value)` 中更新数据。字段可设 `kind: 'number'`、`readOnly`、`validate`。验证返回错误字符串时保留编辑；Escape 取消并恢复编辑入口焦点。回调为同步更新契约，远程保存及冲突处理由宿主提供。 |
| [`Timeline`](../packages/ui/src/complex/timeline.tsx) | `events` 包含稳定 ID、标题、说明、可选时间与内容；`status` 为 `complete / current / error / pending`。按传入顺序呈现，不自动按日期重排，也不执行事件。 |
| [`Stepper`](../packages/ui/src/complex/stepper.tsx) | 必填 `steps`、`value`；可选 `onValueChange` 控制导航。每步可设 `disabled`、`error` 和说明。允许跳步及业务验证由宿主决定；它不负责保存整个流程。 |
| [`SettingsSection / SettingsRow`](../packages/ui/src/complex/settings-section.tsx) | `SettingsSection` 提供必填 `title` 与可选 `description`、`actions`、`children`。`SettingsRow` 提供 `label`、`description` 和控件区域。行标题不会自动成为内部控件的 label，宿主仍须提供 `aria-label` 或显式 `<label>` 关联。 |
| [`AppShell / WorkspacePane / ResizableWorkspace`](../packages/ui/src/complex/workspace.tsx) | `AppShell` 的 `header / sidebar / inspector / footer / children` 负责窗口区域，容器高度由宿主决定。`WorkspacePane` 提供 `title / description / actions / footer`，`scroll` 默认 `true`，内容区独立滚动。`ResizableWorkspace` 接收必填 `primary / secondary`，支持水平或垂直分栏及键盘调整；默认主栏 60%、最小栏 20%，`onSizesChange` 返回百分比。它不自动持久化布局。 |
| [`CommandSearch`](../packages/ui/src/complex/command-search.tsx) | 必填分组 `groups` 与 `onSelect(command)`；命令具备稳定 ID、标签、说明、关键词、禁用项及可选快捷键提示。`query` / `onQueryChange` 可受控。cmdk 负责过滤、分组、空态和键盘选择，组件保护中文 IME Enter；`shortcut` 只显示提示，不注册全局快捷键。 |
| [`DiffViewer`](../packages/ui/src/complex/diff-viewer.tsx) | 必填 `hunks: DiffHunk[]`，每行由宿主明确提供 `kind`、修改前后文本及行号；`view / onViewChange` 可控制 `unified / split`。提供换行切换、局部滚动、文本增删语义和 `binary / error / emptyMessage` 状态。**组件不计算 diff，也不推断修改前后行的配对。** |
| [`LogViewer`](../packages/ui/src/complex/log-viewer.tsx) | `entries: LogEntry[]` 来自宿主，级别为 `debug / info / warning / error`。`query / levels / follow` 分别可受控；本地搜索与级别筛选，上滚暂停、明确操作恢复跟随。`onClear` 请求宿主清除数据，支持 `loading / error / disabled`。它不连接日志服务，也不执行终端命令。 |
| [`KeyValueEditor`](../packages/ui/src/complex/key-value-editor.tsx) | `value: KeyValueEntry[] / onValueChange` 必填，数组与稳定 ID 保留重复键和无效草稿，允许增删键和值。键去除首尾空格后必填且区分大小写判重；`requireValues` 可要求非空值，`onSubmit` 支持 Promise，失败保留草稿。`secret` 仅控制界面遮罩，`readOnly / maxRows / disabled` 控制编辑。与 PropertyList 的固定属性编辑用途不同，不负责安全存储。 |
| [`ResourceList`](../packages/ui/src/complex/resource-list.tsx) | 必填 `items: ResourceItem[]`；`query / sort / selectedIds` 分别可受控。`selectionMode` 为 `none / single / multiple`，筛选不丢失已有选择，批量全选只影响当前可选结果。支持名称或更新时间排序、行操作、`loading / error / onRetry / emptyMessage`。当前提供列表布局，行操作调用宿主，不读取或修改文件。 |

公共布局组件适合编辑器、设置页和数据页共同复用。文件目录选择哪个文件、检查器何时打开、页面路由、数据请求与保存失败后的恢复，属于产品逻辑。将这些状态留在宿主，避免把一个聊天页的布局固定成整个组件库的默认结构。

## AI 层：19 个组件族

公共导出见 [`ai/index.ts`](../packages/ui/src/ai/index.ts)，演示入口见 [`ai/catalog.tsx`](../packages/ui/src/ai/catalog.tsx)。这层没有模型客户端或后台 Agent；组件通过宿主传入的数据和回调工作。

| 组件族及实际导出 | 关键契约与边界 |
| --- | --- |
| [`Composer`](../packages/ui/src/ai/composer.tsx) | `value` / `onValueChange` 可受控，未受控时支持 `defaultValue`；必填 `onSubmit(text): void \| Promise<void>`。成功后只清除未被宿主改写的原草稿；拒绝 Promise 时保留草稿并显示错误。提交期间阻止重复发送。`running` / `onStop` 由宿主管理生成与停止，`context` / `toolbar` / `hint` 接受 ReactNode。Enter 发送、Shift + Enter 换行，IME 候选确认不发送。 |
| [`Conversation / Message`](../packages/ui/src/ai/conversation.tsx) | `Conversation` 接收 `children`、`follow`、`label`、`empty`；读者停留在底部时跟随新增内容，上滚后暂停跟随并出现“回到最新”。宿主提供容器高度和消息序列。`Message.from` 为 `user / assistant / system`，支持 `streaming`、`actions` 和 `local`；正文是 ReactNode，不自动解析 Markdown 或连接流式接口。 |
| [`Reasoning`](../packages/ui/src/ai/execution.tsx) | 展示宿主提供的过程说明，支持 `idle / running / complete`、`elapsedSeconds`、受控 `open / onOpenChange`。未传计时值时可对当前 running 状态本地计时。它不生成或获取模型内部推理。 |
| [`ToolCall`](../packages/ui/src/ai/execution.tsx) | 必填 `title` 和 `status`，状态为 `pending / running / success / error`。`variant` 为 `inline / card`，展开可受控；错误态的 `onRetry` 只调用宿主函数，不运行工具。 |
| [`PlanSteps`](../packages/ui/src/ai/execution.tsx) | `steps` 提供 ID、标题、说明及上述执行状态；可选 `onStepSelect(id)`。完成数由传入状态计算，不调度或推进步骤。 |
| [`AttachmentList`](../packages/ui/src/ai/context.tsx) | `items` 提供文件名、类型、大小说明与 `ready / uploading / error` 状态；`onRemove(id)`、`onRetry(id)` 由宿主实现。它显示元数据和状态，不选择、读取或上传实际文件。 |
| [`ContextPill`](../packages/ui/src/ai/context.tsx) | 必填 `label` 和 `children`，可选 `icon / onRemove / disabled`。显示一个上下文引用；移除只发出回调，不读取文件或修改模型上下文。 |
| [`ModelSelector`](../packages/ui/src/ai/model-selector.tsx) | `options: ModelOption[]`、`value: string \| null`、`onValueChange(string)` 必填；选项提供 `id / name / description / disabled`。`compact` 适合 composer 工具栏。模型目录、实际模型参数与可用性由宿主提供，选择本身不连接服务。 |
| [`PromptSuggestions`](../packages/ui/src/ai/context.tsx) | `items` 包含 `id / label / prompt`；`onSelect(prompt)` 返回建议文本。通常接到草稿 setter，由用户继续编辑和发送。 |
| [`Citation / Sources`](../packages/ui/src/ai/context.tsx) | `SourceItem` 提供 `id / title / href? / description?`。`Citation` 还接收 `index`；`Sources` 接收 `items`。允许 HTTP(S)、站内路径和片段链接，其余协议退回文本展示。组件不抓取网页或验证来源内容。 |
| [`PermissionRequest`](../packages/ui/src/ai/decisions.tsx) | 必填 `title / description / decision / onDecision`；`decision` 为 `pending / allowed / denied`，回调只返回允许或拒绝。**点击允许不会执行命令或授予后端权限**，宿主负责绑定准确操作、记录决定并实施授权。 |
| [`ArtifactPanel`](../packages/ui/src/ai/artifact.tsx) | `title` 与 `versions` 必填；版本提供 `id / label / status / preview / code / language / error`。`version / onVersionChange` 和 `view / onViewChange` 可受控，`onClose` 交给宿主。`preview` 是宿主提供的 ReactNode，没有沙箱，也不编译或执行 `code` 字符串。 |
| [`CodeBlock`](../packages/ui/src/ai/code-block.tsx) | 必填 `code`，可选 `language / filename / copyable / onCopy`。按语言提供真实语法高亮，保持源码与局部滚动；未知语言或超长内容回退为原样文本。默认复制使用系统剪贴板，提供失败反馈。`variant="embedded"` 用于已有产物外框，移除自身外框并保留代码文本内距。支持的语言与边界见 [复用指南](reuse-guide.md#工作区增量代码高亮)；不把语法色当作 diff。 |
| [`TokenUsage`](../packages/ui/src/ai/decisions.tsx) | `sourceLabel` 必填；`input / output / contextUsed / contextLimit` 由宿主提供。有效数值显示用量和上下文比例，未知值显示占位；不按字符数估算 token，也不查询账户额度。 |
| [`AgentTaskCard`](../packages/ui/src/ai/decisions.tsx) | 必填 `title / status`，支持执行状态和 `needs-attention`；`onOpen`、`actions`、上下文及更新时间说明由宿主提供。它是任务呈现，不启动后台任务。 |
| [`MessageActions`](../packages/ui/src/ai/message-actions.tsx) | 必填 `text` 是复制内容，不从渲染后的 DOM 提取。`onCopy / onRetry / onEdit / onFeedbackChange` 支持 Promise，操作期间防止重复提交并显示失败；`feedback` 可受控，为 `up / down / null`。未传 `onCopy` 时使用剪贴板，其余业务操作由宿主提供。 |
| [`MessageBranch`](../packages/ui/src/ai/message-branch.tsx) | 必填受控 `index / count / onIndexChange`，`index` 从 0 开始，显示时转为 1 起始。支持前后按钮、左右键、Home / End，空分支和禁用状态不切换。只选择宿主提供的版本，不创建或保存会话分支。 |
| [`TaskQueue`](../packages/ui/src/ai/task-queue.tsx) | 必填 `tasks: QueueTask[]`，状态为 `queued / running / paused / completed / failed / cancelled`。支持分组筛选，`onPause / onResume / onCancel / onRetry` 接收任务 ID 并可返回 Promise；逐任务防重复、保留错误。`onOpen` 交由宿主导航；组件不调度或运行任务。 |
| [`Checkpoint`](../packages/ui/src/ai/checkpoint.tsx) | 必填 `title / files / onRestore`，文件状态为 `added / modified / deleted`。恢复前展示确认对话框，等待宿主 Promise；失败时保留检查点与错误，成功后关闭确认。`status` 可接管 `pending / restoring / success / error`。组件不写文件，恢复范围、内容和执行由宿主定义。 |

## 两个可以直接组合的例子

以下代码使用已声明的包子入口。React 19 应用安装 `@reito/ui` 和 `@reito/tokens` 后，在应用入口导入一次示例中的两份 CSS；发布包提供预编译样式。主题与密度放在 HTML 根节点，例如 `<html data-theme="dark" data-density="compact">`，以覆盖 portal 弹层。复杂组件与 AI 组件使用同一套基础控件，不另建主题。

### 设置分组

此例保存到组件内存，包含真实受控输入、开关及保存反馈。`SettingsRow.label` 是行标题，内部控件分别提供自己的可访问名称。

```tsx
import { useState } from 'react';
import { Button, Input, Switch } from '@reito/ui/basic';
import { SettingsRow, SettingsSection } from '@reito/ui/complex';
import '@reito/tokens/css';
import '@reito/ui/styles.css';

export function WorkspaceSettings() {
  const [name, setName] = useState('Graphite');
  const [notify, setNotify] = useState(true);
  const [saved, setSaved] = useState('');

  return <div className="reito-root">
    <SettingsSection title="工作区偏好" description="本地示例"
      actions={<Button disabled={!name.trim()} onClick={() =>
        setSaved(`${name.trim()}：提醒${notify ? '开启' : '关闭'}`)
      }>保存设置</Button>}>
      <SettingsRow label="工作区名称">
        <Input aria-label="工作区名称" value={name}
          onChange={event => { setName(event.target.value); setSaved(''); }} />
      </SettingsRow>
      <SettingsRow label="完成提醒">
        <Switch aria-label="完成提醒" checked={notify}
          onCheckedChange={value => { setNotify(value); setSaved(''); }} />
      </SettingsRow>
    </SettingsSection>
    <p role="status">{saved && `此示例已保存：${saved}`}</p>
  </div>;
}
```

### Composer、上下文与模型选择

此例将建议填入草稿，允许移除或重新添加上下文，并把选中的模型 ID、上下文标识和提交文本一起交给本地回调。上下文标识是宿主数据，`ContextPill` 不读取对应文件。接入服务时，让 `onSubmit` 返回宿主请求的 Promise，并通过 `running / onStop` 接入生成与取消状态。

```tsx
import { useState } from 'react';
import { Button } from '@reito/ui/basic';
import { Composer, ContextPill, ModelSelector, PromptSuggestions,
  type ModelOption } from '@reito/ui/ai';
import '@reito/tokens/css';
import '@reito/ui/styles.css';

const models: ModelOption[] = [
  { id: 'local-demo', name: '本地演示', description: '未连接模型' },
  { id: 'unconfigured', name: '未配置服务', disabled: true },
];

export function RequestComposer() {
  const [draft, setDraft] = useState('');
  const [model, setModel] = useState('local-demo');
  const [includeGuide, setIncludeGuide] = useState(true);
  const [receipt, setReceipt] = useState('');

  return <div className="reito-root">
    <PromptSuggestions items={[
      { id: 'review', label: '检查共享样式', prompt: '检查组件的焦点与间距' },
    ]} onSelect={setDraft} />
    <Composer value={draft} onValueChange={setDraft} label="请求草稿"
      submitLabel="记录本地请求"
      context={includeGuide && <ContextPill label="design-language.md"
        onRemove={() => setIncludeGuide(false)}>design-language.md</ContextPill>}
      toolbar={<>
        <Button type="button" variant="ghost" size="sm" disabled={includeGuide}
          onClick={() => setIncludeGuide(true)}>添加规范上下文</Button>
        <ModelSelector options={models} value={model}
          onValueChange={setModel} compact />
      </>}
      onSubmit={text => {
        const contextIds = includeGuide ? ['design-language.md'] : [];
        setReceipt(JSON.stringify({ text, model, contextIds }));
      }} />
    <p role="status">{receipt ? `本地已记录：${receipt}` : '未发送外部请求'}</p>
  </div>;
}
```

需要组合数据页或工作区时，继续使用复杂层的 `AppShell`、`WorkspacePane` 和 `ResizableWorkspace`。宿主负责数据获取、持久化、模型认证、实际上传、执行授权、取消请求与错误恢复；共享组件负责将这些状态清楚地呈现出来。

## 核对依据

本页对应 0.4 源码，组件族与 story 数量按 [生成目录](../apps/lab/src/catalog-manifest.json) 核对，API 逐项核对实际接口与 [`packages/ui/package.json`](../packages/ui/package.json) 的 `exports`。新增族应注册 catalog 与 stories，再运行 `npm run catalog:build`；`npm run check` 中的 `catalog:check` 检查漂移。两个 TSX 示例使用源码公开子入口类型检查，它们演示本地交互，不代表已经连接模型或保存服务。[Workbench](../apps/workbench/src/App.tsx) 展示 Agent、文件与差异、设置的跨层组合。完整运行与打包方法见 [reuse-guide.md](reuse-guide.md)，验证结果以该次实际运行记录为准。
