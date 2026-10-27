import type { Meta, StoryObj } from '@storybook/react-vite';
import { GlowCloudDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-glow-cloud',
  title: '模式/GlowCloud 光云',
  component: GlowCloudDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '发光云示意。' } } },
} satisfies Meta<typeof GlowCloudDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
