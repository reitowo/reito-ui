import type { Meta, StoryObj } from '@storybook/react-vite';
import { KpiChartDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-kpi-chart',
  title: '模式/KpiChart 指标图',
  component: KpiChartDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：折线、键盘与礼貌提示。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof KpiChartDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
