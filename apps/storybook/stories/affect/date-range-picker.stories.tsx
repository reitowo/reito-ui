import type { Meta, StoryObj } from '@storybook/react-vite';
import { AffectDateRangePickerDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-date-range-picker',
  title: '模式/DateRangePicker 日期范围',
  component: AffectDateRangePickerDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：预设与对比周期。模式层兄弟，不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof AffectDateRangePickerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
