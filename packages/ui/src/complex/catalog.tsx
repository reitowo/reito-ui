import { useId, useState, type ComponentType } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { DateRange } from 'react-day-picker';
import { FileText, FolderOpen, Search, Settings, Terminal } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Badge } from '../primitives/badge.js';
import { Input } from '../primitives/input.js';
import { Switch } from '../primitives/switch.js';
import { DiffViewer, type DiffHunk } from './diff-viewer.js';
import { LogViewer, type LogEntry } from './log-viewer.js';
import { KeyValueEditor, type KeyValueEntry } from './key-value-editor.js';
import { ResourceList, type ResourceItem } from './resource-list.js';
import { FormDemo } from './form-demo.js';
import { AsyncFormDemo } from './async-form-demo.js';
import { VirtualListDemo } from './virtual-list-demo.js';
import { VirtualGridDemo } from './virtual-grid-demo.js';
import { TreeView, type TreeViewNode } from './tree-view.js';
import { AsyncTreeView, type AsyncTreeViewNode } from './async-tree-view.js';
import { ReorderableTreeView, moveTreeNode } from './reorderable-tree-view.js';
import type { LocalDateTimeValue } from '../basic.js';
export { FormDemo } from './form-demo.js';
import {
  AppShell, Cascader, CommandSearch, DataTable, DateRangePicker, DateTimeRangePicker, DisclosureTree, FileUpload, PropertyList, TreeSelect, TreeTable,
  ResizableWorkspace, SearchFilterBar, SettingsRow, SettingsSection, Stepper, Timeline, WorkspacePane,
  serializeDateTimeRange, type CommandGroupDefinition, type DateTimeRangeValue, type DisclosureNode, type PropertyItem, type TimelineEvent,
} from './index.js';

export interface DemoRecord { id: string; name: string; owner: string; status: string; updated: string; }
export const demoRecords: DemoRecord[] = [
  { id: 'TASK-01', name: '整理设计 tokens', owner: 'Reito', status: '已完成', updated: '2026-09-01' },
  { id: 'TASK-02', name: '实现导航组件', owner: 'Lin', status: '进行中', updated: '2026-09-02' },
  { id: 'TASK-03', name: '验证键盘操作', owner: 'Reito', status: '待开始', updated: '2026-09-03' },
  { id: 'TASK-04', name: '编写使用文档', owner: 'Ming', status: '进行中', updated: '2026-09-04' },
  { id: 'TASK-05', name: '检查深浅主题', owner: 'Lin', status: '已完成', updated: '2026-09-05' },
  { id: 'TASK-06', name: '完善日期范围', owner: 'Reito', status: '待开始', updated: '2026-09-06' },
  { id: 'TASK-07', name: '补充表格空态', owner: 'Ming', status: '进行中', updated: '2026-09-07' },
  { id: 'TASK-08', name: '发布本地预览', owner: 'Lin', status: '待开始', updated: '2026-09-08' },
];
export const demoColumns: ColumnDef<DemoRecord>[] = [
  { accessorKey: 'name', header: '任务', cell: info => <span className="font-medium">{String(info.getValue())}</span> },
  { accessorKey: 'owner', header: '负责人' },
  { accessorKey: 'status', header: '状态', cell: info => <Badge variant="secondary">{String(info.getValue())}</Badge> },
  { accessorKey: 'updated', header: '更新日期' },
];
export function DataTableDemo() { return <DataTable data={demoRecords} columns={demoColumns} getRowId={row => row.id} caption="本地任务" />; }

export const demoNodes: DisclosureNode[] = [
  { id: 'src', label: 'src', children: [
    { id: 'components', label: 'components', children: [
      { id: 'button', label: 'button.tsx' }, { id: 'input', label: 'input.tsx' }, { id: 'private', label: 'private.tsx', disabled: true },
    ] },
    { id: 'app', label: 'App.tsx' },
  ] },
  { id: 'docs', label: 'docs', children: [{ id: 'guide', label: '使用指南.md' }, { id: 'tokens', label: 'tokens.md' }] },
  { id: 'readme', label: 'README.md', description: '项目入口与本地运行说明' },
];
export function DisclosureTreeDemo() {
  const [selected, setSelected] = useState('button');
  return <div className="space-y-[var(--rui-content-gap)]"><DisclosureTree nodes={demoNodes} defaultExpanded={['src', 'components']} value={selected} onValueChange={setSelected} /><p role="status" className="border-t border-border pt-[var(--rui-content-gap)] text-xs text-muted-foreground">当前选择：{selected}</p></div>;
}

