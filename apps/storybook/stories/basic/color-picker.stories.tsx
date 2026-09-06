import { useState, type ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, ColorInput, ColorPicker, type ColorFormat } from '../../../../packages/ui/src/basic.js';
import { ColorPickerDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, choiceControl, textControl } from '../feature-controls.js';

const presets = ['#4F7DFF', '#29A36A', '#C58A21', '#B64655', '#8A63D2'];

const meta = {
  title: '基础/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  args: { label: '界面强调色' },
  parameters: { docs: { description: { component: '紧凑颜色字段，提供可提交的 HEX/RGB/HSL 文本、弹出或内联色板、透明度、RGB 通道、预设颜色与键盘调整。组件外观由 Graphite tokens 管理；实际颜色值属于表单数据。' } } },
} satisfies Meta<typeof ColorPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = { label: string; value: string; format: ColorFormat; allowAlpha: boolean; inline: boolean; showChannels: boolean; disabled: boolean; readOnly: boolean; description: string; error: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { label: '界面强调色', value: '#4F7DFFFF', format: 'hex', allowAlpha: true, inline: false, showChannels: true, disabled: false, readOnly: false, description: '值保存在当前 Story；不会写入系统主题。', error: '' },
  argTypes: { label: textControl, value: { control: 'color' }, format: choiceControl(['hex', 'rgb', 'hsl']), allowAlpha: booleanControl, inline: booleanControl, showChannels: booleanControl, disabled: booleanControl, readOnly: booleanControl, description: textControl, error: textControl },
  parameters: { controls: { include: ['label', 'value', 'format', 'allowAlpha', 'inline', 'showChannels', 'disabled', 'readOnly', 'description', 'error'] } },
  render: function Render(args) {
    const [, update] = useArgs<PlaygroundArgs>();
    return <div className="grid max-w-md gap-[var(--rui-content-gap-sm)]"><ColorPicker {...args} error={args.error || undefined} presets={presets} onValueChange={value => update({ value })} /><output className="font-mono text-xs text-muted-foreground">value={args.value}</output></div>;
  },
};

export const Overview: Story = { name: '总览', render: () => <ColorPickerDemo /> };

function ControlledPicker({ initial = '#4F7DFF', ...props }: { initial?: string } & Omit<ComponentProps<typeof ColorPicker>, 'label' | 'value' | 'defaultValue' | 'onValueChange'>) {
  const [value, setValue] = useState(initial);
  const [committed, setCommitted] = useState(initial);
  return <div className="grid max-w-md gap-[var(--rui-content-gap-sm)]"><ColorPicker {...props} label="界面强调色" value={value} onValueChange={setValue} onValueCommit={setCommitted} /><output className="font-mono text-xs text-muted-foreground">value={value} · committed={committed}</output></div>;
}

export const Popup: Story = { name: '弹出色板', render: () => <ControlledPicker presets={presets} /> };
export const Inline: Story = { name: '内联色板', render: () => <ControlledPicker inline presets={presets} /> };
export const TextOnly: Story = { name: '仅颜色输入', render: function Render() { const [value, setValue] = useState('#4F7DFF'); return <ColorInput label="标注颜色" value={value} onValueChange={setValue} description="Enter 或失焦提交；Escape 恢复已提交值。" className="max-w-md" />; } };
export const Formats: Story = { name: 'HEX / RGB / HSL', render: () => <div className="grid max-w-lg gap-[var(--rui-content-gap)]"><ColorInput label="HEX" defaultValue="#4F7DFF" format="hex" /><ColorInput label="RGB" defaultValue="#4F7DFF" format="rgb" /><ColorInput label="HSL" defaultValue="#4F7DFF" format="hsl" /></div> };
export const Alpha: Story = { name: '透明度边界', render: () => <ControlledPicker initial="#4F7DFF80" allowAlpha inline presets={['#4F7DFF00', '#4F7DFF80', '#4F7DFFFF']} /> };
export const PresetPalette: Story = { name: '预设色', render: () => <ControlledPicker inline presets={presets} showChannels={false} /> };
export const WithoutChannels: Story = { name: '隐藏通道', render: () => <ControlledPicker inline showChannels={false} /> };
export const InvalidDraft: Story = { name: '无效输入与恢复', render: () => <ControlledPicker /> };
export const ReadOnly: Story = { name: '只读', render: () => <ColorPicker label="锁定颜色" value="#4F7DFF" readOnly description="保留可复制文本，关闭色板入口。" className="max-w-md" /> };
export const Disabled: Story = { name: '禁用', render: () => <ColorPicker label="不可用颜色" value="#4F7DFF" disabled className="max-w-md" /> };
export const FieldError: Story = { name: '字段错误', render: () => <ColorPicker label="对比色" value="#4F7DFF" error="该颜色未达到当前文本的对比度要求。" className="max-w-md" /> };
export const KeyboardArea: Story = { name: '键盘调整色板', render: () => <ControlledPicker inline /> };
export const NativeForm: Story = { name: '原生表单值', render: function Render() {
  const [value, setValue] = useState('#4F7DFF');
  const [submitted, setSubmitted] = useState('');
  return <form className="grid max-w-md gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get('accent') ?? '')); }}><ColorPicker label="界面强调色" name="accent" value={value} onValueChange={setValue} required presets={presets} /><Button type="submit" variant="outline">读取表单</Button><output className="font-mono text-xs text-muted-foreground">form={submitted}</output></form>;
} };
