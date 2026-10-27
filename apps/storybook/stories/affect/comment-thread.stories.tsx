import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommentThreadDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-comment-thread',
  title: '模式/CommentThread 评论串',
  component: CommentThreadDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '评论、折叠详情与本地回复。' } } },
} satisfies Meta<typeof CommentThreadDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
