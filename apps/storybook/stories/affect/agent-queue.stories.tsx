import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentQueueDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-agent-queue',
  title: '模式/AgentQueue 代理队列',
  component: AgentQueueDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：等待、工作者与限流。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof AgentQueueDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
