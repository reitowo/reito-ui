import { useCallback, useRef, useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AsyncMultiSelect, Button, type AsyncMultiSelectLoader, type AsyncMultiSelectOption } from '../../../../packages/ui/src/basic.js';
import { AsyncMultiSelectDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, numberControl, textControl } from '../feature-controls.js';

const options: AsyncMultiSelectOption[] = [
  { value: 'react', label: 'React', description: '界面组件', group: '前端' },
  { value: 'typescript', label: 'TypeScript', description: '类型系统', group: '前端' },
  { value: 'tailwind', label: 'Tailwind CSS', description: '样式工具', group: '工具' },
  { value: 'storybook', label: 'Storybook', description: '组件工作台', group: '工具' },
  { value: 'rust', label: 'Rust', description: '系统语言', group: '后端', disabled: true },
];

function delay(ms: number, signal: AbortSignal) { return new Promise<void>((resolve, reject) => { const timer = window.setTimeout(resolve, ms); signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true }); }); }
const loadOptions: AsyncMultiSelectLoader = async (query, { signal }) => { await delay(80, signal); const term = query.trim().toLocaleLowerCase(); return options.filter(option => option.label.toLocaleLowerCase().includes(term)); };
const remoteOptions: AsyncMultiSelectOption[] = Array.from({ length: 240 }, (_, index) => ({ value: `remote-${index}`, label: `远程资源 ${String(index + 1).padStart(3, '0')}`, description: index % 4 === 0 ? `动态说明 ${index + 1}` : undefined, group: `远程分片 ${Math.floor(index / 40) + 1}` }));

const meta = { id: "基础-asyncmultiselect",
  title: "基础/AsyncMultiSelect 异步多选", component: AsyncMultiSelect, tags: ['autodocs'],
  args: { label: '异步选择技术栈', loadOptions },
  parameters: { docs: { description: { component: '宿主加载的异步多选。查询与值分别受控；当前结果页支持分组、创建、全选/半选与批量清除，同时继续从缓存解析结果页外的已选 chip。' } } },
} satisfies Meta<typeof AsyncMultiSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({ loader = loadOptions, initialValue = ['react'], initialQuery = '', selectedOptions = options.filter(option => initialValue.includes(option.value)), minQueryLength = 0, disabled = false, error, name, showSelectAll = false, allowCreate = false }: { loader?: AsyncMultiSelectLoader; initialValue?: string[]; initialQuery?: string; selectedOptions?: AsyncMultiSelectOption[]; minQueryLength?: number; disabled?: boolean; error?: string; name?: string; showSelectAll?: boolean; allowCreate?: boolean }) {
  const [value, setValue] = useState(initialValue); const [query, setQuery] = useState(initialQuery);
  return <div className="grid max-w-md gap-[var(--rui-content-gap-sm)]"><AsyncMultiSelect label="异步选择技术栈" loadOptions={loader} value={value} onValueChange={setValue} query={query} onQueryChange={setQuery} selectedOptions={selectedOptions} minQueryLength={minQueryLength} debounceMs={0} disabled={disabled} error={error} name={name} showSelectAll={showSelectAll} onCreateOption={allowCreate ? async label => { await new Promise(resolve => window.setTimeout(resolve, 80)); return { value: label.toLocaleLowerCase().replaceAll(' ', '-'), label, group: '自定义' }; } : undefined} /><output className="text-xs text-muted-foreground">query={JSON.stringify(query)} · value={JSON.stringify(value)}</output></div>;
}

