import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { RichTextEditor, richTextEditorDefaultBlockActions, richTextEditorDefaultEmojiItems, richTextEditorDefaultSlashCommands, richTextEditorDefaultToolbarItems, type RichTextEditorBlockAction, type RichTextEditorEmojiName, type RichTextEditorMentionItem, type RichTextEditorSlashCommandName, type RichTextEditorSnapshot, type RichTextEditorToolbarItem, type RichTextEditorValue } from '../../../../packages/ui/src/complex/rich-text-editor.js';
import { RichTextEditorDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, choiceControl, textControl } from '../feature-controls.js';

const markdownValue = '# 工作区说明\n\n使用 **Graphite** 组件构建紧凑桌面工具。\n\n- 共享 token\n- 受控内容';
const htmlValue = '<h2>HTML 草稿</h2><p>内容经过 <strong>schema</strong> 解析。</p><blockquote><p>未知属性不会进入输出。</p></blockquote>';
const jsonValue = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'JSON 草稿' }] },
    { type: 'paragraph', content: [{ type: 'text', text: '这是规范文档树。' }] },
  ],
};
const teamMentions: readonly RichTextEditorMentionItem[] = [
  { id: 'reito', label: 'Reito', description: '设计系统维护者', keywords: ['owner', 'design'] },
  { id: 'lin', label: 'Lin', description: '组件工程', keywords: ['frontend', 'react'] },
  { id: 'graphite-bot', label: 'Graphite Bot', description: '自动检查', keywords: ['bot', 'audit'] },
  { id: 'archived', label: 'Archived User', description: '已停用', disabled: true },
];

const meta = {
  title: '复杂/RichTextEditor 富文本编辑',
  component: RichTextEditor,
  parameters: { docs: { description: { component: 'Tiptap schema 驱动的内容面，公开 JSON、HTML、Markdown 受控输入输出，并提供紧凑工具栏、任务列表、段落对齐、Emoji、斜杠命令、提及、链接编辑、格式状态和历史操作。' } } },
} satisfies Meta<typeof RichTextEditor>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  format: 'markdown' | 'html' | 'json';
  value: string;
  label: string;
  description: string;
  placeholder: string;
  readOnly: boolean;
  disabled: boolean;
  showOutput: boolean;
  showToolbar: boolean;
  toolbarPreset: 'full' | 'marks' | 'structure' | 'extensions' | 'history';
  emojiPreset: 'all' | 'status' | 'none';
  suggestions: boolean;
  mentionPreset: 'team' | 'empty';
  slashPreset: 'full' | 'writing' | 'none';
  blockControls: boolean;
  blockPreset: 'full' | 'move' | 'structure' | 'none';
  linkPlaceholder: string;
};

const toolbarPresets: Record<PlaygroundArgs['toolbarPreset'], readonly RichTextEditorToolbarItem[]> = {
  full: richTextEditorDefaultToolbarItems,
  marks: ['bold', 'italic', 'underline', 'strike', 'code', 'clear-format'],
  structure: ['paragraph', 'heading-1', 'heading-2', 'bullet-list', 'ordered-list', 'task-list', 'blockquote'],
  extensions: ['task-list', 'align-left', 'align-center', 'align-right', 'align-justify', 'emoji'],
  history: ['undo', 'redo'],
};

const emojiPresets: Record<PlaygroundArgs['emojiPreset'], readonly RichTextEditorEmojiName[]> = {
  all: richTextEditorDefaultEmojiItems,
  status: ['eyes', 'check', 'warning'],
  none: [],
};

const mentionPresets: Record<PlaygroundArgs['mentionPreset'], readonly RichTextEditorMentionItem[]> = {
  team: teamMentions,
  empty: [],
};

const slashPresets: Record<PlaygroundArgs['slashPreset'], readonly RichTextEditorSlashCommandName[]> = {
  full: richTextEditorDefaultSlashCommands,
  writing: ['paragraph', 'heading-1', 'heading-2', 'bullet-list', 'blockquote'],
  none: [],
};

