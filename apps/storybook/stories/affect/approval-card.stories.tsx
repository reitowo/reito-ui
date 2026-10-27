import type { Meta, StoryObj } from '@storybook/react-vite';
import { ApprovalCardDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-approval-card',
  title: '模式/ApprovalCard 审批卡',
  component: ApprovalCardDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：风险、倒计时与批准。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof ApprovalCardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
