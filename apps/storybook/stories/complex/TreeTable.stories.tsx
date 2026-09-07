import { useRef, useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TreeTable, type TreeTableCheckPropagation, type TreeTableFilterMode, type TreeTableNode, type TreeTableProps, type TreeTableSelectionMode } from '../../../../packages/ui/src/complex/index.js';
import { treeTableColumns, TreeTableDemo, treeTableNodes, type TreeTableDemoData } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, choiceControl, textControl } from '../feature-controls.js';

function TreeTableForDemo(props: TreeTableProps<TreeTableDemoData>) { return <TreeTable {...props} />; }
const meta = {
  title: '复杂/TreeTable 树表格',
  component: TreeTableForDemo,
  tags: ['autodocs'],
  args: { nodes: treeTableNodes, columns: treeTableColumns },
  parameters: { docs: { description: { component: '以原生 treegrid 呈现层级行，并统一展开、三态选择、父子筛选、列视图、根分页与可取消的 lazy 子节点。参数调试在同一 Canvas 中修改公开 props。' } } },
} satisfies Meta<typeof TreeTableForDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  selectionMode: TreeTableSelectionMode;
  value: string;
  checked: string[];
  expanded: string[];
  checkPropagation: TreeTableCheckPropagation;
  caption: string;
  loading: boolean;
  error: string;
  searchable: boolean;
  filterable: boolean;
  columnManager: boolean;
  query: string;
  filterMode: TreeTableFilterMode;
  pageSize: number;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { selectionMode: 'checkbox', value: 'button', checked: ['button'], expanded: ['src', 'components'], checkPropagation: 'cascade', caption: '项目文件', loading: false, error: '', searchable: true, filterable: false, columnManager: true, query: '', filterMode: 'ancestors', pageSize: 0 },
  argTypes: { selectionMode: choiceControl(['none', 'single', 'checkbox']), value: textControl, checked: { control: { type: 'check' }, options: ['src', 'components', 'button', 'input', 'app', 'docs', 'readme', 'archive'] }, expanded: { control: { type: 'check' }, options: ['src', 'components', 'docs'] }, checkPropagation: choiceControl(['cascade', 'independent']), caption: textControl, loading: booleanControl, error: textControl, searchable: booleanControl, filterable: booleanControl, columnManager: booleanControl, query: textControl, filterMode: choiceControl(['ancestors', 'subtree']), pageSize: { control: { type: 'number', min: 0, max: 4, step: 1 } } },
  parameters: { controls: { include: ['selectionMode', 'value', 'checked', 'expanded', 'checkPropagation', 'caption', 'searchable', 'query', 'filterMode', 'filterable', 'columnManager', 'pageSize', 'loading', 'error'] } },
  render: function Render(args) {
    const [, update] = useArgs<PlaygroundArgs>();
    return <TreeTable nodes={treeTableNodes} columns={treeTableColumns} selectionMode={args.selectionMode} value={args.value || undefined} onValueChange={next => update({ value: next })} checked={args.checked} onCheckedChange={next => update({ checked: next })} expanded={args.expanded} onExpandedChange={next => update({ expanded: next })} checkPropagation={args.checkPropagation} caption={args.caption} searchable={args.searchable} query={args.query} onQueryChange={next => update({ query: next })} filterMode={args.filterMode} filterable={args.filterable} columnManager={args.columnManager} pageSize={args.pageSize || undefined} loading={args.loading} error={args.error || undefined} onRetry={() => update({ error: '' })} />;
  },
};

export const Overview: Story = { name: '总览', render: () => <TreeTableDemo /> };
export const Single: Story = { name: '受控单选', render: function Render() { const [value, setValue] = useState('button'); return <div className="grid gap-[var(--rui-content-gap-sm)]"><TreeTable nodes={treeTableNodes} columns={treeTableColumns} selectionMode="single" value={value} onValueChange={setValue} defaultExpanded={['src', 'components']} caption="单选项目文件" /><output className="text-xs text-muted-foreground">value={value}</output></div>; } };
export const Checkbox: Story = { name: '级联复选', render: function Render() { const [checked, setChecked] = useState(['button']); return <TreeTable nodes={treeTableNodes} columns={treeTableColumns} selectionMode="checkbox" checked={checked} onCheckedChange={setChecked} defaultExpanded={['src', 'components']} caption="选择项目文件" />; } };
export const Partial: Story = { name: '父级半选', render: () => <TreeTable nodes={treeTableNodes} columns={treeTableColumns} selectionMode="checkbox" checked={['button']} defaultExpanded={['src', 'components']} caption="部分选择" /> };
export const Independent: Story = { name: '独立复选', render: () => <TreeTable nodes={treeTableNodes} columns={treeTableColumns} selectionMode="checkbox" defaultChecked={['components']} checkPropagation="independent" defaultExpanded={['src', 'components']} caption="独立选择" /> };
export const Collapsed: Story = { name: '全部折叠', render: () => <TreeTable nodes={treeTableNodes} columns={treeTableColumns} selectionMode="single" caption="折叠层级" /> };
export const ControlledExpansion: Story = { name: '受控展开', render: function Render() { const [expanded, setExpanded] = useState(['src']); return <TreeTable nodes={treeTableNodes} columns={treeTableColumns} expanded={expanded} onExpandedChange={setExpanded} caption="受控展开" />; } };
export const DisabledRow: Story = { name: '禁用层级行', render: () => <TreeTable nodes={treeTableNodes} columns={treeTableColumns} selectionMode="checkbox" defaultExpanded={['docs']} caption="禁用行" /> };
export const Empty: Story = { name: '空数据', render: () => <TreeTable nodes={[]} columns={treeTableColumns} caption="空项目" /> };
export const Loading: Story = { name: '加载中', render: () => <TreeTable nodes={treeTableNodes} columns={treeTableColumns} loading caption="加载项目" /> };
export const ErrorRetry: Story = { name: '错误与重试', render: function Render() { const [failed, setFailed] = useState(true); return <TreeTable nodes={treeTableNodes} columns={treeTableColumns} error={failed ? '层级数据暂不可用' : undefined} onRetry={() => setFailed(false)} caption="可重试项目" />; } };
export const NoSelection: Story = { name: '只读层级数据', render: () => <TreeTable nodes={treeTableNodes} columns={treeTableColumns} selectionMode="none" defaultExpanded={['src', 'components', 'docs']} caption="项目概览" /> };
export const Narrow: Story = { name: '窄容器', render: () => <div className="max-w-sm"><TreeTable nodes={treeTableNodes} columns={treeTableColumns} selectionMode="checkbox" defaultExpanded={['src', 'components']} caption="窄表格" /></div> };
export const LongContent: Story = { name: '长内容', render: () => <TreeTable nodes={[{ id: 'workspace', data: { name: 'very-long-workspace-directory-name', kind: '目录', status: '变更' as const }, children: [{ id: 'nested', data: { name: 'a-very-long-component-filename-for-overflow.tsx', kind: 'React TypeScript', status: '就绪' as const } }] }]} columns={treeTableColumns} defaultExpanded={['workspace']} caption="长内容项目" /> };

