import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorldMapDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-world-map',
  title: '模式/WorldMap 世界地图',
  component: WorldMapDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '简化大洲形状与切换。' } } },
} satisfies Meta<typeof WorldMapDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
