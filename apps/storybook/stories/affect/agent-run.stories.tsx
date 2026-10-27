import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentRunDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-agent-run',
  title: '模式/AgentRun 代理运行',
  component: AgentRunDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：计划、工具、审批与草稿。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof AgentRunDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
