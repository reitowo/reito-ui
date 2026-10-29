import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShimmerLoaderDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-shimmer-loader',
  title: '模式/ShimmerLoader 微光加载',
  component: ShimmerLoaderDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '骨架与微光文字。' } } },
} satisfies Meta<typeof ShimmerLoaderDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
