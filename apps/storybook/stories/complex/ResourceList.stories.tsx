import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { booleanControl, choiceControl, numberControl, recipeControl, textControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ResourceList, type ResourceItem } from '../../../../packages/ui/src/complex/resource-list.js';
import { ResourceListDemo, demoResources } from '../../../../packages/ui/src/complex/catalog.js';
import { Button } from '../../../../packages/ui/src/primitives/button.js';

const remoteResources: ResourceItem[] = Array.from({ length: 80 }, (_, index) => ({
  id: `resource-${String(index + 1).padStart(3, '0')}`,
  name: `resource-${String(index + 1).padStart(3, '0')}.md`,
  kind: index % 3 === 0 ? '文档' : index % 3 === 1 ? '配置' : '代码',
  description: `远程结果 ${index + 1} · 稳定 ID 保持选择`,
  updatedAt: `2026-09-${String((index % 28) + 1).padStart(2, '0')}T10:00:00+08:00`,
}));

const meta = { id: "复杂-resourcelist-资源列表",
  title: "复杂/ResourceList 资源列表", component: ResourceListDemo,
  parameters: { docs: { description: { component: '资源列表支持本地或远程数据、虚拟化、增量加载、稳定 ID 选择和宿主行操作。远程模式由宿主响应查询与排序，并传入当前加载窗口和总量。' } } },
} satisfies Meta<typeof ResourceListDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { selectionMode: 'multiple', selectedIds: [], query: '', sort: 'name-asc', loading: false, disabled: false, label: '项目资源', error: '', empty: false, virtualized: false, overscan: 4 },
  argTypes: {
    selectionMode: choiceControl(['none', 'single', 'multiple']),
    selectedIds: { control: 'check', options: demoResources.filter(item => !item.disabled).map(item => item.id), description: '稳定 ID 选择；single 与 none 会同步规范化 Controls。' },
    query: textControl, sort: choiceControl(['name-asc', 'name-desc', 'updated-desc']), loading: booleanControl, disabled: booleanControl,
    label: textControl, error: textControl, empty: recipeControl(booleanControl, '传入空 items。'), virtualized: booleanControl, overscan: numberControl,
  },
  parameters: { controls: { include: ['selectionMode', 'selectedIds', 'query', 'sort', 'loading', 'disabled', 'label', 'error', 'empty', 'virtualized', 'overscan'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs();
    useEffect(() => {
      const selectedIds = args.selectedIds ?? [];
      if (args.selectionMode === 'none' && selectedIds.length) updateArgs({ selectedIds: [] });
      else if (args.selectionMode === 'single' && selectedIds.length > 1) updateArgs({ selectedIds: selectedIds.slice(0, 1) });
    }, [args.selectionMode, args.selectedIds, updateArgs]);
    const { empty, ...props } = args;
    return <ResourceList {...props} items={empty ? [] : demoResources} viewportClassName="h-56" onSelectionChange={selectedIds => updateArgs({ selectedIds })} onQueryChange={query => updateArgs({ query })} onSortChange={sort => updateArgs({ sort })} onRetry={() => updateArgs({ error: '' })} />;
  },
};

export const Overview: Story = { name: "总览对比", render: () => <ResourceListDemo /> };

function LocalInteractive() {
  const [selected, setSelected] = useState<string[]>([]);
  const [opened, setOpened] = useState('');
  return <div className="space-y-[var(--rui-content-gap)]">
    <ResourceList items={demoResources} label="项目资源" selectionMode="multiple" selectedIds={selected} onSelectionChange={setSelected}
      actions={[{ id: 'open', label: '打开', onAction: item => setOpened(item.name) }]} />
    <p role="status" className="text-xs text-muted-foreground">{opened ? `已打开 ${opened}（本地预览）` : '本地交互状态'}</p>
  </div>;
}

export const Interactive: Story = {
  name: "交互 · 筛选、批量选择、排序与行操作",
  render: () => <LocalInteractive />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('checkbox', { name: '选择 specs.md' }));
    await userEvent.type(canvas.getByRole('textbox', { name: '搜索项目资源' }), 'tokens');
    expect(canvas.getByText('显示 1 / 4 项 · 已选择 1 项')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('checkbox', { name: '选择筛选结果' }));
    expect(canvas.getByText('显示 1 / 4 项 · 已选择 2 项')).toBeInTheDocument();
    await userEvent.clear(canvas.getByRole('textbox', { name: '搜索项目资源' }));
    expect(canvas.getByRole('checkbox', { name: '选择 specs.md' })).toBeChecked();
    expect(canvas.getByRole('checkbox', { name: '选择 tokens.json' })).toBeChecked();
    await userEvent.click(canvas.getByRole('combobox', { name: '资源排序' }));
    await userEvent.click(body.getByRole('option', { name: '名称 Z → A' }));
    const rows = within(canvas.getByRole('list', { name: '项目资源列表' })).getAllByRole('listitem');
    expect(within(rows[0]).getByText('workspace.png')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '打开 tokens.json' }));
    expect(canvas.getByText('已打开 tokens.json（本地预览）')).toBeInTheDocument();
  },
};

