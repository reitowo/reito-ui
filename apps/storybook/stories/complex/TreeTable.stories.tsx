import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TreeTable, type TreeTableCheckPropagation, type TreeTableProps, type TreeTableSelectionMode } from '../../../../packages/ui/src/complex/index.js';
import { treeTableColumns, TreeTableDemo, treeTableNodes, type TreeTableDemoData } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, choiceControl, textControl } from '../feature-controls.js';

function TreeTableForDemo(props: TreeTableProps<TreeTableDemoData>) { return <TreeTable {...props} />; }
const meta = {
  title: '复杂/TreeTable 树表格',
  component: TreeTableForDemo,
  tags: ['autodocs'],
  args: { nodes: treeTableNodes, columns: treeTableColumns },
  parameters: { docs: { description: { component: '以原生表格结构呈现层级行，使用 treegrid 行焦点模型，并复用 TreeView 的展开与三态级联规则。' } } },
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
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { selectionMode: 'checkbox', value: 'button', checked: ['button'], expanded: ['src', 'components'], checkPropagation: 'cascade', caption: '项目文件', loading: false, error: '' },
  argTypes: { selectionMode: choiceControl(['none', 'single', 'checkbox']), value: textControl, checked: { control: { type: 'check' }, options: ['src', 'components', 'button', 'input', 'app', 'docs', 'readme', 'archive'] }, expanded: { control: { type: 'check' }, options: ['src', 'components', 'docs'] }, checkPropagation: choiceControl(['cascade', 'independent']), caption: textControl, loading: booleanControl, error: textControl },
  parameters: { controls: { include: ['selectionMode', 'value', 'checked', 'expanded', 'checkPropagation', 'caption', 'loading', 'error'] } },
  render: function Render(args) {
    const [, update] = useArgs<PlaygroundArgs>();
    return <TreeTable nodes={treeTableNodes} columns={treeTableColumns} selectionMode={args.selectionMode} value={args.value || undefined} onValueChange={next => update({ value: next })} checked={args.checked} onCheckedChange={next => update({ checked: next })} expanded={args.expanded} onExpandedChange={next => update({ expanded: next })} checkPropagation={args.checkPropagation} caption={args.caption} loading={args.loading} error={args.error || undefined} onRetry={() => update({ error: '' })} />;
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
