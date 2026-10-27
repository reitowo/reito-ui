import type { Meta, StoryObj } from '@storybook/react-vite';
import { PermissionRequestDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-permission-request',
  title: '模式/PermissionRequest 权限请求',
  component: PermissionRequestDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：一次、限时或始终授权。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof PermissionRequestDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
