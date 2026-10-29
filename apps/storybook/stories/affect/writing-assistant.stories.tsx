import type { Meta, StoryObj } from '@storybook/react-vite';
import { WritingAssistantDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-writing-assistant',
  title: '模式/WritingAssistant 写作助手',
  component: WritingAssistantDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：建议、流式回复与口述。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof WritingAssistantDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
