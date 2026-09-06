import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Checkpoint } from '../../../../packages/ui/src/ai/checkpoint.js';
import { CheckpointDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { title: 'AI/Checkpoint', component: Checkpoint, args: { title: '布局调整前', description: '本地恢复点示例，不修改本机文件。', files: [{ path: 'workspace-settings.ts', status: 'modified' }, { path: 'layout.css', status: 'added' }], onRestore: fn(), confirmDescription: '这次恢复只调用本地示例回调，不会读写文件。' }, decorators: [Story => <StoryFrame><Story /></StoryFrame>], parameters: { docs: { description: { component: '检查点摘要、文件变更和确认对话框。onRestore 由宿主实现；等待时防止重复提交，失败保持对话框与检查点内容，成功关闭确认层并恢复焦点。组件不会修改磁盘。' } } } } satisfies Meta<typeof Checkpoint>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: '交互场景：恢复检查点', render: () => <CheckpointDemo /> };
export const Confirmation: Story = { name: '确认对话框', play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: '恢复检查点' })); const dialog = await within(canvasElement.ownerDocument.body).findByRole('alertdialog'); await waitFor(() => expect(dialog).toBeVisible()); } };
export const RestoreFailureAndRetry: Story = { name: '交互场景：恢复失败与重试',
  play: async ({ canvasElement, args }) => {
    args.onRestore.mockRejectedValueOnce(new globalThis.Error('本地恢复失败，检查点已保留。')).mockResolvedValue(undefined);
    const canvas = within(canvasElement);
    const document = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: '恢复检查点' });
    await userEvent.click(trigger);
    let dialog = within(await document.findByRole('alertdialog'));
    await userEvent.click(dialog.getByRole('button', { name: '保留当前状态' }));
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(args.onRestore).not.toHaveBeenCalled();
    await userEvent.click(trigger);
    dialog = within(await document.findByRole('alertdialog'));
    await userEvent.click(dialog.getByRole('button', { name: '确认恢复' }));
    await expect(await dialog.findByRole('alert')).toHaveTextContent('本地恢复失败');
    await expect(canvas.getByText('workspace-settings.ts')).toBeInTheDocument();
    await userEvent.click(dialog.getByRole('button', { name: '确认恢复' }));
    await waitFor(() => expect(document.queryByRole('alertdialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(canvas.getByRole('status')).toHaveTextContent('恢复回调已完成');
    await expect(args.onRestore).toHaveBeenCalledTimes(2);
  },
};
export const Restoring: Story = { name: '恢复中', args: { status: 'restoring' } };
export const Error: Story = { name: '恢复失败', args: { status: 'error', error: '本地恢复失败，检查点已保留。' } };
export const Success: Story = { name: '已恢复', args: { status: 'success' } };
export const Empty: Story = { name: '没有变更文件', args: { files: [] } };
export const Disabled: Story = { name: '禁用', args: { disabled: true } };

export const Default: Story = { name: '默认检查点' };

export const Playground: Story = {
  name: '参数调试', args: { status: 'pending', disabled: false, title: '布局调整前', description: '本地恢复点示例，不修改本机文件。', error: '', createdLabel: '刚刚', confirmDescription: '仅调用本地示例回调。' },
  argTypes: { status: choiceControl(['pending', 'restoring', 'success', 'error']), disabled: booleanControl, title: textControl, description: textControl, error: textControl, createdLabel: textControl, confirmDescription: textControl },
  parameters: { controls: { include: ['status', 'disabled', 'title', 'description', 'error', 'createdLabel', 'confirmDescription'] } },
  render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <Checkpoint {...args} onRestore={() => updateArgs({ status: 'success' })} />; },
};
