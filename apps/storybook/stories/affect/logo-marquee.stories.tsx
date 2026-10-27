import type { Meta, StoryObj } from '@storybook/react-vite';
import { LogoMarqueeDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-logo-marquee',
  title: '模式/LogoMarquee 标志滚动',
  component: LogoMarqueeDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '信任条循环，减少动效时静止。' } } },
} satisfies Meta<typeof LogoMarqueeDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
