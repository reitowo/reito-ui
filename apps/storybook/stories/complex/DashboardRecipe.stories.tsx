import { useMemo, useRef, useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, LayoutDashboard, ListTodo, Plus, Search, Settings } from 'lucide-react';
import {
  Badge,
  Button,
  Input,
  NativeSelect,
  NativeSelectOption,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '../../../../packages/ui/src/basic.js';
import {
  ApplicationSearch,
  AppShell,
  DataTable,
  Form,
  FormError,
  FormField,
  WorkspacePreset,
  useForm,
  useWorkspaceLayoutState,
  useWorkspacePresetState,
  type CommandGroupDefinition,
  type WorkspacePresetView,
} from '../../../../packages/ui/src/complex/index.js';
import { booleanControl, choiceControl, recipeControl, textControl } from '../feature-controls.js';

type DashboardSection = 'overview' | 'tasks' | 'settings';
type DataState = 'ready' | 'empty' | 'loading' | 'error';
type TaskStatus = 'todo' | 'active' | 'done';

interface TaskRecord {
  id: string;
  title: string;
  owner: string;
  status: TaskStatus;
  updated: string;
}

interface TaskDraft {
  title: string;
  owner: string;
}

interface DashboardWorkspaceRecipeProps {
  title?: string;
  workspaceTitle?: string;
  layoutMode?: 'auto' | 'wide' | 'narrow';
  section: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
  view: WorkspacePresetView;
  onViewChange: (view: WorkspacePresetView) => void;
  dataState?: DataState;
  onDataStateChange?: (state: DataState) => void;
  searchOpen?: boolean;
  onSearchOpenChange?: (open: boolean) => void;
  emptyMessage?: string;
  preferenceSource?: string;
}

const initialTasks: TaskRecord[] = [
  { id: 'TASK-101', title: '统一工作区标题层级', owner: 'Reito', status: 'active', updated: '今天 10:24' },
  { id: 'TASK-102', title: '检查紧凑表格行高', owner: '林澈', status: 'todo', updated: '今天 09:42' },
  { id: 'TASK-103', title: '补充搜索失败状态', owner: 'Reito', status: 'done', updated: '昨天 18:10' },
  { id: 'TASK-104', title: '核对窄屏检查器', owner: '周野', status: 'todo', updated: '昨天 16:35' },
  { id: 'TASK-105', title: '记录 Storybook 审计', owner: '林澈', status: 'done', updated: '周一 14:20' },
];

const sectionItems: Array<{ id: DashboardSection; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: '概览', icon: LayoutDashboard },
  { id: 'tasks', label: '任务', icon: ListTodo },
  { id: 'settings', label: '设置', icon: Settings },
];

const statusLabel: Record<TaskStatus, string> = { todo: '待处理', active: '进行中', done: '已完成' };

