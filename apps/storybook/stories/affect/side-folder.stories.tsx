import type { Meta, StoryObj } from '@storybook/react-vite';
import { SideFolderDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-side-folder',
  title: '模式/SideFolder 侧向文件夹',
  component: SideFolderDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '悬停滑出的文件夹。' } } },
} satisfies Meta<typeof SideFolderDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
