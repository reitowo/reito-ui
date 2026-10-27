import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppShellWorkspaceFlatDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-app-shell-workspace-flat',
  title: '模式/AppShellWorkspaceFlat 扁平工作区',
  component: AppShellWorkspaceFlatDemo,
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
        component: '公开文档重建：扁平壳加右侧工作区。模式层兄弟，不是 Pro 源码移植。',
      },
    },
  },
} satisfies Meta<typeof AppShellWorkspaceFlatDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
