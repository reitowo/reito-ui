import type { Meta, StoryObj } from '@storybook/react-vite';
import { GradientTextDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-gradient-text',
  title: '模式/GradientText 渐变文字',
  component: GradientTextDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '短词扫过语义渐变。' } } },
} satisfies Meta<typeof GradientTextDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
