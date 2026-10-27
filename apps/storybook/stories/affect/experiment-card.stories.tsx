import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExperimentCardDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-experiment-card',
  title: '模式/ExperimentCard 实验卡',
  component: ExperimentCardDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { component: '公开文档重建：方案对比与选赢家。不是 Pro 源码移植。' },
    },
  },
} satisfies Meta<typeof ExperimentCardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
