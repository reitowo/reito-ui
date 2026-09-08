import { useId, useMemo, useState, type ComponentType } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { DateRange } from 'react-day-picker';
import { Bold, Download, Eye, FileText, FolderOpen, GitBranch, Italic, Mail, MoreHorizontal, PanelRightOpen, Search, Settings, Terminal, Trash2, Undo2 } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Badge } from '../primitives/badge.js';
import { Input } from '../primitives/input.js';
import { Switch } from '../primitives/switch.js';
import { DiffViewer, type DiffHunk } from './diff-viewer.js';
import { LogViewer, type LogEntry } from './log-viewer.js';
import { KeyValueEditor, type KeyValueEntry } from './key-value-editor.js';
import { ResourceList, type ResourceItem } from './resource-list.js';
import { ResourceView } from './resource-view.js';
import { FormDemo } from './form-demo.js';
import { ChartDemo } from './chart-demo.js';
import { AsyncFormDemo } from './async-form-demo.js';
import { VirtualListDemo } from './virtual-list-demo.js';
import { VirtualGridDemo } from './virtual-grid-demo.js';
import { TreeView, type TreeViewNode } from './tree-view.js';
import { AsyncTreeView, type AsyncTreeViewNode } from './async-tree-view.js';
import { ReorderableTreeView, moveTreeNode } from './reorderable-tree-view.js';
import { OrganizationChart, type OrganizationChartNode } from './organization-chart.js';
import { TerminalPrompt, type TerminalPromptEntry } from './terminal-prompt.js';
import { RichTextEditor } from './rich-text-editor.js';
import { SplitButton, type SplitButtonItem } from './split-button.js';
import { ConfirmPopover } from './confirm-popover.js';
import { UserInfo } from './user-info.js';
import { Banner } from './banner.js';
import { Toolbar, type ToolbarGroup } from './toolbar.js';
import { InlineEdit } from './inline-edit.js';
import { OverlayProvider, useOverlay } from './overlay-provider.js';
import type { LocalDateTimeValue } from '../basic.js';
export { FormDemo } from './form-demo.js';
import {
  AppShell, Cascader, CommandSearch, ContentNavigation, DataTable, DateRangePicker, DateTimeRangePicker, DisclosureTree, FileUpload, PropertyList, SortableList, Transfer, TreeSelect, TreeTable,
  ResizableWorkspace, SearchFilterBar, SettingsRow, SettingsSection, Stepper, Timeline, WorkspacePane,
  serializeDateTimeRange, type CommandGroupDefinition, type DateTimeRangeValue, type DisclosureNode, type PropertyItem, type PropertyValue, type TimelineEvent,
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

export const organizationDemoNodes: OrganizationChartNode[] = [{
  id: 'lead', label: 'Reito', description: '产品与组件系统', children: [
    { id: 'design', label: '界面设计', description: 'Graphite 视觉与交互', children: [{ id: 'tokens', label: '设计令牌', description: '主题、密度与语义角色' }, { id: 'stories', label: '组件示例', description: 'Storybook 变体与检查' }] },
    { id: 'engineering', label: '工程实现', description: 'React 与桌面工作区', children: [{ id: 'runtime', label: '本地运行时', description: '进程与文件集成' }, { id: 'quality', label: '质量验证', description: '类型、交互与可访问性' }] },
  ],
}];
export function OrganizationChartDemo() {
  const [selected, setSelected] = useState<string | null>('lead');
  const [collapsed, setCollapsed] = useState<string[]>([]);
  return <div className="space-y-[var(--rui-content-gap)]"><OrganizationChart nodes={organizationDemoNodes} selectedId={selected} onSelectedIdChange={setSelected} collapsedIds={collapsed} onCollapsedIdsChange={setCollapsed} label="组件团队结构" /><p role="status" className="text-xs text-muted-foreground">当前节点：{selected ?? '无'} · 折叠 {collapsed.length} 项</p></div>;
}

const terminalDemoEntries: TerminalPromptEntry[] = [{ id: 'welcome', command: 'help', output: '本地示例：输入内容只会写入当前页面状态。', status: 'success', time: '09:41' }];
export function TerminalPromptDemo() {
  const [entries, setEntries] = useState(terminalDemoEntries);
  return <TerminalPrompt entries={entries} onSubmit={command => setEntries(current => [...current, { id: `${Date.now()}`, command, output: `本地示例已记录“${command}”；没有调用 shell、进程或 PTY。`, status: 'success', time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }])} onClear={() => setEntries([])} label="本地示例命令" outputLabel="本地命令记录" />;
}

const richTextDemoValue = '# 组件说明\n\n这是一份由 **Tiptap 文档模型**驱动的本地 Markdown 草稿。\n\n- [ ] 检查任务列表\n- [x] 输出由宿主持有';
export function RichTextEditorDemo() {
  const [value, setValue] = useState(richTextDemoValue);
  return <div className="space-y-[var(--rui-content-gap)]"><RichTextEditor format="markdown" value={value} onValueChange={next => setValue(String(next))} label="组件说明" description="本地受控 Markdown；输入 / 或 @，悬停块可重排，也可插入图片地址。" mentionItems={[{ id: 'reito', label: 'Reito', description: '设计系统维护者' }, { id: 'lin', label: 'Lin', description: '组件工程' }]} /><p role="status" className="text-xs text-muted-foreground">宿主值：{value.length} 个字符</p></div>;
}

const splitButtonDemoItems: SplitButtonItem[] = [
  { id: 'save-copy', label: '保存副本', icon: <Download aria-hidden="true" />, shortcut: 'Ctrl+Shift+S' },
  { id: 'create-branch', label: '保存并创建分支', icon: <GitBranch aria-hidden="true" />, shortcut: 'Ctrl+Alt+S' },
  { id: 'publish', label: '发布到远端', disabled: true },
];
export function SplitButtonDemo() {
  const [message, setMessage] = useState('选择主操作或展开相关操作。');
  return <div className="grid gap-[var(--rui-content-gap-sm)]">
    <SplitButton
      label="保存"
      groupLabel="保存操作"
      menuLabel="更多保存操作"
      actionShortcut="Ctrl+S"
      items={splitButtonDemoItems}
      onAction={() => setMessage('已运行主操作：保存（本地示例）')}
      onItemSelect={item => setMessage(`已选择：${String(item.label)}（本地示例）`)}
    />
    <p role="status" className="text-xs text-muted-foreground">{message}</p>
  </div>;
}

export function ConfirmPopoverDemo() {
  const [message, setMessage] = useState('尚未删除本地草稿。');
  return <div className="grid gap-[var(--rui-content-gap-sm)]">
    <ConfirmPopover
      trigger={<Button type="button" variant="outline" size="sm"><Trash2 aria-hidden="true" />删除草稿</Button>}
      title="删除这份草稿？"
      description="删除后无法从当前本地示例恢复。"
      destructive
      confirmLabel="删除"
      onConfirm={() => setMessage('已删除本地示例草稿。')}
    />
    <p role="status" className="text-xs text-muted-foreground">{message}</p>
  </div>;
}

export function UserInfoDemo() {
  const [message, setMessage] = useState('这是本地示例用户。');
  return <div className="grid gap-[var(--rui-content-gap-sm)]">
    <UserInfo
      name="Reito"
      description="组件系统维护者"
      fallback="R"
      status="在线"
      statusTone="success"
      variant="muted"
      actions={[
        { id: 'message', label: '发送本地示例消息', icon: <Mail aria-hidden="true" />, onSelect: () => setMessage('已触发消息操作（本地示例）。') },
        { id: 'more', label: '更多用户操作', icon: <MoreHorizontal aria-hidden="true" />, disabled: true, onSelect: () => undefined },
      ]}
    />
    <p role="status" className="text-xs text-muted-foreground">{message}</p>
  </div>;
}

export function BannerDemo() {
  const [message, setMessage] = useState('本地通知尚未处理。');
  return <div className="grid gap-[var(--rui-content-gap-sm)]">
    <Banner title="组件索引可以更新" description="这是本地示例，不会请求远端服务。" tone="info" action={{ label: '查看', onSelect: () => setMessage('已触发查看操作（本地示例）。') }} onDismiss={() => setMessage('已关闭本地通知。')} />
    <p role="status" className="text-xs text-muted-foreground">{message}</p>
  </div>;
}

export function ToolbarDemo() {
  const [bold, setBold] = useState(true);
  const [message, setMessage] = useState('等待本地操作。');
  const groups: ToolbarGroup[] = [
    { id: 'history', label: '历史', items: [{ id: 'undo', label: '撤销', icon: <Undo2 aria-hidden="true" />, shortcut: 'Control+Z', onSelect: () => setMessage('已触发撤销（本地示例）。') }] },
    { id: 'format', label: '格式', items: [
      { id: 'bold', label: '加粗', icon: <Bold aria-hidden="true" />, kind: 'toggle', pressed: bold, onPressedChange: setBold },
      { id: 'italic', label: '斜体', icon: <Italic aria-hidden="true" />, kind: 'toggle', pressed: false, onPressedChange: pressed => setMessage(pressed ? '已打开斜体。' : '已关闭斜体。') },
    ] },
    { id: 'view', label: '视图', items: [
      { id: 'preview', label: '预览', icon: <Eye aria-hidden="true" />, overflow: 'always', onSelect: () => setMessage('已打开本地预览。') },
      { id: 'inspector', label: '检查器', icon: <PanelRightOpen aria-hidden="true" />, overflow: 'always', onSelect: () => setMessage('已打开本地检查器。') },
    ] },
  ];
  return <div className="grid gap-[var(--rui-content-gap-sm)]">
    <Toolbar label="编辑操作" groups={groups} overflow="menu" maxVisibleItems={3} status="本地草稿" onItemSelect={item => item.kind === 'toggle' && setMessage(`${String(item.label)}：${item.pressed ? '关闭' : '打开'}`)} />
    <p role="status" className="text-xs text-muted-foreground">{message}</p>
  </div>;
}

export function InlineEditDemo() {
  const [value, setValue] = useState('Graphite 工作区');
  return <div className="grid gap-[var(--rui-content-gap-sm)]">
    <InlineEdit label="工作区名称" value={value} onValueChange={next => setValue(String(next))} required validate={next => String(next).length < 2 ? '名称至少需要 2 个字符' : undefined} />
    <p role="status" className="text-xs text-muted-foreground">当前名称：{value}</p>
  </div>;
}

function OverlayProviderDemoLauncher() {
  const overlay = useOverlay();
  const [status, setStatus] = useState('尚未打开浮层');
  async function open() {
    const handle = overlay.open<boolean>({
      title: '应用本地设置？',
      description: '这个示例只更新下方状态，不会写入外部服务。',
      content: '命令式入口与声明式 Dialog、Sheet、AlertDialog 使用同一套基础组件。',
      confirmLabel: '应用',
      confirmValue: true,
    });
    const outcome = await handle.result;
    setStatus(outcome.status === 'closed' ? '已应用本地设置' : `已关闭：${outcome.reason}`);
  }
  return <div className="grid gap-[var(--rui-content-gap-sm)]">
    <Button type="button" size="sm" variant="outline" onClick={open}>打开设置浮层</Button>
    <p role="status" className="text-xs text-muted-foreground">{status}</p>
  </div>;
}

export function OverlayProviderDemo() {
  return <OverlayProvider><OverlayProviderDemoLauncher /></OverlayProvider>;
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

export const transferItems = [
  { value: 'read', label: '读取文件', description: '查看工作区内容', group: '文件' },
  { value: 'write', label: '写入文件', description: '修改工作区内容', group: '文件' },
  { value: 'terminal', label: '运行终端', description: '执行本地命令', group: '工具' },
  { value: 'browser', label: '使用浏览器', description: '打开本地预览', group: '工具' },
  { value: 'admin', label: '管理策略', description: '由宿主锁定', group: '系统', disabled: true },
];

export function TransferDemo() {
  const [value, setValue] = useState(['read']);
  return <Transfer items={transferItems} value={value} onValueChange={setValue} sourceLabel="可用权限" targetLabel="已授予权限" />;
}

export const sortableItems = [
  { id: 'context', label: '读取上下文', description: '收集当前工作区文件' },
  { id: 'plan', label: '生成计划', description: '拆分可执行步骤' },
  { id: 'approval', label: '等待批准', description: '锁定的流程边界', disabled: true },
  { id: 'execute', label: '执行变更', description: '修改并验证代码' },
  { id: 'report', label: '汇报结果', description: '记录验证证据' },
];

export function SortableListDemo() {
  const [order, setOrder] = useState(sortableItems.map(item => item.id));
  return <SortableList items={sortableItems} order={order} onOrderChange={setOrder} defaultSelected={['plan']} label="任务顺序" />;
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
  const [values, setValues] = useState<Record<string, PropertyValue>>({ name: 'Graphite 工作区', retention: 30, autosave: true, density: 'compact', id: 'workspace-local-01' });
  const items: PropertyItem[] = [
    { key: 'name', path: ['workspace', 'name'], label: '工作区名称', value: values.name, validate: value => String(value).length < 2 ? '名称至少需要 2 个字符' : undefined },
    { key: 'retention', path: ['workspace', 'retentionDays'], label: '保留天数', description: '允许 1 至 365 天', kind: 'number', value: values.retention, min: 1, max: 365, step: 1 },
    { key: 'autosave', path: ['editor', 'autosave'], label: '自动保存', kind: 'boolean', value: values.autosave },
    { key: 'density', path: ['appearance', 'density'], label: '界面密度', kind: 'select', value: values.density, options: [{ value: 'compact', label: '紧凑' }, { value: 'comfortable', label: '舒适' }] },
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
    { id: 'open-project', label: '打开项目', description: '选择本地示例项目', keywords: ['open', 'project'], icon: <FolderOpen aria-hidden="true" />, shortcut: '⌘ O', actionLabel: '打开' },
    { id: 'search-files', label: '搜索文件', description: '查找工作区中的文件', keywords: ['search', 'find'], icon: <Search aria-hidden="true" />, shortcut: '⌘ P', actionLabel: '搜索' },
  ] },
  { id: 'tools', label: '工具', commands: [
    { id: 'settings', label: '偏好设置', keywords: ['settings'], icon: <Settings aria-hidden="true" /> },
    { id: 'terminal', label: '打开终端', description: '此演示中不可用', disabled: true, icon: <Terminal aria-hidden="true" /> },
  ] },
];
export function CommandSearchDemo() {
  const [selected, setSelected] = useState('');
  return <div className="space-y-[var(--rui-content-gap)]"><CommandSearch groups={demoCommands} context="Reito UI / 当前工作区" onSelect={command => setSelected(command.label)} /><p role="status" className="text-xs text-muted-foreground">{selected ? `已选择：${selected}（本地演示）` : '选择命令以预览结果'}</p></div>;
}

export const demoContentSections = [
  { id: 'overview', title: '概览', content: <p>文档目录与正文共享一个受控当前位置。</p> },
  { id: 'usage', title: '使用方式', content: <p>选择目录项目会滚动正文；阅读正文也会更新目录。</p>, children: [
    { id: 'keyboard', title: '键盘操作', content: <p>目录沿用 TreeView 的方向键、Home、End 与 Enter。</p> },
  ] },
  { id: 'boundary', title: '宿主边界', content: <p>路由、Markdown 解析和远程内容仍由宿主提供。</p> },
];
export function ContentNavigationDemo() {
  const [current, setCurrent] = useState('overview');
  return <ContentNavigation className="h-[var(--rui-container-lg)]" sections={demoContentSections} value={current} onValueChange={setCurrent} title="组件指南" contentTitle="设计语言" />;
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
    <LogViewer entries={entries} onClear={() => setEntries([])} viewportClassName="h-56" />
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

const catalogResources: ResourceItem[] = [...demoResources, ...Array.from({ length: 56 }, (_, index) => ({
  id: `catalog-${index + 5}`,
  name: `component-${String(index + 5).padStart(2, '0')}.tsx`,
  kind: index % 2 ? '代码' : '文档',
  description: `增量加载资源 ${index + 5}`,
  updatedAt: `2026-08-${String((index % 28) + 1).padStart(2, '0')}T10:00:00+08:00`,
}))];

export function ResourceListDemo() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'name-asc' | 'name-desc' | 'updated-desc'>('name-asc');
  const [loaded, setLoaded] = useState(16);
  const [selection, setSelection] = useState<string[]>([]);
  const [opened, setOpened] = useState('');
  const matches = useMemo(() => catalogResources.filter(item => `${item.name} ${item.description} ${item.kind}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => {
    if (sort === 'updated-desc') return (Date.parse(b.updatedAt ?? '') || 0) - (Date.parse(a.updatedAt ?? '') || 0);
    return sort === 'name-desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
  }), [query, sort]);
  const items = matches.slice(0, loaded);
  return <div className="space-y-[var(--rui-content-gap)]">
    <ResourceList label="项目资源" items={items} dataMode="remote" totalCount={matches.length} virtualized viewportClassName="h-64"
      query={query} onQueryChange={next => { setQuery(next); setLoaded(16); }} sort={sort} onSortChange={next => { setSort(next); setLoaded(16); }}
      selectionMode="multiple" selectedIds={selection} onSelectionChange={setSelection} hasMore={loaded < matches.length} onLoadMore={() => setLoaded(current => Math.min(matches.length, current + 16))}
      actions={[
        { id: 'open', label: '打开', onAction: item => setOpened(item.name) },
      ]} />
    <p role="status" className="text-xs text-muted-foreground">{opened ? `已打开 ${opened}（本地预览）` : '远程数据由本地数组模拟；查询会替换加载窗口，稳定 ID 选择继续保留。'}</p>
  </div>;
}

export function ResourceViewDemo() {
  const [selected, setSelected] = useState(['specs']);
  const [opened, setOpened] = useState('');
  return <div className="space-y-[var(--rui-content-gap)]">
    <ResourceView items={catalogResources} label="组件资源" pageSize={9} selectionMode="multiple" selectedIds={selected} onSelectionChange={setSelected}
      actions={[{ id: 'open', label: '打开', onAction: item => setOpened(item.name) }]} />
    <p role="status" className="text-xs text-muted-foreground">{opened ? `已打开 ${opened}（本地预览）` : '列表与网格共享查询、分页、选择和行操作。'}</p>
  </div>;
}

export interface ComplexCatalogEntry { id: string; name: string; description: string; component: ComponentType; }
export const complexCatalog: ComplexCatalogEntry[] = [
  { id: 'chart', name: 'Chart 图表', description: '趋势、对比与占比，键盘访问及替代数据表', component: ChartDemo },
  { id: 'overlay-provider', name: 'OverlayProvider 命令式浮层', description: 'Dialog、Sheet 与 AlertDialog 的命令式打开、结果、关闭、并发栈和卸载收口。', component: OverlayProviderDemo },
  { id: 'inline-edit', name: 'InlineEdit 行内编辑', description: '显示与编辑槽、草稿提交取消、异步错误、只读和焦点恢复。', component: InlineEditDemo },
  { id: 'toolbar', name: 'Toolbar 工具栏', description: '操作分组、切换状态、可达溢出菜单与方向键漫游焦点。', component: ToolbarDemo },
  { id: 'banner', name: 'Banner 通知条', description: '信息、动作、关闭、长内容和可控 live region 的紧凑通知。', component: BannerDemo },
  { id: 'user-info', name: 'User 信息行', description: '头像、主辅文字、状态和独立宿主操作的紧凑组合。', component: UserInfoDemo },
  { id: 'confirm-popover', name: 'ConfirmPopover 锚点确认', description: '贴近触发器的确认、取消、异步进度、错误与焦点恢复。', component: ConfirmPopoverDemo },
  { id: 'split-button', name: 'SplitButton 拆分按钮', description: '主操作与相关菜单共享边缘，独立控制忙碌、禁用、标签和快捷键。', component: SplitButtonDemo },
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
  { id: 'transfer', name: 'Transfer 穿梭选择', description: '双侧搜索、选择与批量转移，保持稳定值和目标顺序。', component: TransferDemo },
  { id: 'sortable-list', name: 'SortableList 排序列表', description: '受控顺序、批量移动、键盘等价操作与拖放边界。', component: SortableListDemo },
  { id: 'organization-chart', name: 'OrganizationChart 组织结构图', description: '层级关系布局、受控折叠选择、模板与树键盘导航。', component: OrganizationChartDemo },
  { id: 'terminal-prompt', name: 'TerminalPrompt 命令交互', description: '宿主响应列表、历史浏览、提交取消与中文输入法保护。', component: TerminalPromptDemo },
  { id: 'rich-text-editor', name: 'RichTextEditor 富文本编辑', description: 'Tiptap schema 文档模型，支持受控多格式内容、块操作、图片上传、宿主补全审阅、任务列表、建议、链接与历史。', component: RichTextEditorDemo },
  { id: 'data-table', name: 'DataTable 数据表格', description: '真实排序、跨页选中、筛选与分页，使用稳定行 ID。', component: DataTableDemo },
  { id: 'disclosure-tree', name: 'DisclosureTree 目录导航', description: '原生折叠目录，使用 Tab 和 Enter 操作，不冒充 ARIA 树。', component: DisclosureTreeDemo },
  { id: 'search-filter-bar', name: 'SearchFilterBar 搜索筛选', description: '受控搜索与多选条件，直接筛选本地数据。', component: SearchFilterBarDemo },
  { id: 'date-range-picker', name: 'DateRangePicker 日期范围', description: '日历、日期输入、上下界校验、应用与取消。', component: DateRangePickerDemo },
  { id: 'date-time-range-picker', name: 'DateTimeRangePicker 日期时间范围', description: '起止本地日期时间、精度、范围校验、时区元数据与稳定提交。', component: DateTimeRangePickerDemo },
  { id: 'file-upload', name: 'FileUpload 文件上传', description: '本地校验、受控上传生命周期，以及会释放资源的图片缩略图和文件回退。', component: FileUploadDemo },
  { id: 'property-list', name: 'PropertyList 属性编辑', description: '文本、数字、布尔、选项、日期字段，以及嵌套路径、草稿、逐项禁用与只读。', component: PropertyListDemo },
  { id: 'timeline', name: 'Timeline 时间线', description: '按时间呈现完成、进行、失败和等待状态。', component: TimelineDemo },
  { id: 'stepper', name: 'Stepper 分步流程', description: '可导航步骤、必填门槛与本地确认流程。', component: StepperDemo },
  { id: 'settings-section', name: 'SettingsSection 设置分组', description: '标题、说明、行布局与真实受控表单。', component: SettingsSectionDemo },
  { id: 'workspace', name: 'Workspace 工作区布局', description: '应用外壳、基础分栏、响应式三槽预设与版本化视图持久化。', component: WorkspaceDemo },
  { id: 'command-search', name: 'CommandSearch 命令搜索', description: '跨资源分组、应用 Dialog、异步状态、快捷键与上下文。', component: CommandSearchDemo },
  { id: 'content-navigation', name: 'ContentNavigation 文档导航', description: '目录与阅读位置联动、受控路由、窄布局、长标题和空章节。', component: ContentNavigationDemo },
  { id: 'diff-viewer', name: 'DiffViewer 差异查看', description: '显式结构化行与宿主配对，统一/并排切换与长行处理。', component: DiffViewerDemo },
  { id: 'log-viewer', name: 'LogViewer 日志查看', description: '动态虚拟日志、查询、稳定增量加载、暂停跟随与受控视图偏好。', component: LogViewerDemo },
  { id: 'key-value-editor', name: 'KeyValueEditor 键值编辑', description: '稳定 ID 的受控草稿，支持富类型值、嵌套路径、逐项状态、校验、遮罩与提交。', component: KeyValueEditorDemo },
  { id: 'resource-list', name: 'ResourceList 资源列表', description: '本地/远程查询、虚拟窗口、增量加载与跨窗口稳定选择。', component: ResourceListDemo },
  { id: 'resource-view', name: 'ResourceView 资源视图', description: '同一集合状态的列表/网格切换、搜索、分页、选择与动作。', component: ResourceViewDemo },
];
