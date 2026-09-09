import { useEffect, useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarkdownContent, RichMessage, type MarkdownContentProps } from '../../../../packages/ui/src/ai/markdown-content.js';
import { Conversation } from '../../../../packages/ui/src/ai/conversation.js';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { booleanControl, choiceControl, rangeControl, recipeControl, textControl } from '../feature-controls.js';
import { StoryFrame } from './story-frame.js';

const fullDocument = [
  '# Reito UI 验收',
  '',
  '这是一段包含 **加粗**、*强调*、~~已移除~~ 和 [官方文档](https://ui.nuxt.com/docs/components/) 的本地 Markdown 示例。',
  '',
  '> 消息正文保持自然流动，辅助内容按需展开。',
  '',
  '1. 检查语义结构',
  '2. 检查宽度和复制',
  '',
  '- [x] 表格与任务列表',
  '- [ ] 由宿主接入真实数据',
  '',
  '| 能力 | 状态 | 边界 |',
  '| --- | --- | --- |',
  '| GFM | 已开启 | 本地渲染 |',
  '| HTML | 默认转义 | 不执行 |',
  '',
  '行内代码 `density="compact"` 与 fenced code 共存：',
  '',
  '```ts',
  'export const workspace = {',
  '  density: "compact",',
  '};',
  '```',
].join('\n');

const streamDocument = [
  '## 流式检查',
  '',
  '正在生成 **紧凑工作面**，链接在地址完整前保持为文字：[设计规范](https://example.com/design)。',
  '',
  '| 阶段 | 状态 |',
  '| --- | --- |',
  '| 解析 | 完成 |',
  '| 视觉 | 检查中 |',
  '',
  '```ts',
  'export const stream = {',
  '  appendOnly: true,',
  '};',
  '```',
].join('\n');

interface StreamingHarnessProps {
  source: string;
  chunkSize: number;
  intervalMs: number;
  autoStart: boolean;
  asMessage: boolean;
  completeIncompleteMarkdown: boolean;
}

function StreamingHarness({ source, chunkSize, intervalMs, autoStart, asMessage, completeIncompleteMarkdown }: StreamingHarnessProps) {
  const firstChunk = Math.min(source.length, Math.max(1, chunkSize));
  const [length, setLength] = useState(firstChunk);
  const [playing, setPlaying] = useState(autoStart);
  const partial = source.slice(0, length);
  const active = length < source.length;

  useEffect(() => { setLength(firstChunk); setPlaying(autoStart); }, [autoStart, firstChunk, source]);
  useEffect(() => {
    if (!playing || !active) return;
    const timer = window.setTimeout(() => setLength(current => Math.min(source.length, current + Math.max(1, chunkSize))), intervalMs);
    return () => window.clearTimeout(timer);
  }, [active, chunkSize, intervalMs, length, playing, source.length]);
  useEffect(() => { if (!active) setPlaying(false); }, [active]);

  const markdownProps = { completeIncompleteMarkdown, streamKey: 'storybook-stream' } as const;
  return <div className="grid min-w-0 gap-[var(--rui-content-gap)]" data-testid="streaming-harness">
    <div className="flex flex-wrap items-center gap-[var(--rui-content-gap-sm)]">
      <Button type="button" size="sm" variant="outline" onClick={() => setPlaying(value => !value)} disabled={!active}>{playing ? '暂停流式示例' : '播放流式示例'}</Button>
      <Button type="button" size="sm" variant="outline" onClick={() => setLength(current => Math.min(source.length, current + Math.max(1, chunkSize)))} disabled={!active}>追加一块</Button>
      <Button type="button" size="sm" variant="outline" onClick={() => { setLength(source.length); setPlaying(false); }}>完成流式示例</Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => { setLength(firstChunk); setPlaying(false); }}>重新开始流式示例</Button>
      <span role="status" className="text-xs text-muted-foreground">{length} / {source.length} 字符 · {active ? '追加中' : '已完成'}</span>
    </div>
    {asMessage
      ? <Conversation className="min-h-[var(--rui-preview-min-height)] rounded-lg border"><RichMessage from="assistant" content={partial || ' '} streaming={active} local markdownProps={markdownProps} /></Conversation>
      : <MarkdownContent value={partial || ' '} streaming={active} {...markdownProps} />}
  </div>;
}