export const Overview: Story = { name: "总览对比", render: () => <AsyncMultiSelectDemo /> };
export const Default: Story = { name: "查询、选择与移除", render: () => <Controlled />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); const body = within(canvasElement.ownerDocument.body); const input = canvas.getByRole('combobox', { name: '异步选择技术栈' }); await userEvent.type(input, 'type'); await userEvent.click(await body.findByRole('option', { name: /TypeScript/ })); await expect(canvas.getByText(/value=\["react","typescript"\]/)).toBeVisible(); await userEvent.click(canvas.getByRole('button', { name: '移除React' })); await expect(canvas.getByText(/value=\["typescript"\]/)).toBeVisible(); } };
export const MinimumQuery: Story = { name: "最少查询字符", render: () => <Controlled minQueryLength={2} /> };
export const Loading: Story = { name: "状态 · 加载中", render: () => <Controlled initialQuery="re" loader={() => new Promise(() => {})} /> };
export const Empty: Story = { name: "无结果", render: () => <Controlled initialQuery="missing" /> };
export const ErrorRetry: Story = { name: "失败与重试", render: function Render() { const attempts = useRef(0); const loader = useCallback<AsyncMultiSelectLoader>(async (query, { signal }) => { await delay(40, signal); attempts.current += 1; if (attempts.current === 1) throw new Error('本地目录暂时不可用'); return options.filter(option => option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())); }, []); return <Controlled initialQuery="react" loader={loader} />; } };
export const StaleResults: Story = { name: "过期结果保护", render: () => <Controlled initialValue={[]} loader={async (query, { signal }) => { await delay(query === 'r' ? 240 : 30, signal); return query === 'r' ? [{ value: 'rust', label: 'Rust' }] : [{ value: 'react', label: 'React' }]; }} /> };
export const SelectedCache: Story = { name: "已选标签跨结果保留", render: () => <Controlled initialValue={['react', 'typescript']} initialQuery="tail" selectedOptions={options.slice(0, 2)} loader={async (_query, { signal }) => { await delay(40, signal); return [options[2]]; }} /> };
export const GroupedResults: Story = { name: "分组结果", render: () => <Controlled initialValue={[]} /> };
export const PartialSelection: Story = { name: "当前结果半选", render: () => <Controlled initialValue={['react']} showSelectAll /> };
export const PageBulkSelection: Story = { name: "当前结果批量选择", render: () => <Controlled initialValue={['tailwind']} initialQuery="type" showSelectAll /> };
export const CreateOption: Story = { name: "异步创建新项", render: () => <Controlled initialValue={[]} allowCreate /> };
export const CreateFailure: Story = { name: "创建失败", render: function Render() { const [value, setValue] = useState<string[]>([]); const [query, setQuery] = useState(''); return <AsyncMultiSelect label="异步选择技术栈" loadOptions={loadOptions} value={value} onValueChange={setValue} query={query} onQueryChange={setQuery} debounceMs={0} onCreateOption={async () => { await new Promise(resolve => window.setTimeout(resolve, 60)); throw new Error('无法创建这个技术标签'); }} className="max-w-md" />; } };
export const DisabledBoundary: Story = { name: "禁用项批量边界", render: () => <Controlled initialValue={['rust', 'react']} selectedOptions={[options[4], options[0]]} showSelectAll /> };
export const VirtualRemotePages: Story = { name: "虚拟远程分页", render: function Render() { const [value, setValue] = useState(['remote-180']); const [query, setQuery] = useState(''); const search = (term: string) => remoteOptions.filter(option => `${option.label} ${option.value}`.toLocaleLowerCase().includes(term.trim().toLocaleLowerCase())); return <div className="grid max-w-md gap-2"><AsyncMultiSelect label="远程资源" value={value} onValueChange={setValue} query={query} onQueryChange={setQuery} selectedOptions={[remoteOptions[180]]} debounceMs={0} virtual hasMore loadOptions={async (term, { signal }) => { await delay(40, signal); return search(term).slice(0, 40); }} loadMoreOptions={async (term, { signal, offset }) => { await delay(80, signal); return search(term).slice(offset, offset + 40); }} /><output data-testid="remote-value" className="font-mono text-xs text-muted-foreground">value={JSON.stringify(value)}</output></div>; } };
export const VirtualLoadFailure: Story = { name: "远程增量失败", render: () => <AsyncMultiSelect label="远程资源" defaultValue={[]} debounceMs={0} virtual hasMore loadOptions={async (_query, { signal }) => { await delay(20, signal); return remoteOptions.slice(0, 12); }} loadMoreOptions={async (_query, { signal }) => { await delay(60, signal); throw new Error('无法加载下一页'); }} className="max-w-md" /> };
export const Disabled: Story = { name: "状态 · 禁用", render: () => <Controlled disabled /> };
export const Invalid: Story = { name: "字段错误", render: () => <Controlled error="请至少选择两个技术栈。" /> };
export const FormValue: Story = { name: "原生表单值", render: function Render() { const [submitted, setSubmitted] = useState<string[]>([]); return <form className="grid max-w-md gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); setSubmitted(new FormData(event.currentTarget).getAll('stack').map(String)); }}><Controlled name="stack" initialValue={['react', 'typescript']} /><Button type="submit" variant="outline">读取表单</Button><output>form={JSON.stringify(submitted)}</output></form>; } };

type PlaygroundArgs = { label: string; value: string[]; query: string; minQueryLength: number; debounceMs: number; disabled: boolean; required: boolean; error: string; placeholder: string; emptyMessage: string; showSelectAll: boolean; allowCreate: boolean; virtual: boolean; virtualOverscan: number };
export const Playground: StoryObj<PlaygroundArgs> = { name: "参数调试", args: { label: '异步选择技术栈', value: ['react'], query: '', minQueryLength: 0, debounceMs: 120, disabled: false, required: false, error: '', placeholder: '输入关键词搜索…', emptyMessage: '没有匹配的选项', showSelectAll: true, allowCreate: true, virtual: false, virtualOverscan: 4 }, argTypes: { label: textControl, value: { control: 'check', options: ['react', 'typescript', 'tailwind', 'storybook', 'rust'] }, query: textControl, minQueryLength: numberControl, debounceMs: numberControl, disabled: booleanControl, required: booleanControl, error: textControl, placeholder: textControl, emptyMessage: textControl, showSelectAll: booleanControl, allowCreate: booleanControl, virtual: booleanControl, virtualOverscan: numberControl }, parameters: { controls: { include: ['label', 'value', 'query', 'minQueryLength', 'debounceMs', 'disabled', 'required', 'error', 'placeholder', 'emptyMessage', 'showSelectAll', 'allowCreate', 'virtual', 'virtualOverscan'] } }, render: function Render({ allowCreate, ...args }) { const [, update] = useArgs(); return <AsyncMultiSelect {...args} error={args.error || undefined} selectedOptions={options.filter(option => args.value.includes(option.value))} loadOptions={loadOptions} onCreateOption={allowCreate ? label => ({ value: label.toLocaleLowerCase().replaceAll(' ', '-'), label, group: '自定义' }) : undefined} onQueryChange={query => update({ query })} onValueChange={value => update({ value })} className="max-w-md" />; } };
