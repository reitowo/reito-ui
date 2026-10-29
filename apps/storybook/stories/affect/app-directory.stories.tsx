import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppDirectoryDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-app-directory',
  title: '模式/AppDirectory 应用目录',
  component: AppDirectoryDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '分类、搜索与连接流程。' } } },
} satisfies Meta<typeof AppDirectoryDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
