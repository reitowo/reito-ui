import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { enUS, zhCN } from 'react-day-picker/locale';
import { Button, DateTimePicker, formatLocalDateTime, parseLocalDateTime, type LocalDateTimeValue, type TimePrecision } from '../../../../packages/ui/src/basic.js';
import { DateTimePickerDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, choiceControl, rangeControl, textControl } from '../feature-controls.js';

const locales = { 'zh-CN': zhCN, 'en-US': enUS } as const;
const meta = {
  title: '基础/DateTimePicker',
  component: DateTimePicker,
  tags: ['autodocs'],
  args: { label: '计划执行时间' },
  parameters: { docs: { description: { component: '组合 InputDate 与 InputTime 的本地日期时间字段。它处理完整值、跨日上下限与无时区序列化；date-only、time-only 和带时区瞬时值使用各自边界。' } } },
} satisfies Meta<typeof DateTimePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = { label: string; value: string; localeCode: keyof typeof locales; hourCycle: 12 | 24; precision: TimePrecision; minuteStep: number; min: string; max: string; disabled: boolean; readOnly: boolean; required: boolean; description: string; error: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { label: '计划执行时间', value: '2026-09-07T17:30', localeCode: 'zh-CN', hourCycle: 24, precision: 'minute', minuteStep: 5, min: '2026-09-07T16:00', max: '2026-09-08T10:00', disabled: false, readOnly: false, required: false, description: '本地日期时间，不附加 Z 或时区 offset。', error: '' },
  argTypes: { label: textControl, value: textControl, localeCode: choiceControl(['zh-CN', 'en-US']), hourCycle: choiceControl([12, 24]), precision: choiceControl(['minute', 'second']), minuteStep: rangeControl(1, 60, 1), min: textControl, max: textControl, disabled: booleanControl, readOnly: booleanControl, required: booleanControl, description: textControl, error: textControl },
  parameters: { controls: { include: ['label', 'value', 'localeCode', 'hourCycle', 'precision', 'minuteStep', 'min', 'max', 'disabled', 'readOnly', 'required', 'description', 'error'] } },
  render: function Render(args) {
    const [, update] = useArgs<PlaygroundArgs>();
    return <div className="grid max-w-xl gap-[var(--rui-content-gap-sm)]"><DateTimePicker label={args.label} value={parseLocalDateTime(args.value)} onValueChange={next => update({ value: formatLocalDateTime(next, args.precision) })} locale={locales[args.localeCode]} hourCycle={args.hourCycle} precision={args.precision} minuteStep={args.minuteStep} min={parseLocalDateTime(args.min) ?? undefined} max={parseLocalDateTime(args.max) ?? undefined} disabled={args.disabled} readOnly={args.readOnly} required={args.required} description={args.description} error={args.error || undefined} /><output className="font-mono text-xs text-muted-foreground">value={args.value || 'null'}</output></div>;
  },
};

export const Overview: Story = { name: '总览', render: () => <DateTimePickerDemo /> };
const initial: LocalDateTimeValue = { date: new Date(2026, 8, 7), time: { hour: 17, minute: 30, second: 0 } };
function ControlledDateTime({ initialValue = initial, ...props }: { initialValue?: LocalDateTimeValue | null } & Omit<React.ComponentProps<typeof DateTimePicker>, 'label' | 'value' | 'defaultValue' | 'onValueChange'>) {
  const [value, setValue] = useState<LocalDateTimeValue | null>(initialValue);
  const [committed, setCommitted] = useState(formatLocalDateTime(initialValue, props.precision));
  return <div className="grid max-w-xl gap-[var(--rui-content-gap-sm)]"><DateTimePicker {...props} label="计划执行时间" value={value} onValueChange={setValue} onValueCommit={next => setCommitted(formatLocalDateTime(next, props.precision))} /><output className="font-mono text-xs text-muted-foreground">value={formatLocalDateTime(value, props.precision) || 'null'} · committed={committed || 'null'}</output></div>;
}

export const LocalDateTime: Story = { name: '本地日期时间', render: () => <ControlledDateTime /> };
export const WithSeconds: Story = { name: '秒精度', render: () => <ControlledDateTime initialValue={{ date: new Date(2026, 8, 7), time: { hour: 17, minute: 30, second: 15 } }} precision="second" /> };
export const TwelveHour: Story = { name: '12 小时显示', render: () => <ControlledDateTime hourCycle={12} /> };
export const CrossDayRange: Story = { name: '跨日范围', render: () => <ControlledDateTime min={{ date: new Date(2026, 8, 7), time: { hour: 16, minute: 0 } }} max={{ date: new Date(2026, 8, 8), time: { hour: 10, minute: 0 } }} description="允许 9 月 7 日 16:00 至 9 月 8 日 10:00。" /> };
export const SameDayRange: Story = { name: '同日范围', render: () => <ControlledDateTime min={{ date: new Date(2026, 8, 7), time: { hour: 16, minute: 0 } }} max={{ date: new Date(2026, 8, 7), time: { hour: 18, minute: 0 } }} /> };
export const Empty: Story = { name: '空值与逐步填写', render: () => <ControlledDateTime initialValue={null} /> };
export const DisabledDate: Story = { name: '禁用日期', render: () => <ControlledDateTime isDateDisabled={date => date.getDay() === 0 || date.getDay() === 6} /> };
export const Required: Story = { name: '必填', render: () => <ControlledDateTime initialValue={null} required /> };
export const ReadOnly: Story = { name: '只读', render: () => <ControlledDateTime readOnly /> };
export const Disabled: Story = { name: '禁用', render: () => <ControlledDateTime disabled /> };
export const FieldError: Story = { name: '字段错误', render: () => <ControlledDateTime error="执行时间与维护窗口冲突。" /> };
export const NativeForm: Story = { name: '原生表单值', render: function Render() {
  const [value, setValue] = useState<LocalDateTimeValue | null>(initial);
  const [submitted, setSubmitted] = useState('');
  return <form className="grid max-w-xl gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get('schedule') ?? '')); }}><DateTimePicker label="计划执行时间" name="schedule" value={value} onValueChange={setValue} minuteStep={5} required /><Button type="submit" variant="outline">读取表单</Button><output className="font-mono text-xs text-muted-foreground">form={submitted}</output></form>;
} };
export const TimezoneBoundary: Story = { name: '时区边界说明', render: () => <ControlledDateTime description="该值是墙上时间。需要 UTC 或 IANA 时区时，由宿主在提交边界显式转换。" /> };
