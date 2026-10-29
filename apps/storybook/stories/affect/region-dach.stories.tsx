import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionDachDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-region-dach',
  title: '模式/RegionDach 区域地图',
  component: RegionDachDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '可切换区域的示意地图。' } } },
} satisfies Meta<typeof RegionDachDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
