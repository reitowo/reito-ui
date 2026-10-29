import type { Meta, StoryObj } from '@storybook/react-vite';
import { MetricsDashboardDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-metrics-dashboard',
  title: '模式/MetricsDashboard 指标仪表',
  component: MetricsDashboardDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: 'KPI 选度量，折线或柱状。' } } },
} satisfies Meta<typeof MetricsDashboardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
