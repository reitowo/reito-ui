import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ToolCall } from '../../../../packages/ui/src/ai/execution.js';
import { ToolCallDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { title: 'AI/ToolCall', component: ToolCall, args: { title: '读取设计规范', status: 'success', children: '本地示例内容：共享组件消费语义令牌。' }, decorators: [Story => <StoryFrame><Story /></StoryFrame>], parameters: { docs: { description: { component: '行内与卡片两种结构共用折叠交互及等待、进行、完成、错误状态。组件不会运行工具。' } } } } satisfies Meta<typeof ToolCall>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: '默认行内折叠',};
export const Card: Story = { name: '卡片展开', args: { variant: 'card', defaultOpen: true } };
export const Pending: Story = { name: '等待开始', args: { status: 'pending', children: undefined } };
export const Running: Story = { name: '进行中', args: { status: 'running', children: undefined } };
export const Error: Story = { name: '失败展开', args: { status: 'error', defaultOpen: true, children: '本地错误状态：文件不可用。' } };
export const RetryLocalState: Story = { name: '交互场景：工具重试与展开', render: () => <ToolCallDemo />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: '重试此步骤' })); await expect(canvas.getByText('正在播放本地状态变化…')).toBeVisible(); await expect(await canvas.findByText('本地状态示例已完成，没有执行命令。')).toBeVisible(); await userEvent.click(canvas.getByRole('button', { name: /读取设计规范/ })); await expect(canvas.getByText('docs/design-language.md')).toBeVisible(); } };

export const Expanded: Story = { name: '行内展开', args: { defaultOpen: true } };
export const CardCollapsed: Story = { name: '卡片折叠', args: { variant: 'card' } };

export const Playground: Story = {
  name: '参数调试', args: { variant: 'inline', open: false, status: 'success', title: '读取设计规范', durationLabel: '0.4s', children: '本地示例：共享组件消费语义令牌。' },
  argTypes: { variant: choiceControl(['inline', 'card']), open: booleanControl, status: choiceControl(['pending', 'running', 'success', 'error']), title: textControl, durationLabel: textControl, children: textControl },
  parameters: { controls: { include: ['variant', 'open', 'status', 'title', 'durationLabel', 'children'] } },
  render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <ToolCall {...args} onOpenChange={open => updateArgs({ open })} onRetry={() => updateArgs({ status: 'running' })} />; },
};
