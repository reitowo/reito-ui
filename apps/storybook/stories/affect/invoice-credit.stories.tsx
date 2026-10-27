import type { Meta, StoryObj } from '@storybook/react-vite';
import { InvoiceCreditDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-invoice-credit',
  title: '模式/InvoiceCredit 发票与贷记',
  component: InvoiceCreditDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '发票与贷记单叠放，勾选后开具。' } } },
} satisfies Meta<typeof InvoiceCreditDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