const blockPresets: Record<PlaygroundArgs['blockPreset'], readonly RichTextEditorBlockAction[]> = {
  full: richTextEditorDefaultBlockActions,
  move: ['move-up', 'move-down'],
  structure: ['paragraph', 'heading-1', 'heading-2', 'bullet-list', 'ordered-list', 'task-list', 'blockquote', 'code-block'],
  none: [],
};

function parsePlaygroundValue(format: PlaygroundArgs['format'], value: string): RichTextEditorValue {
  if (format !== 'json') return value;
  try { return JSON.parse(value) as RichTextEditorValue; }
  catch { return value; }
}

function printable(value: RichTextEditorValue) {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { format: 'markdown', value: markdownValue, label: '可调内容', description: '直接调整格式、工具栏、块操作、扩展内容和交互状态。输入 / 或 @ 查看建议。', placeholder: '开始输入…', readOnly: false, disabled: false, showOutput: true, showToolbar: true, toolbarPreset: 'full', emojiPreset: 'all', suggestions: true, mentionPreset: 'team', slashPreset: 'full', blockControls: true, blockPreset: 'full', linkPlaceholder: 'https://example.com' },
  argTypes: {
    format: choiceControl(['markdown', 'html', 'json']),
    value: textControl,
    label: textControl,
    description: textControl,
    placeholder: textControl,
    readOnly: booleanControl,
    disabled: booleanControl,
    showOutput: booleanControl,
    showToolbar: booleanControl,
    toolbarPreset: choiceControl(['full', 'marks', 'structure', 'extensions', 'history']),
    emojiPreset: choiceControl(['all', 'status', 'none']),
    suggestions: booleanControl,
    mentionPreset: choiceControl(['team', 'empty']),
    slashPreset: choiceControl(['full', 'writing', 'none']),
    blockControls: booleanControl,
    blockPreset: choiceControl(['full', 'move', 'structure', 'none']),
    linkPlaceholder: textControl,
  },
  parameters: { controls: { include: ['format', 'value', 'label', 'description', 'placeholder', 'readOnly', 'disabled', 'showToolbar', 'toolbarPreset', 'emojiPreset', 'suggestions', 'mentionPreset', 'slashPreset', 'blockControls', 'blockPreset', 'linkPlaceholder', 'showOutput'] } },
  render: function Render(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <div className="grid gap-[var(--rui-content-gap)]"><RichTextEditor format={args.format} value={parsePlaygroundValue(args.format, args.value)} label={args.label} description={args.description} placeholder={args.placeholder} readOnly={args.readOnly} disabled={args.disabled} toolbar={args.showToolbar} toolbarItems={toolbarPresets[args.toolbarPreset]} emojiItems={emojiPresets[args.emojiPreset]} suggestions={args.suggestions} mentionItems={mentionPresets[args.mentionPreset]} slashCommands={slashPresets[args.slashPreset]} blockControls={args.blockControls} blockActions={blockPresets[args.blockPreset]} linkPlaceholder={args.linkPlaceholder} onValueChange={next => updateArgs({ value: printable(next) })} />{args.showOutput && <pre data-testid="playground-output" className="max-h-[var(--rui-preview-min-height)] overflow-auto rounded-md border border-border bg-muted p-[var(--rui-content-padding)] font-mono text-xs whitespace-pre-wrap">{args.value}</pre>}</div>;
  },
};

export const Default: Story = { name: '默认本地示例', render: () => <RichTextEditorDemo /> };

export const MarkdownControlled: Story = { name: 'Markdown 受控值', render: function Render() { const [value, setValue] = useState(markdownValue); return <RichTextEditor format="markdown" value={value} onValueChange={next => setValue(String(next))} label="Markdown 文档" />; } };
export const HtmlControlled: Story = { name: 'HTML 受控值', render: function Render() { const [value, setValue] = useState(htmlValue); return <RichTextEditor format="html" value={value} onValueChange={next => setValue(String(next))} label="HTML 文档" />; } };
export const JsonControlled: Story = { name: 'JSON 受控值', render: function Render() { const [value, setValue] = useState<RichTextEditorValue>(jsonValue); return <RichTextEditor format="json" value={value} onValueChange={setValue} label="JSON 文档" />; } };

