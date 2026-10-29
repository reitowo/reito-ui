import { useState } from 'react';
import { TraceWaterfall } from '@reito/ui/affect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TraceWaterfallDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-trace-waterfall',
  title: '模式/TraceWaterfall 轨迹瀑布',
  component: TraceWaterfallDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: {
    docs: { description: { component: '公开文档重建：耗时、费用与最慢调用。不是 Pro 源码移植。' } },
  },
} satisfies Meta<typeof TraceWaterfallDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };

function LiveTrace() {
  const [startedAt] = useState(() => Date.now() - 7000);
  return (
    <TraceWaterfall
      startedAt={startedAt}
      root={{ id: 'live-run', name: '运行中的轨迹', kind: 'agent', status: 'running', start: 0 }}
    />
  );
}
export const Live: Story = { name: '状态 · 运行中', render: () => <LiveTrace /> };
