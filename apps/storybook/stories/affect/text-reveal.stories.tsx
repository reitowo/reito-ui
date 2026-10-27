import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextRevealDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-text-reveal',
  title: '模式/TextReveal 文字显现',
  component: TextRevealDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '进入视口后逐词显现。' } } },
} satisfies Meta<typeof TextRevealDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