function SnapshotExample() {
  const [value, setValue] = useState(markdownValue);
  const [state, setState] = useState<RichTextEditorSnapshot>();
  return <div className="grid gap-[var(--rui-content-gap)]"><RichTextEditor format="markdown" value={value} onValueChange={(next, snapshot) => { setValue(String(next)); setState(snapshot); }} label="多格式输出" /><dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-[var(--rui-content-gap)] gap-y-[var(--rui-space-1)] text-xs"><dt className="text-muted-foreground">Markdown</dt><dd data-testid="snapshot-markdown" className="truncate font-mono">{state?.markdown ?? '编辑后生成'}</dd><dt className="text-muted-foreground">HTML</dt><dd data-testid="snapshot-html" className="truncate font-mono">{state?.html ?? '编辑后生成'}</dd><dt className="text-muted-foreground">JSON</dt><dd data-testid="snapshot-json" className="truncate font-mono">{state ? JSON.stringify(state.json) : '编辑后生成'}</dd></dl></div>;
}
export const MultiFormatSnapshot: Story = { name: '同一模型多格式输出', render: () => <SnapshotExample /> };

export const MarksToolbar: Story = { name: '仅文本格式工具', args: { format: 'markdown', defaultValue: '选择文字后应用 **格式**。', label: '文本格式', toolbarItems: toolbarPresets.marks } };
export const StructureToolbar: Story = { name: '仅结构工具', args: { format: 'markdown', defaultValue: '把当前段落转换为标题、列表或引用。', label: '段落结构', toolbarItems: toolbarPresets.structure } };
export const ExtensionToolbar: Story = { name: '仅扩展工具', args: { format: 'markdown', defaultValue: '任务、对齐与 Emoji 共用同一文档模型。', label: '编辑扩展', toolbarItems: toolbarPresets.extensions } };
export const ToolbarHidden: Story = { name: '隐藏工具栏', args: { format: 'markdown', defaultValue: markdownValue, label: '沉浸编辑', toolbar: false } };

function BlockActionsExample() {
  const [value, setValue] = useState('# 发布说明\n\n第一段需要移动。\n\n第二段可以转换。\n\n最后一段用于检查边界。');
  const [state, setState] = useState<RichTextEditorSnapshot>();
  return <div className="grid gap-[var(--rui-content-gap)]"><RichTextEditor format="markdown" value={value} onValueChange={(next, snapshot) => { setValue(String(next)); setState(snapshot); }} label="受控块操作" description="悬停块左侧可拖拽或打开菜单；Alt+Shift+↑/↓ 可移动当前块。" toolbarItems={['block-actions', 'undo', 'redo']} /><dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-[var(--rui-content-gap)] gap-y-[var(--rui-space-1)] text-xs"><dt className="text-muted-foreground">Markdown</dt><dd data-testid="block-markdown" className="whitespace-pre-wrap font-mono">{state?.markdown ?? value}</dd><dt className="text-muted-foreground">HTML</dt><dd data-testid="block-html" className="truncate font-mono">{state?.html ?? '操作后同步'}</dd><dt className="text-muted-foreground">JSON</dt><dd data-testid="block-json" className="truncate font-mono">{state ? JSON.stringify(state.json) : '操作后同步'}</dd></dl></div>;
}
export const BlockActionsControlled: Story = { name: '块移动转换删除与恢复', render: () => <BlockActionsExample /> };
export const BlockActionsEmpty: Story = { name: '块操作空能力', args: { format: 'markdown', defaultValue: '宿主保留入口，但没有授予块操作。', label: '空块操作', toolbarItems: ['block-actions'], blockActions: [] } };
export const BlockSingle: Story = { name: '唯一块删除与恢复', render: function Render() { const [value, setValue] = useState('唯一内容块'); return <div className="grid gap-[var(--rui-content-gap)]"><RichTextEditor format="markdown" value={value} onValueChange={next => setValue(String(next))} label="唯一块" toolbarItems={['block-actions', 'undo', 'redo']} /><output data-testid="single-block-output" className="font-mono text-xs text-muted-foreground">{value || '空文档'}</output></div>; } };
export const BlockControlsOff: Story = { name: '关闭块控制', args: { format: 'markdown', defaultValue: '内容不显示块句柄和块操作入口。', label: '纯编辑面', blockControls: false } };
export const BlockReadOnly: Story = { name: '只读块内容', args: { format: 'markdown', defaultValue: '# 只读内容\n\n块句柄与写操作均隐藏。', label: '只读块', readOnly: true } };
export const BlockNarrow: Story = { name: '窄面板块操作', render: () => <div className="max-w-[var(--rui-container-3xs)]"><RichTextEditor format="markdown" defaultValue={'# 窄面板\n\n悬停此段检查句柄。\n\n末段保持在组件内。'} label="窄面板块" toolbarItems={['block-actions', 'undo', 'redo']} /></div> };

