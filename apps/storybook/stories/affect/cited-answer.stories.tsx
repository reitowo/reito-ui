import type { Meta, StoryObj } from '@storybook/react-vite';
import { CitedAnswerDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-cited-answer',
  title: '模式/CitedAnswer 引用对照',
  component: CitedAnswerDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：句子与来源互亮。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof CitedAnswerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
