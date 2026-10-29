import type { Meta, StoryObj } from '@storybook/react-vite';
import { AutonomyDialDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-autonomy-dial',
  title: '模式/AutonomyDial 自主程度',
  component: AutonomyDialDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：三级权限与锁定。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof AutonomyDialDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
