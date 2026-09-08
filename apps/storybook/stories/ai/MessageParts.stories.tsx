import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { MessageParts, StructuredMessage, type MessagePart, type MessagePartStatus } from '../../../../packages/ui/src/ai/message-parts.js';
import { demoMessageParts, MessagePartsDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { booleanControl, choiceControl, recipeControl, textControl } from '../feature-controls.js';
import { StoryFrame } from './story-frame.js';

const meta = {
  title: 'AI/MessageParts',
  component: MessageParts,
  args: { parts: demoMessageParts },
  decorators: [Story => <StoryFrame><Story /></StoryFrame>],
  parameters: { docs: { description: { component: '把宿主消息 parts 映射到现有文本、工具、来源、附件和产物组件。part id 与状态由宿主持有；组件不绑定请求服务或模型 SDK。' } } },
} satisfies Meta<typeof MessageParts>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  text: string;
  textFormat: 'plain' | 'markdown';
  textStatus: MessagePartStatus;
  from: 'user' | 'assistant' | 'system';
  includeTool: boolean;
  toolStatus: MessagePartStatus;
  toolOpen: boolean;
  includeSources: boolean;
  includeAttachments: boolean;
  includeArtifact: boolean;
  artifactView: 'preview' | 'code';
  includeUnknown: boolean;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: {
    text: '已读取 **Graphite** 规范，当前内容由本地 Story 提供。',
    textFormat: 'markdown',
    textStatus: 'complete',
    from: 'assistant',
    includeTool: true,
    toolStatus: 'complete',
    toolOpen: false,
    includeSources: true,
    includeAttachments: true,
    includeArtifact: false,
    artifactView: 'preview',
    includeUnknown: false,
  },
  argTypes: {
    text: recipeControl(textControl, 'TextMessagePart.text'),
    textFormat: recipeControl(choiceControl(['plain', 'markdown']), 'TextMessagePart.format'),
    textStatus: recipeControl(choiceControl(['pending', 'streaming', 'complete', 'error']), 'TextMessagePart.status'),
    from: recipeControl(choiceControl(['user', 'assistant', 'system']), 'StructuredMessage.from'),
    includeTool: recipeControl(booleanControl, '组合示例：加入 ToolMessagePart。'),
    toolStatus: recipeControl(choiceControl(['pending', 'streaming', 'complete', 'error']), 'ToolMessagePart.status'),
    toolOpen: recipeControl(booleanControl, 'ToolMessagePart.open'),
    includeSources: recipeControl(booleanControl, '组合示例：加入 SourceMessagePart。'),
    includeAttachments: recipeControl(booleanControl, '组合示例：加入 AttachmentMessagePart。'),
    includeArtifact: recipeControl(booleanControl, '组合示例：加入 ArtifactMessagePart。'),
    artifactView: recipeControl(choiceControl(['preview', 'code']), 'ArtifactMessagePart.view'),
    includeUnknown: recipeControl(booleanControl, '组合示例：检查未知 part 的降级显示。'),
  },
  parameters: { controls: { include: ['text', 'textFormat', 'textStatus', 'from', 'includeTool', 'toolStatus', 'toolOpen', 'includeSources', 'includeAttachments', 'includeArtifact', 'artifactView', 'includeUnknown'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs();
    const parts: MessagePart[] = [
      { id: 'answer', type: 'text', text: args.text, format: args.textFormat, status: args.textStatus },
      ...(args.includeTool ? [{ id: 'tool', type: 'tool', title: '检查设计令牌', content: args.toolStatus === 'error' ? '本地错误状态示例。' : '本地工具结果示例。', status: args.toolStatus, open: args.toolOpen } satisfies MessagePart] : []),
      ...(args.includeSources ? [{ id: 'sources', type: 'source', items: [{ id: 'design', title: '本地设计规范', description: '由 Story 提供的来源条目' }] } satisfies MessagePart] : []),
      ...(args.includeAttachments ? [{ id: 'attachments', type: 'attachment', items: [{ id: 'guide', name: 'design-language.md', sizeLabel: '12 KB', status: 'ready' }] } satisfies MessagePart] : []),
      ...(args.includeArtifact ? [{ id: 'artifact', type: 'artifact', title: 'workspace.ts', view: args.artifactView, version: 'v1', versions: [{ id: 'v1', label: '版本 1', status: 'ready', preview: <p className="text-sm">本地产物预览</p>, code: 'export const density = "compact";', language: 'typescript' }] } satisfies MessagePart] : []),
      ...(args.includeUnknown ? [{ id: 'future', type: 'unknown', originalType: 'data-progress', label: '尚未安装 data-progress 适配器' } satisfies MessagePart] : []),
    ];
    return <StructuredMessage
      from={args.from}
      local
      parts={parts}
      onRetryPart={id => id === 'tool' ? updateArgs({ toolStatus: 'complete' }) : updateArgs({ textStatus: 'complete' })}
      onToolOpenChange={(_id, open) => updateArgs({ toolOpen: open })}
      onArtifactViewChange={(_id, view) => updateArgs({ artifactView: view })}
    />;
  },
};

export const AllParts: Story = { name: '全部已知类型', render: () => <MessagePartsDemo /> };

export const StructuredAssistant: Story = {
  name: '助手结构化消息',
  render: () => <StructuredMessage from="assistant" local parts={[{ id: 'answer', type: 'text', format: 'markdown', text: '正文保持自然流动，工具和来源作为相邻 parts。' }, { id: 'tool', type: 'tool', title: '读取本地规范', status: 'complete', content: 'docs/design-language.md' }]} />,
};

export const PlainText: Story = { name: '纯文本', args: { parts: [{ id: 'plain', type: 'text', format: 'plain', text: '纯文本保留换行。\n第二行继续使用消息字号。' }] } };
export const StreamingText: Story = { name: '流式文本', render: () => <StructuredMessage from="assistant" parts={[{ id: 'stream', type: 'text', format: 'markdown', status: 'streaming', streamKey: 'response-1', text: '正在增量输出 **稳定内容**' }]} /> };
export const PendingTool: Story = { name: '工具等待', args: { parts: [{ id: 'tool', type: 'tool', title: '等待宿主运行', status: 'pending' }] } };
export const RunningTool: Story = { name: '工具运行', args: { parts: [{ id: 'tool', type: 'tool', title: '读取本地工作区', status: 'streaming', open: true, content: '状态由宿主更新。' }] } };
export const ErrorPart: Story = { name: '错误与已缓存内容', args: { parts: [{ id: 'answer', type: 'text', text: '这段已接收内容继续保留。', status: 'error', error: '后续内容接收失败' }] }, render: args => <MessageParts {...args} onRetryPart={() => undefined} /> };
export const SourcesPart: Story = { name: '引用来源', args: { parts: [{ id: 'sources', type: 'source', items: [{ id: 'local', title: '本地设计规范', description: '宿主提供的来源元数据' }] }] } };
export const AttachmentsPart: Story = { name: '附件', args: { parts: [{ id: 'attachments', type: 'attachment', items: [{ id: 'guide', name: 'design-language.md', sizeLabel: '12 KB' }, { id: 'image', name: 'preview.png', kind: 'image', status: 'error', error: '本地错误示例' }] }] } };
export const ArtifactPart: Story = { name: '产物', args: { parts: [{ id: 'artifact', type: 'artifact', title: 'workspace.ts', versions: [{ id: 'v1', label: '版本 1', status: 'ready', preview: <p className="text-sm">本地产物预览</p>, code: 'export const density = "compact";', language: 'typescript' }] }] } };
export const UnknownPart: Story = { name: '未知类型降级', args: { parts: [{ id: 'future', type: 'unknown', originalType: 'data-progress' }] } };
export const RuntimeUnknownType: Story = { name: '运行时未知类型', args: { parts: [{ id: 'provider-event', type: 'provider-event', payload: { progress: 0.5 } } as unknown as MessagePart] } };
export const CustomUnknownRenderer: Story = { name: '自定义未知类型', args: { parts: [{ id: 'future', type: 'unknown', originalType: 'data-progress', payload: { value: 50 } }] }, render: args => <MessageParts {...args} renderUnknownPart={part => <p data-testid="custom-unknown" className="text-sm text-muted-foreground">宿主已处理 {part.originalType}</p>} /> };
export const Empty: Story = { name: '空消息', args: { parts: [] } };

function StableUpdatesExample() {
  const [text, setText] = useState('稳定开头');
  const parts: MessagePart[] = [{ id: 'stable', type: 'text', format: 'plain', text: '不会替换的第一段' }, { id: 'stream', type: 'text', format: 'plain', status: 'streaming', text }];
  return <div className="grid gap-[var(--rui-content-gap)]"><MessageParts parts={parts} /><Button type="button" size="sm" variant="outline" className="justify-self-start" onClick={() => setText(value => `${value} + 新片段`)}>追加流内容</Button></div>;
}
export const StablePartIdentity: Story = {
  name: '稳定 ID 增量更新',
  render: () => <StableUpdatesExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stable = canvasElement.querySelector('[data-message-part-id="stable"]');
    await userEvent.click(canvas.getByRole('button', { name: '追加流内容' }));
    await expect(canvas.getByText('稳定开头 + 新片段')).toBeVisible();
    await expect(canvasElement.querySelector('[data-message-part-id="stable"]')).toBe(stable);
  },
};

export const InteractiveCallbacks: Story = { name: '宿主受控回调', render: () => <MessagePartsDemo /> };
export const Narrow: Story = { name: '窄工作面', render: () => <div className="max-w-xs"><MessageParts parts={demoMessageParts} /></div> };
