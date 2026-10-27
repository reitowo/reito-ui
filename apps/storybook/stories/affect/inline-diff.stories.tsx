import type { Meta, StoryObj } from '@storybook/react-vite';
import { InlineDiffDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-inline-diff',
  title: '模式/InlineDiff 行内改写',
  component: InlineDiffDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：逐处接受或拒绝。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof InlineDiffDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
