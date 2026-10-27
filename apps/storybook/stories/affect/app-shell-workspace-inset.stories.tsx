import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppShellWorkspaceInsetDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-app-shell-workspace-inset',
  title: '模式/AppShellWorkspace 嵌套工作区',
  component: AppShellWorkspaceInsetDemo,
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
        component: '公开文档重建：嵌套壳加工具与建议。模式层兄弟，不是 Pro 源码移植。',
      },
    },
  },
} satisfies Meta<typeof AppShellWorkspaceInsetDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
