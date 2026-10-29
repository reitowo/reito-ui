import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatComposerDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-chat-composer',
  title: '模式/ChatComposer 对话输入',
  component: ChatComposerDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：模型、语音与批准。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof ChatComposerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
