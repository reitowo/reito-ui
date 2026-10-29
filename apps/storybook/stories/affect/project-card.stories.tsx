import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProjectCardDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-project-card',
  title: '模式/ProjectCard 项目卡',
  component: ProjectCardDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：展开子任务、状态与成员。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof ProjectCardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
