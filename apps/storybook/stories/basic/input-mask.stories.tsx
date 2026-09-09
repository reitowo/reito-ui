import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, InputMask, formatMaskValue, isMaskComplete, type InputMaskDefinitions, type InputMaskIncompleteBehavior } from '../../../../packages/ui/src/basic.js';
import { InputMaskDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, choiceControl, textControl } from '../feature-controls.js';

const meta = { id: "基础-inputmask",
  title: "基础/InputMask 格式输入",
  component: InputMask,
  tags: ['autodocs'],
  args: { label: '联系电话', mask: '999-9999-9999? x99999' },
  parameters: { docs: { description: { component: '格式化输入公开 raw 值并显示独立 display 值。9 表示数字、a 表示 ASCII 字母、* 表示 ASCII 字母或数字，? 之后的段可选；支持粘贴、删除、光标和 IME composition。' } } },
} satisfies Meta<typeof InputMask>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = { label: string; mask: string; value: string; placeholder: string; incompleteBehavior: InputMaskIncompleteBehavior; disabled: boolean; readOnly: boolean; required: boolean; description: string; error: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { label: '联系电话', mask: '999-9999-9999? x99999', value: '02155551234', placeholder: '021-5555-1234', incompleteBehavior: 'allow', disabled: false, readOnly: false, required: false, description: '公开值不含格式符；问号后的分机段可选。', error: '' },
  argTypes: { label: textControl, mask: textControl, value: textControl, placeholder: textControl, incompleteBehavior: choiceControl(['allow', 'clear', 'restore']), disabled: booleanControl, readOnly: booleanControl, required: booleanControl, description: textControl, error: textControl },
  parameters: { controls: { include: ['label', 'mask', 'value', 'placeholder', 'incompleteBehavior', 'disabled', 'readOnly', 'required', 'description', 'error'] } },
  render: function Render(args) {
    const [, update] = useArgs<PlaygroundArgs>();
    return <div className="grid max-w-md gap-[var(--rui-content-gap-sm)]"><InputMask {...args} error={args.error || undefined} inputMode="numeric" onValueChange={value => update({ value })} /><output className="font-mono text-xs text-muted-foreground">raw={args.value || 'empty'} · display={formatMaskValue(args.value, args.mask) || 'empty'}</output></div>;
  },
};

export const Overview: Story = { name: "总览对比", render: () => <InputMaskDemo /> };

function ControlledMask({ initialValue = '', mask = '999-9999-9999', definitions, ...props }: { initialValue?: string; mask?: string; definitions?: InputMaskDefinitions } & Omit<React.ComponentProps<typeof InputMask>, 'label' | 'mask' | 'value' | 'defaultValue' | 'onValueChange' | 'definitions'>) {
  const [value, setValue] = useState(initialValue);
  const [committed, setCommitted] = useState(initialValue);
  return <div className="grid max-w-md gap-[var(--rui-content-gap-sm)]"><InputMask {...props} label="格式值" mask={mask} definitions={definitions} value={value} onValueChange={setValue} onValueCommit={setCommitted} /><output className="font-mono text-xs text-muted-foreground">raw={value || 'empty'} · display={formatMaskValue(value, mask, definitions) || 'empty'} · complete={String(isMaskComplete(value, mask, definitions))} · committed={committed || 'empty'}</output></div>;
}

export const Phone: Story = { name: "电话号码", render: () => <ControlledMask initialValue="02155551234" inputMode="numeric" /> };
export const OptionalExtension: Story = { name: "可选分机", render: () => <ControlledMask initialValue="021555512348001" mask="999-9999-9999? x99999" inputMode="numeric" /> };
export const Serial: Story = { name: "字母数字编号", render: () => <ControlledMask initialValue="AB1234Z9" mask="aa-9999-*9" autoCapitalize="characters" /> };
const uppercaseDefinition: InputMaskDefinitions = { X: /[A-Z]/, '9': /[0-9]/ };
export const CustomDefinition: Story = { name: "自定义槽位", render: () => <ControlledMask initialValue="RUI041" mask="XXX-999" definitions={uppercaseDefinition} description="X 由宿主定义为大写字母。" /> };
export const PasteFormatted: Story = { name: "粘贴格式文本", render: () => <ControlledMask placeholder="粘贴 021-5555-1234" inputMode="numeric" /> };
export const DeleteAcrossLiteral: Story = { name: "跨格式符删除", render: () => <ControlledMask initialValue="02155551234" inputMode="numeric" /> };
export const IncompleteAllow: Story = { name: "保留未完成值", render: () => <ControlledMask initialValue="021" incompleteBehavior="allow" required /> };
export const IncompleteClear: Story = { name: "清空未完成值", render: () => <ControlledMask initialValue="021" incompleteBehavior="clear" required /> };
export const IncompleteRestore: Story = { name: "恢复上次提交", render: () => <ControlledMask initialValue="02155551234" incompleteBehavior="restore" required /> };
const unicodeDefinition: InputMaskDefinitions = { 文: /[\p{L}\p{N}]/u };
export const CompositionInput: Story = { name: "输入法组合", render: () => <ControlledMask mask="文文文文" definitions={unicodeDefinition} description="自定义 Unicode 槽位在 compositionend 后统一规范化。" /> };
export const Empty: Story = { name: "空值", render: () => <ControlledMask placeholder="000-0000-0000" /> };
export const ReadOnly: Story = { name: "状态 · 只读", render: () => <ControlledMask initialValue="02155551234" readOnly /> };
export const Disabled: Story = { name: "状态 · 禁用", render: () => <ControlledMask initialValue="02155551234" disabled /> };
export const FieldError: Story = { name: "字段错误", render: () => <ControlledMask initialValue="02155551234" error="该号码已被占用。" /> };
export const NativeForm: Story = { name: "原生表单 raw 值", render: function Render() {
  const [submitted, setSubmitted] = useState('');
  return <form className="grid max-w-md gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get('phone') ?? '')); }}><InputMask label="联系电话" name="phone" mask="999-9999-9999" defaultValue="02155551234" required inputMode="numeric" /><Button type="submit" variant="outline">读取表单</Button><output className="font-mono text-xs text-muted-foreground">form={submitted || 'empty'}</output></form>;
} };
