import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThinkingStateDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-thinking-state',
  title: '模式/ThinkingState 思考状态',
  component: ThinkingStateDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：计时、来源与步骤。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof ThinkingStateDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
