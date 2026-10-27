import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProjectFlowDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-project-flow',
  title: '模式/ProjectFlow 项目流',
  component: ProjectFlowDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '客户任务分出卡片。' } } },
} satisfies Meta<typeof ProjectFlowDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
