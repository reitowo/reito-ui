import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageActionsDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-message-actions',
  title: '模式/MessageActions 消息操作条',
  component: MessageActionsDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '复制、重试、反馈、朗读与版本。' } } },
} satisfies Meta<typeof MessageActionsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
