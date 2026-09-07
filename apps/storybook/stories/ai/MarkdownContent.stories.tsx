import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarkdownContent, RichMessage, type MarkdownContentProps } from '../../../../packages/ui/src/ai/markdown-content.js';
import { Conversation } from '../../../../packages/ui/src/ai/conversation.js';
import { booleanControl, choiceControl, recipeControl, textControl } from '../feature-controls.js';
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

const meta = {
  title: 'AI/MarkdownContent / RichMessage',
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
  emptyText: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { value: fullDocument, htmlPolicy: 'escape', externalLinkTarget: '_blank', codeCopyable: true, asMessage: false, from: 'assistant', streaming: false, emptyText: '没有可显示的 Markdown 内容' },
  argTypes: {
    value: textControl,
    htmlPolicy: choiceControl(['escape', 'remove']),
    externalLinkTarget: choiceControl(['_blank', '_self']),
    codeCopyable: booleanControl,
    asMessage: recipeControl(booleanControl, '在同一 Canvas 中切换 MarkdownContent 与 RichMessage 组合。'),
    from: recipeControl(choiceControl(['user', 'assistant', 'system']), '仅在 RichMessage 组合中使用。'),
    streaming: recipeControl(booleanControl, '仅在 RichMessage 组合中使用。'),
    emptyText: recipeControl(textControl, '转换为 empty ReactNode 的本地示例文案。'),
  },
  parameters: { controls: { include: ['value', 'htmlPolicy', 'externalLinkTarget', 'codeCopyable', 'asMessage', 'from', 'streaming', 'emptyText'] } },
  render: args => args.asMessage
    ? <Conversation className="min-h-[var(--rui-preview-min-height)] rounded-lg border"><RichMessage from={args.from} content={args.value} streaming={args.streaming} local markdownProps={{ htmlPolicy: args.htmlPolicy, externalLinkTarget: args.externalLinkTarget, codeCopyable: args.codeCopyable, empty: <p className="text-muted-foreground">{args.emptyText}</p> }} /></Conversation>
    : <MarkdownContent value={args.value} htmlPolicy={args.htmlPolicy} externalLinkTarget={args.externalLinkTarget} codeCopyable={args.codeCopyable} empty={<p className="text-muted-foreground">{args.emptyText}</p>} />,
};

export const Default: Story = { name: '完整 GFM 文档', args: { value: fullDocument } };
export const RichAssistantMessage: Story = { name: '富文本助手消息', render: () => <Conversation className="min-h-[var(--rui-preview-min-height)] rounded-lg border"><RichMessage from="assistant" content={fullDocument} local /></Conversation> };
export const RichUserMessage: Story = { name: '富文本用户消息', render: () => <Conversation className="min-h-[var(--rui-preview-min-height)] rounded-lg border"><RichMessage from="user" content={'请检查 **Markdown** 和 `CodeBlock` 的组合。'} local /></Conversation> };
export const Table: Story = { name: 'GFM 表格', args: { value: '| 项目 | 负责人 | 状态 |\n| --- | --- | --- |\n| Token | Reito | 完成 |\n| Markdown | Lin | 检查中 |' } };
export const TaskList: Story = { name: 'GFM 任务列表', args: { value: '- [x] 解析结构\n- [ ] 连接宿主数据' } };
export const FencedCode: Story = { name: '高亮代码与原文复制', args: { value: '```typescript\nexport const density = "compact";\n```' } };
export const InlineCode: Story = { name: '行内代码', args: { value: '设置 `data-density="compact"` 后重新渲染。' } };
export const Links: Story = { name: '外部与相对链接', args: { value: '[外部文档](https://ui.nuxt.com/) · [项目文档](/docs/design-language)' } };
export const HtmlEscaped: Story = { name: '原始 HTML 转义', args: { value: '前文 <strong data-demo="raw">HTML 不执行</strong> 后文', htmlPolicy: 'escape' } };
export const HtmlRemoved: Story = { name: '原始 HTML 标签移除', args: { value: '前文 <strong data-demo="raw">HTML 不执行</strong> 后文', htmlPolicy: 'remove' } };
export const UnsafeUrl: Story = { name: '危险 URL 过滤', args: { value: '[不安全链接](javascript:alert(1))\n\n![不安全图片](javascript:alert(2))' } };
export const FilteredElements: Story = { name: '元素白名单与解包', args: { value: '# 标题\n\n保留 **强调** 和 [链接文字](https://example.com)。', allowedElements: ['h1', 'p', 'strong'], unwrapDisallowed: true } };
export const CustomRenderers: Story = {
  name: '自定义节点与代码块',
  render: () => <MarkdownContent
    value={'> 由宿主替换引用节点。\n\n```txt\ncustom renderer\n```'}
    components={{ blockquote: ({ node: _node, ...props }) => <aside data-testid="custom-quote" aria-label="自定义引用" {...props} /> }}
    renderCodeBlock={({ code, language }) => <section data-testid="custom-code" aria-label={`${language}自定义代码块`} className="my-[var(--rui-space-3)] rounded-md border border-border bg-muted p-[var(--rui-content-padding)]"><code className="font-mono text-xs">{code}</code></section>}
  />,
};
export const Empty: Story = { name: '空内容', args: { value: '  ', empty: <p className="text-sm text-muted-foreground">没有可显示的 Markdown 内容</p> } };
export const LongDocument: Story = { name: '长文档', args: { value: Array.from({ length: 18 }, (_, index) => `## 章节 ${index + 1}\n\n这是用于检查长内容排版与自然流动的本地段落。`).join('\n\n') } };
export const Narrow: Story = { name: '窄工作面', render: () => <div className="max-w-[var(--rui-container-3xs)]"><MarkdownContent value={'## 窄面板\n\n超长路径：`workspace/packages/ui/src/ai/markdown-content.tsx`\n\n| 能力 | 状态 |\n| --- | --- |\n| 横向内容 | 仅表格容器滚动 |\n\n```powershell\nnpm run check --workspace @reito/ui\n```'} /></div> };
