import { useEffect } from 'react';
import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, rangeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { MessageBranch } from '../../../../packages/ui/src/ai/message-branch.js';
import { MessageBranchDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { title: 'AI/MessageBranch', component: MessageBranch, args: { index: 0, count: 3, onIndexChange: fn() }, decorators: [Story => <StoryFrame><Story /></StoryFrame>], parameters: { docs: { description: { component: '零基索引由调用方持有。上一项和下一项在边界禁用；方向键、Home、End 支持键盘切换。组件只切换索引，不生成分支内容。' } } } } satisfies Meta<typeof MessageBranch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: '交互场景：分支键盘切换',
  render: () => <MessageBranchDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '上一分支' })).toBeDisabled();
    const group = canvas.getByRole('group', { name: '消息分支' });
    group.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByText('方案二：会话与当前产物并排查看。')).toBeVisible();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('button', { name: '下一分支' })).toBeDisabled();
    await expect(canvas.getByRole('status', { name: '当前分支' })).toHaveTextContent('3 / 3');
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(canvas.getByRole('status', { name: '当前分支' })).toHaveTextContent('1 / 3'));
  },
};
export const SingleBranch: Story = { name: '只有一个分支', args: { count: 1 } };
export const Empty: Story = { name: '没有分支', args: { count: 0 } };
export const Disabled: Story = { name: '禁用', args: { index: 1, disabled: true } };
export const LastBranch: Story = { name: '最后一个分支', args: { index: 2 } };

export const Default: Story = { name: '第一个分支' };
export const MiddleBranch: Story = { name: '中间分支', args: { index: 1 } };

export const Playground: Story = {
  name: '参数调试', args: { index: 0, count: 3, disabled: false, label: '消息分支' },
  argTypes: { index: { ...rangeControl(0, 9), description: '零基索引；超出 count 时画布使用最后一项，空集合为 0。状态立即规范化；完成编辑、失焦后参数框同步。' }, count: rangeControl(0, 10), disabled: booleanControl, label: textControl },
  parameters: { controls: { include: ['index', 'count', 'disabled', 'label'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs();
    const count = Number.isFinite(args.count) ? Math.max(0, Math.floor(args.count)) : 0;
    const index = Number.isFinite(args.index) ? Math.max(0, Math.min(Math.max(0, count - 1), Math.floor(args.index))) : 0;
    useEffect(() => {
      if (args.count !== count || args.index !== index) updateArgs({ count, index });
    }, [args.count, args.index, count, index, updateArgs]);
    return <MessageBranch {...args} count={count} index={index} onIndexChange={index => updateArgs({ index })} />;
  },
};
