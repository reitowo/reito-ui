import { useEffect, useId, useRef, useState, type ComponentType } from 'react';
import { FileText, Folder, Plus } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Input } from '../primitives/input.js';
import { ArtifactPanel, type ArtifactVersion } from './artifact.js';
import { CodeBlock } from './code-block.js';
import { MarkdownContent } from './markdown-content.js';
import { StructuredMessage, type MessagePart } from './message-parts.js';
import { Composer, type ComposerCommandItem, type ComposerDraft, type ComposerMentionItem } from './composer.js';
import { AttachmentList, Citation, ContextPill, PromptSuggestions, Sources, type AttachmentItem, type SourceItem } from './context.js';
import { ChatPalette } from './chat-palette.js';
import { ChatOverlay } from './chat-overlay.js';
import { Conversation, Message } from './conversation.js';
import { AgentTaskCard, PermissionRequest, TokenUsage, type PermissionDecision } from './decisions.js';
import { PlanSteps, Reasoning, ToolCall } from './execution.js';
import { ModelSelector, type ModelOption } from './model-selector.js';
import { AiDemoFrame, type ExecutionStatus } from './shared.js';
import { MessageActions, type MessageFeedback } from './message-actions.js';
import { MessageBranch } from './message-branch.js';
import { TaskQueue, type QueueTask, type QueueTaskStatus } from './task-queue.js';
import { Checkpoint } from './checkpoint.js';

export const demoModels: ModelOption[] = [
  { id: 'auto', name: '自动', description: '本地选项；未连接模型' },
  { id: 'sample', name: '示例模型', description: '用于检查选择器状态' },
  { id: 'unavailable', name: '未配置模型', description: '需要由宿主配置', disabled: true },
];

export const demoComposerCommands: ComposerCommandItem[] = [
  { id: 'review', label: 'review', description: '插入本地审查请求', insertText: '请审查当前改动：' },
  { id: 'explain', label: 'explain', description: '插入解释请求', insertText: '请解释当前文件：' },
  { id: 'remote', label: 'remote', description: '外部命令尚未配置', disabled: true },
];
export const demoComposerMentions: ComposerMentionItem[] = [
  { id: 'design', label: 'design-language.md', kind: 'file', description: '本地设计规范', keywords: ['规范'] },
  { id: 'composer', label: 'composer.tsx', kind: 'file', description: '当前输入组件' },
  { id: 'reito', label: 'Reito', kind: 'person', description: '本地示例成员' },
];

export function ChatPaletteDemo() { return <ChatPalette groups={[{ id: 'local', label: '本地命令', commands: [{ id: 'review', label: '审查文件' }] }]} onCommand={() => undefined} composer={{ onSubmit: () => undefined }}><Message from='assistant' local>仅演示本地视图切换。</Message></ChatPalette>; }

export function ChatOverlayDemo() { return <ChatOverlay description='本地示例，未连接模型' composer={{ onSubmit: () => undefined }}><Message from='assistant' local>在当前工作区继续提问。</Message></ChatOverlay>; }

export function ComposerDemo() {
  const [draft, setDraft] = useState<ComposerDraft>({ text: '', mentions: [], contextIds: [] });
  const [model, setModel] = useState('auto');
  const [context, setContext] = useState(true);
  const [sent, setSent] = useState('');
  return <AiDemoFrame><Composer
    draft={draft}
    onDraftChange={setDraft}
    onSubmit={setSent} onSubmitDraft={submitted => setSent(`${submitted.text} · ${submitted.mentions.length} 个提及`)}
    commandItems={demoComposerCommands}
    mentionItems={demoComposerMentions}
    contextItems={context ? [{ id: 'workspace', label: '当前工作区', icon: <Folder /> }] : []}
    onContextRemove={() => setContext(false)}
    toolbar={<><Button type="button" variant="ghost" size="icon-sm" aria-label="添加示例上下文" disabled={context} onClick={() => setContext(true)}><Plus /></Button><ModelSelector options={demoModels} value={model} onValueChange={setModel} compact /></>}
    hint="Enter 发送 · Shift + Enter 换行 · / 命令 · @ 提及"
  /><p role="status" className="text-sm text-muted-foreground">{sent ? `本地已记录：${sent}` : '输入 / 或 @ 检查结构化草稿。'}</p></AiDemoFrame>;
}

