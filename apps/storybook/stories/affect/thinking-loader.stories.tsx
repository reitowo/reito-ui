import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThinkingLoaderDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-thinking-loader',
  title: '模式/ThinkingLoader 思考加载',
  component: ThinkingLoaderDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '阶段标签与完成态。' } } },
} satisfies Meta<typeof ThinkingLoaderDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
