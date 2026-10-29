import type { Meta, StoryObj } from '@storybook/react-vite';
import { GhostedChatDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-ghosted-chat',
  title: '模式/GhostedChat 已读未回',
  component: GhostedChatDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '已读未回的对话示意。' } } },
} satisfies Meta<typeof GhostedChatDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
