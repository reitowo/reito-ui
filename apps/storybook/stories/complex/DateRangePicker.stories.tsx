import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, recipeControl } from '../feature-controls.js';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import { DateRangePicker, type DateRangePickerProps } from '../../../../packages/ui/src/complex/index.js';
import { DateRangePickerDemo } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { title: '复杂/DateRangePicker 日期范围', component: DateRangePickerDemo, parameters: { docs: { description: { component: '基于官方 Calendar 与 Popover，受控值在“应用范围”时提交。“取消”与 Escape 丢弃草稿，支持清除及日期上下界。' } } } } satisfies Meta<typeof DateRangePickerDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  name: '交互场景：校验、应用与取消',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /^日期范围：/ }));
    await fireEvent.change(body.getByLabelText('开始日期'), { target: { value: '2026-09-10' } });
    expect(body.getByRole('alert')).toHaveTextContent('结束日期不能早于开始日期');
    expect(body.getByRole('button', { name: '应用范围' })).toBeDisabled();
    await fireEvent.change(body.getByLabelText('结束日期'), { target: { value: '2026-09-20' } });
    await userEvent.click(body.getByRole('button', { name: '应用范围' }));
    expect(canvas.getByRole('status')).toHaveTextContent('已应用 9 月 10 日至 9 月 20 日');
    await userEvent.click(canvas.getByRole('button', { name: /^日期范围：/ }));
    await fireEvent.change(body.getByLabelText('开始日期'), { target: { value: '2026-09-12' } });
    await userEvent.click(body.getByRole('button', { name: '取消' }));
    expect(canvas.getByRole('status')).toHaveTextContent('已应用 9 月 10 日至 9 月 20 日');
  },
};
export const Disabled: Story = { name: '禁用', render: () => <DateRangePicker value={undefined} onValueChange={() => {}} disabled /> };

function RangeExample({ initial, bounded = false }: { initial?: DateRangePickerProps['value']; bounded?: boolean }) {
  const [range, setRange] = useState(initial);
  return <DateRangePicker value={range} onValueChange={setRange} minDate={bounded ? new Date(2026, 8, 1) : undefined} maxDate={bounded ? new Date(2026, 8, 30) : undefined} />;
}
export const Default: Story = { name: '已选择日期范围', render: () => <RangeExample initial={{ from: new Date(2026, 8, 1), to: new Date(2026, 8, 7) }} /> };
export const Unselected: Story = { name: '未选择日期范围', render: () => <RangeExample /> };
export const Bounded: Story = { name: '限制可选日期', render: () => <RangeExample initial={{ from: new Date(2026, 8, 1), to: new Date(2026, 8, 7) }} bounded /> };

type PlaygroundArgs = { from: string; to: string; label: string; disabled: boolean; bounded: boolean };
function playgroundDate(value: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined; const [year, month, day] = value.split('-').map(Number); const date = new Date(year, month - 1, day); return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined; }
function playgroundDateText(value?: Date) { return value ? [value.getFullYear(), String(value.getMonth() + 1).padStart(2, '0'), String(value.getDate()).padStart(2, '0')].join('-') : ''; }
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { from: '2026-09-01', to: '2026-09-07', label: '日期范围', disabled: false, bounded: false },
 argTypes: { from: recipeControl(textControl, 'value.from，输入 YYYY-MM-DD；无效日期视为空值。'), to: recipeControl(textControl, 'value.to，输入 YYYY-MM-DD；无效日期视为空值。'), label: textControl, disabled: booleanControl, bounded: recipeControl(booleanControl, '提供 2026-09-01 至 2026-09-30 的 minDate/maxDate。') },
 parameters: { controls: { include: ['from', 'to', 'disabled', 'bounded', 'label'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); const from = playgroundDate(args.from); const to = playgroundDate(args.to); return <DateRangePicker value={from ? { from, to } : undefined} onValueChange={value => updateArgs({ from: playgroundDateText(value?.from), to: playgroundDateText(value?.to) })} disabled={args.disabled} label={args.label} minDate={args.bounded ? new Date(2026, 8, 1) : undefined} maxDate={args.bounded ? new Date(2026, 8, 30) : undefined} />; },
};
