import type { Meta, StoryObj } from '@storybook/react-vite';
import { SmartRecommendationDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-smart-recommendation',
  title: '模式/SmartRecommendation 智能建议',
  component: SmartRecommendationDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '信号、备选、采用与撤销。' } } },
} satisfies Meta<typeof SmartRecommendationDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