export const SlashCommands: Story = {
  name: '斜杠命令',
  args: { format: 'markdown', defaultValue: '', label: '命令编辑', description: '在空段落行首输入 /，筛选后使用方向键与 Enter 插入结构。', mentionItems: teamMentions },
};

function MentionSerializationExample() {
  const [value, setValue] = useState<RichTextEditorValue>({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '分配给 ' }] }] });
  const [state, setState] = useState<RichTextEditorSnapshot>();
  return <div className="grid gap-[var(--rui-content-gap)]"><RichTextEditor format="json" value={value} onValueChange={(next, snapshot) => { setValue(next); setState(snapshot); }} label="本地提及" description="输入 @ 后选择本地成员；禁用成员不会被选中。" mentionItems={teamMentions} /><section aria-label="提及序列化结果"><dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-[var(--rui-content-gap)] gap-y-[var(--rui-space-1)] text-xs"><dt className="text-muted-foreground">JSON</dt><dd data-testid="mention-json" className="truncate font-mono">{state ? JSON.stringify(state.json) : '插入后显示 mention 节点'}</dd><dt className="text-muted-foreground">HTML</dt><dd data-testid="mention-html" className="truncate font-mono">{state?.html ?? '插入后显示 data-type=mention'}</dd><dt className="text-muted-foreground">Markdown</dt><dd data-testid="mention-markdown" className="truncate font-mono">{state?.markdown ?? '插入后显示提及扩展语法'}</dd></dl></section></div>;
}
export const MentionLocal: Story = { name: '本地提及与序列化', render: () => <MentionSerializationExample /> };

function loadTeamMentions(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<readonly RichTextEditorMentionItem[]>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      const normalized = query.toLocaleLowerCase();
      resolve(teamMentions.filter(item => [item.id, item.label, ...(item.keywords ?? [])].some(value => value.toLocaleLowerCase().includes(normalized))));
    }, 180);
    signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('请求已取消', 'AbortError')); }, { once: true });
  });
}
export const MentionAsync: Story = { name: '异步提及与加载态', args: { format: 'markdown', defaultValue: '', label: '异步成员', description: '输入 @ 后由本地延时 Provider 返回结果；新查询会取消旧请求。', loadMentionItems: loadTeamMentions } };
export const MentionEmpty: Story = { name: '提及空结果', args: { format: 'markdown', defaultValue: '', label: '空成员集合', mentionItems: [] } };
export const SuggestionsOff: Story = { name: '关闭建议能力', args: { format: 'markdown', defaultValue: '', label: '普通编辑', suggestions: false, mentionItems: teamMentions } };
export const SuggestionNarrow: Story = { name: '窄面板建议菜单', render: () => <div className="max-w-[var(--rui-container-3xs)]"><RichTextEditor format="markdown" defaultValue="" label="窄面板命令" mentionItems={teamMentions} /></div> };

function TaskListExample() {
  const [value, setValue] = useState('- [ ] 检查紧凑间距\n  - [x] 确认嵌套任务\n- [x] 记录验收结果');
  return <div className="grid gap-[var(--rui-content-gap)]"><RichTextEditor format="markdown" value={value} onValueChange={next => setValue(String(next))} label="Markdown 任务列表" toolbarItems={['task-list', 'undo', 'redo']} /><output data-testid="task-list-output" className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">{value}</output></div>;
}
export const TaskListMarkdown: Story = { name: '任务列表与 Markdown', render: () => <TaskListExample /> };