export function TreeViewDemo() {
  const [selected, setSelected] = useState('button');
  const [expanded, setExpanded] = useState(['src', 'components']);
  return <div className="space-y-[var(--rui-content-gap)]"><TreeView nodes={demoNodes} value={selected} onValueChange={setSelected} expanded={expanded} onExpandedChange={setExpanded} label="项目树" /><p role="status" className="border-t border-border pt-[var(--rui-content-gap)] text-xs text-muted-foreground">当前节点：{selected} · 展开 {expanded.length} 项</p></div>;
}

export const asyncTreeNodes: AsyncTreeViewNode[] = [
  { id: 'workspace', label: 'workspace', loadable: true },
  { id: 'docs', label: 'docs', loadable: true },
];
export function AsyncTreeViewDemo() {
  return <AsyncTreeView nodes={asyncTreeNodes} defaultExpanded={['workspace', 'src']} label="异步项目树" loadChildren={(node, { signal }) => new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => resolve(node.id === 'workspace' ? [{ id: 'src', label: 'src', children: [{ id: 'app', label: 'App.tsx' }] }] : []), 320);
    signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
  })} />;
}
export function ReorderableTreeViewDemo() {
  const [nodes, setNodes] = useState<TreeViewNode[]>(demoNodes);
  const [selected, setSelected] = useState('button');
  return <ReorderableTreeView nodes={nodes} treeId="catalog-tree" defaultExpanded={['src', 'components']} value={selected} onValueChange={setSelected} label="可重排项目树" onMove={intent => { const next = moveTreeNode(nodes, intent); if (next) setNodes(next); }} />;
}

export function TreeSelectDemo() {
  const [value, setValue] = useState<string | undefined>('button');
  return <div className="space-y-[var(--rui-content-gap)]"><TreeSelect nodes={demoNodes} value={value} onValueChange={setValue} defaultExpanded={['src', 'components']} label="入口文件" description="从当前项目树中选择一个节点。" /><p role="status" className="text-xs text-muted-foreground">当前节点：{value || '未选择'}</p></div>;
}

export const cascaderOptions = [
  { id: 'frontend', label: '前端', description: '浏览器与桌面界面', children: [
    { id: 'react', label: 'React', children: [{ id: 'component-library', label: '组件库' }, { id: 'desktop-app', label: '桌面应用' }] },
    { id: 'vue', label: 'Vue', children: [{ id: 'admin-console', label: '管理后台' }, { id: 'documentation', label: '文档站' }] },
  ] },
  { id: 'backend', label: '后端', children: [
    { id: 'node', label: 'Node.js', children: [{ id: 'api-service', label: 'API 服务' }] },
    { id: 'rust', label: 'Rust', disabled: true, children: [{ id: 'native-service', label: '原生服务' }] },
  ] },
];

export function CascaderDemo() {
  const [value, setValue] = useState<string[] | undefined>(['frontend', 'react', 'component-library']);
  return <div className="space-y-[var(--rui-content-gap)]"><Cascader options={cascaderOptions} value={value} onValueChange={setValue} label="工程类型" description="按技术栈逐级选择目标工程。" /><p role="status" className="text-xs text-muted-foreground">当前路径：{value?.join(' / ') || '未选择'}</p></div>;
}

