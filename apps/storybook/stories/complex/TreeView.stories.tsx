import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import { TreeView } from '../../../../packages/ui/src/complex/tree-view.js';
import { demoNodes } from '../../../../packages/ui/src/complex/catalog.js';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { choiceControl, textControl } from '../feature-controls.js';

const meta = { title: '复杂/TreeView 树形导航', component: TreeView } satisfies Meta<typeof TreeView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  name: '参数调试',
  args: { nodes: demoNodes, value: 'button', expanded: ['src', 'components'], label: '项目树', emptyMessage: '没有节点' },
  argTypes: {
    nodes: { control: false }, value: choiceControl(['src', 'components', 'button', 'input', 'private', 'app', 'docs', 'guide', 'tokens', 'readme']),
    expanded: { control: { type: 'check' }, options: ['src', 'components', 'docs'] }, label: textControl, emptyMessage: textControl,
    onValueChange: { control: false }, onExpandedChange: { control: false }, defaultValue: { control: false }, defaultExpanded: { control: false }, className: { control: false },
  },
  render: function Render(args) { const [, update] = useArgs(); return <TreeView {...args} onValueChange={next => update({ value: next })} onExpandedChange={next => update({ expanded: next })} />; },
};
export const Empty: Story = { args: { nodes: [], label: '空项目树' } };
export const Disabled: Story = { args: { nodes: demoNodes, expanded: ['src', 'components'], value: 'button', label: '含禁用节点的项目树' } };
export const Collapsed: Story = { args: { nodes: demoNodes, expanded: [], label: '折叠项目树' } };
export const Narrow: Story = { args: { nodes: [{ id: 'root', label: '特别长的工作区目录 workspace-components', children: [{ id: 'file', label: 'WorkspaceConfiguration.settings.tsx', description: '完整说明保留在标题中' }] }], expanded: ['root'], label: '窄项目树' }, render: args => <div className="w-52 max-w-full"><TreeView {...args} /></div> };
export const FocusRecovery: Story = { name: '折叠后的焦点恢复', args: { nodes: demoNodes }, render: function Render() { const [expanded, setExpanded] = useState(['src', 'components']); return <div className="grid gap-[var(--rui-content-gap)]"><Button variant="outline" onClick={() => setExpanded([])}>折叠 src</Button><TreeView nodes={demoNodes} value="input" expanded={expanded} onExpandedChange={setExpanded} label="焦点恢复项目树" /></div>; } };
