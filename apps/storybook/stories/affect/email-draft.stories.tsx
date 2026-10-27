import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmailDraftDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-email-draft',
  title: '模式/EmailDraft 邮件草稿',
  component: EmailDraftDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '语气、收件人、附件与发送回执。' } } },
} satisfies Meta<typeof EmailDraftDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
