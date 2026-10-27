import type { Meta, StoryObj } from '@storybook/react-vite';
import { PricingPlansDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-pricing-plans',
  title: '模式/PricingPlans 定价方案',
  component: PricingPlansDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '月/年切换与方案卡。' } } },
} satisfies Meta<typeof PricingPlansDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
