import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChangeSummaryDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-change-summary',
  title: '模式/ChangeSummary 变化摘要',
  component: ChangeSummaryDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '一行一个指标与语义趋势。' } } },
} satisfies Meta<typeof ChangeSummaryDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
