import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentChatDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-agent-chat',
  title: '模式/AgentChat 代理对话',
  component: AgentChatDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：编排对话、在场代理与简报。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof AgentChatDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
