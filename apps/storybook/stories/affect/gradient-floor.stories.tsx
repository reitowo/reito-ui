import type { Meta, StoryObj } from '@storybook/react-vite';
import { GradientFloorDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-gradient-floor',
  title: '模式/GradientFloor 渐变地面',
  component: GradientFloorDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '底边语义光晕。' } } },
} satisfies Meta<typeof GradientFloorDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
