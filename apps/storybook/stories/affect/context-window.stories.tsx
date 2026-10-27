import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContextWindowDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-context-window',
  title: '模式/ContextWindow 上下文窗口',
  component: ContextWindowDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：单元格子、移除与压缩。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof ContextWindowDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
