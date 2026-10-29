import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentTreeDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-agent-tree',
  title: '模式/AgentTree 代理树',
  component: AgentTreeDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：编排与子代理成本。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof AgentTreeDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
