import type { Meta, StoryObj } from '@storybook/react-vite';
import { FolderDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-folder',
  title: '模式/Folder 文件夹详情',
  component: FolderDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：面包屑与文件预览卡。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof FolderDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
