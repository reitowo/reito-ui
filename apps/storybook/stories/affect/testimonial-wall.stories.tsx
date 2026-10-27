import type { Meta, StoryObj } from '@storybook/react-vite';
import { TestimonialWallDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-testimonial-wall',
  title: '模式/TestimonialWall 评价墙',
  component: TestimonialWallDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '多列评价循环。' } } },
} satisfies Meta<typeof TestimonialWallDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
