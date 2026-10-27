import type { Meta, StoryObj } from '@storybook/react-vite';
import { ParallelAttemptsDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-parallel-attempts',
  title: '模式/ParallelAttempts 并行尝试',
  component: ParallelAttemptsDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：多路竞赛与择优。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof ParallelAttemptsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
