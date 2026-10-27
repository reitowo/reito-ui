import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabOverloadDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-tab-overload',
  title: '模式/TabOverload 标签过载',
  component: TabOverloadDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '重叠标签跟随悬停。' } } },
} satisfies Meta<typeof TabOverloadDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
