import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppShellInsetDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-app-shell-inset',
  title: '模式/AppShell 嵌套壳',
  component: AppShellInsetDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: '公开文档重建：侧栏、项目与账户框。模式层兄弟，不是 Pro 源码移植。',
      },
    },
  },
} satisfies Meta<typeof AppShellInsetDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
