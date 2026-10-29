import type { Meta, StoryObj } from '@storybook/react-vite';
import { GlassFolderDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-glass-folder',
  title: '模式/GlassFolder 磨砂文件夹',
  component: GlassFolderDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '悬停掀起示意文档。' } } },
} satisfies Meta<typeof GlassFolderDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
