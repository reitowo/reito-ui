import type { Meta, StoryObj } from '@storybook/react-vite';
import { GridBackgroundDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-grid-background',
  title: '模式/GridBackground 网格背景',
  component: GridBackgroundDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '内容后的细线网格。' } } },
} satisfies Meta<typeof GridBackgroundDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
