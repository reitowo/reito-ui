import type { Meta, StoryObj } from '@storybook/react-vite';
import { ClientContextDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-client-context',
  title: '模式/ClientContext 客户上下文',
  component: ClientContextDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '客户切换、KPI 与时间线。' } } },
} satisfies Meta<typeof ClientContextDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
