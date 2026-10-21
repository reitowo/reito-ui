import { JumpToLatest } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { JumpToLatestDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, choiceControl, numberControl, textControl } from '../feature-controls.js';

const meta = {
  id: 'basic-jump-to-latest',
  title: '基础/JumpToLatest 回到最新',
  component: JumpToLatest,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '阅读者离开日志或会话底部后出现的浮动胶囊。默认定位到最近的 relative 容器底部；宿主负责判断是否在底部并执行滚动。',
      },
    },
  },
} satisfies Meta<typeof JumpToLatest>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '参数调试',
  args: { label: '回到最新', count: 0, placement: 'end', disabled: false, visible: true },
  argTypes: { label: textControl, count: numberControl, placement: choiceControl(['center', 'end']), disabled: booleanControl, visible: booleanControl },
  parameters: { controls: { include: ['label', 'count', 'placement', 'disabled', 'visible'] } },
  render: (args) => (
    <div className="relative h-32 w-full max-w-md rounded-lg border">
      <JumpToLatest {...args} />
    </div>
  ),
};
export const Interactive: Story = {
  name: '交互 · 滚动日志',
  render: () => <JumpToLatestDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /回到最新/ }));
    await expect(canvas.queryByRole('button', { name: /^回到最新/ })).toBeNull();
  },
};
export const Unread: Story = { name: '未读计数', args: { count: 3, floating: false } };
export const Disabled: Story = { name: '状态 · 禁用', args: { disabled: true, floating: false } };