const localResponse = '先统一工作面的阅读宽度与分隔线，再用同一套控件构建设置、工具调用和代码预览。正文保持自然流动；辅助信息在需要时展开。';
export function ConversationDemo() {
  const [text, setText] = useState(localResponse);
  const [running, setRunning] = useState(false);
  const position = useRef(0);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      position.current = Math.min(localResponse.length, position.current + 3);
      setText(localResponse.slice(0, position.current));
      if (position.current >= localResponse.length) setRunning(false);
    }, 65);
    return () => clearInterval(timer);
  }, [running]);
  return <AiDemoFrame><Conversation className="h-80 rounded-lg border" label="本地示例对话"><Message from="user" local>我想让组件在桌面工作区里保持一致。</Message><Message from="assistant" local streaming={running}>{text || ' '}</Message></Conversation><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" disabled={running} onClick={() => { position.current = 0; setText(''); setRunning(true); }}>开始本地流式示例</Button>{running && <Button type="button" variant="ghost" size="sm" onClick={() => setRunning(false)}>停止示例</Button>}</div></AiDemoFrame>;
}

export function ReasoningDemo() {
  const [running, setRunning] = useState(false);
  return <AiDemoFrame><Reasoning status={running ? 'running' : 'complete'} defaultOpen elapsedSeconds={running ? undefined : 4}>先检查组件的语义角色，再核对焦点和边界。这段过程说明由示例作者提供。</Reasoning><Button type="button" variant="outline" size="sm" onClick={() => setRunning(value => !value)}>{running ? '结束本地计时' : '开始本地计时'}</Button></AiDemoFrame>;
}

export function ToolCallDemo() {
  const [status, setStatus] = useState<ExecutionStatus>('error');
  useEffect(() => {
    if (status !== 'running') return;
    const timer = setTimeout(() => setStatus('success'), 700);
    return () => clearTimeout(timer);
  }, [status]);
  return <AiDemoFrame><ToolCall title="读取设计规范" status="success" durationLabel="示例 0.2s"><code className="font-mono text-xs">docs/design-language.md</code><p className="mt-2 text-muted-foreground">示例内容：组件颜色来自共享语义令牌。</p></ToolCall><ToolCall title="检查组件示例" status={status} variant="card" defaultOpen onRetry={() => setStatus('running')}>{status === 'error' ? '本地错误状态示例。点击重试仅切换组件状态。' : status === 'running' ? '正在播放本地状态变化…' : '本地状态示例已完成，没有执行命令。'}</ToolCall></AiDemoFrame>;
}

export function PlanStepsDemo() {
  const [selected, setSelected] = useState('');
  return <AiDemoFrame><PlanSteps steps={[{ id: 'tokens', title: '确认共享令牌', status: 'success' }, { id: 'components', title: '组合工作区组件', description: '输入区、来源与产物使用相同的基础控件。', status: 'running' }, { id: 'stories', title: '检查 Storybook 状态', status: 'pending' }]} onStepSelect={setSelected} /><p role="status" className="text-xs text-muted-foreground">{selected ? `当前示例步骤：${selected}` : '点击步骤可检查选择回调。'}</p></AiDemoFrame>;
}

const initialAttachments: AttachmentItem[] = [{ id: 'guide', name: 'design-language.md', sizeLabel: '12 KB', status: 'ready' }, { id: 'image', name: 'workspace-preview.png', kind: 'image', status: 'error', error: '本地错误状态示例' }];
export function AttachmentListDemo() {
  const [items, setItems] = useState(initialAttachments);
  return <AiDemoFrame><AttachmentList items={items} onRemove={id => setItems(current => current.filter(item => item.id !== id))} onRetry={id => setItems(current => current.map(item => item.id === id ? { ...item, status: 'ready', sizeLabel: '48 KB', error: undefined } : item))} /><Button type="button" variant="ghost" size="sm" onClick={() => setItems(initialAttachments)}>重置示例附件</Button></AiDemoFrame>;
}

