import type { Meta, StoryObj } from '@storybook/react-vite';
import { IntegrationPickerDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-integration-picker',
  title: '模式/IntegrationPicker 集成选择',
  component: IntegrationPickerDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：搜索服务并开关连接。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof IntegrationPickerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
