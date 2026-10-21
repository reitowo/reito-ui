import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { MiniTimeline, type MiniTimelineEvent } from '../../../../packages/ui/src/complex/mini-timeline.js';
import { MiniTimelineDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { choiceControl, rangeControl, textControl } from '../feature-controls.js';

const lanes = [
  { id: 'open', label: 'open' },
  { id: 'read', label: 'read' },
  { id: 'write', label: 'write' },
];
const events = (count: number): MiniTimelineEvent[] =>
  Array.from({ length: count }, (_, index) => {
    const lane = index % 9 === 0 ? 'open' : index % 7 === 3 ? 'write' : 'read';
    return { id: `e${index + 1}`, lane, label: `本地事件 ${index + 1}`, tone: lane === 'open' ? 'info' : index % 11 === 5 ? 'danger' : 'neutral' };
  });

const meta = {
  id: 'complex-mini-timeline',
  title: '复杂/MiniTimeline 迷你时间线',
  component: MiniTimeline,
  tags: ['autodocs'],
  args: { lanes, events: events(24) },
  parameters: {
    docs: {
      description: {
        component:
          '按通道排列的小刻度事件总览。整条时间线只有一个 Tab 停靠点，左右方向键与 Home/End 在事件间移动，Enter/Space 选择；颜色同时由可访问名称和 title 说明。',
      },
    },
  },
} satisfies Meta<typeof MiniTimeline>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = { count: number; value: string; label: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { count: 36, value: 'e36', label: '本地编辑轨迹' },
  argTypes: { count: rangeControl(4, 80), value: choiceControl(['', 'e1', 'e12', 'e36']), label: textControl },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return <MiniTimeline label={args.label} lanes={lanes} events={events(args.count)} markers={[{ index: 0, label: 'T1' }, { index: Math.floor(args.count / 2), label: 'T2' }]} value={args.value || null} onValueChange={(value) => updateArgs({ value })} />;
  },
};
export const Interactive: Story = {
  name: '交互 · 键盘选择',
  render: () => <MiniTimelineDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByRole('button', { pressed: true });
    selected.focus();
    await userEvent.keyboard('{Home}{Enter}');
    await expect(canvas.getByText(/当前事件：本地事件 1/)).toBeVisible();
  },
};
export const Empty: Story = { name: '无事件', args: { events: [] } };
