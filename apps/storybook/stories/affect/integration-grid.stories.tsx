import type { Meta, StoryObj } from '@storybook/react-vite';
import { IntegrationGridDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-integration-grid',
  title: '模式/IntegrationGrid 集成蜂窝',
  component: IntegrationGridDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '中心产品与周围工具。' } } },
} satisfies Meta<typeof IntegrationGridDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
