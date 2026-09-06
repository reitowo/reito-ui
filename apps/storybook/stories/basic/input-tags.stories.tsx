import { useCallback, useRef, useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, InputTags, type InputTagsDuplicateBehavior, type InputTagsProps, type InputTagsRejection, type InputTagsSuggestion, type InputTagsSuggestionLoader } from '../../../../packages/ui/src/basic.js';
import { InputTagsDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, choiceControl, numberControl, textControl } from '../feature-controls.js';

const meta = {
  title: '基础/InputTags',
  component: InputTags,
  tags: ['autodocs'],
  args: { label: '项目标签' },
  parameters: { docs: { description: { component: '任意字符串标签输入。支持批量粘贴、IME、静态或异步建议、异步创建状态、标签级禁用/错误和方向键导航；只允许选择既有 options 的场景继续使用 MultiSelect。' } } },
} satisfies Meta<typeof InputTags>;
export default meta;
type Story = StoryObj<typeof meta>;

function ControlledTags({ initial = ['React'], duplicateBehavior = 'ignore', maxTags, caseSensitive = false, readOnly = false, disabled = false, error }: { initial?: string[]; duplicateBehavior?: InputTagsDuplicateBehavior; maxTags?: number; caseSensitive?: boolean; readOnly?: boolean; disabled?: boolean; error?: string }) {
  const [value, setValue] = useState(initial);
  const [rejection, setRejection] = useState<InputTagsRejection>();
  return <div className="grid max-w-md gap-[var(--rui-content-gap-sm)]"><InputTags label="项目标签" value={value} onValueChange={setValue} onReject={setRejection} duplicateBehavior={duplicateBehavior} maxTags={maxTags} caseSensitive={caseSensitive} readOnly={readOnly} disabled={disabled} error={error} /><output className="text-xs text-muted-foreground">value={JSON.stringify(value)}{rejection ? ` · reject=${rejection.reason}:${rejection.value}` : ''}</output></div>;
}

type AdvancedTagsProps = Omit<InputTagsProps, 'label' | 'value' | 'defaultValue' | 'onValueChange'> & { initial?: string[]; label?: string };
function AdvancedTags({ initial = [], label = '项目标签', ...props }: AdvancedTagsProps) {
  const [value, setValue] = useState(initial);
  return <div className="grid max-w-md gap-[var(--rui-content-gap-sm)]"><InputTags {...props} label={label} value={value} onValueChange={setValue} /><output className="text-xs text-muted-foreground">value={JSON.stringify(value)}</output></div>;
}
const suggestionOptions: InputTagsSuggestion[] = [
  { value: 'React', label: 'React', description: '界面组件' },
  { value: 'TypeScript', label: 'TypeScript', description: '类型系统' },
  { value: 'Tailwind CSS', label: 'Tailwind CSS', description: '样式工具' },
  { value: 'Rust', label: 'Rust', description: '系统语言', disabled: true },
];
function delay(ms: number, signal: AbortSignal) { return new Promise<void>((resolve, reject) => { const timer = window.setTimeout(resolve, ms); signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true }); }); }
const loadSuggestions: InputTagsSuggestionLoader = async (query, { signal }) => { await delay(100, signal); const term = query.trim().toLocaleLowerCase(); return suggestionOptions.filter(option => option.label.toLocaleLowerCase().includes(term)); };

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
export const PasteBatch: Story = { name: '批量粘贴拆分', render: () => <AdvancedTags pasteSeparators={[',', '，', '\n', '\t']} /> };
export const ImeSafe: Story = { name: '中文 IME 组合输入', render: () => <AdvancedTags /> };
export const Suggestions: Story = { name: '本地建议与创建项', render: () => <AdvancedTags suggestions={suggestionOptions} suggestionDebounceMs={0} /> };
export const AsyncSuggestions: Story = { name: '异步建议', render: () => <AdvancedTags loadSuggestions={loadSuggestions} suggestionDebounceMs={0} /> };
export const StaleSuggestions: Story = { name: '建议过期结果保护', render: () => <AdvancedTags loadSuggestions={async (query, { signal }) => { await delay(query === 'r' ? 240 : 30, signal); return query === 'r' ? [{ value: 'Rust', label: 'Rust' }] : [{ value: 'React', label: 'React' }]; }} suggestionDebounceMs={0} /> };
export const SuggestionErrorRetry: Story = { name: '建议失败与重试', render: function Render() { const attempts = useRef(0); const loader = useCallback<InputTagsSuggestionLoader>(async (query, { signal }) => { await delay(40, signal); attempts.current += 1; if (attempts.current === 1) throw new Error('建议服务暂时不可用'); return suggestionOptions.filter(option => option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())); }, []); return <AdvancedTags loadSuggestions={loader} suggestionDebounceMs={0} />; } };
export const AsyncCreate: Story = { name: '异步创建中', render: () => <AdvancedTags onCreateTag={async (_value, { signal }) => delay(320, signal)} /> };
export const CreateFailure: Story = { name: '创建失败', render: () => <AdvancedTags onCreateTag={async () => { await new Promise(resolve => window.setTimeout(resolve, 60)); throw new Error('标签名称未通过工作区校验'); }} /> };
export const TagStates: Story = { name: '标签级禁用与错误', render: () => <AdvancedTags initial={['React', 'TypeScript', 'Tailwind CSS']} disabledTags={['React']} tagErrors={{ TypeScript: '该标签已在远程删除' }} /> };
export const KeyboardNavigation: Story = { name: '标签与建议键盘导航', render: () => <AdvancedTags initial={['React', 'TypeScript']} suggestions={suggestionOptions} suggestionDebounceMs={0} /> };

