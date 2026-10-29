import type { Meta, StoryObj } from '@storybook/react-vite';
import { TiltCardDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-tilt-card',
  title: '模式/TiltCard 倾斜卡',
  component: TiltCardDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '指针倾斜，减少动效时静止。' } } },
} satisfies Meta<typeof TiltCardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
