import * as React from 'react';
import { Bot, Code2, FileText, Palette, Settings, Terminal } from 'lucide-react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Listbox, type ListboxOption, type ListboxValue } from '../../../../packages/ui/src/basic.js';
import { ListboxDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, choiceControl, textControl } from '../feature-controls.js';

const options: ListboxOption[] = [
  { value: 'react', label: 'React', description: '界面组件与状态', group: '应用', icon: <Code2 />, keywords: ['frontend'] },
  { value: 'typescript', label: 'TypeScript', description: '类型系统', group: '应用', icon: <FileText /> },
  { value: 'tailwind', label: 'Tailwind CSS', description: '样式工具', group: '应用', icon: <Palette /> },
  { value: 'storybook', label: 'Storybook', description: '组件工作台', group: '工具', icon: <Settings /> },
  { value: 'terminal', label: 'Terminal', description: '命令与任务输出', group: '工具', icon: <Terminal /> },
  { value: 'agent', label: 'Agent runtime', description: 'AI 工作流', group: '工具', icon: <Bot /> },
  { value: 'legacy', label: '旧版构建器', description: '等待迁移', group: '工具', icon: <Settings />, disabled: true },
];
const largeOptions: ListboxOption[] = Array.from({ length: 50_000 }, (_, index) => ({ value: `item-${index}`, label: `资源 ${String(index + 1).padStart(5, '0')}`, description: index % 8 === 0 ? '包含补充说明的资源' : undefined, disabled: index % 997 === 0 }));

const meta = {
  title: '基础/Listbox',
  component: Listbox,
  tags: ['autodocs'],
  args: { label: '技术栈', options },
  parameters: { docs: { description: { component: '常驻单选或多选列表。列表自身持有焦点，活动项通过 aria-activedescendant 暴露；支持分组、搜索、富选项、禁用项与连续范围选择。' } } },
} satisfies Meta<typeof Listbox>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  label: string; selectionMode: 'single' | 'multiple'; selected: string; searchable: boolean; query: string;
  rangeSelection: boolean; bulkSelection: boolean; clearable: boolean; disabled: boolean; readOnly: boolean;
  required: boolean; virtual: boolean; overscan: number; scenario: 'ready' | 'loading' | 'error'; description: string; error: string;
};
export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { label: '技术栈', selectionMode: 'multiple', selected: 'react,typescript', searchable: true, query: '', rangeSelection: true, bulkSelection: true, clearable: true, disabled: false, readOnly: false, required: false, virtual: false, overscan: 4, scenario: 'ready', description: '方向键移动；Space 切换；Shift 连选。', error: '' },
  argTypes: { label: textControl, selectionMode: choiceControl(['single', 'multiple']), selected: textControl, searchable: booleanControl, query: textControl, rangeSelection: booleanControl, bulkSelection: booleanControl, clearable: booleanControl, disabled: booleanControl, readOnly: booleanControl, required: booleanControl, virtual: booleanControl, overscan: { control: { type: 'number', min: 0, max: 20 } }, scenario: choiceControl(['ready', 'loading', 'error']), description: textControl, error: textControl },
  parameters: { controls: { include: ['label', 'selectionMode', 'selected', 'searchable', 'query', 'rangeSelection', 'bulkSelection', 'clearable', 'disabled', 'readOnly', 'required', 'virtual', 'overscan', 'scenario', 'description', 'error'] } },
  render: function Render(args) {
    const [, update] = useArgs<PlaygroundArgs>();
    const values = args.selected.split(',').map(value => value.trim()).filter(Boolean);
    const value: ListboxValue = args.selectionMode === 'multiple' ? values : values[0] ?? null;
    return <div className="grid max-w-md gap-[var(--rui-content-gap-sm)]"><Listbox {...args} options={args.virtual ? largeOptions : options} value={value} query={args.query} loading={args.scenario === 'loading'} loadError={args.scenario === 'error' ? '无法读取选项' : undefined} onRetry={() => update({ scenario: 'ready' })} error={args.error || undefined} onQueryChange={query => update({ query })} onValueChange={next => update({ selected: Array.isArray(next) ? next.join(',') : next ?? '' })} /><output className="font-mono text-xs text-muted-foreground">value={JSON.stringify(value)}</output></div>;
  },
};

export const Overview: Story = { name: '总览', render: () => <ListboxDemo /> };

function Stateful(props: Omit<React.ComponentProps<typeof Listbox>, 'value' | 'onValueChange'> & { initialValue?: ListboxValue }) {
  const { initialValue = null, ...listboxProps } = props;
  const [value, setValue] = React.useState<ListboxValue>(initialValue);
  return <div className="grid max-w-md gap-[var(--rui-content-gap-sm)]"><Listbox {...listboxProps} value={value} onValueChange={setValue} /><output data-testid="listbox-value" className="font-mono text-xs text-muted-foreground">value={JSON.stringify(value)}</output></div>;
}

