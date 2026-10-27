import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppShellFlatDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-app-shell-flat',
  title: '模式/AppShellFlat 扁平壳',
  component: AppShellFlatDemo,
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
        component: '公开文档重建：发丝分割的边缘铺满壳。模式层兄弟，不是 Pro 源码移植。',
      },
    },
  },
} satisfies Meta<typeof AppShellFlatDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
