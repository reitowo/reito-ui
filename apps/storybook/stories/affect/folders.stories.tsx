import type { Meta, StoryObj } from '@storybook/react-vite';
import { FoldersDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-folders',
  title: '模式/Folders 文件夹总览',
  component: FoldersDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：搜索、排序与网格/列表。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof FoldersDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
