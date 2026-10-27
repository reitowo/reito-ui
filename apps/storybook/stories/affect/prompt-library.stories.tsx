import type { Meta, StoryObj } from '@storybook/react-vite';
import { PromptLibraryDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-prompt-library',
  title: '模式/PromptLibrary 提示库',
  component: PromptLibraryDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：模板变量与预览。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof PromptLibraryDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
