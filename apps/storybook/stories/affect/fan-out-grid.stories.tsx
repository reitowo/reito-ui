import type { Meta, StoryObj } from '@storybook/react-vite';
import { FanoutGridDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-fan-out-grid',
  title: '模式/FanoutGrid 分发网格',
  component: FanoutGridDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：批量任务格子与重试。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof FanoutGridDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
