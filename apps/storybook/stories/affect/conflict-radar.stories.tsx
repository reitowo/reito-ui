import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConflictRadarDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-conflict-radar',
  title: '模式/ConflictRadar 冲突雷达',
  component: ConflictRadarDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：并行改动与合并选择。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof ConflictRadarDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
