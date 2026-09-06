import type { Meta, StoryObj } from '@storybook/react-vite';
import { MeterGroup, ProgressGroup, type MeterGroupItem } from '../../../../packages/ui/src/basic.js';

const storageItems: MeterGroupItem[] = [
  { id: 'projects', label: '项目文件', value: 42, valueLabel: '42 GB', tone: 'default' },
  { id: 'indexes', label: '本地索引', value: 18, valueLabel: '18 GB', tone: 'accent' },
  { id: 'cache', label: '缓存', value: 12, valueLabel: '12 GB', tone: 'muted' },
];

const meta = {
  title: '基础/MeterGroup',
  component: MeterGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'MeterGroup 表示容量、配额或分类构成；ProgressGroup 表示任务完成进度。两者都用可读标签与数值补足颜色，并明确零值、超额和不确定状态。',
      },
    },
  },
} satisfies Meta<typeof MeterGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  kind: 'meter' | 'progress';
  label: string;
  max: number;
  projects: number;
  indexes: number;
  cache: number;
  showLegend: boolean;
  legendPosition: 'start' | 'end';
  unit: 'GB' | '%';
  indeterminate: boolean;
  description: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: {
    kind: 'meter',
    label: '工作区存储构成',
    max: 128,
    projects: 42,
    indexes: 18,
    cache: 12,
    showLegend: true,
    legendPosition: 'end',
    unit: 'GB',
    indeterminate: false,
    description: '展示每类本地数据占用；任务执行状态请选择 ProgressGroup。',
  },
  argTypes: {
    kind: { control: 'select', options: ['meter', 'progress'] },
    label: { control: 'text' },
    max: { control: { type: 'number', min: 1 } },
    projects: { control: { type: 'number', min: 0 } },
    indexes: { control: { type: 'number', min: 0 } },
    cache: { control: { type: 'number', min: 0 } },
    showLegend: { control: 'boolean' },
    legendPosition: { control: 'inline-radio', options: ['start', 'end'] },
    unit: { control: 'inline-radio', options: ['GB', '%'] },
    indeterminate: { control: 'boolean', if: { arg: 'kind', eq: 'progress' } },
    description: { control: 'text' },
  },
  parameters: { controls: { include: ['kind', 'label', 'max', 'projects', 'indexes', 'cache', 'showLegend', 'legendPosition', 'unit', 'indeterminate', 'description'] } },
  render: ({ kind, projects, indexes, cache, unit, ...args }) => {
    const items: MeterGroupItem[] = [
      { id: 'projects', label: '项目文件', value: projects, tone: 'default' },
      { id: 'indexes', label: '本地索引', value: indexes, tone: 'accent' },
      { id: 'cache', label: '缓存', value: cache, tone: 'muted' },
    ];
    const Component = kind === 'progress' ? ProgressGroup : MeterGroup;
    return <Component {...args} items={items} formatValue={value => `${value} ${unit}`} className="max-w-lg" />;
  },
};

export const Default: Story = { name: '存储构成', args: { label: '工作区存储构成', items: storageItems, max: 128, valueLabel: '72 / 128 GB', description: '每段数值相加得到总用量。', className: 'max-w-lg' } };
export const LegendFirst: Story = { name: '图例在前', args: { ...Default.args, legendPosition: 'start' } };
export const WithoutLegend: Story = { name: '隐藏图例', args: { ...Default.args, showLegend: false, description: '适合附近已有可读分类明细的紧凑场景。' } };
export const Zero: Story = { name: '零值', args: { label: '本月 API 配额', items: [{ id: 'used', label: '已使用', value: 0 }], max: 1000, emptyLabel: '本月尚未使用配额', formatValue: value => `${value} 次`, className: 'max-w-lg' } };
export const Overflow: Story = { name: '超额', args: { label: '团队预算', items: [{ id: 'compute', label: '计算', value: 78, tone: 'default' }, { id: 'storage', label: '存储', value: 36, tone: 'warning' }], max: 100, valueLabel: '¥114 / ¥100', overflowLabel: value => `超出预算 ¥${value}`, className: 'max-w-lg' } };
export const CustomValues: Story = { name: '自定义数值格式', args: { label: '数据质量构成', items: [{ id: 'complete', label: '完整记录', value: 82, tone: 'success' }, { id: 'partial', label: '缺少可选字段', value: 12, tone: 'warning' }], max: 100, formatValue: value => `${value}%`, description: '剩余 6% 为待检查记录。', className: 'max-w-lg' } };
export const LongLabels: Story = { name: '长标签', args: { label: '沪深市场分钟行情与复权因子同步存储构成', items: [{ id: 'quotes', label: '分钟行情与逐笔成交归档文件', value: 48, description: '最近 90 个交易日', tone: 'default' }, { id: 'factors', label: '复权因子与证券基础信息索引', value: 22, description: '每日收盘后更新', tone: 'accent' }], max: 96, formatValue: value => `${value} GB`, className: 'max-w-lg' } };
export const SanitizedValues: Story = { name: '异常输入归零', args: { label: '可用资源', items: [{ id: 'negative', label: '负数输入', value: -8, tone: 'danger' }, { id: 'invalid', label: '非数值输入', value: Number.NaN, tone: 'warning' }, { id: 'valid', label: '有效输入', value: 24, tone: 'success' }], max: 100, formatValue: value => `${value}%`, className: 'max-w-lg' } };

export const Progress: Story = { name: '任务分段进度', args: { label: '', items: [] }, render: () => <ProgressGroup label="索引重建进度" items={[{ id: 'scan', label: '扫描文件', value: 35, tone: 'success' }, { id: 'parse', label: '解析内容', value: 28, tone: 'default' }, { id: 'write', label: '写入索引', value: 9, tone: 'accent' }]} max={100} formatValue={value => `${value}%`} description="已完成 72%，当前正在写入索引。" className="max-w-lg" /> };
export const IndeterminateProgress: Story = { name: '未知任务进度', args: { label: '', items: [] }, render: () => <ProgressGroup label="正在发现远程资源" items={[]} max={100} indeterminate description="服务端尚未返回可估算的任务总量。" className="max-w-lg" /> };
export const CompleteProgress: Story = { name: '任务完成', args: { label: '', items: [] }, render: () => <ProgressGroup label="数据同步" items={[{ id: 'download', label: '下载', value: 60, tone: 'success' }, { id: 'index', label: '索引', value: 40, tone: 'default' }]} max={100} valueLabel="已完成" className="max-w-lg" /> };
export const EmptyProgress: Story = { name: '任务尚未开始', args: { label: '', items: [] }, render: () => <ProgressGroup label="导出任务" items={[]} max={100} emptyLabel="等待开始" formatValue={value => `${value}%`} className="max-w-lg" /> };
export const Narrow: Story = { name: '窄容器', args: { ...Default.args, className: 'max-w-64' } };
export const CompositionOverview: Story = { name: '测量与进度对比', args: { label: '', items: [] }, render: () => <div className="grid max-w-2xl gap-[var(--rui-content-gap)] sm:grid-cols-2"><MeterGroup label="存储构成" items={storageItems} max={128} formatValue={value => `${value} GB`} /><ProgressGroup label="索引重建" items={[{ id: 'scan', label: '扫描', value: 40, tone: 'success' }, { id: 'write', label: '写入', value: 28, tone: 'default' }]} max={100} formatValue={value => `${value}%`} /></div> };
