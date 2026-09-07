import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rating } from '../../../../packages/ui/src/basic.js';

const meta = {
  title: '基础/Rating',
  component: Rating,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '紧凑评分输入，支持受控/非受控值、整数/半星/四分之一精度、清除、悬停预览、级数、尺寸、语义色、只读/禁用、错误和原生单选键盘模型。' } } },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '参数调试',
  args: { label: '本次回答质量', value: 3.5, max: 5, step: 0.5, size: 'default', tone: 'warning', allowClear: true, hoverable: true, readOnly: false, disabled: false, required: false, description: '选择 1–5 星；方向键移动，空格确认。', error: '' },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'number' },
    max: { control: { type: 'range', min: 3, max: 10, step: 1 } },
    step: { control: 'inline-radio', options: [1, 0.5, 0.25] },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    tone: { control: 'select', options: ['default', 'warning', 'success', 'danger'] },
    allowClear: { control: 'boolean' }, hoverable: { control: 'boolean' }, readOnly: { control: 'boolean' }, disabled: { control: 'boolean' }, required: { control: 'boolean' }, description: { control: 'text' }, error: { control: 'text' },
  },
  parameters: { controls: { include: ['label', 'value', 'max', 'step', 'size', 'tone', 'allowClear', 'hoverable', 'readOnly', 'disabled', 'required', 'description', 'error'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <Rating {...args} onValueChange={value => updateArgs({ value })} className="max-w-sm" />; },
};

function InteractiveRating({ defaultValue = 3, step = 1 }: { defaultValue?: number | null; step?: 1 | 0.5 | 0.25 }) {
  const [value, setValue] = useState<number | null>(defaultValue);
  return <div className="grid max-w-sm gap-[var(--rui-content-gap-sm)]"><Rating label="本次回答质量" value={value} onValueChange={setValue} step={step} description="方向键移动，空格选择。" /><output data-testid="rating-value">value={value ?? 'null'}</output></div>;
}

export const Default: Story = { name: '交互评分', args: { label: '', value: null }, render: () => <InteractiveRating /> };
export const Empty: Story = { name: '未评分', args: { label: '本次回答质量', defaultValue: null, emptyLabel: '等待评分', className: 'max-w-sm' } };
export const HalfStep: Story = { name: '半星精度', args: { label: '', value: null }, render: () => <InteractiveRating defaultValue={2.5} step={0.5} /> };
export const QuarterStep: Story = { name: '四分之一精度', args: { label: '模型输出质量', defaultValue: 3.75, step: 0.25, className: 'max-w-sm' } };
export const TenLevels: Story = { name: '十级评分', args: { label: '可用性评分', defaultValue: 8, max: 10, tone: 'success', className: 'max-w-lg' } };
export const Required: Story = { name: '必填且不可清除', args: { label: '发布前评分', defaultValue: 4, required: true, description: '必填评分不显示清除按钮。', className: 'max-w-sm' } };
export const ReadOnly: Story = { name: '只读展示', args: { label: '平均评分', value: 4.5, step: 0.5, readOnly: true, valueLabel: '4.5 / 5（128 次）', className: 'max-w-sm' } };
export const Disabled: Story = { name: '禁用', args: { label: '历史评分', value: 3, disabled: true, className: 'max-w-sm' } };
export const Invalid: Story = { name: '错误反馈', args: { label: '本次回答质量', value: null, required: true, error: '请选择评分后再提交。', className: 'max-w-sm' } };
export const WithoutHover: Story = { name: '关闭悬停预览', args: { label: '稳定度', defaultValue: 3, hoverable: false, className: 'max-w-sm' } };
export const WithoutClear: Story = { name: '关闭清除', args: { label: '推荐度', defaultValue: 4, allowClear: false, className: 'max-w-sm' } };
export const CustomIcon: Story = { name: '自定义内容', args: { label: '会话感受', defaultValue: 4, tone: 'success', renderIcon: ({ filled }) => <span className="flex size-full items-center justify-center text-sm">{filled ? '●' : '○'}</span>, className: 'max-w-sm' } };
export const Sizes: Story = { name: '尺寸对比', args: { label: '', value: null }, render: () => <div className="grid gap-[var(--rui-content-gap)]"><Rating label="小尺寸" value={3} size="sm" readOnly /><Rating label="默认尺寸" value={3} readOnly /><Rating label="大尺寸" value={3} size="lg" readOnly /></div> };
export const Tones: Story = { name: '语义色对比', args: { label: '', value: null }, render: () => <div className="grid gap-[var(--rui-content-gap)] sm:grid-cols-2"><Rating label="默认" value={4} tone="default" readOnly /><Rating label="提醒" value={4} tone="warning" readOnly /><Rating label="通过" value={4} tone="success" readOnly /><Rating label="风险" value={2} tone="danger" readOnly /></div> };
export const NativeForm: Story = { name: '原生表单值', args: { label: '', value: null }, render: () => { const [result, setResult] = useState('尚未提交'); return <form className="grid max-w-sm gap-[var(--rui-content-gap-sm)]" onSubmit={event => { event.preventDefault(); setResult(String(new FormData(event.currentTarget).get('quality'))); }}><Rating label="回答质量" name="quality" defaultValue={3.5} step={0.5} /><button type="submit" className="w-fit text-sm underline underline-offset-4">读取 FormData</button><output data-testid="form-value">{result}</output></form>; } };
