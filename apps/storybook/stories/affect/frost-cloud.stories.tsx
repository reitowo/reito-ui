import type { Meta, StoryObj } from '@storybook/react-vite';
import { FrostCloudDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-frost-cloud',
  title: '模式/FrostCloud 霜云',
  component: FrostCloudDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '可点击的霜云示意。' } } },
} satisfies Meta<typeof FrostCloudDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