export interface TreeTableDemoData { name: string; kind: string; status: '就绪' | '变更' | '忽略' }
export const treeTableNodes = [
  { id: 'src', data: { name: 'src', kind: '目录', status: '变更' as const }, children: [
    { id: 'components', data: { name: 'components', kind: '目录', status: '变更' as const }, children: [
      { id: 'button', data: { name: 'button.tsx', kind: 'React', status: '就绪' as const } },
      { id: 'input', data: { name: 'input.tsx', kind: 'React', status: '变更' as const } },
    ] },
    { id: 'app', data: { name: 'App.tsx', kind: 'React', status: '就绪' as const } },
  ] },
  { id: 'docs', data: { name: 'docs', kind: '目录', status: '就绪' as const }, children: [
    { id: 'readme', data: { name: 'README.md', kind: 'Markdown', status: '就绪' as const } },
    { id: 'archive', data: { name: 'archive.md', kind: 'Markdown', status: '忽略' as const }, disabled: true },
  ] },
];
export const treeTableColumns = [
  { id: 'name', header: '名称', cell: (node: { data: TreeTableDemoData }) => node.data.name },
  { id: 'kind', header: '类型', cell: (node: { data: TreeTableDemoData }) => node.data.kind },
  { id: 'status', header: '状态', cell: (node: { data: TreeTableDemoData }) => <Badge variant="secondary">{node.data.status}</Badge> },
];

export function TreeTableDemo() {
  const [checked, setChecked] = useState(['button']);
  return <TreeTable nodes={treeTableNodes} columns={treeTableColumns} selectionMode="checkbox" checked={checked} onCheckedChange={setChecked} defaultExpanded={['src', 'components']} caption="项目文件" />;
}

