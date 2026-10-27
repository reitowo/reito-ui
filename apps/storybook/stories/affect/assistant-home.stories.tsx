import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssistantHomeDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-assistant-home',
  title: '模式/AssistantHome 助手首页',
  component: AssistantHomeDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：问候、提示与已连接应用。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof AssistantHomeDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
