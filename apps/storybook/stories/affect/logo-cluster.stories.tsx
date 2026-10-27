import type { Meta, StoryObj } from '@storybook/react-vite';
import { LogoClusterDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-logo-cluster',
  title: '模式/LogoCluster 标志簇',
  component: LogoClusterDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '中心标志与周围标记。' } } },
} satisfies Meta<typeof LogoClusterDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
