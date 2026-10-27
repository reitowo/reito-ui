import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationStackDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-notification-stack',
  title: '模式/NotificationStack 通知叠卡',
  component: NotificationStackDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '关闭前卡后露出下一张。' } } },
} satisfies Meta<typeof NotificationStackDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
