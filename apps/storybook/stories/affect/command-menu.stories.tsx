import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommandMenuDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-command-menu',
  title: '模式/CommandMenu 命令菜单',
  component: CommandMenuDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：搜索并运行命令。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof CommandMenuDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