export function ContextPillDemo() {
  const [included, setIncluded] = useState(true);
  return <AiDemoFrame><div className="flex flex-wrap items-center gap-2"><ContextPill label="当前工作区" icon={<Folder />}>当前工作区</ContextPill>{included && <ContextPill label="design-language.md" icon={<FileText />} onRemove={() => setIncluded(false)}>design-language.md</ContextPill>}<ContextPill label="只读上下文" disabled onRemove={() => undefined}>只读上下文</ContextPill></div>{!included && <Button type="button" size="sm" variant="outline" onClick={() => setIncluded(true)}>添加规范上下文</Button>}</AiDemoFrame>;
}

export function ModelSelectorDemo() {
  const [value, setValue] = useState('auto');
  return <AiDemoFrame><ModelSelector options={demoModels} value={value} onValueChange={setValue} /><p role="status" className="text-sm text-muted-foreground">当前本地选项：{demoModels.find(model => model.id === value)?.name}</p></AiDemoFrame>;
}

export function PromptSuggestionsDemo() {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState('');
  return <AiDemoFrame><PromptSuggestions items={[{ id: 'review', label: '检查共享样式', prompt: '检查侧栏布局与焦点样式' }, { id: 'explain', label: '解释组件结构', prompt: '解释组件的分层和复用方式' }, { id: 'later', label: '远程分析未配置', prompt: '', disabled: true }]} onSelect={setValue} /><Composer value={value} onValueChange={setValue} onSubmit={setSent} /><p role="status" className="text-sm text-muted-foreground">{sent ? `本地已记录：${sent}` : '建议只填入草稿，由你决定发送。'}</p></AiDemoFrame>;
}

export const demoSources: SourceItem[] = [{ id: 'base', title: 'Base UI · React components', href: 'https://base-ui.com/react/overview/quick-start', description: '基础交互组件的官方文档' }, { id: 'shadcn', title: 'shadcn/ui · Components', href: 'https://ui.shadcn.com/docs/components', description: '组件组合与样式的官方文档' }];
export function SourcesDemo() { return <AiDemoFrame note="引用展示示例 · 来源由调用方提供"><p className="text-sm leading-6">基础交互与样式组合使用各自的官方接口。<Citation source={demoSources[0]} index={1} /> <Citation source={demoSources[1]} index={2} /></p><Sources items={demoSources} /></AiDemoFrame>; }

export function PermissionRequestDemo() {
  const [decision, setDecision] = useState<PermissionDecision>('pending');
  return <AiDemoFrame><PermissionRequest title="运行本地检查" description="允许示例进入下一步？此处只记录选择，不运行命令。" detail={<code className="break-all font-mono text-xs">npm run check</code>} decision={decision} onDecision={setDecision} /><Button type="button" size="sm" variant="ghost" onClick={() => setDecision('pending')}>重置权限示例</Button></AiDemoFrame>;
}

