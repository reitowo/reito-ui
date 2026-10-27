import type { Meta, StoryObj } from '@storybook/react-vite';
import { KpiBoardDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-kpi-board',
  title: '模式/KpiBoard 指标板',
  component: KpiBoardDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '趋势卡、总览图与焦点卡。' } } },
} satisfies Meta<typeof KpiBoardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
