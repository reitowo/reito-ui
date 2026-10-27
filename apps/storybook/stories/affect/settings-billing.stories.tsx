import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsBillingDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-settings-billing',
  title: '模式/SettingsBilling 设置与账单',
  component: SettingsBillingDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：方案、用量、发票与密钥。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof SettingsBillingDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
