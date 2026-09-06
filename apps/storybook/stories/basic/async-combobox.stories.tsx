import { useCallback, useRef, useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AsyncCombobox, type AsyncComboboxLoader, type AsyncComboboxOption } from '../../../../packages/ui/src/basic.js';
import { AsyncComboboxDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, numberControl, textControl } from '../feature-controls.js';

const options: AsyncComboboxOption[] = [
  { value: 'react', label: 'React', description: '界面组件' },
  { value: 'typescript', label: 'TypeScript', description: '类型系统' },
  { value: 'tailwind', label: 'Tailwind CSS', description: '样式工具' },
  { value: 'storybook', label: 'Storybook', description: '组件工作台' },
  { value: 'rust', label: 'Rust', description: '系统语言', disabled: true },
];

function delay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
  });
}

const loadOptions: AsyncComboboxLoader = async (query, { signal }) => {
  await delay(80, signal);
  const term = query.trim().toLocaleLowerCase();
  return options.filter(option => option.label.toLocaleLowerCase().includes(term));
};

const meta = {
  title: '基础/AsyncCombobox',
  component: AsyncCombobox,
  tags: ['autodocs'],
  args: { label: '异步查找技术栈', loadOptions },
  parameters: { docs: { description: { component: '宿主通过 loadOptions 接入任意本地或远程数据源。组件受控输入查询，使用 AbortSignal 和请求序号丢弃过期结果，并呈现 loading、error、empty 与 retry。' } } },
} satisfies Meta<typeof AsyncCombobox>;
export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({ loader = loadOptions, initialValue = null, initialQuery = '', selectedOption, minQueryLength = 0, debounceMs = 0, disabled = false, error }: { loader?: AsyncComboboxLoader; initialValue?: string | null; initialQuery?: string; selectedOption?: AsyncComboboxOption; minQueryLength?: number; debounceMs?: number; disabled?: boolean; error?: string }) {
  const [value, setValue] = useState<string | null>(initialValue);
  const [query, setQuery] = useState(initialQuery);
  return <div className="grid max-w-sm gap-[var(--rui-content-gap-sm)]"><AsyncCombobox label="异步查找技术栈" loadOptions={loader} value={value} onValueChange={setValue} query={query} onQueryChange={setQuery} selectedOption={selectedOption} minQueryLength={minQueryLength} debounceMs={debounceMs} disabled={disabled} error={error} /><output className="text-xs text-muted-foreground">query={JSON.stringify(query)} · value={value ?? 'null'}</output></div>;
}

export const Overview: Story = { name: '总览', render: () => <AsyncComboboxDemo /> };
export const Default: Story = { name: '查询与选择', render: () => <Controlled />, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement); const body = within(canvasElement.ownerDocument.body);
  const input = canvas.getByRole('combobox', { name: '异步查找技术栈' });
  await userEvent.type(input, 'type');
  await userEvent.click(await body.findByRole('option', { name: /TypeScript/ }));
  await expect(canvas.getByText('query="TypeScript" · value=typescript')).toBeVisible();
} };
export const MinimumQuery: Story = { name: '最少查询字符', render: () => <Controlled minQueryLength={2} /> };
export const Loading: Story = { name: '加载中', render: () => <Controlled initialQuery="re" loader={() => new Promise(() => {})} /> };
export const Empty: Story = { name: '无结果', render: () => <Controlled initialQuery="missing" /> };
export const ErrorRetry: Story = { name: '失败与重试', render: function Render() {
  const attempts = useRef(0);
  const loader = useCallback<AsyncComboboxLoader>(async (query, { signal }) => { await delay(40, signal); attempts.current += 1; if (attempts.current === 1) throw new Error('本地目录暂时不可用'); return options.filter(option => option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())); }, []);
  return <Controlled initialQuery="react" loader={loader} />;
} };
export const StaleResults: Story = { name: '过期结果保护', render: () => <Controlled loader={async (query, { signal }) => { await delay(query === 'r' ? 240 : 30, signal); return query === 'r' ? [{ value: 'rust', label: 'Rust' }] : [{ value: 'react', label: 'React' }]; }} /> };
export const SelectedCache: Story = { name: '选中项缓存', render: () => <Controlled initialValue="react" initialQuery="React" selectedOption={options[0]} loader={async (_query, { signal }) => { await delay(40, signal); return []; }} /> };
export const Disabled: Story = { name: '禁用', render: () => <Controlled disabled /> };
export const Invalid: Story = { name: '字段错误', render: () => <Controlled error="请选择一个可用技术栈。" /> };

type PlaygroundArgs = { label: string; value: string | null; query: string; minQueryLength: number; debounceMs: number; disabled: boolean; required: boolean; error: string; placeholder: string; emptyMessage: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { label: '异步查找技术栈', value: null, query: '', minQueryLength: 0, debounceMs: 120, disabled: false, required: false, error: '', placeholder: '输入关键词搜索…', emptyMessage: '没有匹配的选项' },
  argTypes: { label: textControl, value: { control: 'select', options: [null, 'react', 'typescript', 'tailwind', 'storybook'] }, query: textControl, minQueryLength: numberControl, debounceMs: numberControl, disabled: booleanControl, required: booleanControl, error: textControl, placeholder: textControl, emptyMessage: textControl },
  parameters: { controls: { include: ['label', 'value', 'query', 'minQueryLength', 'debounceMs', 'disabled', 'required', 'error', 'placeholder', 'emptyMessage'] } },
  render: function Render(args) { const [, update] = useArgs(); return <AsyncCombobox {...args} error={args.error || undefined} loadOptions={loadOptions} onQueryChange={query => update({ query })} onValueChange={value => update({ value })} className="max-w-sm" />; },
};
