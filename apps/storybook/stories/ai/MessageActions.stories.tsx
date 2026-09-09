import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { MessageActions } from '../../../../packages/ui/src/ai/message-actions.js';
import { MessageActionsDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { id: "ai-messageactions", title: "AI/MessageActions 消息操作", component: MessageActions, args: { text: '只复制这一段消息正文。', onCopy: fn(), onRetry: fn(), onEdit: fn(), onFeedbackChange: fn() }, decorators: [Story => <StoryFrame><Story /></StoryFrame>], parameters: { docs: { description: { component: '独立消息操作条。复制回调接收 text 属性，不读取 DOM。重试、编辑、反馈由宿主提供；异步失败保留操作上下文，可重新尝试。' } } } } satisfies Meta<typeof MessageActions>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: "交互 · 消息与操作条", render: () => <MessageActionsDemo /> };
export const CopyAndFeedback: Story = { name: "交互 · 复制、反馈与编辑",
  render: args => <><p>这一段是周围内容，不应进入复制回调。</p><MessageActions {...args} /></>,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '复制消息' }));
    await expect(args.onCopy).toHaveBeenCalledWith('只复制这一段消息正文。');
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('消息已复制'));
    await userEvent.click(canvas.getByRole('button', { name: '有帮助' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: '有帮助' })).toHaveAttribute('aria-pressed', 'true'));
    await userEvent.click(canvas.getByRole('button', { name: '有帮助' }));
    await expect(args.onFeedbackChange).toHaveBeenLastCalledWith(null);
    await userEvent.click(canvas.getByRole('button', { name: '编辑消息' }));
    await expect(args.onEdit).toHaveBeenCalledTimes(1);
  },
};
export const RetryError: Story = { name: "交互 · 重试失败与恢复",
  play: async ({ canvasElement, args }) => {
    args.onRetry!.mockRejectedValueOnce(new Error('本地重试失败，请再次尝试。')).mockResolvedValue(undefined);
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '重试消息' }));
    await expect(await canvas.findByRole('alert')).toHaveTextContent('本地重试失败');
    await userEvent.click(canvas.getByRole('button', { name: '重试消息' }));
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('重试请求已提交'));
    await expect(args.onRetry).toHaveBeenCalledTimes(2);
  },
};
export const Disabled: Story = { name: "状态 · 禁用", args: { disabled: true, feedback: 'down' } };
export const EmptyText: Story = { name: "空消息正文", args: { text: '', onRetry: undefined, onEdit: undefined, onFeedbackChange: undefined } };
export const PendingAction: Story = { name: "操作处理中", args: { onRetry: fn(() => new Promise<void>(() => undefined)) }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: '重试消息' })); await expect(canvas.getByRole('button', { name: '重试消息' })).toBeDisabled(); await expect(canvas.getByRole('status')).toHaveTextContent('正在处理操作'); } };

export const Default: Story = { name: "默认操作条" };
export const PositiveFeedback: Story = { name: "已标记有帮助", args: { feedback: 'up' } };
export const NegativeFeedback: Story = { name: "已标记没有帮助", args: { feedback: 'down' } };
export const CopyOnly: Story = { name: "仅复制操作", args: { onRetry: undefined, onEdit: undefined, onFeedbackChange: undefined } };

export const Playground: Story = {
  name: "参数调试", args: { text: '本地消息内容。', feedback: null, copyable: true, disabled: false, label: '消息操作', onCopy: undefined },
  argTypes: { text: textControl, feedback: choiceControl([null, 'up', 'down']), copyable: booleanControl, disabled: booleanControl, label: textControl },
  parameters: { controls: { include: ['feedback', 'copyable', 'disabled', 'text', 'label'] } },
  render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <MessageActions {...args} onFeedbackChange={feedback => updateArgs({ feedback })} />; },
};
