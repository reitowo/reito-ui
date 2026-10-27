import type { Meta, StoryObj } from '@storybook/react-vite';
import { OutreachBranchesDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-outreach-branches',
  title: '模式/OutreachBranches 外展支线',
  component: OutreachBranchesDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '一条动作分出三条通道。' } } },
} satisfies Meta<typeof OutreachBranchesDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
