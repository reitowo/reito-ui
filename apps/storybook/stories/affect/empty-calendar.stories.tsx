import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyCalendarDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-empty-calendar',
  title: '模式/EmptyCalendar 空日历',
  component: EmptyCalendarDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '空闲日历卡片。' } } },
} satisfies Meta<typeof EmptyCalendarDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