export const Single: Story = { name: '单选', render: () => <Stateful label="默认运行时" options={options} initialValue="react" /> };
export const Multiple: Story = { name: '多选', render: () => <Stateful label="启用的工具" options={options} selectionMode="multiple" initialValue={['react', 'typescript']} clearable /> };
export const Grouped: Story = { name: '分组', render: () => <Stateful label="按用途分组" options={options} initialValue="storybook" /> };
export const Searchable: Story = { name: '搜索', render: () => <Stateful label="搜索技术栈" options={options} searchable initialValue="tailwind" /> };
export const RichOptions: Story = { name: '富选项', render: () => <Stateful label="包含图标与说明" options={options} initialValue="agent" /> };
export const DisabledOption: Story = { name: '禁用项', render: () => <Stateful label="跳过不可用项" options={options} initialValue="terminal" description="方向键会跳过“旧版构建器”。" /> };
export const RangeSelection: Story = { name: '连续范围', render: () => <Stateful label="批量选择" options={options} selectionMode="multiple" initialValue={['react']} rangeSelection description="选择起点后按 Shift+方向键、Shift+Space 或 Shift+点击扩展范围。" /> };

function ControlledActiveExample() {
  const [active, setActive] = React.useState<string | null>('typescript');
  return <div className="grid max-w-md gap-[var(--rui-content-gap-sm)]"><Listbox label="受控活动项" options={options} activeValue={active} onActiveValueChange={setActive} defaultValue="react" /><output className="font-mono text-xs text-muted-foreground">active={active ?? 'null'}</output></div>;
}
export const ControlledActive: Story = { name: '受控活动项', render: () => <ControlledActiveExample /> };
export const Empty: Story = { name: '空列表', render: () => <Stateful label="成员" options={[]} emptyMessage="还没有成员" /> };
export const NoMatches: Story = { name: '无搜索结果', render: () => <Stateful label="技术栈" options={options} searchable defaultQuery="不存在" emptyMessage="未找到匹配项" /> };
export const Required: Story = { name: '必填', render: () => <Stateful label="默认运行时" options={options} required description="提交前由表单层检查是否选择。" /> };
export const ReadOnly: Story = { name: '只读', render: () => <Stateful label="已锁定技术栈" options={options} selectionMode="multiple" initialValue={['react', 'typescript']} readOnly /> };
export const Disabled: Story = { name: '整体禁用', render: () => <Stateful label="不可用技术栈" options={options} initialValue="react" disabled /> };
export const FieldError: Story = { name: '字段错误', render: () => <Stateful label="默认运行时" options={options} required error="请选择一个可用运行时" /> };

function NativeFormExample() {
  const [value, setValue] = React.useState<ListboxValue>(['react', 'storybook']);
  const [result, setResult] = React.useState('');
  return <form className="grid max-w-md gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); setResult(JSON.stringify(new FormData(event.currentTarget).getAll('tools'))); }}><Listbox label="提交工具" options={options} selectionMode="multiple" value={value} onValueChange={setValue} name="tools" /><Button type="submit" className="justify-self-start">读取 FormData</Button><output data-testid="form-value">{result}</output></form>;
}
export const NativeForm: Story = { name: '原生表单值', render: () => <NativeFormExample /> };

export const VirtualLarge: Story = { name: '五万项虚拟窗口', render: () => <Stateful label="资源" options={largeOptions} virtual initialValue="item-240" description="只渲染视口、overscan 与活动项。" /> };
export const VirtualSelectedPosition: Story = { name: '定位远端选中项', render: () => <Stateful label="资源" options={largeOptions} virtual initialValue="item-25000" /> };
export const VirtualKeyboard: Story = { name: '虚拟键盘导航', render: () => <Stateful label="资源" options={largeOptions} virtual initialValue="item-1" /> };
export const VirtualSearch: Story = { name: '虚拟筛选焦点', render: () => <Stateful label="搜索资源" options={largeOptions} virtual searchable defaultActiveValue="item-12000" /> };
export const LoadingEmpty: Story = { name: '首次加载', render: () => <Stateful label="远程资源" options={[]} loading /> };
export const LoadingWithOptions: Story = { name: '保留旧结果加载', render: () => <Stateful label="远程资源" options={options} loading initialValue="react" /> };

function LoadErrorExample() {
  const [failed, setFailed] = React.useState(true);
  return <div className="max-w-md"><Listbox label="远程资源" options={[]} loadError={failed ? '无法读取远程资源' : undefined} loading={!failed} onRetry={() => setFailed(false)} /></div>;
}
export const LoadError: Story = { name: '加载失败与重试', render: () => <LoadErrorExample /> };

function RangeCallbackExample() {
  const [range, setRange] = React.useState('尚未测量');
  return <div className="grid max-w-md gap-[var(--rui-content-gap-sm)]"><Listbox label="资源" options={largeOptions} virtual overscan={2} onRangeChange={next => setRange(`${next.visibleStartIndex}-${next.visibleEndIndex} / ${next.startIndex}-${next.endIndex}`)} /><output data-testid="range-value" className="font-mono text-xs text-muted-foreground">range={range}</output></div>;
}
export const VirtualRange: Story = { name: '可见范围回调', render: () => <RangeCallbackExample /> };
