import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayerStackDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-layer-stack',
  title: '模式/LayerStack 层叠',
  component: LayerStackDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '选中层抬起。' } } },
} satisfies Meta<typeof LayerStackDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
