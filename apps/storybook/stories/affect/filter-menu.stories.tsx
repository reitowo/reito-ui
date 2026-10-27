import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterMenuDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-filter-menu',
  title: '模式/FilterMenu 筛选菜单',
  component: FilterMenuDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '分组筛选与可移除芯片。' } } },
} satisfies Meta<typeof FilterMenuDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