function AlignmentExample() {
  const [value, setValue] = useState('<p>选中段落并更改对齐方式。</p>');
  const [state, setState] = useState<RichTextEditorSnapshot>();
  return <div className="grid gap-[var(--rui-content-gap)]"><RichTextEditor format="html" value={value} onValueChange={(next, snapshot) => { setValue(String(next)); setState(snapshot); }} label="HTML 段落对齐" toolbarItems={['align-left', 'align-center', 'align-right', 'align-justify', 'undo', 'redo']} /><dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-[var(--rui-content-gap)] gap-y-[var(--rui-space-1)] text-xs"><dt className="text-muted-foreground">HTML</dt><dd data-testid="alignment-html" className="truncate font-mono">{state?.html ?? value}</dd><dt className="text-muted-foreground">Markdown</dt><dd data-testid="alignment-markdown" className="truncate font-mono">{state?.markdown ?? '对齐属性不进入 Markdown'}</dd><dt className="text-muted-foreground">JSON</dt><dd data-testid="alignment-json" className="truncate font-mono">{state ? JSON.stringify(state.json) : '操作后显示 textAlign'}</dd></dl></div>;
}
export const AlignmentSerialization: Story = { name: '对齐序列化边界', render: () => <AlignmentExample /> };

function EmojiExample() {
  const [value, setValue] = useState('发布状态：');
  const [state, setState] = useState<RichTextEditorSnapshot>();
  return <div className="grid gap-[var(--rui-content-gap)]"><RichTextEditor format="markdown" value={value} onValueChange={(next, snapshot) => { setValue(String(next)); setState(snapshot); }} label="Emoji 节点" toolbarItems={['emoji', 'undo', 'redo']} /><dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-[var(--rui-content-gap)] gap-y-[var(--rui-space-1)] text-xs"><dt className="text-muted-foreground">Markdown</dt><dd data-testid="emoji-markdown" className="truncate font-mono">{state?.markdown ?? value}</dd><dt className="text-muted-foreground">HTML</dt><dd data-testid="emoji-html" className="truncate font-mono">{state?.html ?? '插入后显示 data-type=emoji'}</dd><dt className="text-muted-foreground">JSON</dt><dd data-testid="emoji-json" className="truncate font-mono">{state ? JSON.stringify(state.json) : '插入后显示 emoji 节点'}</dd></dl></div>;
}
export const EmojiSerialization: Story = { name: 'Emoji 插入与序列化', render: () => <EmojiExample /> };
export const EmojiEmptyPicker: Story = { name: 'Emoji 空选项', args: { format: 'markdown', defaultValue: '宿主已隐藏全部 Emoji 选项。', label: 'Emoji 空选择器', toolbarItems: ['emoji'], emojiItems: [] } };

export const TaskListReadOnly: Story = { name: '只读任务列表', args: { format: 'markdown', defaultValue: '- [ ] 只读任务\n- [x] 已完成任务', label: '只读检查项', readOnly: true, toolbarItems: toolbarPresets.extensions } };

function HistoryExample() {
  const [value, setValue] = useState('历史起点');
  return <div className="grid gap-[var(--rui-content-gap)]"><RichTextEditor format="markdown" value={value} onValueChange={next => setValue(String(next))} label="撤销重做" toolbarItems={toolbarPresets.history} /><output data-testid="history-output" className="text-xs text-muted-foreground">{value}</output></div>;
}
export const HistoryControls: Story = { name: '撤销与重做', render: () => <HistoryExample /> };

function LinkExample() {
  const [value, setValue] = useState('选择这段文字并设置链接。');
  return <div className="grid gap-[var(--rui-content-gap)]"><RichTextEditor format="html" value={value} onValueChange={next => setValue(String(next))} label="链接与选区" toolbarItems={['link', 'unlink', 'undo', 'redo']} /><output data-testid="link-output" className="break-all font-mono text-xs text-muted-foreground">{value}</output></div>;
}
export const LinkSelection: Story = { name: '链接与选区保留', render: () => <LinkExample /> };