export function SearchFilterBarDemo() {
  const [query, setQuery] = useState(''); const [selected, setSelected] = useState<string[]>([]);
  const filtered = demoRecords.filter(row => (!selected.length || selected.includes(row.status)) && `${row.name} ${row.owner}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="space-y-[var(--rui-content-gap)]"><SearchFilterBar query={query} onQueryChange={setQuery} selected={selected} onSelectedChange={setSelected} label="筛选本地任务" resultCount={filtered.length} filters={['待开始', '进行中', '已完成'].map(status => ({ value: status, label: status, count: demoRecords.filter(row => row.status === status).length }))} /><ul className="divide-y divide-border">{filtered.map(row => <li key={row.id} className="flex items-center justify-between gap-[var(--rui-content-gap)] py-[var(--rui-cell-padding-y)] text-sm"><span>{row.name}</span><Badge variant="secondary">{row.status}</Badge></li>)}</ul>{!filtered.length && <p className="py-[var(--rui-empty-padding)] text-center text-sm text-muted-foreground">没有符合条件的任务</p>}</div>;
}

export function DateRangePickerDemo() {
  const [range, setRange] = useState<DateRange | undefined>({ from: new Date(2026, 8, 1), to: new Date(2026, 8, 7) });
  return <div className="space-y-[var(--rui-content-gap)]"><DateRangePicker value={range} onValueChange={setRange} minDate={new Date(2026, 0, 1)} maxDate={new Date(2026, 11, 31)} /><p role="status" className="text-xs text-muted-foreground">{range?.from && range.to ? `已应用 ${range.from.getMonth() + 1} 月 ${range.from.getDate()} 日至 ${range.to.getMonth() + 1} 月 ${range.to.getDate()} 日` : '尚未设置日期范围'}</p><p className="text-xs text-muted-foreground">可选择 2026 年内的日期，取消会保留上次应用的范围。</p></div>;
}

const catalogDateTime = (day: number, hour: number, minute: number): LocalDateTimeValue => ({ date: new Date(2026, 8, day), time: { hour, minute } });
export function DateTimeRangePickerDemo() {
  const [range, setRange] = useState<DateTimeRangeValue>({ start: catalogDateTime(7, 17, 30), end: catalogDateTime(8, 9, 30) });
  return <div className="space-y-[var(--rui-content-gap)]"><DateTimeRangePicker value={range} onValueChange={setRange} min={catalogDateTime(7, 16, 0)} max={catalogDateTime(8, 10, 0)} minuteStep={5} timeZone="Asia/Shanghai" description="本地墙上时间与时区标识分开保存；组件不会隐式换算 UTC 瞬时值。" /><output className="block break-all font-mono text-xs text-muted-foreground">{serializeDateTimeRange(range, { timeZone: 'Asia/Shanghai' }) || '范围尚未完整或有效'}</output></div>;
}
export function FileUploadDemo() { return <FileUpload accept=".txt,.md,.json" maxSize={1024 * 1024} maxFiles={3} />; }

export function PropertyListDemo() {
  const [values, setValues] = useState<Record<string, string | number>>({ name: 'Graphite 工作区', retention: 30, id: 'workspace-local-01' });
  const items: PropertyItem[] = [
    { key: 'name', label: '工作区名称', value: values.name, validate: value => String(value).length < 2 ? '名称至少需要 2 个字符' : undefined },
    { key: 'retention', label: '保留天数', description: '允许 1 至 365 天', kind: 'number', value: values.retention, validate: value => Number(value) < 1 || Number(value) > 365 || !Number.isInteger(Number(value)) ? '请输入 1 至 365 的整数' : undefined },
    { key: 'id', label: '工作区 ID', value: values.id, readOnly: true },
  ];
  return <div className="space-y-[var(--rui-content-gap)]"><PropertyList items={items} onValueChange={(key, value) => setValues(previous => ({ ...previous, [key]: value }))} /><p className="text-xs text-muted-foreground">编辑仅保存在此示例的内存中。</p></div>;
}

export const demoEvents: TimelineEvent[] = [
  { id: '1', title: '工作区已创建', description: '加载本地示例数据。', time: '09:30', dateTime: '2026-09-06T09:30:00+08:00', status: 'complete' },
  { id: '2', title: '组件检查完成', description: '按钮、输入和菜单的类型检查通过。', time: '09:34', status: 'complete' },
  { id: '3', title: '交互验证', description: '演示进行中状态，不会发起外部请求。', time: '09:36', status: 'current' },
  { id: '4', title: '等待人工确认', description: '确认后再进入发布步骤。', status: 'pending' },
];
export function TimelineDemo() { return <Timeline events={demoEvents} />; }

const demoSteps = [
  { id: 'details', title: '填写信息', description: '确认工作区名称' },
  { id: 'preferences', title: '选择偏好', description: '调整本地设置' },
  { id: 'review', title: '确认配置', description: '完成示例流程' },
];
export function StepperDemo() {
  const [current, setCurrent] = useState('details'); const [name, setName] = useState('我的工作区'); const [notifications, setNotifications] = useState(true); const [complete, setComplete] = useState(false);
  const active = demoSteps.findIndex(step => step.id === current); const id = useId();
  return <div className="space-y-[var(--rui-content-gap)]"><Stepper steps={demoSteps.map((step, index) => ({ ...step, disabled: index > 0 && !name.trim() }))} value={current} onValueChange={value => { setCurrent(value); setComplete(false); }} /><div className="min-h-28 rounded-lg border border-border p-[var(--rui-content-padding)]">{current === 'details' ? <label htmlFor={id} className="space-y-2 text-sm">工作区名称<Input id={id} value={name} onChange={event => setName(event.target.value)} placeholder="输入名称" /></label> : current === 'preferences' ? <SettingsRow label="本地通知" description="仅切换此示例中的偏好"><Switch aria-label="本地通知" checked={notifications} onCheckedChange={setNotifications} /></SettingsRow> : <p className="text-sm leading-relaxed">名称：{name}<br />本地通知：{notifications ? '开启' : '关闭'}</p>}</div><div className="flex items-center justify-between gap-3"><Button variant="outline" disabled={active === 0} onClick={() => { setCurrent(demoSteps[active - 1].id); setComplete(false); }}>上一步</Button>{active < demoSteps.length - 1 ? <Button disabled={!name.trim()} onClick={() => setCurrent(demoSteps[active + 1].id)}>下一步</Button> : <Button disabled={complete} onClick={() => setComplete(true)}>{complete ? '已完成' : '完成配置'}</Button>}</div>{complete && <p role="status" className="text-sm text-muted-foreground">本地配置已确认。</p>}</div>;
}

export function SettingsSectionDemo() {
  const [enabled, setEnabled] = useState(true); const [name, setName] = useState('Graphite'); const [saved, setSaved] = useState(false);
  return <div className="space-y-[var(--rui-content-gap)]"><SettingsSection title="工作区偏好" description="所有修改仅影响此示例。" actions={<Button size="sm" disabled={!name.trim() || saved} onClick={() => setSaved(true)}>{saved ? '已保存' : '保存设置'}</Button>}><SettingsRow label="工作区名称" description="显示在侧边栏和最近列表中"><Input aria-label="工作区名称" className="w-44" value={name} onChange={event => { setName(event.target.value); setSaved(false); }} /></SettingsRow><SettingsRow label="桌面提醒" description="在任务完成时显示提醒"><Switch aria-label="桌面提醒" checked={enabled} onCheckedChange={value => { setEnabled(value); setSaved(false); }} /></SettingsRow><SettingsRow label="云端同步" description="本地原型没有外部服务"><Switch aria-label="云端同步" checked={false} disabled /></SettingsRow></SettingsSection>{saved && <p role="status" className="text-xs text-muted-foreground">偏好已保存在此示例中。</p>}</div>;
}

export function WorkspaceDemo() {
  const [selected, setSelected] = useState('button'); const [sizes, setSizes] = useState({ primary: 30, secondary: 70 });
  return <AppShell className="h-[480px]" header={<div className="flex items-center justify-between gap-3"><span className="font-medium">本地工作区</span><Badge variant="secondary">布局示例</Badge></div>} footer={`拖动分隔线或聚焦后使用方向键调整 · 主面板 ${Math.round(sizes.primary)}%`}>
    <ResizableWorkspace defaultPrimaryPercent={30} primaryLabel="文件目录" secondaryLabel="文件预览" onSizesChange={setSizes} primary={<WorkspacePane title="文件目录" className="h-full"><DisclosureTree nodes={demoNodes} defaultExpanded={['src', 'components']} value={selected} onValueChange={setSelected} /></WorkspacePane>} secondary={<WorkspacePane title="文件预览" description="选择左侧文件查看本地内容" className="h-full"><div className="space-y-[var(--rui-content-gap)] p-[var(--rui-preview-padding)]"><FileText className="size-6 text-muted-foreground" aria-hidden="true" /><h3 className="text-sm font-medium">{selected}</h3><p className="text-sm leading-relaxed text-muted-foreground">面板内容各自滚动。布局不拥有业务状态，也不会读取磁盘文件。</p><pre className="overflow-auto rounded-lg bg-muted/40 p-[var(--rui-content-padding)] text-xs leading-relaxed"><code>{`// ${selected}\nexport const example = {\n  local: true,\n  theme: 'graphite',\n};`}</code></pre></div></WorkspacePane>} />
  </AppShell>;
}

export const demoCommands: CommandGroupDefinition[] = [
  { id: 'workspace', label: '工作区', commands: [
    { id: 'open-project', label: '打开项目', description: '选择本地示例项目', keywords: ['open', 'project'], icon: <FolderOpen aria-hidden="true" />, shortcut: '⌘ O' },
    { id: 'search-files', label: '搜索文件', description: '查找工作区中的文件', keywords: ['search', 'find'], icon: <Search aria-hidden="true" />, shortcut: '⌘ P' },
  ] },
  { id: 'tools', label: '工具', commands: [
    { id: 'settings', label: '偏好设置', keywords: ['settings'], icon: <Settings aria-hidden="true" /> },
    { id: 'terminal', label: '打开终端', description: '此演示中不可用', disabled: true, icon: <Terminal aria-hidden="true" /> },
  ] },
];
export function CommandSearchDemo() {
  const [selected, setSelected] = useState('');
  return <div className="space-y-[var(--rui-content-gap)]"><CommandSearch groups={demoCommands} onSelect={command => setSelected(command.label)} /><p role="status" className="text-xs text-muted-foreground">{selected ? `已选择：${selected}（本地演示）` : '选择命令以预览结果'}</p></div>;
}

export const demoDiffHunks: DiffHunk[] = [{
  id: 'workspace-options', header: '@@ -1,4 +1,4 @@', rows: [
    { id: 'open', kind: 'context', before: { lineNumber: 1, text: 'export const workspace = {' }, after: { lineNumber: 1, text: 'export const workspace = {' } },
    { id: 'density', kind: 'change', before: { lineNumber: 2, text: '  density: "comfortable",' }, after: { lineNumber: 2, text: '  density: "compact",' } },
    { id: 'remove', kind: 'change', before: { lineNumber: 3, text: '  legacyToolbar: true,' } },
    { id: 'add', kind: 'change', after: { lineNumber: 3, text: '  readableContent: true,' } },
    { id: 'close', kind: 'context', before: { lineNumber: 4, text: '};' }, after: { lineNumber: 4, text: '};' } },
  ],
}];

export function DiffViewerDemo() {
  return <DiffViewer filename="workspace.ts" hunks={demoDiffHunks} />;
}

export const demoLogEntries: LogEntry[] = [
  ...Array.from({ length: 24 }, (_, index): LogEntry => ({
    id: `event-${index}`, level: index % 3 === 0 ? 'debug' : 'info',
    time: `09:${String(index).padStart(2, '0')}`, source: 'local-preview',
    message: `本地记录 ${index + 1}：已读取组件示例。`,
  })),
  { id: 'auth-error', level: 'error', time: '09:25', source: 'configuration', message: '认证失败：本地示例尚未配置服务。' },
];

export function LogViewerDemo() {
  const [entries, setEntries] = useState(demoLogEntries);
  const [serial, setSerial] = useState(1);
  return <div className="space-y-[var(--rui-content-gap)]">
    <LogViewer entries={entries} onClear={() => setEntries([])} />
    <Button size="sm" variant="outline" onClick={() => {
      setEntries(current => [...current, { id: `added-${serial}`, level: 'warning', time: '09:30', message: `新增本地日志 ${serial}` }]);
      setSerial(current => current + 1);
    }}>添加示例日志</Button>
    <p className="text-xs text-muted-foreground">日志由本地数组提供，不执行终端命令。</p>
  </div>;
}

export function KeyValueEditorDemo() {
  const [entries, setEntries] = useState<KeyValueEntry[]>([
    { id: 'workspace', key: 'WORKSPACE', value: 'Graphite' },
    { id: 'example', key: 'DEMO_SECRET', value: 'local-example-only', secret: true },
  ]);
  const [receipt, setReceipt] = useState('');
  return <div className="space-y-[var(--rui-content-gap)]">
    <KeyValueEditor value={entries} onValueChange={next => { setEntries(next); setReceipt(''); }}
      onSubmit={next => setReceipt(`已应用 ${next.length} 项本地配置`)} requireValues maxRows={6} />
    <p role="status" className="text-xs text-muted-foreground">{receipt || '配置仅保存在当前示例内存中。敏感值遮罩只影响显示。'}</p>
  </div>;
}

export const demoResources: ResourceItem[] = [
  { id: 'specs', name: 'specs.md', kind: '文档', description: '工作区界面与交互要求', updatedAt: '2026-09-04T10:00:00+08:00' },
  { id: 'tokens', name: 'tokens.json', kind: '配置', description: '共享语义令牌', updatedAt: '2026-09-06T10:00:00+08:00' },
  { id: 'preview', name: 'workspace.png', kind: '图片', description: '本地示例预览元数据', updatedAt: '2026-09-05T10:00:00+08:00' },
  { id: 'archive', name: 'archive.zip', kind: '归档', description: '不可操作状态示例', disabled: true },
];

export function ResourceListDemo() {
  const [items, setItems] = useState(demoResources);
  const [selection, setSelection] = useState<string[]>([]);
  const [opened, setOpened] = useState('');
  return <div className="space-y-[var(--rui-content-gap)]">
    <ResourceList label="项目资源" items={items} selectionMode="multiple" selectedIds={selection} onSelectionChange={setSelection}
      actions={[
        { id: 'open', label: '打开', onAction: item => setOpened(item.name) },
        { id: 'remove', label: '移除', onAction: item => {
          setItems(current => current.filter(resource => resource.id !== item.id));
          setSelection(current => current.filter(id => id !== item.id));
        } },
      ]} />
    <p role="status" className="text-xs text-muted-foreground">{opened ? `已打开 ${opened}（本地预览）` : '行操作仅更新本地示例，不读取磁盘资源。'}</p>
  </div>;
}

export interface ComplexCatalogEntry { id: string; name: string; description: string; component: ComponentType; }
export const complexCatalog: ComplexCatalogEntry[] = [
  { id: 'form', name: 'Form 表单管理', description: 'Schema、跨字段与异步校验、提交重置、嵌套字段和数组。', component: FormDemo },
  { id: 'async-form', name: 'AsyncForm 异步表单', description: '可取消的异步校验、过期响应隔离、记录切换和提交恢复。', component: AsyncFormDemo },
  { id: 'virtual-list', name: 'VirtualList 虚拟列表', description: '窗口化行、稳定 key、滚动定位、可见范围和按需加载。', component: VirtualListDemo },
  { id: 'virtual-grid', name: 'VirtualGrid 虚拟网格', description: '双轴窗口、稳定单元格、行列定位和二维可见范围。', component: VirtualGridDemo },
  { id: 'tree-view', name: 'TreeView 树形导航', description: 'ARIA 树、受控展开选择、方向键导航和焦点恢复。', component: TreeViewDemo },
  { id: 'async-tree-view', name: 'AsyncTreeView 异步树', description: '按需子节点、加载错误重试、刷新和过期响应隔离。', component: AsyncTreeViewDemo },
  { id: 'reorderable-tree-view', name: 'ReorderableTreeView 树重排', description: '受控树内与跨树移动、合法落点和键盘等价操作。', component: ReorderableTreeViewDemo },
  { id: 'tree-select', name: 'TreeSelect 树选择', description: '弹层树搜索、单选/复选、级联半选、懒加载与焦点恢复。', component: TreeSelectDemo },
  { id: 'cascader', name: 'Cascader 级联选择', description: '任意层级的路径选择、叶节点边界、懒加载和方向键导航。', component: CascaderDemo },
  { id: 'tree-table', name: 'TreeTable 树表格', description: '层级表格、筛选、列视图、根分页、lazy 子节点与稳定选择。', component: TreeTableDemo },
  { id: 'data-table', name: 'DataTable 数据表格', description: '真实排序、跨页选中、筛选与分页，使用稳定行 ID。', component: DataTableDemo },
  { id: 'disclosure-tree', name: 'DisclosureTree 目录导航', description: '原生折叠目录，使用 Tab 和 Enter 操作，不冒充 ARIA 树。', component: DisclosureTreeDemo },
  { id: 'search-filter-bar', name: 'SearchFilterBar 搜索筛选', description: '受控搜索与多选条件，直接筛选本地数据。', component: SearchFilterBarDemo },
  { id: 'date-range-picker', name: 'DateRangePicker 日期范围', description: '日历、日期输入、上下界校验、应用与取消。', component: DateRangePickerDemo },
  { id: 'date-time-range-picker', name: 'DateTimeRangePicker 日期时间范围', description: '起止本地日期时间、精度、范围校验、时区元数据与稳定提交。', component: DateTimeRangePickerDemo },
  { id: 'file-upload', name: 'FileUpload 文件队列', description: '文件类型、大小、重复与数量校验；仅本地队列。', component: FileUploadDemo },
  { id: 'property-list', name: 'PropertyList 属性编辑', description: '逐项编辑、数字验证、取消与只读字段。', component: PropertyListDemo },
  { id: 'timeline', name: 'Timeline 时间线', description: '按时间呈现完成、进行、失败和等待状态。', component: TimelineDemo },
  { id: 'stepper', name: 'Stepper 分步流程', description: '可导航步骤、必填门槛与本地确认流程。', component: StepperDemo },
  { id: 'settings-section', name: 'SettingsSection 设置分组', description: '标题、说明、行布局与真实受控表单。', component: SettingsSectionDemo },
  { id: 'workspace', name: 'Workspace 工作区布局', description: '应用外壳、独立滚动面板、指针与键盘分栏。', component: WorkspaceDemo },
  { id: 'command-search', name: 'CommandSearch 命令搜索', description: '分组、关键词筛选、空态与中文输入法保护。', component: CommandSearchDemo },
  { id: 'diff-viewer', name: 'DiffViewer 差异查看', description: '显式结构化行与宿主配对，统一/并排切换与长行处理。', component: DiffViewerDemo },
  { id: 'log-viewer', name: 'LogViewer 日志查看', description: '搜索、级别筛选、滚动暂停与跟随，以及宿主清除回调。', component: LogViewerDemo },
  { id: 'key-value-editor', name: 'KeyValueEditor 键值编辑', description: '增删键值、重复和必填验证、可选敏感值遮罩。', component: KeyValueEditorDemo },
  { id: 'resource-list', name: 'ResourceList 资源列表', description: '本地搜索排序、单选/批量选择与宿主行操作。', component: ResourceListDemo },
];
