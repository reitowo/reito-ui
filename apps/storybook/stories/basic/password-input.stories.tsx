import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, PasswordInput, type PasswordRule, type PasswordStrength } from '../../../../packages/ui/src/basic.js';
import { PasswordInputDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, textControl } from '../feature-controls.js';

const rules: PasswordRule[] = [
  { id: 'length', label: '至少 10 个字符', test: value => value.length >= 10 },
  { id: 'mixed-case', label: '同时包含大小写字母', test: /(?=.*[a-z])(?=.*[A-Z])/ },
  { id: 'number', label: '包含数字', test: /\d/ },
  { id: 'symbol', label: '包含符号', test: /[^\p{L}\p{N}]/u },
];

const meta = {
  title: '基础/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  args: { label: '访问密码' },
  parameters: { docs: { description: { component: '在普通密码输入上组合可访问的显隐操作、宿主规则和内联强度反馈。组件不内置账号政策，也不保存或发送密码。' } } },
} satisfies Meta<typeof PasswordInput>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = { label: string; value: string; placeholder: string; feedback: boolean; disabled: boolean; readOnly: boolean; required: boolean; description: string; error: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { label: '访问密码', value: 'Graphite9!', placeholder: '输入密码', feedback: true, disabled: false, readOnly: false, required: false, description: '规则由当前表单或账号策略传入。', error: '' },
  argTypes: { label: textControl, value: textControl, placeholder: textControl, feedback: booleanControl, disabled: booleanControl, readOnly: booleanControl, required: booleanControl, description: textControl, error: textControl },
  parameters: { controls: { include: ['label', 'value', 'placeholder', 'feedback', 'disabled', 'readOnly', 'required', 'description', 'error'] } },
  render: function Render(args) {
    const [, update] = useArgs<PlaygroundArgs>();
    return <div className="max-w-md"><PasswordInput {...args} rules={rules} error={args.error || undefined} autoComplete="new-password" onValueChange={value => update({ value })} /></div>;
  },
};

export const Overview: Story = { name: '总览', render: () => <PasswordInputDemo /> };

function ControlledPassword({ initialValue = 'Graphite9!', ...props }: { initialValue?: string } & Omit<React.ComponentProps<typeof PasswordInput>, 'label' | 'value' | 'defaultValue' | 'onValueChange'>) {
  const [value, setValue] = useState(initialValue);
  const [committed, setCommitted] = useState(initialValue);
  return <div className="grid max-w-md gap-[var(--rui-content-gap-sm)]"><PasswordInput {...props} label="访问密码" value={value} onValueChange={setValue} onValueCommit={setCommitted} /><output className="text-xs text-muted-foreground">length={value.length} · committed={committed.length}</output></div>;
}

export const VisibilityToggle: Story = { name: '显隐与焦点', render: () => <ControlledPassword feedback={false} /> };
export const WithRules: Story = { name: '规则与强度', render: () => <ControlledPassword rules={rules} autoComplete="new-password" /> };
export const Controlled: Story = { name: '受控值与提交', render: () => <ControlledPassword rules={rules} /> };
export const CustomStrength: Story = { name: '宿主强度算法', render: () => <ControlledPassword rules={rules} getStrength={(value): PasswordStrength => value.length >= 16 ? { score: 4, label: '组织标准' } : value.length >= 12 ? { score: 3, label: '接近标准' } : value ? { score: 1, label: '长度不足' } : { score: 0, label: '尚未输入' }} description="本示例由宿主按长度覆盖强度标签；规则仍独立显示。" /> };
export const WithoutFeedback: Story = { name: '关闭反馈', render: () => <ControlledPassword rules={rules} feedback={false} /> };
export const Empty: Story = { name: '空值', render: () => <ControlledPassword initialValue="" rules={rules} placeholder="输入密码" /> };
export const Required: Story = { name: '必填', render: () => <ControlledPassword initialValue="" rules={rules} required /> };
export const ReadOnly: Story = { name: '只读', render: () => <ControlledPassword rules={rules} readOnly /> };
export const Disabled: Story = { name: '禁用', render: () => <ControlledPassword rules={rules} disabled /> };
export const FieldError: Story = { name: '字段错误', render: () => <ControlledPassword rules={rules} error="该密码出现在已泄露凭据列表中。" /> };
export const HostValidation: Story = { name: '宿主校验', render: function Render() {
  const [value, setValue] = useState('password');
  const error = /password/i.test(value) ? '不能包含常见单词 password。' : undefined;
  return <div className="max-w-md"><PasswordInput label="访问密码" value={value} onValueChange={setValue} rules={rules} error={error} description="业务错误由宿主校验后回填。" /></div>;
} };
export const NativeForm: Story = { name: '原生表单值', render: function Render() {
  const [submitted, setSubmitted] = useState('');
  return <form className="grid max-w-md gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get('password') ?? '')); }}><PasswordInput label="访问密码" name="password" defaultValue="Graphite9!" rules={rules} required autoComplete="new-password" /><Button type="submit" variant="outline">读取表单</Button><output className="text-xs text-muted-foreground">form-length={submitted.length}</output></form>;
} };
export const AutoCompleteModes: Story = { name: '自动填充语义', render: () => <div className="grid max-w-md gap-[var(--rui-content-gap)]"><PasswordInput label="当前密码" autoComplete="current-password" feedback={false} /><PasswordInput label="新密码" autoComplete="new-password" rules={rules} /></div> };
