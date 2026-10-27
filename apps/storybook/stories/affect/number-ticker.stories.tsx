import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberTickerDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-number-ticker',
  title: '模式/NumberTicker 数字翻滚',
  component: NumberTickerDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '格式化数字滚入。' } } },
} satisfies Meta<typeof NumberTickerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
