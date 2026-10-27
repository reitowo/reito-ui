import type { Meta, StoryObj } from '@storybook/react-vite';
import { SetupGuideDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-setup-guide',
  title: '模式/SetupGuide 设置指南',
  component: SetupGuideDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：分组清单与顺序解锁。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof SetupGuideDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
