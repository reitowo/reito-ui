import type { Meta, StoryObj } from '@storybook/react-vite';
import { TaskBoardDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-task-board',
  title: '模式/TaskBoard 任务板',
  component: TaskBoardDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '看板、筛选与详情改状态。' } } },
} satisfies Meta<typeof TaskBoardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
