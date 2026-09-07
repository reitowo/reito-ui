import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { RichTextEditor, type RichTextEditorSnapshot, type RichTextEditorValue } from '../../../../packages/ui/src/complex/rich-text-editor.js';
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

const meta = {
  title: '复杂/RichTextEditor 富文本编辑',
  component: RichTextEditor,
  parameters: { docs: { description: { component: 'Tiptap schema 驱动的基础内容面，公开 JSON、HTML、Markdown 受控输入输出及规范化边界；工具栏和高级扩展由后续能力项提供。' } } },
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
  args: { format: 'markdown', value: markdownValue, label: '可调内容', description: '直接调整格式、内容和交互状态。', placeholder: '开始输入…', readOnly: false, disabled: false, showOutput: true },
  argTypes: {
    format: choiceControl(['markdown', 'html', 'json']),
    value: textControl,
    label: textControl,
    description: textControl,
    placeholder: textControl,
    readOnly: booleanControl,
    disabled: booleanControl,
    showOutput: booleanControl,
  },
  parameters: { controls: { include: ['format', 'value', 'label', 'description', 'placeholder', 'readOnly', 'disabled', 'showOutput'] } },
  render: function Render(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <div className="grid gap-[var(--rui-content-gap)]"><RichTextEditor {...args} value={parsePlaygroundValue(args.format, args.value)} onValueChange={next => updateArgs({ value: printable(next) })} />{args.showOutput && <pre data-testid="playground-output" className="max-h-[var(--rui-preview-min-height)] overflow-auto rounded-md border border-border bg-muted p-[var(--rui-content-padding)] font-mono text-xs whitespace-pre-wrap">{args.value}</pre>}</div>;
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
