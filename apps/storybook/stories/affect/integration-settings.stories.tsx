import type { Meta, StoryObj } from '@storybook/react-vite';
import { IntegrationSettingsDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-integration-settings',
  title: '模式/IntegrationSettings 集成设置',
  component: IntegrationSettingsDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：开关、密钥与脏保存条。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof IntegrationSettingsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
