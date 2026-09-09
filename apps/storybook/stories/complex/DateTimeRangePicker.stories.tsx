import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { enUS, zhCN } from 'react-day-picker/locale';
import { Button, formatLocalDateTime, parseLocalDateTime, type LocalDateTimeValue, type TimePrecision } from '../../../../packages/ui/src/basic.js';
import {
  DateTimeRangePicker,
  serializeDateTimeRange,
  type DateTimeRangePickerProps,
  type DateTimeRangeValue,
} from '../../../../packages/ui/src/complex/index.js';
import { DateTimeRangePickerDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, choiceControl, rangeControl, textControl } from '../feature-controls.js';

const locales = { 'zh-CN': zhCN, 'en-US': enUS } as const;
const local = (text: string) => parseLocalDateTime(text);
const initial: DateTimeRangeValue = { start: local('2026-09-07T17:30'), end: local('2026-09-08T09:30') };
const minimum = local('2026-09-07T16:00') as LocalDateTimeValue;
const maximum = local('2026-09-08T10:00') as LocalDateTimeValue;

const meta = { id: "复杂-datetimerangepicker-日期时间范围",
  title: "复杂/DateTimeRangePicker 日期时间范围",
  component: DateTimeRangePicker,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '组合两个本地 DateTimePicker。校验跨日顺序与全局上下限；IANA 时区只作为显式元数据进入稳定 JSON，不在组件内转换 UTC 瞬时值。' } } },
} satisfies Meta<typeof DateTimeRangePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  start: string;
  end: string;
  label: string;
  localeCode: keyof typeof locales;
  hourCycle: 12 | 24;
  precision: TimePrecision;
  minuteStep: number;
  secondStep: number;
  timeZone: string;
  bounded: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  description: string;
  error: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { start: '2026-09-07T17:30', end: '2026-09-08T09:30', label: '执行窗口', localeCode: 'zh-CN', hourCycle: 24, precision: 'minute', minuteStep: 5, secondStep: 1, timeZone: 'Asia/Shanghai', bounded: true, disabled: false, readOnly: false, required: false, description: '本地墙上时间与时区标识分开提交。', error: '' },
  argTypes: { start: textControl, end: textControl, label: textControl, localeCode: choiceControl(['zh-CN', 'en-US']), hourCycle: choiceControl([12, 24]), precision: choiceControl(['minute', 'second']), minuteStep: rangeControl(1, 60, 1), secondStep: rangeControl(1, 60, 1), timeZone: textControl, bounded: booleanControl, disabled: booleanControl, readOnly: booleanControl, required: booleanControl, description: textControl, error: textControl },
  parameters: { controls: { include: ['start', 'end', 'label', 'localeCode', 'hourCycle', 'precision', 'minuteStep', 'secondStep', 'timeZone', 'bounded', 'disabled', 'readOnly', 'required', 'description', 'error'] } },
  render: function Render(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    const value = { start: local(args.start), end: local(args.end) };
    const timeZone = args.timeZone || undefined;
    return <div className="grid gap-[var(--rui-content-gap-sm)]"><DateTimeRangePicker value={value} onValueChange={next => updateArgs({ start: formatLocalDateTime(next.start, args.precision), end: formatLocalDateTime(next.end, args.precision) })} label={args.label} locale={locales[args.localeCode]} hourCycle={args.hourCycle} precision={args.precision} minuteStep={args.minuteStep} secondStep={args.secondStep} timeZone={timeZone} min={args.bounded ? minimum : undefined} max={args.bounded ? maximum : undefined} disabled={args.disabled} readOnly={args.readOnly} required={args.required} description={args.description} error={args.error || undefined} /><output className="break-all font-mono text-xs text-muted-foreground">value={serializeDateTimeRange(value, { precision: args.precision, min: args.bounded ? minimum : undefined, max: args.bounded ? maximum : undefined, timeZone }) || 'invalid'}</output></div>;
  },
};

export const Overview: Story = { name: "总览对比", render: () => <DateTimeRangePickerDemo /> };

function ControlledRange({ initialValue = initial, ...props }: { initialValue?: DateTimeRangeValue } & Omit<DateTimeRangePickerProps, 'value' | 'defaultValue' | 'onValueChange'>) {
  const [value, setValue] = useState(initialValue);
  const [committed, setCommitted] = useState(serializeDateTimeRange(initialValue, { precision: props.precision, min: props.min, max: props.max, timeZone: props.timeZone }));
  return <div className="grid gap-[var(--rui-content-gap-sm)]"><DateTimeRangePicker {...props} value={value} onValueChange={setValue} onValueCommit={next => setCommitted(serializeDateTimeRange(next, { precision: props.precision, min: props.min, max: props.max, timeZone: props.timeZone }))} /><output data-testid="range-value" className="break-all font-mono text-xs text-muted-foreground">value={serializeDateTimeRange(value, { precision: props.precision, min: props.min, max: props.max, timeZone: props.timeZone }) || 'invalid'} · committed={committed || 'none'}</output></div>;
}

export const CrossDay: Story = { name: "跨日范围", render: () => <ControlledRange label="执行窗口" min={minimum} max={maximum} minuteStep={5} /> };
export const SameDay: Story = { name: "同日范围", render: () => <ControlledRange initialValue={{ start: local('2026-09-07T16:30'), end: local('2026-09-07T18:00') }} /> };
export const Inverted: Story = { name: "倒置范围", render: () => <ControlledRange initialValue={{ start: local('2026-09-08T09:30'), end: local('2026-09-07T17:30') }} /> };
export const Bounded: Story = { name: "全局上下限", render: () => <ControlledRange min={minimum} max={maximum} description="允许 9 月 7 日 16:00 至 9 月 8 日 10:00。" /> };
export const WithSeconds: Story = { name: "秒精度", render: () => <ControlledRange initialValue={{ start: local('2026-09-07T17:30:15'), end: local('2026-09-07T17:31:45') }} precision="second" secondStep={5} /> };
export const TwelveHour: Story = { name: "12 小时显示", render: () => <ControlledRange hourCycle={12} /> };
export const TimeZoneMetadata: Story = { name: "IANA 时区元数据", render: () => <ControlledRange timeZone="Asia/Shanghai" description="时区随本地起止值提交；宿主负责将墙上时间解析为业务瞬时值。" /> };
export const InvalidTimeZone: Story = { name: "无效时区", render: () => <ControlledRange timeZone="Mars/Olympus" /> };
export const Partial: Story = { name: "未完整范围", render: () => <ControlledRange initialValue={{ start: initial.start, end: null }} /> };
export const Required: Story = { name: "必填空值", render: () => <ControlledRange initialValue={{ start: null, end: null }} required /> };
export const ReadOnly: Story = { name: "状态 · 只读", render: () => <ControlledRange readOnly /> };
export const Disabled: Story = { name: "状态 · 禁用", render: () => <ControlledRange disabled /> };
export const FieldError: Story = { name: "业务错误", render: () => <ControlledRange error="执行窗口与维护期冲突。" /> };
export const NativeForm: Story = { name: "稳定原生表单值", render: function Render() {
  const [value, setValue] = useState(initial);
  const [submitted, setSubmitted] = useState('');
  return <form className="grid gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get('window') ?? '')); }}><DateTimeRangePicker name="window" value={value} onValueChange={setValue} precision="second" timeZone="Asia/Shanghai" required /><Button type="submit" variant="outline">读取表单</Button><output data-testid="form-value" className="break-all font-mono text-xs text-muted-foreground">form={submitted}</output></form>;
} };
