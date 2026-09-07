import { useCallback, useRef, useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { TreeSelect, type AsyncTreeViewNode, type TreeViewCheckPropagation, type TreeViewSelectionMode } from '../../../../packages/ui/src/complex/index.js';
import { demoNodes, TreeSelectDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, choiceControl, textControl } from '../feature-controls.js';

const wait = (duration: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  const timer = window.setTimeout(resolve, duration);
  signal?.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
});
const lazyRoots: AsyncTreeViewNode[] = [{ id: 'workspace', label: 'workspace', description: '远程目录', loadable: true }, { id: 'archive', label: 'archive', loadable: true }];
const loadDemo = async (node: AsyncTreeViewNode, { signal }: { signal: AbortSignal }) => {
  await wait(220, signal);
  return node.id === 'workspace' ? [{ id: 'remote-src', label: 'src', children: [{ id: 'remote-app', label: 'App.tsx' }, { id: 'remote-token', label: 'tokens.json' }] }] : [];
};

const meta = {
  title: '复杂/TreeSelect 树选择',
  component: TreeSelect,
  tags: ['autodocs'],
  args: { nodes: demoNodes },
  parameters: { docs: { description: { component: '将共享 TreeView / AsyncTreeView 放入可搜索 Popover。搜索只改变可见投影，完整树仍参与级联、半选和隐藏选择保持。' } } },
} satisfies Meta<typeof TreeSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  selectionMode: TreeViewSelectionMode;
  value: string;
  checked: string[];
  expanded: string[];
  query: string;
  checkPropagation: TreeViewCheckPropagation;
  label: string;
  placeholder: string;
  disabled: boolean;
  required: boolean;
  description: string;
  error: string;
};
export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { selectionMode: 'single', value: 'button', checked: ['button'], expanded: ['src', 'components'], query: '', checkPropagation: 'cascade', label: '项目节点', placeholder: '请选择节点', disabled: false, required: false, description: '搜索、展开和选择都在同一个预览中调整。', error: '' },
  argTypes: { selectionMode: choiceControl(['single', 'checkbox']), value: textControl, checked: { control: { type: 'check' }, options: ['src', 'components', 'button', 'input', 'app', 'docs', 'guide', 'tokens', 'readme'] }, expanded: { control: { type: 'check' }, options: ['src', 'components', 'docs'] }, query: textControl, checkPropagation: choiceControl(['cascade', 'independent']), label: textControl, placeholder: textControl, disabled: booleanControl, required: booleanControl, description: textControl, error: textControl },
  parameters: { controls: { include: ['selectionMode', 'value', 'checked', 'expanded', 'query', 'checkPropagation', 'label', 'placeholder', 'disabled', 'required', 'description', 'error'] } },
  render: function Render(args) {
    const [, update] = useArgs<PlaygroundArgs>();
    return <TreeSelect nodes={demoNodes} selectionMode={args.selectionMode} value={args.value || undefined} onValueChange={next => update({ value: next ?? '' })} checked={args.checked} onCheckedChange={next => update({ checked: next })} expanded={args.expanded} onExpandedChange={next => update({ expanded: next })} query={args.query} onQueryChange={next => update({ query: next })} checkPropagation={args.checkPropagation} label={args.label} placeholder={args.placeholder} disabled={args.disabled} required={args.required} description={args.description} error={args.error || undefined} />;
  },
};

export const Overview: Story = { name: '总览', render: () => <TreeSelectDemo /> };
export const Single: Story = { name: '受控单选', render: function Render() { const [value, setValue] = useState<string>(); return <TreeSelect nodes={demoNodes} value={value} onValueChange={setValue} defaultExpanded={['src', 'components']} label="入口文件" />; } };
export const Checkbox: Story = { name: '复选与级联', render: function Render() { const [checked, setChecked] = useState(['button']); return <TreeSelect nodes={demoNodes} selectionMode="checkbox" checked={checked} onCheckedChange={setChecked} defaultExpanded={['src', 'components']} label="包含文件" />; } };
export const Partial: Story = { name: '半选状态', render: () => <TreeSelect nodes={demoNodes} selectionMode="checkbox" checked={['button']} defaultExpanded={['src', 'components']} label="部分选择" /> };
export const Independent: Story = { name: '独立复选', render: () => <TreeSelect nodes={demoNodes} selectionMode="checkbox" defaultChecked={['components']} checkPropagation="independent" defaultExpanded={['src', 'components']} label="独立节点" /> };
export const SearchProjection: Story = { name: '搜索保留层级', render: () => <TreeSelect nodes={demoNodes} selectionMode="checkbox" defaultChecked={['button', 'input']} defaultExpanded={['src', 'components']} defaultQuery="input" label="搜索项目树" /> };
export const NoResults: Story = { name: '无搜索结果', render: () => <TreeSelect nodes={demoNodes} defaultQuery="不存在" label="搜索项目树" /> };
export const Empty: Story = { name: '空树', render: () => <TreeSelect nodes={[]} label="空项目树" /> };
export const Disabled: Story = { name: '禁用', render: () => <TreeSelect nodes={demoNodes} value="button" disabled label="入口文件" /> };
export const FieldError: Story = { name: '字段错误', render: () => <TreeSelect nodes={demoNodes} required error="请选择一个可用入口。" label="入口文件" /> };
export const Lazy: Story = { name: '懒加载节点', render: () => <TreeSelect nodes={lazyRoots} loadChildren={loadDemo} defaultExpanded={['workspace']} label="远程目录" /> };
export const LazyErrorRetry: Story = { name: '懒加载错误与重试', render: function Render() {
  const [attempt, setAttempt] = useState(0);
  const attempts = useRef(0);
  const loader = useCallback(async (_node: AsyncTreeViewNode, { signal }: { signal: AbortSignal }) => { await wait(160, signal); attempts.current += 1; setAttempt(attempts.current); if (attempts.current === 1) throw new Error('目录暂不可用'); return [{ id: 'recovered', label: 'recovered.ts' }]; }, []);
  return <div className="grid gap-[var(--rui-content-gap-sm)]"><TreeSelect nodes={[lazyRoots[0]]} loadChildren={loader} defaultExpanded={['workspace']} label="可重试目录" /><output className="text-xs text-muted-foreground">尝试次数：{attempt}</output></div>;
} };
export const FocusReturn: Story = { name: '关闭后焦点恢复', render: () => <div className="grid max-w-sm gap-[var(--rui-content-gap)]"><TreeSelect nodes={demoNodes} value="button" defaultExpanded={['src', 'components']} label="入口文件" /><Button variant="outline">后续操作</Button></div> };
export const NativeForm: Story = { name: '原生表单值', render: function Render() {
  const [checked, setChecked] = useState(['button', 'input']); const [submitted, setSubmitted] = useState('');
  return <form className="grid gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); setSubmitted(new FormData(event.currentTarget).getAll('files').join(',')); }}><TreeSelect name="files" nodes={demoNodes} selectionMode="checkbox" checked={checked} onCheckedChange={setChecked} defaultExpanded={['src', 'components']} label="包含文件" /><Button type="submit" variant="outline">读取表单</Button><output data-testid="form-value" className="text-xs text-muted-foreground">form={submitted}</output></form>;
} };
