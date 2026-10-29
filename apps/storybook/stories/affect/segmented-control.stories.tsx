import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControlDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-segmented-control',
  title: '模式/SegmentedControl 分段控件',
  component: SegmentedControlDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '托盘或下划线分段。' } } },
} satisfies Meta<typeof SegmentedControlDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
