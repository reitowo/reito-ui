import type { Meta, StoryObj } from '@storybook/react-vite';
import { IntegrationsDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-integrations',
  title: '模式/Integrations 集成目录',
  component: IntegrationsDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：分类、搜索与连接状态。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof IntegrationsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
