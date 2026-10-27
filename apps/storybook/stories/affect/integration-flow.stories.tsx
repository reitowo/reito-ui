import type { Meta, StoryObj } from '@storybook/react-vite';
import { IntegrationFlowDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-integration-flow',
  title: '模式/IntegrationFlow 集成流',
  component: IntegrationFlowDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '通用标记沿弧线轮转。' } } },
} satisfies Meta<typeof IntegrationFlowDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
