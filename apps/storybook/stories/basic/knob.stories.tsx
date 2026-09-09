import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Knob } from '../../../../packages/ui/src/basic.js';

const meta = { id: "基础-knob",
  title: "基础/Knob 旋钮",
  component: Knob,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '紧凑圆形单值输入。支持环形指针拖动、受控/非受控值、min/max/step、键盘、三档尺寸与线宽、语义色、只读/禁用、错误和原生表单值。范围或精确文本编辑分别使用 Slider / NumberField。' } } },
} satisfies Meta<typeof Knob>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: "参数调试",
  args: { label: '上下文预算', value: 62, min: 0, max: 100, step: 1, size: 'default', stroke: 'default', tone: 'accent', showRange: true, readOnly: false, disabled: false, description: '环形拖动或使用方向键调整。', error: '' },
  argTypes: {
    label: { control: 'text' }, value: { control: 'number' }, min: { control: 'number' }, max: { control: 'number' }, step: { control: { type: 'number', min: 0.1 } },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] }, stroke: { control: 'inline-radio', options: ['thin', 'default', 'thick'] }, tone: { control: 'select', options: ['default', 'accent', 'success', 'warning', 'danger'] },
    showRange: { control: 'boolean' }, readOnly: { control: 'boolean' }, disabled: { control: 'boolean' }, description: { control: 'text' }, error: { control: 'text' },
  },
  parameters: { controls: { include: ['label', 'value', 'min', 'max', 'step', 'size', 'stroke', 'tone', 'showRange', 'readOnly', 'disabled', 'description', 'error'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <Knob {...args} onValueChange={value => updateArgs({ value })} className="max-w-48" />; },
};

function InteractiveKnob() {
  const [value, setValue] = useState(50);
  const [committed, setCommitted] = useState(50);
  return <div className="grid w-fit gap-[var(--rui-content-gap-sm)]"><Knob label="上下文预算" value={value} onValueChange={setValue} onValueCommitted={setCommitted} tone="accent" formatValue={current => `${current}%`} showRange description="环形拖动或使用方向键调整。" /><output data-testid="knob-value">value={value}; committed={committed}</output></div>;
}

export const Default: Story = { name: "交互旋钮", args: { label: '', value: 0 }, render: () => <InteractiveKnob /> };
export const MinMax: Story = { name: "自定义范围", args: { label: '均衡器', defaultValue: 0, min: -12, max: 12, step: 1, showRange: true, formatValue: value => `${value > 0 ? '+' : ''}${value} dB` } };
export const FineStep: Story = { name: "小数步进", args: { label: '播放速度', defaultValue: 1.25, min: 0.5, max: 2, step: 0.25, formatValue: value => `${value}×`, showRange: true } };
export const Temperature: Story = { name: "温度读数", args: { label: '模型温度', defaultValue: 0.7, min: 0, max: 2, step: 0.1, tone: 'warning', formatValue: value => value.toFixed(1), valueText: value => `温度 ${value.toFixed(1)}`, showRange: true } };
export const ReadOnly: Story = { name: "状态 · 只读", args: { label: 'CPU 使用率', value: 43, readOnly: true, tone: 'success', formatValue: value => `${value}%`, description: '只读监测可保留相同视觉。' } };
export const Disabled: Story = { name: "状态 · 禁用", args: { label: '已锁定配额', value: 35, disabled: true, formatValue: value => `${value}%` } };
export const Invalid: Story = { name: "错误反馈", args: { label: '上下文预算', value: 96, tone: 'danger', error: '当前值超过建议预算。', formatValue: value => `${value}%` } };
export const WithoutRange: Story = { name: "隐藏范围文字", args: { label: '音量', defaultValue: 68, showRange: false, formatValue: value => `${value}%` } };
export const Small: Story = { name: "小尺寸", args: { label: '缩放', defaultValue: 75, size: 'sm', formatValue: value => `${value}%` } };
export const Large: Story = { name: "大尺寸", args: { label: '缩放', defaultValue: 75, size: 'lg', formatValue: value => `${value}%` } };
export const ThinStroke: Story = { name: "细轨道", args: { label: '完成度', defaultValue: 75, stroke: 'thin', tone: 'success', formatValue: value => `${value}%` } };
export const ThickStroke: Story = { name: "粗轨道", args: { label: '完成度', defaultValue: 75, stroke: 'thick', tone: 'success', formatValue: value => `${value}%` } };
export const Sizes: Story = { name: "尺寸对比", args: { label: '', value: 0 }, render: () => <div className="flex flex-wrap items-end gap-[var(--rui-content-gap)]"><Knob label="小" value={35} size="sm" readOnly /><Knob label="默认" value={55} readOnly /><Knob label="大" value={75} size="lg" readOnly /></div> };
export const Tones: Story = { name: "语义色对比", args: { label: '', value: 0 }, render: () => <div className="flex flex-wrap gap-[var(--rui-content-gap)]"><Knob label="默认" value={60} readOnly /><Knob label="重点" value={60} tone="accent" readOnly /><Knob label="通过" value={60} tone="success" readOnly /><Knob label="提醒" value={60} tone="warning" readOnly /><Knob label="风险" value={60} tone="danger" readOnly /></div> };
export const NativeForm: Story = { name: "原生表单值", args: { label: '', value: 0 }, render: () => { const [result, setResult] = useState('尚未提交'); return <form className="grid w-fit gap-[var(--rui-content-gap-sm)]" onSubmit={event => { event.preventDefault(); setResult(String(new FormData(event.currentTarget).get('volume'))); }}><Knob label="音量" name="volume" defaultValue={65} formatValue={value => `${value}%`} /><button type="submit" className="w-fit text-sm underline underline-offset-4">读取 FormData</button><output data-testid="form-value">{result}</output></form>; } };

