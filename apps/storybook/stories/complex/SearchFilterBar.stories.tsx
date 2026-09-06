import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl } from '../feature-controls.js';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchFilterBar } from '../../../../packages/ui/src/complex/index.js';
import { SearchFilterBarDemo } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { title: '复杂/SearchFilterBar 搜索筛选', component: SearchFilterBarDemo, parameters: { docs: { description: { component: 'query 和 selected 由调用方控制。示例按名称、负责人和状态过滤本地任务，可组合条件并清除全部。' } } } } satisfies Meta<typeof SearchFilterBarDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = { name: '交互场景：真实筛选与结果列表' };
export const Disabled: Story = { name: '禁用条件', render: () => <SearchFilterBar query="" onQueryChange={() => {}} selected={[]} onSelectedChange={() => {}} filters={[{ value: 'all', label: '全部' }]} disabled /> };

function FilterExample({ initialQuery = '', initialSelected = [] }: { initialQuery?: string; initialSelected?: string[] }) { const [query, setQuery] = useState(initialQuery); const [selected, setSelected] = useState(initialSelected); return <SearchFilterBar query={query} onQueryChange={setQuery} selected={selected} onSelectedChange={setSelected} filters={[{ value: 'active', label: '进行中', count: 3 }, { value: 'complete', label: '已完成', count: 5 }]} />; }
export const Default: Story = { name: '默认筛选栏', render: () => <FilterExample /> };
export const Selected: Story = { name: '已选条件', render: () => <FilterExample initialSelected={['active']} /> };
export const SearchQuery: Story = { name: '搜索内容', render: () => <FilterExample initialQuery="tokens" /> };

type PlaygroundArgs = Pick<ComponentProps<typeof SearchFilterBar>, 'query' | 'selected' | 'disabled' | 'label' | 'placeholder'>;
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { query: '', selected: [], disabled: false, label: '搜索与筛选', placeholder: '搜索名称或说明…' },
 argTypes: { query: textControl, selected: { control: 'check', options: ['active', 'complete'] }, disabled: booleanControl, label: textControl, placeholder: textControl },
 parameters: { controls: { include: ['query', 'selected', 'disabled', 'label', 'placeholder'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <SearchFilterBar {...args} filters={[{ value: 'active', label: '进行中' }, { value: 'complete', label: '已完成' }]} onQueryChange={query => updateArgs({ query })} onSelectedChange={selected => updateArgs({ selected })} />; },
};
