import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModelWheelDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-model-wheel',
  title: '模式/ModelWheel 模型轮',
  component: ModelWheelDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '模型名单。' } } },
} satisfies Meta<typeof ModelWheelDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
