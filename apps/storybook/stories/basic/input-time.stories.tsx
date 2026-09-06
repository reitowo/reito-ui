import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, InputTime, formatTimeValue, parseTimeValue, type TimePrecision, type TimeValue } from '../../../../packages/ui/src/basic.js';
import { InputTimeDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, choiceControl, rangeControl, textControl } from '../feature-controls.js';

const meta = {
  title: '基础/InputTime',
  component: InputTime,
  tags: ['autodocs'],
  args: { label: '提醒时间' },
  parameters: { docs: { description: { component: '不携带日期的分段时间输入，支持 12/24 小时制、分钟/秒精度、步进、范围、键盘调整与稳定表单值。' } } },
} satisfies Meta<typeof InputTime>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = { label: string; value: string; hourCycle: 12 | 24; precision: TimePrecision; minuteStep: number; secondStep: number; min: string; max: string; clearable: boolean; disabled: boolean; readOnly: boolean; required: boolean; description: string; error: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { label: '提醒时间', value: '09:30', hourCycle: 24, precision: 'minute', minuteStep: 5, secondStep: 1, min: '08:00', max: '18:00', clearable: true, disabled: false, readOnly: false, required: false, description: '值只表示一天内的时间，不附加日期或时区。', error: '' },
  argTypes: { label: textControl, value: textControl, hourCycle: choiceControl([12, 24]), precision: choiceControl(['minute', 'second']), minuteStep: rangeControl(1, 60, 1), secondStep: rangeControl(1, 60, 1), min: textControl, max: textControl, clearable: booleanControl, disabled: booleanControl, readOnly: booleanControl, required: booleanControl, description: textControl, error: textControl },
  parameters: { controls: { include: ['label', 'value', 'hourCycle', 'precision', 'minuteStep', 'secondStep', 'min', 'max', 'clearable', 'disabled', 'readOnly', 'required', 'description', 'error'] } },
  render: function Render(args) {
    const [, update] = useArgs<PlaygroundArgs>();
    return <div className="grid max-w-sm gap-[var(--rui-content-gap-sm)]"><InputTime label={args.label} value={parseTimeValue(args.value)} onValueChange={next => update({ value: formatTimeValue(next, args.precision) })} hourCycle={args.hourCycle} precision={args.precision} minuteStep={args.minuteStep} secondStep={args.secondStep} min={parseTimeValue(args.min) ?? undefined} max={parseTimeValue(args.max) ?? undefined} clearable={args.clearable} disabled={args.disabled} readOnly={args.readOnly} required={args.required} description={args.description} error={args.error || undefined} /><output className="font-mono text-xs text-muted-foreground">value={args.value || 'null'}</output></div>;
  },
};

export const Overview: Story = { name: '总览', render: () => <InputTimeDemo /> };

function ControlledTime({ initial = { hour: 9, minute: 30, second: 0 }, ...props }: { initial?: TimeValue | null } & Omit<React.ComponentProps<typeof InputTime>, 'label' | 'value' | 'defaultValue' | 'onValueChange'>) {
  const [value, setValue] = useState<TimeValue | null>(initial);
  const [committed, setCommitted] = useState(formatTimeValue(initial, props.precision));
  return <div className="grid max-w-sm gap-[var(--rui-content-gap-sm)]"><InputTime {...props} label="提醒时间" value={value} onValueChange={setValue} onValueCommit={next => setCommitted(formatTimeValue(next, props.precision))} /><output className="font-mono text-xs text-muted-foreground">value={formatTimeValue(value, props.precision) || 'null'} · committed={committed || 'null'}</output></div>;
}

export const TwentyFourHour: Story = { name: '24 小时制', render: () => <ControlledTime /> };
export const TwelveHour: Story = { name: '12 小时制', render: () => <ControlledTime initial={{ hour: 15, minute: 30 }} hourCycle={12} /> };
export const WithSeconds: Story = { name: '秒精度', render: () => <ControlledTime initial={{ hour: 9, minute: 30, second: 15 }} precision="second" /> };
export const Stepped: Story = { name: '分钟与秒步进', render: () => <ControlledTime initial={{ hour: 9, minute: 30, second: 20 }} precision="second" minuteStep={5} secondStep={10} /> };
export const Range: Story = { name: '时间范围', render: () => <ControlledTime min={{ hour: 8, minute: 30 }} max={{ hour: 18, minute: 0 }} description="允许 08:30–18:00。" /> };
export const InvalidDraft: Story = { name: '无效时间与恢复', render: () => <ControlledTime minuteStep={5} /> };
export const KeyboardSegments: Story = { name: '键盘分段调整', render: () => <ControlledTime minuteStep={5} description="左右切换分段；上下按步进调整；Home/End 定位；Escape 恢复。" /> };
export const Empty: Story = { name: '空值与必填', render: () => <ControlledTime initial={null} required /> };
export const Clearable: Story = { name: '清除时间', render: () => <ControlledTime /> };
export const ReadOnly: Story = { name: '只读', render: () => <ControlledTime readOnly /> };
export const Disabled: Story = { name: '禁用', render: () => <ControlledTime disabled /> };
export const FieldError: Story = { name: '字段错误', render: () => <ControlledTime error="提醒时间与免打扰时段冲突。" /> };
export const NativeForm: Story = { name: '原生表单值', render: function Render() {
  const [value, setValue] = useState<TimeValue | null>({ hour: 9, minute: 30, second: 15 });
  const [submitted, setSubmitted] = useState('');
  return <form className="grid max-w-sm gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get('reminder') ?? '')); }}><InputTime label="提醒时间" name="reminder" value={value} onValueChange={setValue} precision="second" required /><Button type="submit" variant="outline">读取表单</Button><output className="font-mono text-xs text-muted-foreground">form={submitted}</output></form>;
} };
