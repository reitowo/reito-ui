import type { Meta, StoryObj } from '@storybook/react-vite';
import { BreakdownChartDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-breakdown-chart',
  title: '模式/BreakdownChart 分解图',
  component: BreakdownChartDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：切片、分段与堆叠条。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof BreakdownChartDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
