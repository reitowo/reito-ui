import { useCallback, useRef, useState } from 'react';
import { Folder, LayoutPanelTop } from 'lucide-react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { Cascader, type CascaderDisplayMode, type CascaderOption, type CascaderSelectionBoundary } from '../../../../packages/ui/src/complex/index.js';
import { cascaderOptions, CascaderDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, choiceControl, textControl } from '../feature-controls.js';

const wait = (duration: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  const timer = window.setTimeout(resolve, duration);
  signal?.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
});

const lazyOptions: CascaderOption[] = [{ id: 'cloud', label: '云端工作区', description: '按需读取项目', loadable: true }];
const loadDemo = async (_option: CascaderOption, { signal }: { signal: AbortSignal }) => {
  await wait(220, signal);
  return [{ id: 'project', label: 'design-system', children: [{ id: 'storybook', label: 'Storybook' }, { id: 'lab', label: '组件 Lab' }] }];
};

const meta = {
  title: '复杂/Cascader 级联选择',
  component: Cascader,
  tags: ['autodocs'],
  args: { options: cascaderOptions },
  parameters: { docs: { description: { component: '以并列层级面板选择完整路径。默认只提交叶节点；可显式允许选择任意层级，并支持受控路径、lazy 子项和原生表单值。' } } },
} satisfies Meta<typeof Cascader>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  value: string[];
  selectionBoundary: CascaderSelectionBoundary;
  displayMode: CascaderDisplayMode;
  label: string;
  placeholder: string;
  clearable: boolean;
  disabled: boolean;
  required: boolean;
  loading: boolean;
  loadError: string;
  description: string;
  error: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { value: ['frontend', 'react', 'component-library'], selectionBoundary: 'leaf', displayMode: 'path', label: '工程类型', placeholder: '请选择工程类型', clearable: true, disabled: false, required: false, loading: false, loadError: '', description: '逐级选择完整路径。', error: '' },
  argTypes: { value: { control: { type: 'object' } }, selectionBoundary: choiceControl(['leaf', 'any']), displayMode: choiceControl(['path', 'label']), label: textControl, placeholder: textControl, clearable: booleanControl, disabled: booleanControl, required: booleanControl, loading: booleanControl, loadError: textControl, description: textControl, error: textControl },
  parameters: { controls: { include: ['value', 'selectionBoundary', 'displayMode', 'label', 'placeholder', 'clearable', 'disabled', 'required', 'loading', 'loadError', 'description', 'error'] } },
  render: function Render(args) {
    const [, update] = useArgs<PlaygroundArgs>();
    return <Cascader options={cascaderOptions} value={args.value.length ? args.value : undefined} onValueChange={next => update({ value: next ?? [] })} selectionBoundary={args.selectionBoundary} displayMode={args.displayMode} label={args.label} placeholder={args.placeholder} clearable={args.clearable} disabled={args.disabled} required={args.required} loading={args.loading} loadError={args.loadError || undefined} onRetry={() => update({ loadError: '' })} description={args.description} error={args.error || undefined} />;
  },
};

export const Overview: Story = { name: '总览', render: () => <CascaderDemo /> };
export const LeafOnly: Story = { name: '仅叶节点', render: () => <Cascader options={cascaderOptions} defaultValue={['frontend', 'react', 'component-library']} label="发布目标" /> };
export const AnyLevel: Story = { name: '可选任意层级', render: () => <Cascader options={cascaderOptions} selectionBoundary="any" label="权限范围" /> };
export const LabelOnly: Story = { name: '仅显示末级', render: () => <Cascader options={cascaderOptions} defaultValue={['frontend', 'vue', 'documentation']} displayMode="label" label="文档类型" /> };
export const Controlled: Story = { name: '受控路径', render: function Render() { const [value, setValue] = useState<string[] | undefined>(['frontend', 'react', 'desktop-app']); return <div className="grid gap-[var(--rui-content-gap-sm)]"><Cascader options={cascaderOptions} value={value} onValueChange={setValue} label="工程类型" /><output className="text-xs text-muted-foreground">value={JSON.stringify(value ?? null)}</output></div>; } };
export const DisabledOption: Story = { name: '禁用分支', render: () => <Cascader options={cascaderOptions} label="运行时" /> };
export const Empty: Story = { name: '空选项', render: () => <Cascader options={[]} defaultOpen label="工程类型" /> };
export const Loading: Story = { name: '整体加载中', render: () => <Cascader options={cascaderOptions} loading defaultOpen label="工程类型" /> };
export const LoadError: Story = { name: '整体加载失败', render: function Render() { const [failed, setFailed] = useState(true); return <Cascader options={cascaderOptions} loadError={failed ? '选项服务暂不可用' : undefined} onRetry={() => setFailed(false)} defaultOpen label="工程类型" />; } };
export const Lazy: Story = { name: '懒加载层级', render: () => <Cascader options={lazyOptions} loadChildren={loadDemo} label="远程工程" /> };
export const LazyErrorRetry: Story = { name: '懒加载错误与重试', render: function Render() {
  const attempts = useRef(0); const [attempt, setAttempt] = useState(0);
  const loader = useCallback(async (_option: CascaderOption, { signal }: { signal: AbortSignal }) => { await wait(160, signal); attempts.current += 1; setAttempt(attempts.current); if (attempts.current === 1) throw new Error('子层级暂不可用'); return [{ id: 'recovered', label: '已恢复选项' }]; }, []);
  return <div className="grid gap-[var(--rui-content-gap-sm)]"><Cascader options={lazyOptions} loadChildren={loader} label="可重试层级" /><output className="text-xs text-muted-foreground">尝试次数：{attempt}</output></div>;
} };
export const FieldError: Story = { name: '字段错误', render: () => <Cascader options={cascaderOptions} required error="请选择一个可用的叶节点。" label="工程类型" /> };
export const NativeForm: Story = { name: '原生表单值', render: function Render() {
  const [value, setValue] = useState<string[] | undefined>(['frontend', 'react', 'component-library']); const [submitted, setSubmitted] = useState('');
  return <form className="grid gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get('target'))); }}><Cascader name="target" options={cascaderOptions} value={value} onValueChange={setValue} label="工程类型" /><Button type="submit" variant="outline">读取表单</Button><output data-testid="form-value" className="text-xs text-muted-foreground">form={submitted}</output></form>;
} };
export const RichOption: Story = { name: '自定义选项内容', render: () => <Cascader options={cascaderOptions} label="工程模板" renderOption={(option, { depth }) => <span className="flex min-w-0 items-center gap-2">{depth < 2 ? <Folder className="size-3.5 shrink-0 text-muted-foreground" /> : <LayoutPanelTop className="size-3.5 shrink-0 text-muted-foreground" />}<span className="truncate">{option.label}</span></span>} /> };
