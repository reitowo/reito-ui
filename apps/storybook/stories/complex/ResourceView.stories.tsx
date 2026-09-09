import { useEffect, useState, type ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { booleanControl, choiceControl, numberControl, recipeControl, textControl } from '../feature-controls.js';
import { ResourceView } from '../../../../packages/ui/src/complex/resource-view.js';
import { ResourceViewDemo, demoResources } from '../../../../packages/ui/src/complex/catalog.js';
import type { ResourceItem } from '../../../../packages/ui/src/complex/resource-list.js';

const resources: ResourceItem[] = Array.from({ length: 26 }, (_, index) => ({
  id: `view-${String(index + 1).padStart(2, '0')}`,
  name: `surface-${String(index + 1).padStart(2, '0')}.tsx`,
  kind: index % 3 === 0 ? '文档' : index % 3 === 1 ? '配置' : '代码',
  description: `同一资源集合中的第 ${index + 1} 项`,
  updatedAt: `2026-09-${String((index % 26) + 1).padStart(2, '0')}T10:00:00+08:00`,
  disabled: index === 7,
}));

const meta = { id: "复杂-resourceview-资源视图",
  title: "复杂/ResourceView 资源视图", component: ResourceViewDemo,
  parameters: { docs: { description: { component: 'ResourceView 在同一状态层切换列表与网格。查询、排序、页码、选择和动作不会随布局切换复制或重置；远程模式由宿主传入当前页。' } } },
} satisfies Meta<typeof ResourceViewDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = Pick<ComponentProps<typeof ResourceView>, 'layout' | 'selectionMode' | 'selectedIds' | 'query' | 'sort' | 'page' | 'pageSize' | 'loading' | 'disabled' | 'label'> & { empty: boolean; error: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { layout: 'list', selectionMode: 'multiple', selectedIds: [], query: '', sort: 'name-asc', page: 0, pageSize: 6, loading: false, disabled: false, label: '组件资源', empty: false, error: '' },
  argTypes: {
    layout: choiceControl(['list', 'grid']), selectionMode: choiceControl(['none', 'single', 'multiple']),
    selectedIds: { control: 'check', options: resources.filter(item => !item.disabled).slice(0, 12).map(item => item.id) },
    query: textControl, sort: choiceControl(['name-asc', 'name-desc', 'updated-desc']), page: numberControl, pageSize: choiceControl([3, 6, 9, 12]),
    loading: booleanControl, disabled: booleanControl, label: textControl, empty: recipeControl(booleanControl, '传入空集合。'), error: textControl,
  },
  parameters: { controls: { include: ['layout', 'selectionMode', 'selectedIds', 'query', 'sort', 'page', 'pageSize', 'loading', 'disabled', 'label', 'empty', 'error'] } },
  render: function Render(args) {
    const [, update] = useArgs();
    useEffect(() => {
      const selectedIds = args.selectedIds ?? [];
      if (args.selectionMode === 'none' && selectedIds.length) update({ selectedIds: [] });
      else if (args.selectionMode === 'single' && selectedIds.length > 1) update({ selectedIds: selectedIds.slice(0, 1) });
    }, [args.selectionMode, args.selectedIds, update]);
    const { empty, ...props } = args;
    return <ResourceView {...props} items={empty ? [] : resources} onLayoutChange={layout => update({ layout })} onSelectionChange={selectedIds => update({ selectedIds })}
      onQueryChange={query => update({ query, page: 0 })} onSortChange={sort => update({ sort, page: 0 })} onPageChange={page => update({ page })} onRetry={() => update({ error: '' })} />;
  },
};

export const Overview: Story = { name: "总览对比", render: () => <ResourceViewDemo /> };

export const StateContinuity: Story = {
  name: "布局切换保持同一状态",
  render: function Render() {
    const [layout, setLayout] = useState<'list' | 'grid'>('grid');
    const [selected, setSelected] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    return <div className="space-y-[var(--rui-content-gap)]"><ResourceView items={resources} label="连续状态资源" layout={layout} onLayoutChange={setLayout} page={page} onPageChange={setPage} pageSize={6} selectionMode="multiple" selectedIds={selected} onSelectionChange={setSelected} /><output className="text-xs text-muted-foreground">layout={layout}; page={page}; selected={selected.join(',') || '空'}</output></div>;
  },
};

export const ControlledLayout: Story = { name: "受控布局偏好", render: function Render() { const [layout, setLayout] = useState<'list' | 'grid'>('list'); return <ResourceView items={demoResources} layout={layout} onLayoutChange={setLayout} label="受控布局" />; } };
export const Pagination: Story = { name: "本地分页", render: () => <ResourceView items={resources} pageSize={6} selectionMode="multiple" label="分页资源" /> };
export const QueryResetsPage: Story = { name: "查询与排序回到首页", render: function Render() { const [page, setPage] = useState(2); const [query, setQuery] = useState(''); return <div className="space-y-[var(--rui-content-gap)]"><ResourceView items={resources} page={page} onPageChange={setPage} pageSize={6} query={query} onQueryChange={setQuery} label="查询分页资源" /><output className="text-xs text-muted-foreground">page={page}</output></div>; } };
export const RemotePage: Story = { name: "远程受控分页", render: function Render() { const [page, setPage] = useState(0); return <ResourceView items={resources.slice(page * 6, page * 6 + 6)} dataMode="remote" totalCount={resources.length} page={page} onPageChange={setPage} pageSize={6} selectionMode="multiple" label="远程分页资源" />; } };
export const MultipleGrid: Story = { name: "网格多选", render: () => <ResourceView items={resources} defaultLayout="grid" selectionMode="multiple" pageSize={6} label="网格多选资源" /> };
export const SingleSelection: Story = { name: "列表网格单选", render: () => <ResourceView items={resources.slice(0, 8)} defaultLayout="grid" selectionMode="single" pageSize={8} label="单选资源" /> };
export const CustomGridContent: Story = { name: "自定义网格内容", render: () => <ResourceView items={resources.slice(0, 6)} defaultLayout="grid" selectionMode="none" renderGridItem={item => <dl className="grid grid-cols-2 gap-1 text-xs"><dt className="text-muted-foreground">标识</dt><dd className="truncate text-right">{item.id}</dd><dt className="text-muted-foreground">更新时间</dt><dd className="text-right">{item.updatedAt?.slice(5, 10)}</dd></dl>} label="自定义资源" /> };
export const SharedActions: Story = { name: "跨布局共享动作", render: function Render() { const [opened, setOpened] = useState(''); return <div className="space-y-[var(--rui-content-gap)]"><ResourceView items={resources.slice(0, 6)} defaultLayout="grid" actions={[{ id: 'open', label: '打开', onAction: item => setOpened(item.name) }]} label="动作资源" /><output className="text-xs text-muted-foreground">{opened || '尚未打开'}</output></div>; } };
export const Loading: Story = { name: "状态 · 加载中", render: () => <ResourceView items={[]} loading /> };
export const Error: Story = { name: "错误与重试", render: () => <ResourceView items={[]} error="资源视图加载失败" onRetry={() => undefined} /> };
export const Empty: Story = { name: "空集合", render: () => <ResourceView items={[]} /> };
export const Disabled: Story = { name: "禁用视图", render: () => <ResourceView items={resources.slice(0, 6)} defaultLayout="grid" selectionMode="multiple" disabled /> };
export const Narrow: Story = { name: "窄宽度", render: () => <div className="max-w-80"><ResourceView items={resources} defaultLayout="grid" selectionMode="multiple" pageSize={4} label="窄面板资源" /></div> };
