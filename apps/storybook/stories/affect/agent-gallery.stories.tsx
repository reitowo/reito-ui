import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentGalleryDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-agent-gallery',
  title: '模式/AgentGallery 代理画廊',
  component: AgentGalleryDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '轮播展开代理步骤与护栏。' } } },
} satisfies Meta<typeof AgentGalleryDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
