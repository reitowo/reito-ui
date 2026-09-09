import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import { ReorderableTreeView, moveTreeNode, transferTreeNode, type TreeMoveIntent } from '../../../../packages/ui/src/complex/reorderable-tree-view.js';
import type { TreeViewNode } from '../../../../packages/ui/src/complex/tree-view.js';
import { textControl } from '../feature-controls.js';

const compactNodes: TreeViewNode[] = [{ id: 'src', label: 'src', children: [{ id: 'components', label: 'components', children: [{ id: 'button', label: 'button.tsx' }, { id: 'input', label: 'input.tsx' }] }, { id: 'app', label: 'App.tsx' }] }, { id: 'docs', label: 'docs', children: [{ id: 'readme', label: 'README.md' }] }];
const meta = { id: "复杂-reorderabletreeview-树重排", title: "复杂/ReorderableTreeView 树重排", component: ReorderableTreeView } satisfies Meta<typeof ReorderableTreeView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: "参数调试", args: { nodes: compactNodes, treeId: 'playground', scope: 'workspace', expanded: ['src', 'components', 'docs'], value: 'button', label: '可重排项目树', onMove: () => undefined },
  argTypes: { nodes: { control: false }, treeId: textControl, scope: textControl, expanded: { control: { type: 'check' }, options: ['src', 'components', 'docs'] }, value: { control: 'select', options: ['src', 'components', 'button', 'input', 'app', 'docs', 'readme'] }, label: textControl, onMove: { control: false }, canDrop: { control: false }, moveAnnouncement: { control: false }, onExpandedChange: { control: false }, onValueChange: { control: false } },
  render: function Render(args) { const [, update] = useArgs(); return <ReorderableTreeView {...args} onValueChange={value => update({ value })} onExpandedChange={expanded => update({ expanded })} onMove={intent => { const nodes = moveTreeNode(args.nodes, intent); if (nodes) update({ nodes, value: intent.sourceId }); }} />; },
};
export const KeyboardMoves: Story = { name: "键盘移动", args: { ...Playground.args }, render: Playground.render };
export const InvalidCycle: Story = { name: "禁止环路", args: { ...Playground.args }, render: Playground.render };
export const DisabledTarget: Story = { name: "禁用落点", args: { ...Playground.args, nodes: [{ id: 'src', label: 'src', children: [{ id: 'locked', label: 'locked', disabled: true }, { id: 'file', label: 'file.ts' }] }] }, render: Playground.render };
export const Narrow: Story = { name: "布局 · 窄屏", args: { ...Playground.args }, render: function Render(args) { const [nodes, setNodes] = useState(args.nodes); return <div className="w-56 max-w-full"><ReorderableTreeView {...args} nodes={nodes} onMove={intent => { const next = moveTreeNode(nodes, intent); if (next) setNodes(next); }} /></div>; } };
export const CrossTree: Story = { name: "允许的跨树移动", args: { ...Playground.args }, render: function Render() {
  const [left, setLeft] = useState<TreeViewNode[]>([{ id: 'inbox', label: 'inbox', children: [{ id: 'draft', label: 'draft.md' }] }]);
  const [right, setRight] = useState<TreeViewNode[]>([{ id: 'archive', label: 'archive', children: [] }]);
  const move = (intent: TreeMoveIntent) => { const result = transferTreeNode(left, right, intent); if (result) { setLeft(result.source); setRight(result.target); } };
  return <div className="grid grid-cols-2 gap-[var(--rui-content-gap)]"><ReorderableTreeView nodes={left} treeId="left" scope="shared" defaultExpanded={['inbox']} label="来源树" onMove={move} /><ReorderableTreeView nodes={right} treeId="right" scope="shared" defaultExpanded={['archive']} label="目标树" onMove={move} /></div>;
} };
