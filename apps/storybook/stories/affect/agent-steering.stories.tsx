import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentSteeringDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-agent-steering',
  title: '模式/AgentSteering 运行中引导',
  component: AgentSteeringDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：排队便条或立即打断。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof AgentSteeringDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
