import type { Meta, StoryObj } from '@storybook/react-vite';
import { CoverFlowDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-cover-flow',
  title: '模式/CoverFlow 封面流',
  component: CoverFlowDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '封面浏览。' } } },
} satisfies Meta<typeof CoverFlowDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
