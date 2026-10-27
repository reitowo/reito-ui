import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactionBarDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-reaction-bar',
  title: '模式/ReactionBar 反应条',
  component: ReactionBarDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '点赞等动作与翻滚计数。' } } },
} satisfies Meta<typeof ReactionBarDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
