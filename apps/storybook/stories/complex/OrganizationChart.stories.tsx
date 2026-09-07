import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { Badge } from '../../../../packages/ui/src/primitives/badge.js';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { OrganizationChart, type OrganizationChartNode } from '../../../../packages/ui/src/complex/organization-chart.js';
import { OrganizationChartDemo, organizationDemoNodes } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, textControl } from '../feature-controls.js';

const meta = {
  title: '复杂/OrganizationChart 组织结构图',
  component: OrganizationChart,
  parameters: { docs: { description: { component: '紧凑层级关系图，支持受控折叠与单选、内容模板、局部横向滚动，以及 ARIA tree 方向键导航。' } } },
} satisfies Meta<typeof OrganizationChart>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  selectedId: string | null;
  collapsedIds: string[];
  collapsible: boolean;
  disabled: boolean;
  label: string;
  emptyLabel: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { selectedId: 'lead', collapsedIds: [], collapsible: true, disabled: false, label: '组件团队结构', emptyLabel: '没有可展示的团队结构' },
  argTypes: {
    selectedId: { control: 'select', options: ['lead', 'design', 'tokens', 'stories', 'engineering', 'runtime', 'quality', null] },
    collapsedIds: { control: { type: 'check' }, options: ['lead', 'design', 'engineering'] },
    collapsible: booleanControl,
    disabled: booleanControl,
    label: textControl,
    emptyLabel: textControl,
  },
  parameters: { controls: { include: ['selectedId', 'collapsedIds', 'collapsible', 'disabled', 'label', 'emptyLabel'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <OrganizationChart
      nodes={organizationDemoNodes}
      {...args}
      onSelectedIdChange={selectedId => updateArgs({ selectedId })}
      onCollapsedIdsChange={collapsedIds => updateArgs({ collapsedIds })}
    />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('treeitem', { name: /工程实现/ }).querySelector(':scope > [data-slot="organization-chart-node"]')!);
    await waitFor(() => expect(canvas.getByRole('treeitem', { name: /工程实现/ })).toHaveAttribute('aria-selected', 'true'));
    canvas.getByRole('treeitem', { name: /工程实现/ }).focus();
    fireEvent.keyDown(canvas.getByRole('treeitem', { name: /工程实现/ }), { key: 'ArrowLeft' });
    await waitFor(() => expect(canvas.getByRole('treeitem', { name: /工程实现/ })).toHaveAttribute('aria-expanded', 'false'));
    fireEvent.keyDown(canvas.getByRole('treeitem', { name: /工程实现/ }), { key: 'ArrowRight' });
    await waitFor(() => expect(canvas.getByRole('treeitem', { name: /工程实现/ })).toHaveAttribute('aria-expanded', 'true'));
  },
};

export const Default: Story = { name: '默认结构', args: { nodes: organizationDemoNodes }, render: () => <OrganizationChartDemo /> };

function ControlledExample() {
  const [selectedId, setSelectedId] = useState<string | null>('design');
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  return <div className="grid gap-[var(--rui-content-gap)]">
    <div className="flex flex-wrap gap-[var(--rui-space-1)]">
      <Button size="xs" variant="outline" onClick={() => setCollapsedIds([])}>全部展开</Button>
      <Button size="xs" variant="outline" onClick={() => setCollapsedIds(['lead', 'design', 'engineering'])}>全部折叠</Button>
    </div>
    <OrganizationChart nodes={organizationDemoNodes} selectedId={selectedId} onSelectedIdChange={setSelectedId} collapsedIds={collapsedIds} onCollapsedIdsChange={setCollapsedIds} label="受控团队结构" />
    <p data-testid="organization-state" role="status" className="text-xs text-muted-foreground">选中：{selectedId ?? '无'} · 折叠：{collapsedIds.join(', ') || '无'}</p>
  </div>;
}

export const Controlled: Story = { name: '受控选择与折叠', args: { nodes: organizationDemoNodes }, render: () => <ControlledExample /> };

export const CustomTemplate: Story = {
  name: '节点内容模板',
  args: { nodes: organizationDemoNodes },
  render: () => <OrganizationChart
    nodes={organizationDemoNodes}
    defaultSelectedId="engineering"
    label="带模板的团队结构"
    renderNode={(node, state) => <>
      <span className="flex min-w-0 items-center gap-[var(--rui-space-1)]">
        <span className="min-w-0 flex-1 truncate font-medium">{node.label}</span>
        {state.depth === 1 && <Badge variant="secondary">Owner</Badge>}
      </span>
      <span className="mt-[var(--rui-space-1)] truncate text-xs text-muted-foreground">L{state.depth} · {node.description ?? '未填写说明'}</span>
    </>}
  />,
};

export const InitiallyCollapsed: Story = { name: '初始折叠', args: { nodes: organizationDemoNodes, defaultCollapsedIds: ['design', 'engineering'], defaultSelectedId: 'lead', label: '初始折叠团队结构' } };
export const NonCollapsible: Story = { name: '固定展开', args: { nodes: organizationDemoNodes, collapsible: false, defaultSelectedId: 'lead', label: '固定展开团队结构' } };
export const Disabled: Story = { name: '整体禁用', args: { nodes: organizationDemoNodes, disabled: true, defaultSelectedId: 'lead', label: '禁用团队结构' } };
export const DisabledNode: Story = { name: '禁用节点', args: { nodes: [{ id: 'root', label: '工作区', children: [{ id: 'public', label: '公开组件' }, { id: 'private', label: '受保护模块', description: '可浏览但不可选择或折叠', disabled: true, children: [{ id: 'secret', label: '内部实现' }] }] }], defaultSelectedId: 'public', label: '包含禁用节点的结构' } };
export const MultipleRoots: Story = { name: '多个根节点', args: { nodes: [{ id: 'product', label: '产品', children: [{ id: 'research', label: '研究' }] }, { id: 'platform', label: '平台', children: [{ id: 'runtime', label: '运行时' }] }], label: '多根结构' } };
export const LongContent: Story = { name: '长内容与局部滚动', args: { nodes: [{ id: 'root', label: '跨桌面端与浏览器端复用的组件系统负责人', description: '负责主题、密度、可访问行为和发布边界', children: Array.from({ length: 5 }, (_, index) => ({ id: `long-${index}`, label: `第 ${index + 1} 个具有特别长名称的工作小组`, description: '说明会在节点内截断，完整内容保留在 title 和可访问名称中' })) }], label: '长内容团队结构' }, render: args => <div className="max-w-[var(--rui-container-sm)]"><OrganizationChart {...args} /></div> };
export const Narrow: Story = { name: '窄工作面', args: { nodes: organizationDemoNodes, defaultCollapsedIds: ['design', 'engineering'], label: '窄工作面团队结构' }, render: args => <div className="max-w-[var(--rui-container-3xs)]"><OrganizationChart {...args} /></div> };
export const Empty: Story = { name: '空状态', args: { nodes: [], label: '空团队结构', emptyLabel: '当前没有组织关系' } };