type PlaygroundArgs = { label: string; value: string[]; placeholder: string; description: string; error: string; maxTags: number; duplicateBehavior: InputTagsDuplicateBehavior; caseSensitive: boolean; editable: boolean; readOnly: boolean; disabled: boolean; required: boolean; separators: string[]; splitOnPaste: boolean; suggestions: InputTagsSuggestion[]; suggestionMinQueryLength: number; suggestionDebounceMs: number; disabledTags: string[]; tagErrors: Record<string, string> };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { label: '项目标签', value: ['React'], placeholder: '输入后按 Enter', description: '本地受控示例；标签不会发送到外部服务。', error: '', maxTags: 5, duplicateBehavior: 'ignore', caseSensitive: false, editable: true, readOnly: false, disabled: false, required: false, separators: [',', '，'], splitOnPaste: true, suggestions: suggestionOptions, suggestionMinQueryLength: 1, suggestionDebounceMs: 80, disabledTags: [], tagErrors: {} },
  argTypes: { label: textControl, value: { control: 'object' }, placeholder: textControl, description: textControl, error: textControl, maxTags: numberControl, duplicateBehavior: choiceControl(['ignore', 'reject', 'allow']), caseSensitive: booleanControl, editable: booleanControl, readOnly: booleanControl, disabled: booleanControl, required: booleanControl, separators: { control: 'object' }, splitOnPaste: booleanControl, suggestions: { control: 'object' }, suggestionMinQueryLength: numberControl, suggestionDebounceMs: numberControl, disabledTags: { control: 'object' }, tagErrors: { control: 'object' } },
  parameters: { controls: { include: ['label', 'value', 'placeholder', 'description', 'error', 'maxTags', 'duplicateBehavior', 'caseSensitive', 'editable', 'readOnly', 'disabled', 'required', 'separators', 'splitOnPaste', 'suggestions', 'suggestionMinQueryLength', 'suggestionDebounceMs', 'disabledTags', 'tagErrors'] } },
  render: function Render(args) { const [, update] = useArgs(); return <InputTags {...args} error={args.error || undefined} onValueChange={value => update({ value })} className="max-w-md" />; },
};
