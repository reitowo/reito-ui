import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { enGB, enUS, zhCN } from 'react-day-picker/locale';
import { Button, InputDate, formatLocalDate, parseLocalDate, type DateOrder } from '../../../../packages/ui/src/basic.js';
import { InputDateDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, choiceControl, textControl } from '../feature-controls.js';

const locales = { 'zh-CN': zhCN, 'en-US': enUS, 'en-GB': enGB } as const;

const meta = { id: "基础-inputdate",
  title: "基础/InputDate 日期输入",
  component: InputDate,
  tags: ['autodocs'],
  args: { label: '交付日期' },
  parameters: { docs: { description: { component: '紧凑的本地日历日输入。日期按 locale 顺序分段，提供范围与禁用日校验、键盘调整、清除、Calendar 联动和稳定的 YYYY-MM-DD 表单值。' } } },
} satisfies Meta<typeof InputDate>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  label: string;
  value: string;
  localeCode: keyof typeof locales;
  order: DateOrder | 'auto';
  min: string;
  max: string;
  clearable: boolean;
  calendarOpen: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  description: string;
  error: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { label: '交付日期', value: '2026-09-07', localeCode: 'zh-CN', order: 'auto', min: '2026-01-01', max: '2027-12-31', clearable: true, calendarOpen: false, disabled: false, readOnly: false, required: false, description: '按本地日历日保存，不附加时区。', error: '' },
  argTypes: { label: textControl, value: textControl, localeCode: choiceControl(['zh-CN', 'en-US', 'en-GB']), order: choiceControl(['auto', 'ymd', 'mdy', 'dmy']), min: textControl, max: textControl, clearable: booleanControl, calendarOpen: booleanControl, disabled: booleanControl, readOnly: booleanControl, required: booleanControl, description: textControl, error: textControl },
  parameters: { controls: { include: ['label', 'value', 'localeCode', 'order', 'min', 'max', 'clearable', 'calendarOpen', 'disabled', 'readOnly', 'required', 'description', 'error'] } },
  render: function Render(args) {
    const [, update] = useArgs<PlaygroundArgs>();
    return <div className="grid max-w-sm gap-[var(--rui-content-gap-sm)]"><InputDate label={args.label} value={parseLocalDate(args.value)} onValueChange={next => update({ value: formatLocalDate(next) })} locale={locales[args.localeCode]} order={args.order === 'auto' ? undefined : args.order} min={parseLocalDate(args.min) ?? undefined} max={parseLocalDate(args.max) ?? undefined} clearable={args.clearable} open={args.calendarOpen} onOpenChange={calendarOpen => update({ calendarOpen })} disabled={args.disabled} readOnly={args.readOnly} required={args.required} description={args.description} error={args.error || undefined} /><output className="font-mono text-xs text-muted-foreground">value={args.value || 'null'}</output></div>;
  },
};

export const Overview: Story = { name: "总览对比", render: () => <InputDateDemo /> };

function ControlledDate({ initial = new Date(2026, 8, 7), ...props }: { initial?: Date | null } & Omit<React.ComponentProps<typeof InputDate>, 'label' | 'value' | 'defaultValue' | 'onValueChange'>) {
  const [value, setValue] = useState<Date | null>(initial);
  const [committed, setCommitted] = useState(formatLocalDate(initial));
  return <div className="grid max-w-sm gap-[var(--rui-content-gap-sm)]"><InputDate {...props} label="交付日期" value={value} onValueChange={setValue} onValueCommit={next => setCommitted(formatLocalDate(next))} /><output className="font-mono text-xs text-muted-foreground">value={formatLocalDate(value) || 'null'} · committed={committed || 'null'}</output></div>;
}

export const LocalizedOrder: Story = { name: "Locale 顺序", render: () => <div className="grid max-w-sm gap-[var(--rui-content-gap)]"><ControlledDate locale={zhCN} /><ControlledDate locale={enUS} /><ControlledDate locale={enGB} /></div> };
export const Empty: Story = { name: "空值与必填", render: () => <ControlledDate initial={null} required /> };
export const Range: Story = { name: "日期范围", render: () => <ControlledDate min={new Date(2026, 8, 1)} max={new Date(2026, 8, 30)} description="仅可选择 2026 年 9 月。" /> };
export const DisabledDates: Story = { name: "禁用日期", render: () => <ControlledDate isDateDisabled={date => date.getDay() === 0 || date.getDay() === 6} description="周末不可选择。" /> };
export const InvalidDraft: Story = { name: "无效日期与恢复", render: () => <ControlledDate /> };
export const KeyboardSegments: Story = { name: "键盘分段调整", render: () => <ControlledDate description="左右切换分段；上下增减；Home/End 定位；Escape 恢复。" /> };
export const CalendarSync: Story = { name: "日历联动", render: () => <ControlledDate defaultOpen /> };
export const Clearable: Story = { name: "清除日期", render: () => <ControlledDate clearable /> };
export const ReadOnly: Story = { name: "状态 · 只读", render: () => <ControlledDate readOnly description="保留可读取的分段值，隐藏操作入口。" /> };
export const Disabled: Story = { name: "状态 · 禁用", render: () => <ControlledDate disabled /> };
export const FieldError: Story = { name: "字段错误", render: () => <ControlledDate error="交付日期与当前迭代冲突。" /> };
export const ControlledCommit: Story = { name: "受控提交事件", render: () => <ControlledDate /> };
export const NativeForm: Story = { name: "原生表单值", render: function Render() {
  const [value, setValue] = useState<Date | null>(new Date(2026, 8, 7));
  const [submitted, setSubmitted] = useState('');
  return <form className="grid max-w-sm gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get('delivery') ?? '')); }}><InputDate label="交付日期" name="delivery" value={value} onValueChange={setValue} required /><Button type="submit" variant="outline">读取表单</Button><output className="font-mono text-xs text-muted-foreground">form={submitted}</output></form>;
} };
