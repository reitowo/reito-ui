import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryPanelDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-memory-panel',
  title: '模式/MemoryPanel 记忆面板',
  component: MemoryPanelDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：分组编辑、暂停与忘记。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof MemoryPanelDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
