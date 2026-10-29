import type { Meta, StoryObj } from '@storybook/react-vite';
import { AffectDropzoneDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-dropzone',
  title: '模式/Dropzone 拖放上传',
  component: AffectDropzoneDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：拖入、进度与重试。模式层兄弟，不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof AffectDropzoneDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
