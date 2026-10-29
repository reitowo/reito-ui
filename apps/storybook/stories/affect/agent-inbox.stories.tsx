import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentInboxDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-agent-inbox',
  title: '模式/AgentInbox 代理收件箱',
  component: AgentInboxDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：后台任务看板。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof AgentInboxDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