const meta = { id: "ai-markdowncontent-richmessage",
  title: "AI/MarkdownContent 富文本内容",
  component: MarkdownContent,
  args: { value: '' },
  decorators: [Story => <StoryFrame><Story /></StoryFrame>],
  parameters: { docs: { description: { component: 'CommonMark/GFM 文档渲染面，复用 CodeBlock 显示 fenced code，并与 Message 组合为 RichMessage。默认不执行原始 HTML，危险 URL 不会进入 href/src。' } } },
} satisfies Meta<typeof MarkdownContent>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = Pick<MarkdownContentProps, 'value' | 'htmlPolicy' | 'externalLinkTarget' | 'codeCopyable'> & {
  asMessage: boolean;
  from: ComponentProps<typeof RichMessage>['from'];
  streaming: boolean;
  completeIncompleteMarkdown: boolean;
  emptyText: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { value: fullDocument, htmlPolicy: 'escape', externalLinkTarget: '_blank', codeCopyable: true, asMessage: false, from: 'assistant', streaming: false, completeIncompleteMarkdown: true, emptyText: '没有可显示的 Markdown 内容' },
  argTypes: {
    value: textControl,
    htmlPolicy: choiceControl(['escape', 'remove']),
    externalLinkTarget: choiceControl(['_blank', '_self']),
    codeCopyable: booleanControl,
    asMessage: recipeControl(booleanControl, '在同一 Canvas 中切换 MarkdownContent 与 RichMessage 组合。'),
    from: recipeControl(choiceControl(['user', 'assistant', 'system']), '仅在 RichMessage 组合中使用。'),
    streaming: booleanControl,
    completeIncompleteMarkdown: booleanControl,
    emptyText: recipeControl(textControl, '转换为 empty ReactNode 的本地示例文案。'),
  },
  parameters: { controls: { include: ['value', 'htmlPolicy', 'externalLinkTarget', 'codeCopyable', 'streaming', 'completeIncompleteMarkdown', 'asMessage', 'from', 'emptyText'] } },
  render: args => args.asMessage
    ? <Conversation className="min-h-[var(--rui-preview-min-height)] rounded-lg border"><RichMessage from={args.from} content={args.value} streaming={args.streaming} local markdownProps={{ htmlPolicy: args.htmlPolicy, externalLinkTarget: args.externalLinkTarget, codeCopyable: args.codeCopyable, completeIncompleteMarkdown: args.completeIncompleteMarkdown, empty: <p className="text-muted-foreground">{args.emptyText}</p> }} /></Conversation>
    : <MarkdownContent value={args.value} streaming={args.streaming} completeIncompleteMarkdown={args.completeIncompleteMarkdown} htmlPolicy={args.htmlPolicy} externalLinkTarget={args.externalLinkTarget} codeCopyable={args.codeCopyable} empty={<p className="text-muted-foreground">{args.emptyText}</p>} />,
};

type StreamingPlaygroundArgs = StreamingHarnessProps;
export const StreamingPlayground: StoryObj<StreamingPlaygroundArgs> = {
  name: "流式参数调试",
  args: { source: streamDocument, chunkSize: 24, intervalMs: 80, autoStart: false, asMessage: true, completeIncompleteMarkdown: true },
  argTypes: {
    source: textControl,
    chunkSize: rangeControl(1, 64),
    intervalMs: rangeControl(20, 500, 20),
    autoStart: booleanControl,
    asMessage: booleanControl,
    completeIncompleteMarkdown: booleanControl,
  },
  parameters: { controls: { include: ['source', 'chunkSize', 'intervalMs', 'autoStart', 'asMessage', 'completeIncompleteMarkdown'] } },
  render: args => <StreamingHarness {...args} />,
};

export const IncompleteInline: Story = { name: "未闭合行内语法", args: { value: '正在生成 **尚未闭合的强调', streaming: true } };
export const IncompleteLink: Story = { name: "未闭合链接", args: { value: '打开 [设计规范](https://example.com/des', streaming: true } };
export const IncompleteFence: Story = { name: "未闭合 fenced code", args: { value: '```typescript\nexport const chunk = "保持原文";', streaming: true } };
export const CompletionDisabled: Story = { name: "关闭未闭合语法补全", args: { value: '正在生成 **保持原始标记', streaming: true, completeIncompleteMarkdown: false } };

const tableStages = [
  '## 已稳定标题\n\n| 阶段 | 状态 |',
  '## 已稳定标题\n\n| 阶段 | 状态 |\n| --- | --- |',
  '## 已稳定标题\n\n| 阶段 | 状态 |\n| --- | --- |\n| 解析 | 完成 |',
];
function StreamingTableStages() {
  const [stage, setStage] = useState(0);
  return <div className="grid gap-[var(--rui-content-gap)]">
    <div className="flex items-center gap-[var(--rui-content-gap-sm)]"><Button size="sm" variant="outline" disabled={stage === tableStages.length - 1} onClick={() => setStage(value => Math.min(tableStages.length - 1, value + 1))}>下一表格阶段</Button><Button size="sm" variant="ghost" onClick={() => setStage(0)}>重置表格阶段</Button><span role="status" className="text-xs text-muted-foreground">阶段 {stage + 1} / {tableStages.length}</span></div>
    <MarkdownContent value={tableStages[stage]} streaming={stage < tableStages.length - 1} streamKey="table-stream" />
  </div>;
}
export const StreamingTable: Story = { name: "表格增量变形", render: () => <StreamingTableStages /> };

