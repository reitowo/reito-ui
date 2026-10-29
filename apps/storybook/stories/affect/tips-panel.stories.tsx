import type { Meta, StoryObj } from '@storybook/react-vite';
import { TipsPanelDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-tips-panel',
  title: '模式/TipsPanel 提示面板',
  component: TipsPanelDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '短提示与完成状态。' } } },
} satisfies Meta<typeof TipsPanelDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
