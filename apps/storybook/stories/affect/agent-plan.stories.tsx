import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentPlanDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-agent-plan',
  title: '模式/AgentPlan 代理计划',
  component: AgentPlanDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：可编辑步骤与运行。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof AgentPlanDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
