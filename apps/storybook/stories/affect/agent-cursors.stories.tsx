import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentCursorsDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-agent-cursors',
  title: '模式/AgentCursors 代理光标',
  component: AgentCursorsDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：文档内指针、建议与评论。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof AgentCursorsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
