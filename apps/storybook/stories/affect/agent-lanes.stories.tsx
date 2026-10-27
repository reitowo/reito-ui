import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentLanesDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-agent-lanes',
  title: '模式/AgentLanes 代理泳道',
  component: AgentLanesDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：并行时间线与交接。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof AgentLanesDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