export const SearchAncestors: Story = { name: '搜索保留祖先路径', render: () => <TreeTable nodes={treeTableNodes} columns={treeTableColumns} searchable defaultQuery="button" filterMode="ancestors" caption="祖先路径筛选" /> };
export const SearchSubtree: Story = { name: '父级匹配保留子树', render: () => <TreeTable nodes={treeTableNodes} columns={treeTableColumns} searchable defaultQuery="src" filterMode="subtree" caption="子树筛选" /> };
export const ColumnFilters: Story = { name: '列筛选', render: () => <TreeTable nodes={treeTableNodes} columns={treeTableColumns} filterable defaultColumnFilters={{ status: '变更' }} caption="按列筛选" /> };
export const ColumnManager: Story = { name: '列显隐管理', render: () => <TreeTable nodes={treeTableNodes} columns={treeTableColumns} columnManager defaultExpanded={['src', 'components']} caption="列管理" /> };

const pagedTreeNodes = [
  ...treeTableNodes,
  { id: 'tests', data: { name: 'tests', kind: '目录', status: '就绪' as const } },
  { id: 'scripts', data: { name: 'scripts', kind: '目录', status: '变更' as const } },
  { id: 'package', data: { name: 'package.json', kind: 'JSON', status: '就绪' as const } },
];
export const RootPagination: Story = { name: '根节点分页', render: function Render() {
  const [page, setPage] = useState(0);
  return <div className="grid gap-[var(--rui-content-gap-sm)]"><TreeTable nodes={pagedTreeNodes} columns={treeTableColumns} page={page} onPageChange={setPage} pageSize={2} caption="分页项目" /><output className="text-xs text-muted-foreground">page={page}</output></div>;
} };
export const ControlledViews: Story = { name: '受控查询与视图', render: function Render() {
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState<Record<string, boolean>>({ status: false });
  const [page, setPage] = useState(0);
  return <div className="grid gap-[var(--rui-content-gap-sm)]"><TreeTable nodes={pagedTreeNodes} columns={treeTableColumns} searchable columnManager query={query} onQueryChange={setQuery} columnVisibility={visibility} onColumnVisibilityChange={setVisibility} page={page} onPageChange={setPage} pageSize={2} caption="受控树表视图" /><output className="text-xs text-muted-foreground">query={query || '空'}; page={page}; status={String(visibility.status !== false)}</output></div>;
} };

const lazyTreeNodes: TreeTableNode<TreeTableDemoData>[] = [{ id: 'remote', data: { name: 'remote', kind: '远程目录', status: '变更' }, loadable: true }];
const lazyChildren: TreeTableNode<TreeTableDemoData>[] = [{ id: 'remote-config', data: { name: 'config.ts', kind: 'TypeScript', status: '就绪' } }];
function resolveLazy(signal: AbortSignal) {
  return new Promise<typeof lazyChildren>((resolve, reject) => {
    const timer = window.setTimeout(() => resolve(lazyChildren), 120);
    signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('已取消', 'AbortError')); }, { once: true });
  });
}
export const LazyChildren: Story = { name: '按需子节点', render: () => <TreeTable nodes={lazyTreeNodes} columns={treeTableColumns} loadChildren={(_, context) => resolveLazy(context.signal)} caption="按需项目" /> };
export const LazyErrorRetry: Story = { name: '子节点错误重试', render: function Render() {
  const attempts = useRef(0);
  return <TreeTable nodes={lazyTreeNodes} columns={treeTableColumns} loadChildren={async (_, context) => {
    attempts.current += 1;
    if (attempts.current === 1) throw new Error('远程目录暂不可用');
    return resolveLazy(context.signal);
  }} caption="可重试远程项目" />;
} };
export const SelectionAcrossViews: Story = { name: '筛选与更新保持选择', render: function Render() {
  const [checked, setChecked] = useState(['button']);
  return <TreeTable nodes={treeTableNodes} columns={treeTableColumns} selectionMode="checkbox" checked={checked} onCheckedChange={setChecked} searchable defaultExpanded={['src', 'components']} caption="跨视图选择" />;
} };
export const LazySelection: Story = { name: '异步子节点继承选择', render: () => <TreeTable nodes={lazyTreeNodes} columns={treeTableColumns} selectionMode="checkbox" defaultChecked={['remote']} loadChildren={(_, context) => resolveLazy(context.signal)} caption="异步选择" /> };
