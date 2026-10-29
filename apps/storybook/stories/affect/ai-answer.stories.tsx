import type { Meta, StoryObj } from '@storybook/react-vite';
import { AIAnswerDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-ai-answer',
  title: '模式/AIAnswer 带出处回答',
  component: AIAnswerDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：来源卡、引用与追问。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof AIAnswerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
