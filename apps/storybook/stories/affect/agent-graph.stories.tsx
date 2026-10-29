import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentGraphDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-agent-graph',
  title: '模式/AgentGraph 代理图',
  component: AgentGraphDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：代理、工具与调用热度。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof AgentGraphDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
