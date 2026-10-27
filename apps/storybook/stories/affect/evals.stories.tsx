import type { Meta, StoryObj } from '@storybook/react-vite';
import { EvalsDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-evals',
  title: '模式/Evals 评测',
  component: EvalsDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：通过率、提示差与用例。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof EvalsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
