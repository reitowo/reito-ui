import type { Meta, StoryObj } from '@storybook/react-vite';
import { BlurCrossfadeDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-blur-crossfade',
  title: '模式/BlurCrossfade 模糊交叉淡入',
  component: BlurCrossfadeDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '内容替换时模糊过渡。' } } },
} satisfies Meta<typeof BlurCrossfadeDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
