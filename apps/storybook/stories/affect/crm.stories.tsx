import type { Meta, StoryObj } from '@storybook/react-vite';
import { CrmDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-crm',
  title: '模式/CRM 客户',
  component: CrmDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：管道标签与可编辑表。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof CrmDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