function DashboardSidebarNavigation({ title, section, onSelect }: { title: string; section: DashboardSection; onSelect: (section: DashboardSection) => void }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const choose = (next: DashboardSection) => {
    onSelect(next);
    if (isMobile) setOpenMobile(false);
  };
  return <>
    <SidebarHeader><span className="truncate px-[var(--rui-space-2)] text-sm font-semibold">{title}</span></SidebarHeader>
    <SidebarContent><SidebarGroup><SidebarGroupLabel>工作区</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{sectionItems.map(item => <SidebarMenuItem key={item.id}><SidebarMenuButton tooltip={item.label} isActive={section === item.id} aria-label={item.label} aria-pressed={section === item.id} onClick={() => choose(item.id)}><item.icon /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent>
    <SidebarFooter><span className="truncate px-[var(--rui-space-2)] text-xs text-muted-foreground">本地交互示例</span></SidebarFooter>
  </>;
}

function DashboardWorkspaceRecipe({
  title = 'Reito 工作台',
  workspaceTitle = '本地任务',
  layoutMode = 'auto',
  section,
  onSectionChange,
  sidebarOpen,
  onSidebarOpenChange,
  view,
  onViewChange,
  dataState = 'ready',
  onDataStateChange,
  searchOpen = false,
  onSearchOpenChange,
  emptyMessage = '当前没有任务，可以从检查器添加一项。',
  preferenceSource = '当前会话',
}: DashboardWorkspaceRecipeProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [receipt, setReceipt] = useState('本地示例尚未执行操作');
  const nextId = useRef(106);
  const form = useForm<TaskDraft>({ defaultValues: { title: '', owner: 'Reito' }, mode: 'onBlur' });

  const finishTask = (id: string) => {
    const task = tasks.find(item => item.id === id);
    if (!task || task.status === 'done') return;
    setTasks(current => current.map(item => item.id === id ? { ...item, status: 'done', updated: '刚刚' } : item));
    setReceipt(`已在本地完成：${task.title}`);
  };

  const columns = useMemo<ColumnDef<TaskRecord>[]>(() => [
    { accessorKey: 'title', header: '任务' },
    { accessorKey: 'owner', header: '负责人' },
    { accessorKey: 'status', header: '状态', cell: ({ row }) => <Badge variant={row.original.status === 'active' ? 'default' : row.original.status === 'done' ? 'secondary' : 'outline'}>{statusLabel[row.original.status]}</Badge> },
    { accessorKey: 'updated', header: '更新' },
    { id: 'action', header: '操作', cell: ({ row }) => <Button type="button" size="xs" variant="ghost" disabled={row.original.status === 'done'} aria-label={`完成 ${row.original.title}`} onClick={() => finishTask(row.original.id)}><CheckCircle2 />完成</Button> },
  ], [tasks]);

  const commands = useMemo<CommandGroupDefinition[]>(() => [
    { id: 'navigation', label: '页面', commands: sectionItems.map(item => ({ id: `page-${item.id}`, label: item.label, description: '切换当前工作面', icon: <item.icon />, actionLabel: '打开' })) },
    { id: 'tasks', label: '任务', commands: tasks.map(task => ({ id: `task-${task.id}`, label: task.title, description: `${task.owner} · ${statusLabel[task.status]}`, keywords: [task.id, task.owner], icon: <ListTodo />, actionLabel: '查看' })) },
    { id: 'actions', label: '操作', commands: [
      { id: 'action-new', label: '新建任务', description: '打开本地任务表单', icon: <Plus />, actionLabel: '新建' },
      { id: 'action-reset', label: '重置本地任务', description: '恢复 Story 初始数据', actionLabel: '重置' },
    ] },
  ], [tasks]);

  const openInspector = () => onViewChange({ ...view, inspectorOpen: true, activePanel: layoutMode === 'narrow' ? 'inspector' : view.activePanel });
  const selectSection = (next: DashboardSection) => {
    onSectionChange(next);
    if (layoutMode === 'narrow') onViewChange({ ...view, activePanel: 'workspace' });
  };

  const table = <div className="min-w-0 p-[var(--rui-preview-padding)]">
    <DataTable
      data={dataState === 'empty' ? [] : tasks}
      columns={columns}
      getRowId={row => row.id}
      caption="本地任务"
      searchPlaceholder="筛选任务…"
      pageSize={5}
      selectable={false}
      loading={dataState === 'loading'}
      error={dataState === 'error' ? '本地任务读取失败，保留上次有效记录。' : undefined}
      onRetry={() => onDataStateChange?.('ready')}
      emptyMessage={emptyMessage}
    />
  </div>;

  const overview = <div className="grid gap-[var(--rui-content-gap)] p-[var(--rui-preview-padding)]">
    <div><h2 className="text-sm font-semibold">当前工作</h2><p className="mt-[var(--rui-space-1)] text-xs text-muted-foreground">直接进入任务、搜索或新建，不重复展示装饰性统计。</p></div>
    <div className="divide-y divide-border rounded-lg border border-border">{tasks.slice(0, 3).map(task => <button key={task.id} type="button" className="flex min-h-[var(--rui-control-height)] w-full min-w-0 items-center gap-[var(--rui-content-gap-sm)] px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-left hover:bg-muted focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:-outline-offset-[var(--rui-outline-width)] focus-visible:outline-ring" onClick={() => selectSection('tasks')}><span className="min-w-0 flex-1 truncate">{task.title}</span><span className="shrink-0 text-xs text-muted-foreground">{statusLabel[task.status]}</span></button>)}</div>
  </div>;

  const settings = <div className="grid max-w-[var(--rui-reading-width)] gap-[var(--rui-content-gap)] p-[var(--rui-preview-padding)]">
    <div><h2 className="text-sm font-semibold">工作区偏好</h2><p className="mt-[var(--rui-space-1)] text-xs text-muted-foreground">侧栏与检查器使用现有版本化状态；来源：{preferenceSource}。</p></div>
    <Button type="button" size="sm" variant="outline" className="w-fit" onClick={() => { onSidebarOpenChange(true); onViewChange({ navigationOpen: false, inspectorOpen: true, activePanel: 'workspace' }); setReceipt('已恢复默认布局'); }}>恢复默认布局</Button>
  </div>;

  const taskForm = <div className="p-[var(--rui-preview-padding)]">
    <Form form={form} aria-label="新建本地任务" onSubmit={draft => {
      const record: TaskRecord = { id: `TASK-${nextId.current++}`, title: draft.title.trim(), owner: draft.owner, status: 'todo', updated: '刚刚' };
      setTasks(current => [record, ...current]);
      setReceipt(`已在本地添加：${record.title}`);
      form.reset({ title: '', owner: draft.owner });
      onDataStateChange?.('ready');
      if (layoutMode === 'narrow') onViewChange({ ...view, activePanel: 'workspace' });
    }}>
      <FormField control={form.control} name="title" label="任务名称" required rules={{ required: '请输入任务名称', validate: value => value.trim().length >= 2 || '至少输入 2 个字符' }} render={({ field, controlProps }) => <Input {...field} {...controlProps} placeholder="例如：检查表格密度" />} />
      <FormField control={form.control} name="owner" label="负责人" render={({ field, controlProps }) => <NativeSelect {...controlProps} ref={field.ref} name={field.name} value={field.value} onBlur={field.onBlur} onChange={field.onChange}><NativeSelectOption value="Reito">Reito</NativeSelectOption><NativeSelectOption value="林澈">林澈</NativeSelectOption><NativeSelectOption value="周野">周野</NativeSelectOption></NativeSelect>} />
      <FormError />
      <div className="flex flex-wrap gap-[var(--rui-content-gap-sm)]"><Button type="submit" size="sm"><Plus />添加任务</Button><Button type="reset" size="sm" variant="outline">清空</Button></div>
    </Form>
  </div>;

  const currentContent = section === 'overview' ? overview : section === 'settings' ? settings : table;
  const currentTitle = section === 'overview' ? '概览' : section === 'settings' ? '设置' : workspaceTitle;

  return <SidebarProvider className="h-svh min-h-0 overflow-hidden" open={sidebarOpen} onOpenChange={onSidebarOpenChange} persistOpen={false}>
    <Sidebar collapsible="icon">
      <DashboardSidebarNavigation title={title} section={section} onSelect={selectSection} />
    </Sidebar>
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <AppShell className="h-full rounded-none border-0" header={<div className="flex min-w-0 items-center gap-[var(--rui-content-gap-sm)]"><SidebarTrigger aria-label="切换导航侧栏" /><span className="min-w-0 flex-1 truncate font-medium">{title}</span><Button type="button" size="xs" variant="outline" onClick={() => onSearchOpenChange?.(true)}><Search />搜索</Button><Button type="button" size="xs" onClick={openInspector}><Plus />新建</Button></div>} footer={<span role="status">{receipt} · {tasks.length} 项任务 · 偏好来源：{preferenceSource}</span>}>
        <WorkspacePreset className="h-full rounded-none border-0" mode={layoutMode} title={currentTitle} workspace={{ title: currentTitle, content: currentContent }} inspector={{ title: '新建任务', description: '保存到当前 Story 的本地状态', content: taskForm }} view={view} onViewChange={onViewChange} workspaceLabel="内容" inspectorLabel="检查器" />
      </AppShell>
    </div>
    <ApplicationSearch open={searchOpen} onOpenChange={open => onSearchOpenChange?.(open)} groups={commands} context={`${title} / ${currentTitle}`} contextLabel="当前工作" label="搜索工作台" placeholder="搜索页面、任务或操作…" onSelect={command => {
      if (command.id.startsWith('page-')) selectSection(command.id.slice(5) as DashboardSection);
      else if (command.id.startsWith('task-')) { selectSection('tasks'); setReceipt(`已定位：${command.label}`); }
      else if (command.id === 'action-new') openInspector();
      else if (command.id === 'action-reset') { setTasks(initialTasks); setReceipt('已恢复 Story 初始任务'); }
    }} />
  </SidebarProvider>;
}

function LocalDashboard({ mode = 'wide', initialSection = 'tasks', initialDataState = 'ready' }: { mode?: DashboardWorkspaceRecipeProps['layoutMode']; initialSection?: DashboardSection; initialDataState?: DataState }) {
  const [section, setSection] = useState(initialSection);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<WorkspacePresetView>({ navigationOpen: false, inspectorOpen: true, activePanel: 'workspace' });
  const [dataState, setDataState] = useState(initialDataState);
  const [searchOpen, setSearchOpen] = useState(false);
  return <DashboardWorkspaceRecipe layoutMode={mode} section={section} onSectionChange={setSection} sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen} view={view} onViewChange={setView} dataState={dataState} onDataStateChange={setDataState} searchOpen={searchOpen} onSearchOpenChange={setSearchOpen} />;
}

function PersistentDashboard() {
  const layout = useWorkspaceLayoutState({ storageKey: 'reito.story.dashboard.layout', defaultSidebarOpen: true });
  const preset = useWorkspacePresetState({ storageKey: 'reito.story.dashboard.preset', defaultInspectorOpen: true });
  const [section, setSection] = useState<DashboardSection>('tasks');
  const [searchOpen, setSearchOpen] = useState(false);
  return <DashboardWorkspaceRecipe section={section} onSectionChange={setSection} sidebarOpen={layout.state.sidebarOpen} onSidebarOpenChange={layout.setSidebarOpen} view={preset.state} onViewChange={preset.setView} searchOpen={searchOpen} onSearchOpenChange={setSearchOpen} preferenceSource={`${layout.source}/${preset.source}`} />;
}

const meta = {
  title: '复杂/DashboardRecipe 工作面配方',
  component: DashboardWorkspaceRecipe,
  args: {
    section: 'tasks',
    onSectionChange: () => {},
    sidebarOpen: true,
    onSidebarOpenChange: () => {},
    view: { navigationOpen: false, inspectorOpen: true, activePanel: 'workspace' },
    onViewChange: () => {},
  },
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: 'var(--rui-container-lg)' }, description: { component: '应用级组合配方：直接复用 Sidebar、AppShell、WorkspacePreset、DataTable、Form 与 ApplicationSearch。配方只存在于示例层，不作为新的组件族或公共 Dashboard 原语。全部数据与动作均为本地 Story 状态。' } } },
} satisfies Meta<typeof DashboardWorkspaceRecipe>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  title: string;
  workspaceTitle: string;
  layoutMode: 'auto' | 'wide' | 'narrow';
  section: DashboardSection;
  sidebarOpen: boolean;
  inspectorOpen: boolean;
  activePanel: 'workspace' | 'inspector';
  dataState: DataState;
  searchOpen: boolean;
  emptyMessage: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { title: 'Reito 工作台', workspaceTitle: '本地任务', layoutMode: 'auto', section: 'tasks', sidebarOpen: true, inspectorOpen: true, activePanel: 'workspace', dataState: 'ready', searchOpen: false, emptyMessage: '当前没有任务，可以从检查器添加一项。' },
  argTypes: {
    title: textControl,
    workspaceTitle: textControl,
    layoutMode: choiceControl(['auto', 'wide', 'narrow']),
    section: choiceControl(['overview', 'tasks', 'settings']),
    sidebarOpen: booleanControl,
    inspectorOpen: booleanControl,
    activePanel: choiceControl(['workspace', 'inspector']),
    dataState: recipeControl(choiceControl(['ready', 'empty', 'loading', 'error']), 'DataTable 的本地数据状态。'),
    searchOpen: booleanControl,
    emptyMessage: textControl,
  },
  parameters: { controls: { include: ['title', 'workspaceTitle', 'layoutMode', 'section', 'sidebarOpen', 'inspectorOpen', 'activePanel', 'dataState', 'searchOpen', 'emptyMessage'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    const view: WorkspacePresetView = { navigationOpen: false, inspectorOpen: args.inspectorOpen, activePanel: args.activePanel };
    return <DashboardWorkspaceRecipe {...args} view={view} onSectionChange={section => updateArgs({ section })} onSidebarOpenChange={sidebarOpen => updateArgs({ sidebarOpen })} onViewChange={next => updateArgs({ inspectorOpen: next.inspectorOpen, activePanel: next.activePanel as PlaygroundArgs['activePanel'] })} onDataStateChange={dataState => updateArgs({ dataState })} onSearchOpenChange={searchOpen => updateArgs({ searchOpen })} />;
  },
};

export const Default: Story = { name: '任务工作面', render: () => <LocalDashboard /> };
export const Narrow: Story = { name: '窄屏工作面', render: () => <LocalDashboard mode="narrow" /> };
export const PersistedPreferences: Story = { name: '布局偏好保存与恢复', render: () => <PersistentDashboard /> };
export const EmptyTasks: Story = { name: '空任务', render: () => <LocalDashboard initialDataState="empty" /> };
export const LoadingTasks: Story = { name: '任务加载中', render: () => <LocalDashboard initialDataState="loading" /> };
export const ErrorTasks: Story = { name: '任务失败与重试', render: () => <LocalDashboard initialDataState="error" /> };
export const Interactive: Story = {
  name: '交互场景：新建、完成与搜索',
  render: () => <LocalDashboard />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: '任务名称' }), '验证 Dashboard 配方');
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: '负责人' }), '林澈');
    await userEvent.click(canvas.getByRole('button', { name: '添加任务' }));
    await expect(canvas.getByText('验证 Dashboard 配方')).toBeVisible();
    await expect(canvas.getByRole('status')).toHaveTextContent('已在本地添加：验证 Dashboard 配方');
    await userEvent.click(canvas.getByRole('button', { name: '完成 验证 Dashboard 配方' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('已在本地完成：验证 Dashboard 配方');
    await userEvent.click(canvas.getByRole('button', { name: '搜索' }));
    const dialog = within(document.body).getByRole('dialog', { name: '应用搜索' });
    await userEvent.type(within(dialog).getByRole('combobox', { name: '搜索工作台' }), '验证 Dashboard');
    await userEvent.click(within(dialog).getByRole('option', { name: /验证 Dashboard 配方/ }));
    await expect(canvas.getByRole('status')).toHaveTextContent('已定位：验证 Dashboard 配方');
  },
};
