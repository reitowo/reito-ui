import type { Meta, StoryObj } from '@storybook/react-vite';
import { useCallback, useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import { AsyncTreeView, type AsyncTreeViewNode } from '../../../../packages/ui/src/complex/async-tree-view.js';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { numberControl, textControl } from '../feature-controls.js';

const roots: AsyncTreeViewNode[] = [{ id: 'workspace', label: 'workspace', loadable: true }, { id: 'empty', label: 'empty', loadable: true }];
const wait = (duration: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  const timer = window.setTimeout(resolve, duration);
  signal?.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
});
const loadDemo = async (node: AsyncTreeViewNode, { signal }: { signal: AbortSignal }) => {
  await wait(280, signal);
  return node.id === 'workspace' ? [{ id: 'src', label: 'src', children: [{ id: 'app', label: 'App.tsx' }, { id: 'tokens', label: 'tokens.json' }] }] : [];
};

const meta = { id: "复杂-asynctreeview-异步树", title: "复杂/AsyncTreeView 异步树", component: AsyncTreeView } satisfies Meta<typeof AsyncTreeView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: "参数调试",
  args: { nodes: roots, expanded: ['workspace', 'src'], refreshKey: 0, label: '异步项目树', loadingLabel: '正在加载', retryLabel: '重试', emptyMessage: '没有子节点', loadChildren: loadDemo },
  argTypes: {
    nodes: { control: false }, loadChildren: { control: false }, expanded: { control: { type: 'check' }, options: ['workspace', 'src', 'empty'] }, refreshKey: numberControl,
    label: textControl, loadingLabel: textControl, retryLabel: textControl, emptyMessage: textControl, loadErrorLabel: { control: false }, onExpandedChange: { control: false },
  },
  render: function Render(args) { const [, update] = useArgs(); return <AsyncTreeView {...args} onExpandedChange={next => update({ expanded: next })} />; },
};
export const Loading: Story = { name: "状态 · 加载中", args: { nodes: [{ id: 'remote', label: 'remote', loadable: true }], defaultExpanded: ['remote'], label: '加载中的项目树', loadChildren: () => new Promise(() => undefined) } };
export const Empty: Story = { name: "状态 · 空内容", args: { nodes: [{ id: 'empty', label: 'empty', loadable: true }], defaultExpanded: ['empty'], label: '空子节点项目树', loadChildren: async () => { await wait(120); return []; } } };
export const ErrorRetry: Story = { name: "错误与重试", args: { nodes: roots, loadChildren: loadDemo }, render: function Render() {
  const [attempt, setAttempt] = useState(0);
  const loader = useCallback(async (_node: AsyncTreeViewNode, { signal }: { signal: AbortSignal }) => { await wait(160, signal); setAttempt(current => current + 1); if (attempt === 0) throw new Error('目录暂不可用'); return [{ id: 'recovered', label: 'recovered.ts' }]; }, [attempt]);
  return <div className="grid gap-[var(--rui-content-gap-sm)]"><AsyncTreeView nodes={[roots[0]]} defaultExpanded={['workspace']} label="可重试项目树" loadChildren={loader} /><span role="status" className="text-xs text-muted-foreground">尝试次数：{attempt}</span></div>;
} };
export const RefreshStale: Story = { name: "刷新与过期响应", args: { nodes: roots, loadChildren: loadDemo }, render: function Render() {
  const [revision, setRevision] = useState(1);
  const loader = useCallback(async () => { const requested = revision; await wait(requested === 1 ? 700 : 120); return [{ id: `revision-${requested}`, label: `revision-${requested}.tsx` }]; }, [revision]);
  return <div className="grid gap-[var(--rui-content-gap-sm)]"><Button variant="outline" size="xs" onClick={() => setRevision(2)}>刷新到新版</Button><AsyncTreeView nodes={[roots[0]]} defaultExpanded={['workspace']} refreshKey={revision} label="可刷新项目树" loadChildren={loader} /></div>;
} };
export const CheckboxAfterLoad: Story = { name: "加载后复选级联", args: { nodes: [{ id: 'workspace', label: 'workspace', loadable: true }], defaultExpanded: ['workspace', 'src'], selectionMode: 'checkbox', defaultChecked: ['workspace'], label: '异步复选项目树', loadChildren: loadDemo } };
export const CollapseCancellation: Story = { name: "折叠取消请求", args: { nodes: roots, loadChildren: loadDemo }, render: function Render() {
  const [expanded, setExpanded] = useState(['workspace']); const [aborted, setAborted] = useState(0);
  const loader = useCallback((_node: AsyncTreeViewNode, { signal }: { signal: AbortSignal }) => new Promise<AsyncTreeViewNode[]>((resolve, reject) => {
    const timer = window.setTimeout(() => resolve([{ id: 'late', label: 'late.ts' }]), 700);
    signal.addEventListener('abort', () => { window.clearTimeout(timer); setAborted(value => value + 1); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
  }), []);
  return <div className="grid gap-[var(--rui-content-gap-sm)]"><Button variant="outline" size="xs" onClick={() => setExpanded(current => current.length ? [] : ['workspace'])}>{expanded.length ? '折叠' : '重新展开'}</Button><AsyncTreeView nodes={[roots[0]]} expanded={expanded} onExpandedChange={setExpanded} label="可取消项目树" loadChildren={loader} /><span role="status" className="text-xs text-muted-foreground">已取消：{aborted}</span></div>;
} };
