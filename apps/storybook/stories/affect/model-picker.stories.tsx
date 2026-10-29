import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModelPickerDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-model-picker',
  title: '模式/ModelPicker 模型选择',
  component: ModelPickerDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：速度质量成本与思考。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof ModelPickerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
