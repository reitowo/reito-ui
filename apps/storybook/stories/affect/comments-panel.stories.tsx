import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommentsPanelDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-comments-panel',
  title: '模式/CommentsPanel 评论面板',
  component: CommentsPanelDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：筛选、/edit 与解决。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof CommentsPanelDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
