import type { Meta, StoryObj } from '@storybook/react-vite';
import { BillingScheduleDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-billing-schedule',
  title: '模式/BillingSchedule 账单计划',
  component: BillingScheduleDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：阶段、产品行与合计。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof BillingScheduleDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