export function ArtifactPanelDemo() {
  const id = useId();
  const [name, setName] = useState('个人工作区');
  const [saved, setSaved] = useState('');
  const [closed, setClosed] = useState(false);
  const versions: ArtifactVersion[] = [{ id: 'v1', label: '版本 1', status: 'ready', preview: <p className="text-sm">初始版本：默认工作区</p>, code: 'export const workspace = { name: "默认工作区" };', language: 'typescript' }, { id: 'v2', label: '版本 2', status: 'draft', preview: <form className="grid gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); setSaved(name.trim()); }}><div className="grid gap-2"><label htmlFor={id} className="text-sm font-medium">工作区名称</label><Input id={id} value={name} onChange={event => setName(event.target.value)} required pattern=".*\S.*" /></div><Button type="submit" size="sm" className="justify-self-start">保存本地预览</Button><p role="status" className="text-xs text-muted-foreground">{saved ? `已保存：${saved}` : '预览表单状态保存在当前示例。'}</p></form>, code: `export const workspace = { name: ${JSON.stringify(name)} };`, language: 'typescript' }];
  return <AiDemoFrame>{closed ? <Button type="button" variant="outline" onClick={() => setClosed(false)}>打开产物示例</Button> : <ArtifactPanel title="WorkspaceSettings.tsx" versions={versions} onClose={() => setClosed(true)} />}</AiDemoFrame>;
}

export function CodeBlockDemo() { return <AiDemoFrame note="代码展示示例 · 复制使用系统剪贴板"><CodeBlock filename="workspace.ts" language="typescript" code={'export const workspace = {\n  name: "个人工作区",\n  density: "compact",\n};'} /></AiDemoFrame>; }
export function MarkdownContentDemo() { return <AiDemoFrame note="Markdown 渲染示例 · 内容与链接由调用方提供"><MarkdownContent value={'## 组件验收\n\n使用 **Graphite tokens** 统一消息和文档。\n\n- 检查窄宽度\n- 保留语义结构\n\n```ts\nexport const density = "compact";\n```'} /></AiDemoFrame>; }
export const demoMessageParts: MessagePart[] = [
  { id: 'answer', type: 'text', format: 'markdown', text: '已读取 **Graphite** 规范，下面是本地结构化消息示例。' },
  { id: 'tool', type: 'tool', title: '检查设计令牌', status: 'error', variant: 'inline', open: true, content: '本地错误示例：等待宿主重试。' },
  { id: 'sources', type: 'source', items: demoSources },
  { id: 'attachment', type: 'attachment', items: [{ id: 'guide', name: 'design-language.md', sizeLabel: '12 KB', status: 'ready' }, { id: 'preview', name: 'workspace-preview.png', kind: 'image', status: 'error', error: '本地附件错误示例' }] },
  { id: 'artifact', type: 'artifact', title: 'workspace.ts', version: 'v1', view: 'preview', versions: [{ id: 'v1', label: '版本 1', status: 'ready', preview: <p className="text-sm">紧凑工作区预览</p>, code: 'export const density = "compact";', language: 'typescript' }, { id: 'v2', label: '版本 2', status: 'draft', preview: <p className="text-sm">舒适工作区草稿</p>, code: 'export const density = "comfortable";', language: 'typescript' }] },
];
export function MessagePartsDemo() {
  const [parts, setParts] = useState(demoMessageParts);
  const updatePart = (id: string, update: (part: MessagePart) => MessagePart) => setParts(current => current.map(part => part.id === id ? update(part) : part));
  return <AiDemoFrame note="结构化消息本地示例 · parts 与状态由宿主持有">
    <StructuredMessage
      from="assistant"
      local
      parts={parts}
      onRetryPart={id => updatePart(id, part => ({ ...part, status: 'complete', error: undefined, ...(part.type === 'tool' ? { content: '本地状态已恢复，没有执行真实工具。' } : {}) }))}
      onToolOpenChange={(id, open) => updatePart(id, part => part.type === 'tool' ? { ...part, open } : part)}
      onAttachmentRemove={(partId, attachmentId) => updatePart(partId, part => part.type === 'attachment' ? { ...part, items: part.items.filter(item => item.id !== attachmentId) } : part)}
      onAttachmentRetry={(partId, attachmentId) => updatePart(partId, part => part.type === 'attachment' ? { ...part, items: part.items.map(item => item.id === attachmentId ? { ...item, status: 'ready', sizeLabel: '48 KB', error: undefined } : item) } : part)}
      onArtifactVersionChange={(id, version) => updatePart(id, part => part.type === 'artifact' ? { ...part, version } : part)}
      onArtifactViewChange={(id, view) => updatePart(id, part => part.type === 'artifact' ? { ...part, view } : part)}
      onArtifactClose={id => setParts(current => current.filter(part => part.id !== id))}
    />
    <Button type="button" size="sm" variant="ghost" className="justify-self-start" onClick={() => setParts(demoMessageParts)}>重置结构化消息</Button>
  </AiDemoFrame>;
}
export function TokenUsageDemo() { return <AiDemoFrame note="静态数值示例 · 不根据文本估算用量"><TokenUsage input={1280} output={346} contextUsed={8120} contextLimit={32000} sourceLabel="手动提供的示例数据" /></AiDemoFrame>; }
export function AgentTaskCardDemo() {
  const [opened, setOpened] = useState(false);
  const [status, setStatus] = useState<'running' | 'needs-attention' | 'success'>('needs-attention');
  return <AiDemoFrame><AgentTaskCard title="检查工作区布局" description="确认输入区、工具调用和预览面板的状态。" status={status} context="reito-ui / local-example" updatedLabel="本地示例" onOpen={() => setOpened(value => !value)} actions={status !== 'success' ? <Button type="button" size="sm" variant="outline" onClick={() => setStatus('success')}>标记示例完成</Button> : <Button type="button" size="sm" variant="ghost" onClick={() => setStatus('needs-attention')}>重置示例</Button>} />{opened && <p role="status" className="text-sm text-muted-foreground">任务详情：这是本地组件状态，没有后台任务。</p>}</AiDemoFrame>;
}

export function MessageActionsDemo() {
  const [feedback, setFeedback] = useState<MessageFeedback>(null);
  const [result, setResult] = useState('');
  const text = '把共享令牌应用到消息和工作区控件。';
  return <AiDemoFrame><p className="text-sm leading-6">{text}</p><MessageActions text={text} feedback={feedback} onFeedbackChange={setFeedback} onRetry={() => setResult('已记录本地重试请求')} onEdit={() => setResult('已记录本地编辑请求')} /><p className="text-xs text-muted-foreground">{result || '复制使用系统剪贴板，其余操作只更新本地示例状态。'}</p></AiDemoFrame>;
}

export function MessageBranchDemo() {
  const [index, setIndex] = useState(0);
  const id = useId();
  const branches = ['方案一：保持单列阅读，按需展开预览。', '方案二：会话与当前产物并排查看。', '方案三：先收集上下文，再进入代码审查。'];
  return <AiDemoFrame><p id={id} className="text-sm leading-6">{branches[index]}</p><MessageBranch index={index} count={branches.length} onIndexChange={setIndex} contentId={id} /></AiDemoFrame>;
}

export const demoQueueTasks: QueueTask[] = [
  { id: 'layout', title: '检查工作区布局', status: 'running', description: '本地队列状态示例' },
  { id: 'focus', title: '检查焦点样式', status: 'queued' },
  { id: 'preview', title: '检查产物预览', status: 'failed', error: '本地错误示例：预览数据尚未就绪' },
  { id: 'tokens', title: '确认共享令牌', status: 'completed' },
];
export function TaskQueueDemo() {
  const [tasks, setTasks] = useState(demoQueueTasks);
  const update = (id: string, status: QueueTaskStatus) => setTasks(current => current.map(task => task.id === id ? { ...task, status, error: undefined } : task));
  return <AiDemoFrame><TaskQueue tasks={tasks} onPause={id => update(id, 'paused')} onResume={id => update(id, 'running')} onCancel={id => update(id, 'cancelled')} onRetry={id => update(id, 'queued')} /><Button type="button" variant="ghost" size="sm" className="justify-self-start" onClick={() => setTasks(demoQueueTasks)}>重置本地队列</Button></AiDemoFrame>;
}

export function CheckpointDemo() {
  const [name, setName] = useState('修改后的工作区');
  const id = useId();
  return <AiDemoFrame note="本地恢复点示例 · 只恢复下方字段，不修改磁盘"><div className="grid gap-[var(--rui-content-gap-sm)]"><label htmlFor={id} className="text-sm">当前示例名称</label><Input id={id} value={name} onChange={event => setName(event.target.value)} /></div><Checkpoint title="布局调整前" description="保存工作区名称和设置的示例恢复点。" createdLabel="本地示例检查点" files={[{ path: 'workspace-settings.ts', status: 'modified' }, { path: 'layout.css', status: 'added' }]} confirmDescription="此演示只把上方工作区名称还原为“个人工作区”，不会读写本机文件。" onRestore={() => setName('个人工作区')} /></AiDemoFrame>;
}

export interface AiCatalogEntry { id: string; name: string; description: string; component: ComponentType }
export const aiCatalog: AiCatalogEntry[] = [
  { id: 'composer', name: 'Composer', description: '受控草稿、多行输入、异步提交和停止动作', component: ComposerDemo },
  { id: 'conversation', name: 'Conversation / Message', description: '可读消息流、角色和滚动跟随', component: ConversationDemo },
  { id: 'reasoning', name: 'Reasoning', description: '折叠过程说明与计时状态', component: ReasoningDemo },
  { id: 'tool-call', name: 'ToolCall', description: '行内与卡片式工具状态', component: ToolCallDemo },
  { id: 'plan-steps', name: 'PlanSteps', description: '带状态的步骤与选择回调', component: PlanStepsDemo },
  { id: 'attachments', name: 'AttachmentList', description: '附件列表、错误、重试与移除', component: AttachmentListDemo },
  { id: 'context-pill', name: 'ContextPill', description: '紧凑上下文与移除动作', component: ContextPillDemo },
  { id: 'model-selector', name: 'ModelSelector', description: '受控模型选项和禁用状态', component: ModelSelectorDemo },
  { id: 'suggestions', name: 'PromptSuggestions', description: '用建议填入可编辑草稿', component: PromptSuggestionsDemo },
  { id: 'sources', name: 'Citation / Sources', description: '行内引用与可追溯来源列表', component: SourcesDemo },
  { id: 'permission', name: 'PermissionRequest', description: '权限请求：由宿主持有允许与拒绝状态', component: PermissionRequestDemo },
  { id: 'artifact', name: 'ArtifactPanel', description: '代码、交互预览与版本切换', component: ArtifactPanelDemo },
  { id: 'code-block', name: 'CodeBlock', description: '语法高亮、滚动代码与原文复制', component: CodeBlockDemo },
  { id: 'markdown-content', name: 'MarkdownContent / RichMessage', description: 'CommonMark/GFM 文档、安全内容策略与消息组合', component: MarkdownContentDemo },
  { id: 'chat-palette', name: 'ChatPalette', description: '命令、会话选择与对话组合', component: ChatPaletteDemo },
  { id: 'chat-overlay', name: 'ChatOverlay', description: '保留草稿的对话弹层与焦点恢复', component: ChatOverlayDemo },
  { id: 'message-parts', name: 'MessageParts / StructuredMessage', description: '文本、工具、引用、附件与产物的宿主受控映射', component: MessagePartsDemo },
  { id: 'token-usage', name: 'TokenUsage', description: '展示调用方提供的用量与来源', component: TokenUsageDemo },
  { id: 'agent-task', name: 'AgentTaskCard', description: '任务状态、需处理状态与操作', component: AgentTaskCardDemo },
  { id: 'message-actions', name: 'MessageActions', description: '消息复制、重试、编辑与反馈操作', component: MessageActionsDemo },
  { id: 'message-branch', name: 'MessageBranch', description: '受控消息分支与键盘切换', component: MessageBranchDemo },
  { id: 'task-queue', name: 'TaskQueue', description: '任务队列、计数、筛选与暂停取消操作', component: TaskQueueDemo },
  { id: 'checkpoint', name: 'Checkpoint', description: '恢复点摘要、文件变更与确认恢复', component: CheckpointDemo },
];
