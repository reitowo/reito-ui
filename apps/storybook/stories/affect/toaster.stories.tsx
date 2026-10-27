import type { Meta, StoryObj } from '@storybook/react-vite';
import { AffectToasterDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-toaster',
  title: '模式/Toaster 轻提示',
  component: AffectToasterDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：模块级 toast。模式层兄弟，不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof AffectToasterDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
