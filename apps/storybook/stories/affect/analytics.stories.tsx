import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnalyticsDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-analytics',
  title: '模式/Analytics 分析',
  component: AnalyticsDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：指标、渠道与产品表。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof AnalyticsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