function StreamReplacement() {
  const [generation, setGeneration] = useState<'first' | 'second'>('first');
  const value = generation === 'first' ? '## 第一段流\n\n正在生成 **旧内容' : '## 第二段流\n\n正在生成 `新内容';
  return <div className="grid gap-[var(--rui-content-gap)]"><Button size="sm" variant="outline" className="justify-self-start" onClick={() => setGeneration(current => current === 'first' ? 'second' : 'first')}>替换流标识</Button><MarkdownContent value={value} streaming streamKey={generation} /></div>;
}
export const StreamReplacementKey: Story = { name: "新流节点替换", render: () => <StreamReplacement /> };

export const StreamingRichMessage: Story = { name: "流式富文本消息", render: () => <Conversation className="min-h-[var(--rui-preview-min-height)] rounded-lg border"><RichMessage from="assistant" content={'正在整理 **消息正文与代码**\n\n```ts\nconst stable = true;'} streaming local /></Conversation> };

export const Default: Story = { name: "完整 GFM 文档", args: { value: fullDocument } };
export const RichAssistantMessage: Story = { name: "富文本助手消息", render: () => <Conversation className="min-h-[var(--rui-preview-min-height)] rounded-lg border"><RichMessage from="assistant" content={fullDocument} local /></Conversation> };
export const RichUserMessage: Story = { name: "富文本用户消息", render: () => <Conversation className="min-h-[var(--rui-preview-min-height)] rounded-lg border"><RichMessage from="user" content={'请检查 **Markdown** 和 `CodeBlock` 的组合。'} local /></Conversation> };
export const Table: Story = { name: "GFM 表格", args: { value: '| 项目 | 负责人 | 状态 |\n| --- | --- | --- |\n| Token | Reito | 完成 |\n| Markdown | Lin | 检查中 |' } };
export const TaskList: Story = { name: "GFM 任务列表", args: { value: '- [x] 解析结构\n- [ ] 连接宿主数据' } };
export const FencedCode: Story = { name: "高亮代码与原文复制", args: { value: '```typescript\nexport const density = "compact";\n```' } };
export const InlineCode: Story = { name: "行内代码", args: { value: '设置 `data-density="compact"` 后重新渲染。' } };
export const Links: Story = { name: "外部与相对链接", args: { value: '[外部文档](https://ui.nuxt.com/) · [项目文档](/docs/design-language)' } };
export const HtmlEscaped: Story = { name: "原始 HTML 转义", args: { value: '前文 <strong data-demo="raw">HTML 不执行</strong> 后文', htmlPolicy: 'escape' } };
export const HtmlRemoved: Story = { name: "原始 HTML 标签移除", args: { value: '前文 <strong data-demo="raw">HTML 不执行</strong> 后文', htmlPolicy: 'remove' } };
export const UnsafeUrl: Story = { name: "危险 URL 过滤", args: { value: '[不安全链接](javascript:alert(1))\n\n![不安全图片](javascript:alert(2))' } };
export const FilteredElements: Story = { name: "元素白名单与解包", args: { value: '# 标题\n\n保留 **强调** 和 [链接文字](https://example.com)。', allowedElements: ['h1', 'p', 'strong'], unwrapDisallowed: true } };
export const CustomRenderers: Story = {
  name: "自定义节点与代码块",
  render: () => <MarkdownContent
    value={'> 由宿主替换引用节点。\n\n```txt\ncustom renderer\n```'}
    components={{ blockquote: ({ node: _node, ...props }) => <aside data-testid="custom-quote" aria-label="自定义引用" {...props} /> }}
    renderCodeBlock={({ code, language }) => <section data-testid="custom-code" aria-label={`${language}自定义代码块`} className="my-[var(--rui-space-3)] rounded-md border border-border bg-muted p-[var(--rui-content-padding)]"><code className="font-mono text-xs">{code}</code></section>}
  />,
};
export const Empty: Story = { name: "状态 · 空内容", args: { value: '  ', empty: <p className="text-sm text-muted-foreground">没有可显示的 Markdown 内容</p> } };
export const LongDocument: Story = { name: "长文档", args: { value: Array.from({ length: 18 }, (_, index) => `## 章节 ${index + 1}\n\n这是用于检查长内容排版与自然流动的本地段落。`).join('\n\n') } };
export const Narrow: Story = { name: "窄工作面", render: () => <div className="max-w-[var(--rui-container-3xs)]"><MarkdownContent value={'## 窄面板\n\n超长路径：`workspace/packages/ui/src/ai/markdown-content.tsx`\n\n| 能力 | 状态 |\n| --- | --- |\n| 横向内容 | 仅表格容器滚动 |\n\n```powershell\nnpm run check --workspace @reito/ui\n```'} /></div> };
