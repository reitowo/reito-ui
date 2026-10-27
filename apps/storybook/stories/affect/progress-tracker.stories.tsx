import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressTrackerDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-progress-tracker',
  title: '模式/ProgressTracker 进度清单',
  component: ProgressTrackerDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '清单与进度条。' } } },
} satisfies Meta<typeof ProgressTrackerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
