import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, InputTags, type InputTagsDuplicateBehavior, type InputTagsRejection } from '../../../../packages/ui/src/basic.js';
import { InputTagsDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, choiceControl, numberControl, textControl } from '../feature-controls.js';

const meta = {
  title: '基础/InputTags',
  component: InputTags,
  tags: ['autodocs'],
  args: { label: '项目标签' },
  parameters: { docs: { description: { component: '任意字符串标签输入。Enter 或配置的分隔键创建标签；公开去重策略、数量上限、受控值、编辑和删除。只允许选择既有 options 的场景继续使用 MultiSelect。' } } },
} satisfies Meta<typeof InputTags>;
export default meta;
type Story = StoryObj<typeof meta>;

function ControlledTags({ initial = ['React'], duplicateBehavior = 'ignore', maxTags, caseSensitive = false, readOnly = false, disabled = false, error }: { initial?: string[]; duplicateBehavior?: InputTagsDuplicateBehavior; maxTags?: number; caseSensitive?: boolean; readOnly?: boolean; disabled?: boolean; error?: string }) {
  const [value, setValue] = useState(initial);
  const [rejection, setRejection] = useState<InputTagsRejection>();
  return <div className="grid max-w-md gap-[var(--rui-content-gap-sm)]"><InputTags label="项目标签" value={value} onValueChange={setValue} onReject={setRejection} duplicateBehavior={duplicateBehavior} maxTags={maxTags} caseSensitive={caseSensitive} readOnly={readOnly} disabled={disabled} error={error} /><output className="text-xs text-muted-foreground">value={JSON.stringify(value)}{rejection ? ` · reject=${rejection.reason}:${rejection.value}` : ''}</output></div>;
}

export const Overview: Story = { name: '总览', render: () => <InputTagsDemo /> };
export const Default: Story = { name: '创建与删除', render: () => <ControlledTags />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByRole('textbox', { name: '项目标签' });
  await userEvent.type(input, 'Graphite{Enter}');
  await expect(canvas.getByText('value=["React","Graphite"]')).toBeVisible();
  await userEvent.click(canvas.getByRole('button', { name: '移除标签 React' }));
  await expect(canvas.getByText('value=["Graphite"]', { exact: false })).toBeVisible();
} };
export const Separators: Story = { name: '中英文分隔键', render: () => <ControlledTags initial={[]} /> };
export const DuplicateIgnored: Story = { name: '重复值忽略', render: () => <ControlledTags initial={['React']} duplicateBehavior="ignore" /> };
export const DuplicateRejected: Story = { name: '重复值拒绝', render: () => <ControlledTags initial={['React']} duplicateBehavior="reject" /> };
export const DuplicateAllowed: Story = { name: '允许重复值', render: () => <ControlledTags initial={['React']} duplicateBehavior="allow" /> };
export const LimitReached: Story = { name: '数量上限', render: () => <ControlledTags initial={['React', 'TypeScript', 'Tailwind CSS']} maxTags={3} /> };
export const Editable: Story = { name: '标签编辑', render: () => <ControlledTags initial={['React', 'TypeScript']} duplicateBehavior="reject" /> };
export const ReadOnly: Story = { name: '只读', render: () => <ControlledTags readOnly /> };
export const Disabled: Story = { name: '禁用', render: () => <ControlledTags disabled /> };
export const Invalid: Story = { name: '字段错误', render: () => <ControlledTags error="请至少添加两个项目标签。" /> };
export const FormValue: Story = { name: '原生表单值', render: function Render() {
  const [value, setValue] = useState(['React', 'TypeScript']);
  const [submitted, setSubmitted] = useState<string[]>([]);
  return <form className="grid max-w-md gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); setSubmitted(new FormData(event.currentTarget).getAll('tags').map(String)); }}><InputTags label="项目标签" name="tags" value={value} onValueChange={setValue} required /><Button type="submit" variant="outline">读取表单</Button><output className="text-xs text-muted-foreground">form={JSON.stringify(submitted)}</output></form>;
} };

type PlaygroundArgs = { label: string; value: string[]; placeholder: string; description: string; error: string; maxTags: number; duplicateBehavior: InputTagsDuplicateBehavior; caseSensitive: boolean; editable: boolean; readOnly: boolean; disabled: boolean; required: boolean; separators: string[] };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { label: '项目标签', value: ['React'], placeholder: '输入后按 Enter', description: '本地受控示例；标签不会发送到外部服务。', error: '', maxTags: 5, duplicateBehavior: 'ignore', caseSensitive: false, editable: true, readOnly: false, disabled: false, required: false, separators: [',', '，'] },
  argTypes: { label: textControl, value: { control: 'object' }, placeholder: textControl, description: textControl, error: textControl, maxTags: numberControl, duplicateBehavior: choiceControl(['ignore', 'reject', 'allow']), caseSensitive: booleanControl, editable: booleanControl, readOnly: booleanControl, disabled: booleanControl, required: booleanControl, separators: { control: 'object' } },
  parameters: { controls: { include: ['label', 'value', 'placeholder', 'description', 'error', 'maxTags', 'duplicateBehavior', 'caseSensitive', 'editable', 'readOnly', 'disabled', 'required', 'separators'] } },
  render: function Render(args) { const [, update] = useArgs(); return <InputTags {...args} error={args.error || undefined} onValueChange={value => update({ value })} className="max-w-md" />; },
};
