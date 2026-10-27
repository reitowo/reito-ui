import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepperFormDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-stepper-form',
  title: '模式/StepperForm 分步表单',
  component: StepperFormDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：步骤、校验与核对。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof StepperFormDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