function Incremental({ automatic = false, error = false }: { automatic?: boolean; error?: boolean }) {
  const [count, setCount] = useState(16);
  const [selected, setSelected] = useState(['resource-003']);
  return <ResourceList items={remoteResources.slice(0, count)} dataMode="remote" totalCount={remoteResources.length} virtualized
    viewportClassName="h-52" selectionMode="multiple" selectedIds={selected} onSelectionChange={setSelected}
    hasMore={count < remoteResources.length} loadMoreError={error ? '下一批资源加载失败' : undefined}
    loadMoreMode={automatic ? 'automatic' : 'manual'} loadMoreThreshold={2} onLoadMore={() => setCount(current => Math.min(remoteResources.length, current + 16))}
    label={automatic ? '自动增量资源' : '手动增量资源'} />;
}

export const Virtualized: Story = { name: "虚拟化大列表", render: () => <ResourceList items={remoteResources} dataMode="remote" totalCount={remoteResources.length} virtualized viewportClassName="h-64" selectionMode="multiple" label="虚拟资源" /> };
export const ManualIncremental: Story = { name: "手动增量加载", render: () => <Incremental /> };
export const AutomaticIncremental: Story = { name: "滚动触发增量加载", render: () => <Incremental automatic /> };
export const LoadMoreError: Story = { name: "增量加载错误与重试", render: () => <Incremental error /> };

export const QueryReplacement: Story = {
  name: "远程查询替换结果",
  render: function QueryReplacementRender() {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(['resource-003']);
    const items = useMemo(() => query ? remoteResources.slice(40, 48) : remoteResources.slice(0, 12), [query]);
    return <ResourceList items={items} dataMode="remote" totalCount={query ? 8 : 80} virtualized viewportClassName="h-52" query={query} onQueryChange={setQuery} selectionMode="multiple" selectedIds={selected} onSelectionChange={setSelected} label="远程查询资源" />;
  },
};

export const SelectionAcrossWindows: Story = {
  name: "跨窗口选择保持",
  render: function SelectionAcrossWindowsRender() {
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState(['resource-003']);
    const window = remoteResources.slice(page * 12, page * 12 + 12);
    return <div className="space-y-[var(--rui-content-gap)]">
      <ResourceList items={window} dataMode="remote" totalCount={remoteResources.length} selectionMode="multiple" selectedIds={selected} onSelectionChange={setSelected} label="分页窗口资源" />
      <div className="flex items-center gap-[var(--rui-content-gap-sm)]"><Button size="sm" variant="outline" onClick={() => setPage(current => current ? 0 : 1)}>切换数据窗口</Button><output className="text-xs text-muted-foreground">已选：{selected.join(', ') || '无'}</output></div>
    </div>;
  },
};

export const SingleSelection: Story = { name: "单选", render: () => <ResourceList items={demoResources.filter(item => !item.disabled)} selectionMode="single" /> };
export const InitialLoading: Story = { name: "首次加载", render: () => <ResourceList items={[]} loading /> };
export const InitialError: Story = { name: "首次加载错误", render: () => <ResourceList items={[]} error="无法加载资源，请检查宿主数据来源。" onRetry={() => undefined} /> };
export const Empty: Story = { name: "空资源", render: () => <ResourceList items={[]} /> };
export const Disabled: Story = { name: "禁用资源操作", render: () => <ResourceList items={demoResources.filter(item => !item.disabled)} disabled /> };
export const Narrow: Story = { name: "窄宽度", render: () => <div className="max-w-80"><ResourceList items={remoteResources.slice(0, 10)} dataMode="remote" totalCount={80} virtualized viewportClassName="h-52" selectionMode="multiple" hasMore onLoadMore={() => undefined} label="窄面板资源" /></div> };

type PlaygroundArgs = Pick<ComponentProps<typeof ResourceList>, 'selectionMode' | 'selectedIds' | 'query' | 'sort' | 'loading' | 'disabled' | 'label' | 'error' | 'virtualized' | 'overscan'> & { empty: boolean };