function FormatStateExample() {
  const [value, setValue] = useState('<p><strong>粗体</strong> 与普通文本</p>');
  return <RichTextEditor format="html" value={value} onValueChange={next => setValue(String(next))} label="格式状态" toolbarItems={['bold', 'italic', 'underline', 'strike', 'code']} />;
}
export const ActiveFormatState: Story = { name: '当前格式状态', render: () => <FormatStateExample /> };

function ExternalReplacementExample() {
  const [value, setValue] = useState(markdownValue);
  return <div className="grid gap-[var(--rui-content-gap)]"><div className="flex flex-wrap gap-[var(--rui-space-1)]"><Button size="xs" variant="outline" onClick={() => setValue('## 宿主替换\n\n外部状态已成为新的受控文档。')}>替换文档</Button><Button size="xs" variant="outline" onClick={() => setValue('')}>清空文档</Button></div><RichTextEditor format="markdown" value={value} onValueChange={next => setValue(String(next))} label="外部受控文档" /></div>;
}
export const ExternalReplacement: Story = { name: '宿主替换与清空', render: () => <ExternalReplacementExample /> };

export const RoundTripNormalization: Story = { name: 'Markdown 往返规范化', args: { format: 'markdown', defaultValue: '# 标题\n\n-   不规则缩进\n- 第二项\n\n<div>内嵌 HTML 会按已安装 schema 处理</div>', label: '规范化示例', description: '编辑后的输出会规范缩进与空行；未被 schema 支持的结构可能丢失。' } };
export const FilteredHtml: Story = { name: 'HTML schema 过滤', args: { format: 'html', defaultValue: '<h2 data-private="secret">安全边界</h2><p onclick="alert(1)">事件属性不会进入规范输出。</p><script>window.bad = true</script>', label: 'HTML 过滤示例', description: '仅保留已安装扩展理解的节点与属性；宿主自定义扩展仍需自行评审输入。' } };
export const Empty: Story = { name: '空内容与占位', args: { format: 'markdown', defaultValue: '', label: '空文档', placeholder: '记录当前工作区决策…' } };
export const ReadOnly: Story = { name: '只读内容', args: { format: 'markdown', defaultValue: markdownValue, label: '只读文档', readOnly: true } };
export const Disabled: Story = { name: '禁用内容', args: { format: 'markdown', defaultValue: markdownValue, label: '禁用文档', disabled: true } };
export const HostError: Story = { name: '宿主错误', args: { format: 'markdown', defaultValue: markdownValue, label: '保存失败文档', error: '宿主未能保存草稿；当前内容仍保留在编辑器。' } };
export const InvalidJson: Story = { name: '无效 JSON 文档', args: { format: 'json', value: { type: 'doc', content: [{ type: 'unknown-node' }] }, label: '无效 JSON', onContentError: () => undefined } };

export const LongDocument: Story = { name: '长文档', args: { format: 'markdown', defaultValue: Array.from({ length: 18 }, (_, index) => `## 第 ${index + 1} 节\n\n本地内容用于检查文档自然增高与段落间距。`).join('\n\n'), label: '长文档' } };
export const Narrow: Story = { name: '窄工作面', render: () => <div className="max-w-[var(--rui-container-3xs)]"><RichTextEditor format="markdown" defaultValue={'# 窄面板\n\n包含很长且不会撑开页面的文本：workspace/components/rich-text-editor/content-model/serialized-output'} label="窄面板文档" /></div> };

export const ImeInput: Story = {
  name: '中文输入法与真实文档更新',
  render: function Render() { const [value, setValue] = useState(''); return <div className="grid gap-[var(--rui-content-gap)]"><RichTextEditor format="markdown" value={value} onValueChange={next => setValue(String(next))} label="中文草稿" /><output data-testid="ime-output" className="text-xs text-muted-foreground">{value || '空'}</output></div>; },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = await canvas.findByRole('textbox', { name: '中文草稿' });
    await userEvent.type(editor, '统一组件');
    await expect(canvas.getByTestId('ime-output')).toHaveTextContent('统一组件');
  },
};
