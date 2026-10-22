import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowLeft,
  ChevronRight,
  Copy,
  Ellipsis,
  File,
  FileText,
  Filter,
  Folder,
  FolderOpen,
  GitCommitHorizontal,
  LayoutDashboard,
  List,
  Moon,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Star,
  Sun,
  Trash2,
} from 'lucide-react';
import './gallery.css';
import {
  Badge,
  Button,
  CodeBlock,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  JumpToLatest,
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MiniTimeline,
  Progress,
  ReitoThemeProvider,
  ResourceList,
  SectionLabel,
  SelectInput,
  SettingsRow,
  SettingsSection,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ToggleGroup,
  ToggleGroupItem,
  ToolCall,
  TooltipProvider,
  type DensityMode,
  type MiniTimelineEvent,
} from '@reito/ui';

const pages = [
  { id: 'trace', label: '活动轨迹', group: '工作流' },
  { id: 'events', label: '事件流', group: '工作流' },
  { id: 'inspector', label: '数据检查', group: '工作流' },
  { id: 'commands', label: '命令面板', group: '工作流' },
  { id: 'dashboard', label: '工作概览', group: '应用' },
  { id: 'files', label: '文件浏览', group: '应用' },
  { id: 'settings', label: '偏好设置', group: '应用' },
] as const;
type PageId = (typeof pages)[number]['id'];
const densities: DensityMode[] = ['dense', 'compact', 'comfortable'];
const densityLabel: Record<DensityMode, string> = { dense: '高密', compact: '紧凑', comfortable: '舒适' };

const sampleHost = 'https://docs.example.com';
const surface = 'browser:project:01a15996-1b06-73e9-9b40-90689ee95a1a#iv8gi8xh';

function sampleSource(title: string, lines: number) {
  const body = [
    `  const doc = await surface.read(${JSON.stringify(title)});`,
    '  const blocks = doc.blocks.filter((block) => block.visible);',
    '  const outline = blocks.filter((block) => block.type === "heading");',
    '  const markdown = blocks.map((block) => block.markdown).join("\\n");',
    '  if (!doc.ok) throw new Error(doc.error);',
    '  const result = { outline, length: markdown.length };',
    '  console.info("local sample", result.length);',
    '  await surface.wait(0);',
    '  const cursor = doc.selection ?? null;',
    '  return { ...result, cursor };',
  ];
  return ['(async () => {', ...Array.from({ length: Math.max(1, lines - 2) }, (_, index) => body[index % body.length]), '})();'].join('\n');
}
const sampleResult = (value: string) =>
  `{"surfaceId":"${surface}","pageUrl":"${sampleHost}/doc/mhfzvq9q0ype","type":"object","value":${value}}`;

type TraceEntry = {
  id: string;
  time: string;
  kind: 'open' | 'eval';
  title: string;
  duration: string;
  tag: string;
  url?: string;
  inputLines?: number;
  output?: string;
  outputLines?: number;
  error?: string;
  turn?: string;
};
const traceEntries: TraceEntry[] = [
  { id: 't1', time: '18:27:22', kind: 'open', title: '打开示例首页', duration: '888ms', tag: '进入工作台', url: `http://127.0.0.1:51779/api/ext/sample/0.8.7/dist/webviews/transit/index.html?home=${encodeURIComponent(sampleHost + '/dock/home')}&wlxLocale=zh-CN&countdown=0` },
  { id: 't2', time: '18:27:26', kind: 'open', title: '选定首页', duration: '1.2s', tag: '首页选择', url: `${sampleHost}/dock/home` },
  { id: 't3', time: '18:28:35', kind: 'eval', title: '读正文与大纲', duration: '24ms', tag: '读正文', inputLines: 13, output: sampleResult('{"info":{"type":"doc","ok":true,"apiVersion":"0.5.0","result":{"docId":"mhfzvq9q0ype","blocks":83}}}'), outputLines: 133, turn: 'Turn 1' },
  { id: 't4', time: '18:28:42', kind: 'eval', title: '排查正文读取', duration: '20ms', tag: '读正文', inputLines: 10, output: sampleResult('{"mdRes":{"type":"doc","ok":true,"apiVersion":"0.5.0","result":{"markdown":"# Model Catalog"}}}'), outputLines: 18 },
  { id: 't5', time: '18:28:48', kind: 'eval', title: '读取后半部分正文', duration: '12ms', tag: '读正文', inputLines: 9, output: sampleResult('{"part2":"### 6.2 本地示例段落与诊断说明"}'), outputLines: 9 },
  { id: 't6', time: '18:30:58', kind: 'eval', title: '读取全文 Markdown', duration: '13ms', tag: '读正文', inputLines: 4, output: sampleResult('"# Model Catalog 服务\\n\\n## 1. 范围与当前状态"'), outputLines: 7 },
  { id: 't7', time: '18:33:17', kind: 'eval', title: '检查文档块结构', duration: '4ms', tag: '查结构', inputLines: 10, output: sampleResult('{"totalBlocks":83,"blockTypes":[{"type":"heading","level":2,"text":"1. 范围"}]}'), outputLines: 103 },
  { id: 't8', time: '18:33:26', kind: 'eval', title: '探测编辑器实例', duration: '2ms', tag: '探针', inputLines: 11, output: sampleResult('{"hasEl":true,"hasEd":true,"editable":true,"schemaNodes":["paragraph","title"]}'), outputLines: 54 },
  { id: 't9', time: '18:33:54', kind: 'eval', title: '测试文本替换', duration: '5ms', tag: '修改点', inputLines: 5, output: sampleResult('{"type":"doc","ok":false,"apiVersion":"0.5.0","error":"document is syncing (local sample)"}'), outputLines: 13 },
  { id: 't10', time: '18:34:04', kind: 'eval', title: '检查同步状态', duration: '4ms', tag: '同步状态', inputLines: 3, output: sampleResult('{"type":"doc","ok":true,"result":{"connected":false,"synced":false}}'), outputLines: 16 },
  { id: 't11', time: '18:34:14', kind: 'eval', title: '等待连接恢复', duration: '2.3s', tag: '探活', inputLines: 4, output: sampleResult('{"type":"doc","ok":true,"result":{"connected":true,"synced":true}}'), outputLines: 16 },
  { id: 't12', time: '18:34:21', kind: 'eval', title: '测试文本替换', duration: '2ms', tag: '修改点', inputLines: 8, error: "Error: Error invoking remote method 'desktop:browser-surface-command': Error: browser surface not found: browser:project" },
  { id: 't13', time: '18:34:32', kind: 'open', title: '重新打开文档', duration: '1.2s', tag: '重新打开', url: `${sampleHost}/doc/mhfzvq9q0ype` },
];

const timelineLanes = [
  { id: 'open', label: 'open' },
  { id: 'read', label: 'read' },
  { id: 'write', label: 'write' },
];
const timelineEvents: MiniTimelineEvent[] = Array.from({ length: 49 }, (_, index) => {
  const lane = index < 2 || index % 13 === 0 || index === 48 ? 'open' : index % 6 === 4 ? 'write' : 'read';
  return {
    id: `e${index + 1}`,
    lane,
    label: `本地事件 ${index + 1} · ${lane}`,
    tone: lane === 'open' ? 'info' : index === 18 || index === 31 || index === 32 ? 'danger' : lane === 'write' ? 'info' : 'neutral',
  };
});

function useFollow() {
  const ref = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(true);
  const measure = () => {
    const element = ref.current;
    if (element) setAtEnd(element.scrollHeight - element.clientHeight - element.scrollTop < 8);
  };
  useEffect(measure, []);
  const jump = () => {
    const element = ref.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
    measure();
  };
  return { ref, atEnd, measure, jump };
}

function PaneHeader({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex min-h-8 shrink-0 items-center gap-2 px-[var(--rui-content-padding)] py-1">
      <h1 className="flex min-w-0 items-center gap-1.5 text-sm leading-[var(--rui-line-interface)] font-semibold">{title}</h1>
      <div className="ml-auto flex shrink-0 items-center gap-1.5">{children}</div>
    </div>
  );
}

function SplitPane({
  pane,
  onBack,
  backLabel,
  main,
  aside,
}: {
  pane: 'main' | 'detail';
  onBack: () => void;
  backLabel: string;
  main: ReactNode;
  aside: ReactNode;
}) {
  return (
    <div className="gallery-split flex h-full min-h-0" data-pane={pane}>
      <div className="gallery-main flex min-h-0 min-w-0 flex-1 flex-col">{main}</div>
      <div className="gallery-aside flex w-[var(--rui-inspector-width)] shrink-0 flex-col gap-1 overflow-y-auto border-l bg-card px-[var(--rui-content-padding)] py-1">
        <div className="gallery-aside-toolbar">
          <Button variant="ghost" size="xs" className="min-h-[var(--rui-control-height-sm)]" onClick={onBack}>
            <ArrowLeft />
            返回
          </Button>
          <span className="truncate text-xs text-muted-foreground">{backLabel}</span>
        </div>
        {aside}
      </div>
    </div>
  );
}

function TracePage() {
  const [view, setView] = useState<string[]>(['list']);
  const [selected, setSelected] = useState<string | null>('e49');
  const follow = useFollow();
  return (
    <section aria-label="活动轨迹" className="flex h-full min-h-0 flex-col">
      <PaneHeader
        title={
          <>
            工作区 A<span className="text-xs font-normal text-muted-foreground">/ 草稿</span>
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            <span className="sr-only">已连接</span>
          </>
        }
      >
        <span className="text-xs text-muted-foreground tabular-nums">49 条</span>
        <ToggleGroup size="xs" variant="outline" spacing={0} aria-label="视图" value={view} onValueChange={(next) => next.length && setView(next)}>
          <ToggleGroupItem value="list" aria-label="列表视图">
            <List />
          </ToggleGroupItem>
          <ToggleGroupItem value="timeline" aria-label="时间线视图">
            <GitCommitHorizontal />
          </ToggleGroupItem>
        </ToggleGroup>
      </PaneHeader>
      <MiniTimeline
        label="事件总览"
        className="shrink-0 px-[var(--rui-content-padding)] py-1.5"
        lanes={timelineLanes}
        events={timelineEvents}
        markers={[{ index: 9, label: 'T1' }, { index: 22, label: 'T2' }, { index: 36, label: 'T3' }]}
        value={selected}
        onValueChange={setSelected}
      />
      <div className="relative min-h-0 flex-1">
        <div
          ref={follow.ref}
          onScroll={follow.measure}
          role="region"
          aria-label="事件列表"
          tabIndex={0}
          className="rui-scroll-focus h-full overflow-y-auto px-[var(--rui-content-padding)] pb-8"
        >
          <div className="grid gap-[var(--rui-content-gap-sm)]">
            {traceEntries.map((entry) => (
              <div key={entry.id} className="grid gap-[var(--rui-content-gap-sm)]">
                {entry.turn && <SectionLabel>{entry.turn}</SectionLabel>}
                <ToolCall
                  variant="trace"
                  status={entry.error ? 'error' : 'success'}
                  timestamp={entry.time}
                  kind={entry.kind === 'open' ? 'open 打开' : 'eval 执行'}
                  title={entry.title}
                  durationLabel={entry.duration}
                  tag={entry.tag}
                  input={entry.inputLines ? sampleSource(entry.title, entry.inputLines) : undefined}
                  output={entry.output}
                  outputLines={entry.outputLines}
                  error={entry.error}
                >
                  {entry.url && <p className="truncate font-mono" title={entry.url}>url: {entry.url}</p>}
                </ToolCall>
              </div>
            ))}
          </div>
        </div>
        <JumpToLatest visible={!follow.atEnd} onClick={follow.jump} />
      </div>
    </section>
  );
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type EventRow = { id: string; time: string; level: LogLevel; source: string; message: string; payload: string };
const sources = ['surface', 'editor', 'sync', 'bridge'];
const messages = [
  'read document outline',
  'resolved 83 blocks in 4ms',
  'selection changed (paragraph 12)',
  'sync heartbeat ok',
  'document is syncing; write deferred',
  'remote method desktop:browser-surface-command failed',
  'reconnected after 2.3s',
  'apply text replacement (local sample)',
];
const eventRows: EventRow[] = Array.from({ length: 64 }, (_, index) => {
  const level: LogLevel = index % 17 === 5 ? 'error' : index % 9 === 4 ? 'warn' : index % 5 === 0 ? 'debug' : 'info';
  const seconds = 22 + index * 7;
  const time = `18:${String(27 + Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}.${String((index * 137) % 1000).padStart(3, '0')}`;
  const message = level === 'error' ? messages[5]! : level === 'warn' ? messages[4]! : messages[index % 4 === 3 ? 7 : index % 4]!;
  return {
    id: `log-${index + 1}`,
    time,
    level,
    source: sources[index % sources.length]!,
    message,
    payload: JSON.stringify({ seq: index + 1, level, source: sources[index % sources.length], surface, ok: level !== 'error' }, null, 2),
  };
});
const levelBadge: Record<LogLevel, 'secondary' | 'outline' | 'destructive'> = { debug: 'outline', info: 'secondary', warn: 'outline', error: 'destructive' };

function EventsPage() {
  const [levels, setLevels] = useState<string[]>(['info', 'warn', 'error']);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('log-6');
  const [pane, setPane] = useState<'main' | 'detail'>('main');
  const [showSource, setShowSource] = useState(true);
  const [wrap, setWrap] = useState(false);
  const follow = useFollow();
  const rows = useMemo(
    () => eventRows.filter((row) => levels.includes(row.level) && `${row.message} ${row.source}`.includes(query)),
    [levels, query],
  );
  const current = eventRows.find((row) => row.id === selected);
  const selectRow = (id: string) => {
    setSelected(id);
    setPane('detail');
  };
  return (
    <SplitPane
      pane={pane}
      onBack={() => setPane('main')}
      backLabel={current ? `${current.time} · ${current.level}` : '事件详情'}
      main={
      <section aria-label="事件流" className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PaneHeader title="事件流">
          <span className="text-xs text-muted-foreground tabular-nums">
            {rows.length} / {eventRows.length}
          </span>
        </PaneHeader>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b px-[var(--rui-content-padding)] pb-1.5">
          <div className="gallery-filter-field relative w-[var(--rui-container-3xs)] min-w-0">
            <Search className="pointer-events-none absolute top-1/2 left-1.5 size-3 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input aria-label="筛选事件" placeholder="筛选消息或来源" value={query} onChange={(event) => setQuery(event.target.value)} className="h-[var(--rui-control-height-sm)] pl-6 text-xs" />
          </div>
          <ToggleGroup multiple size="xs" variant="outline" spacing={0} aria-label="级别" value={levels} onValueChange={setLevels}>
            {(['debug', 'info', 'warn', 'error'] as const).map((level) => (
              <ToggleGroupItem key={level} value={level}>
                {level}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="xs" />}>
              <Settings2 />
              视图
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">
              <DropdownMenuGroup>
                <DropdownMenuLabel>显示</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={showSource} onCheckedChange={setShowSource}>
                  来源列
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={wrap} onCheckedChange={setWrap}>
                  自动换行
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLevels(['debug', 'info', 'warn', 'error'])}>
                <Filter />
                显示全部级别
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <MiniTimeline
          label="事件分布"
          className="shrink-0 border-b px-[var(--rui-content-padding)] py-1.5"
          lanes={sources.map((id) => ({ id, label: id }))}
          events={eventRows.map((row) => ({ id: row.id, lane: row.source, label: `${row.time} ${row.message}`, tone: row.level === 'error' ? 'danger' : row.level === 'warn' ? 'warning' : row.level === 'debug' ? 'neutral' : 'info' }))}
          value={selected}
          onValueChange={setSelected}
        />
        <div className="relative min-h-0 flex-1">
          <div ref={follow.ref} onScroll={follow.measure} className="gallery-table-scroll h-full overflow-y-auto">
            <Table aria-label="事件">
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-0">时间</TableHead>
                  <TableHead className="w-0">级别</TableHead>
                  {showSource && <TableHead className="w-0">来源</TableHead>}
                  <TableHead>消息</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.id === selected ? 'selected' : undefined}
                    onClick={() => selectRow(row.id)}
                    className="cursor-default"
                  >
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground tabular-nums"><span className="font-mono">{row.time}</span></TableCell>
                    <TableCell>
                      <Badge size="xs" variant={levelBadge[row.level]} className={row.level === 'warn' ? 'text-warning' : undefined}>
                        {row.level}
                      </Badge>
                    </TableCell>
                    {showSource && <TableCell className="text-xs text-muted-foreground"><span className="font-mono">{row.source}</span></TableCell>}
                    <TableCell className={`max-w-0 text-xs ${wrap ? 'break-words whitespace-normal' : 'truncate'} ${row.level === 'error' ? 'text-destructive' : ''}`}>
                      <button type="button" className="w-full truncate text-left font-mono outline-none focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring" onClick={() => selectRow(row.id)}>
                        {row.message}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <JumpToLatest visible={!follow.atEnd} count={3} onClick={follow.jump} />
        </div>
      </section>
      }
      aside={
      <aside aria-label="事件详情" className="flex min-h-0 flex-1 flex-col gap-1">
        <SectionLabel trailing={current?.id}>事件详情</SectionLabel>
        {current && (
          <>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-xs">
              <dt className="text-muted-foreground">时间</dt>
              <dd className="font-mono tabular-nums">{current.time}</dd>
              <dt className="text-muted-foreground">级别</dt>
              <dd>
                <Badge size="xs" variant={levelBadge[current.level]}>{current.level}</Badge>
              </dd>
              <dt className="text-muted-foreground">来源</dt>
              <dd className="font-mono">{current.source}</dd>
              <dt className="text-muted-foreground">消息</dt>
              <dd className={current.level === 'error' ? 'text-destructive' : undefined}>{current.message}</dd>
            </dl>
            <SectionLabel divider>Payload</SectionLabel>
            <CodeBlock variant="inline" language="json" code={current.payload} />
          </>
        )}
      </aside>
      }
    />
  );
}

type ModelRow = { id: string; name: string; provider: string; status: 'ready' | 'syncing' | 'failed' | 'draft'; context: string; latency: string; updated: string; starred?: boolean };
const modelRows: ModelRow[] = [
  { id: 'm1', name: 'alpha-large', provider: 'local-a', status: 'ready', context: '200k', latency: '410ms', updated: '10-21 18:12', starred: true },
  { id: 'm2', name: 'alpha-small', provider: 'local-a', status: 'ready', context: '128k', latency: '120ms', updated: '10-21 17:58' },
  { id: 'm3', name: 'beta-embed-v2', provider: 'local-b', status: 'syncing', context: '8k', latency: '38ms', updated: '10-21 17:40' },
  { id: 'm4', name: 'gamma-reasoner', provider: 'local-c', status: 'ready', context: '256k', latency: '880ms', updated: '10-20 22:03' },
  { id: 'm5', name: 'delta-vision', provider: 'local-b', status: 'failed', context: '64k', latency: '—', updated: '10-20 21:47' },
  { id: 'm6', name: 'epsilon-rank', provider: 'local-c', status: 'ready', context: '16k', latency: '22ms', updated: '10-20 19:10' },
  { id: 'm7', name: 'zeta-draft', provider: 'local-a', status: 'draft', context: '128k', latency: '—', updated: '10-19 11:31' },
  { id: 'm8', name: 'eta-summary', provider: 'local-b', status: 'ready', context: '32k', latency: '190ms', updated: '10-18 09:05' },
  { id: 'm9', name: 'theta-translate', provider: 'local-c', status: 'ready', context: '32k', latency: '160ms', updated: '10-17 16:44' },
  { id: 'm10', name: 'iota-classify', provider: 'local-a', status: 'syncing', context: '4k', latency: '9ms', updated: '10-17 08:12' },
];
const statusBadge: Record<ModelRow['status'], { label: string; variant: 'secondary' | 'outline' | 'destructive' }> = {
  ready: { label: '可用', variant: 'secondary' },
  syncing: { label: '同步中', variant: 'outline' },
  failed: { label: '失败', variant: 'destructive' },
  draft: { label: '草稿', variant: 'outline' },
};

function RowActions({ row, onSelect }: { row: ModelRow; onSelect: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`${row.name} 操作`} onClick={onSelect} />}>
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-40">
        <DropdownMenuItem>
          <Pencil />
          编辑
          <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy />
          复制 ID
          <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderOpen />
            移动到
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>生产目录</DropdownMenuItem>
            <DropdownMenuItem>预发目录</DropdownMenuItem>
            <DropdownMenuItem>归档</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 />
          删除
          <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InspectorPage() {
  const [selected, setSelected] = useState('m1');
  const [pane, setPane] = useState<'main' | 'detail'>('main');
  const [provider, setProvider] = useState('all');
  const [streaming, setStreaming] = useState(true);
  const [visible, setVisible] = useState({ provider: true, context: true, latency: true, updated: true });
  const rows = modelRows.filter((row) => provider === 'all' || row.provider === provider);
  const current = modelRows.find((row) => row.id === selected) ?? modelRows[0]!;
  const selectRow = (id: string) => {
    setSelected(id);
    setPane('detail');
  };
  return (
    <SplitPane
      pane={pane}
      onBack={() => setPane('main')}
      backLabel={current.name}
      main={
      <section aria-label="模型目录" className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PaneHeader title="条目目录">
          <SelectInput
            size="xs"
            aria-label="分组"
            value={provider}
            onValueChange={setProvider}
            options={[
              { value: 'all', label: '全部分组' },
              { value: 'local-a', label: '分组 A' },
              { value: 'local-b', label: '分组 B' },
              { value: 'local-c', label: '分组 C' },
            ]}
          />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="xs" />}>
              <List />
              列
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto min-w-36">
              <DropdownMenuGroup>
                <DropdownMenuLabel>可见列</DropdownMenuLabel>
                {(['provider', 'context', 'latency', 'updated'] as const).map((key) => (
                  <DropdownMenuCheckboxItem key={key} checked={visible[key]} onCheckedChange={(checked) => setVisible((value) => ({ ...value, [key]: checked }))}>
                    {{ provider: '分组', context: '容量', latency: '耗时', updated: '更新时间' }[key]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="xs">
            <Plus />
            新增
          </Button>
        </PaneHeader>
        <div className="gallery-table-scroll min-h-0 flex-1 overflow-y-auto border-t">
          <Table aria-label="模型">
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>名称</TableHead>
                {visible.provider && <TableHead>分组</TableHead>}
                <TableHead>状态</TableHead>
                {visible.context && <TableHead className="text-right">容量</TableHead>}
                {visible.latency && <TableHead className="text-right">耗时</TableHead>}
                {visible.updated && <TableHead>更新时间</TableHead>}
                <TableHead className="w-0">
                  <span className="sr-only">操作</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <ContextMenu key={row.id}>
                  <ContextMenuTrigger
                    render={
                      <TableRow
                        data-state={row.id === selected ? 'selected' : undefined}
                        onClick={() => selectRow(row.id)}
                        className="cursor-default"
                      />
                    }
                  >
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-1.5">
                        {row.starred ? <Star className="size-3 text-warning" aria-hidden="true" /> : <span className="size-3" />}
                        {row.starred && <span className="sr-only">已收藏</span>}
                        <button type="button" className="truncate font-mono text-xs outline-none focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring" onClick={() => selectRow(row.id)}>
                          {row.name}
                        </button>
                      </span>
                    </TableCell>
                    {visible.provider && <TableCell className="text-muted-foreground">{row.provider}</TableCell>}
                    <TableCell>
                      <Badge size="xs" variant={statusBadge[row.status].variant}>{statusBadge[row.status].label}</Badge>
                    </TableCell>
                    {visible.context && <TableCell className="text-right text-xs tabular-nums"><span className="font-mono">{row.context}</span></TableCell>}
                    {visible.latency && <TableCell className="text-right text-xs tabular-nums"><span className="font-mono">{row.latency}</span></TableCell>}
                    {visible.updated && <TableCell className="text-xs text-muted-foreground tabular-nums"><span className="font-mono">{row.updated}</span></TableCell>}
                    <TableCell className="py-0">
                      <RowActions row={row} onSelect={() => selectRow(row.id)} />
                    </TableCell>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-auto min-w-40">
                    <ContextMenuItem>
                      <Play />
                      运行本地测试
                    </ContextMenuItem>
                    <ContextMenuItem>
                      <RefreshCw />
                      重新同步
                      <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem variant="destructive">
                      <Trash2 />
                      删除
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="shrink-0 border-t px-[var(--rui-content-padding)] py-0.5 text-2xs text-muted-foreground">
          本地示例数据 · 右键行打开上下文菜单
        </p>
      </section>
      }
      aside={
      <aside aria-label="检查器" className="flex min-h-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <h2 className="min-w-0 flex-1 truncate font-mono text-sm font-medium">{current.name}</h2>
          <Badge size="xs" variant={statusBadge[current.status].variant}>{statusBadge[current.status].label}</Badge>
        </div>
        <SectionLabel divider>基本信息</SectionLabel>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-xs">
          <dt className="text-muted-foreground">分组</dt>
          <dd>{current.provider}</dd>
          <dt className="text-muted-foreground">容量</dt>
          <dd className="font-mono tabular-nums">{current.context}</dd>
          <dt className="text-muted-foreground">耗时</dt>
          <dd className="font-mono tabular-nums">{current.latency}</dd>
          <dt className="text-muted-foreground">更新</dt>
          <dd className="font-mono tabular-nums">{current.updated}</dd>
        </dl>
        <SectionLabel divider>参数</SectionLabel>
        <div className="grid gap-1 text-xs">
          <label className="flex items-center justify-between gap-2">
            流式输出
            <Switch size="sm" checked={streaming} onCheckedChange={setStreaming} />
          </label>
          <div className="flex items-center justify-between gap-2">
            <span id="inspector-route">路由</span>
            <SelectInput size="xs" aria-labelledby="inspector-route" defaultValue="balanced" options={[{ value: 'balanced', label: '均衡' }, { value: 'fast', label: '低延迟' }, { value: 'quality', label: '高质量' }]} />
          </div>
        </div>
        <SectionLabel divider trailing="3">最近事件</SectionLabel>
        <ul className="grid gap-0.5 font-mono text-xs">
          <li className="flex gap-2"><span className="text-muted-foreground tabular-nums">18:12</span><span className="truncate">本地同步完成</span></li>
          <li className="flex gap-2"><span className="text-muted-foreground tabular-nums">17:58</span><span className="truncate">参数已更新</span></li>
          <li className="flex gap-2 text-destructive"><span className="tabular-nums">17:40</span><span className="truncate">连接超时（示例）</span></li>
        </ul>
        <Collapsible>
          <CollapsibleTrigger variant="row" className="bg-sunken">
            <ChevronRight data-slot="collapsible-chevron" className="size-3" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate font-mono text-foreground">原始 JSON</span>
            <span className="text-2xs">8 行</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CodeBlock variant="inline" language="json" className="mt-px" code={JSON.stringify({ id: current.id, name: current.name, provider: current.provider, context: current.context }, null, 2)} />
          </CollapsibleContent>
        </Collapsible>
      </aside>
      }
    />
  );
}

function SettingRow({ label, description, children }: { label: string; description: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[var(--rui-control-height)] items-center gap-3 border-b py-1 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function CommandsPage() {
  const [autosave, setAutosave] = useState(true);
  const [telemetry, setTelemetry] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [panel, setPanel] = useState('bottom');
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-8 shrink-0 items-center gap-2 overflow-x-auto border-b px-[var(--rui-content-padding)] py-1">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>
              <MenubarItem><FileText />新建文档<MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
              <MenubarItem><FolderOpen />打开…<MenubarShortcut>⌘O</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled>导出 PDF</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>编辑</MenubarTrigger>
            <MenubarContent>
              <MenubarItem><Copy />复制<MenubarShortcut>⌘C</MenubarShortcut></MenubarItem>
              <MenubarItem><Pencil />重命名<MenubarShortcut>F2</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem variant="destructive"><Trash2 />删除<MenubarShortcut>⌫</MenubarShortcut></MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>视图</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem checked={wrap} onCheckedChange={setWrap}>自动换行</MenubarCheckboxItem>
              <MenubarCheckboxItem checked={panel === 'bottom'} onCheckedChange={(checked) => setPanel(checked ? 'bottom' : 'hidden')}>底部面板</MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <span className="ml-auto text-2xs text-muted-foreground">本地示例 · 命令不会执行</span>
      </div>
      <div className="gallery-commands-grid grid min-h-0 flex-1 grid-cols-[minmax(0,var(--rui-container-sm))_minmax(0,1fr)] gap-[var(--rui-content-gap)] overflow-y-auto p-[var(--rui-content-padding)]">
        <section aria-label="命令" className="min-w-0">
          <SectionLabel>命令面板</SectionLabel>
          <Command className="h-auto rounded-[var(--rui-component-menu-popup-radius)] border shadow-none">
            <CommandInput placeholder="输入命令或搜索…" />
            <CommandList>
              <CommandGroup heading="文档">
                <CommandItem><FileText />打开最近文档<CommandShortcut>⌘P</CommandShortcut></CommandItem>
                <CommandItem><Search />在文档中查找<CommandShortcut>⌘F</CommandShortcut></CommandItem>
                <CommandItem><RefreshCw />重新同步<CommandShortcut>⌘R</CommandShortcut></CommandItem>
              </CommandGroup>
              <CommandGroup heading="视图">
                <CommandItem><List />切换列表视图</CommandItem>
                <CommandItem><GitCommitHorizontal />切换时间线视图</CommandItem>
                <CommandItem><Settings2 />打开设置<CommandShortcut>⌘,</CommandShortcut></CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </section>
        <section aria-label="设置" className="min-w-0">
          <SectionLabel>编辑器</SectionLabel>
          <div className="rounded-[var(--rui-component-card-radius)] border bg-card px-[var(--rui-component-card-padding-x)]">
            <SettingRow label="自动保存" description="停止输入 1 秒后保存到本地草稿。">
              <Switch size="sm" checked={autosave} onCheckedChange={setAutosave} aria-label="自动保存" />
            </SettingRow>
            <SettingRow label="底部面板" description="事件流与终端的默认位置。">
              <SelectInput size="xs" aria-label="底部面板" value={panel} onValueChange={setPanel} options={[{ value: 'bottom', label: '底部' }, { value: 'right', label: '右侧' }, { value: 'hidden', label: '隐藏' }]} />
            </SettingRow>
            <SettingRow label="默认操作" description="点击轨迹事件时执行的动作。">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="xs" />}>
                  打开详情
                  <ChevronRight className="rotate-90" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-auto min-w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>点击事件时</DropdownMenuLabel>
                    <DropdownMenuRadioGroup defaultValue="detail">
                      <DropdownMenuRadioItem value="detail">打开详情</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="source">展开源码</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="copy">复制结果</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem inset>恢复默认</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SettingRow>
          </div>
          <SectionLabel className="mt-1">隐私</SectionLabel>
          <div className="rounded-[var(--rui-component-card-radius)] border bg-card px-[var(--rui-component-card-padding-x)]">
            <SettingRow label="诊断数据" description="示例开关，不会上传任何数据。">
              <Switch size="sm" checked={telemetry} onCheckedChange={setTelemetry} aria-label="诊断数据" />
            </SettingRow>
            <SettingRow label="自动换行" description="与视图菜单中的选项同步。">
              <Switch size="sm" checked={wrap} onCheckedChange={setWrap} aria-label="自动换行" />
            </SettingRow>
          </div>
        </section>
      </div>
    </div>
  );
}

function readPage(): PageId {
  const page = new URLSearchParams(location.search).get('page');
  return pages.some((item) => item.id === page) ? (page as PageId) : 'trace';
}

function readDensity(fallback: DensityMode): DensityMode {
  const value = new URLSearchParams(location.search).get('density');
  return densities.includes(value as DensityMode) ? (value as DensityMode) : fallback;
}

function DashboardPage() {
  const [selected, setSelected] = useState('task-2');
  const [pane, setPane] = useState<'main' | 'detail'>('main');
  const tasks = [
    { id: 'task-1', title: '整理共享组件入口', area: '基础', done: true },
    { id: 'task-2', title: '核对事件流筛选', area: '复杂', done: false },
    { id: 'task-3', title: '完善偏好设置分区', area: '复杂', done: false },
    { id: 'task-4', title: '补充空态与加载', area: '反馈', done: true },
  ];
  const done = tasks.filter((task) => task.done).length;
  const current = tasks.find((task) => task.id === selected);
  const selectTask = (id: string) => {
    setSelected(id);
    setPane('detail');
  };
  return (
    <SplitPane
      pane={pane}
      onBack={() => setPane('main')}
      backLabel={current?.title ?? '概览详情'}
      main={
      <section aria-label="工作概览" className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PaneHeader title="工作概览">
          <span className="text-xs text-muted-foreground tabular-nums">{done} / {tasks.length} 完成</span>
        </PaneHeader>
        <div className="gallery-table-scroll min-h-0 flex-1 overflow-y-auto px-[var(--rui-content-padding)] py-[var(--rui-content-gap)]">
          <div className="mb-3 grid gap-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>示例进度</span>
              <span className="tabular-nums">{Math.round((done / tasks.length) * 100)}%</span>
            </div>
            <Progress aria-label="示例任务进度" value={(done / tasks.length) * 100} />
          </div>
          <SectionLabel>今日事项</SectionLabel>
          <Table aria-label="事项">
            <TableHeader>
              <TableRow>
                <TableHead>事项</TableHead>
                <TableHead>分区</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} data-state={task.id === selected ? 'selected' : undefined} className="cursor-default" onClick={() => selectTask(task.id)}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="text-muted-foreground">{task.area}</TableCell>
                  <TableCell>
                    <Badge size="xs" variant={task.done ? 'secondary' : 'outline'}>{task.done ? '已完成' : '进行中'}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
      }
      aside={
      <aside aria-label="概览详情" className="flex min-h-0 flex-1 flex-col gap-1">
        <h2 className="text-sm font-medium">{current?.title}</h2>
        <p className="text-xs text-muted-foreground">本地示例事项，不连接外部服务。</p>
        <SectionLabel divider>最近活动</SectionLabel>
        <ul className="grid gap-1 text-xs">
          <li className="flex gap-2"><Activity className="mt-0.5 size-3 text-muted-foreground" /><span>事件流筛选已更新</span></li>
          <li className="flex gap-2"><FileText className="mt-0.5 size-3 text-muted-foreground" /><span>草稿文档已自动保存</span></li>
          <li className="flex gap-2"><RefreshCw className="mt-0.5 size-3 text-muted-foreground" /><span>目录同步完成</span></li>
        </ul>
      </aside>
      }
    />
  );
}

function FilesPage() {
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(['f2']);
  const items = [
    { id: 'f1', name: '概览.md', kind: '文档', description: '工作区说明', updatedAt: '2026-10-21T10:00:00Z', icon: <FileText className="size-3.5" /> },
    { id: 'f2', name: '组件', kind: '文件夹', description: '12 个条目', updatedAt: '2026-10-21T09:40:00Z', icon: <Folder className="size-3.5" /> },
    { id: 'f3', name: 'tokens.json', kind: '配置', description: '本地示例配置', updatedAt: '2026-10-20T18:12:00Z', icon: <File className="size-3.5" /> },
    { id: 'f4', name: '截图', kind: '文件夹', description: '8 个条目', updatedAt: '2026-10-20T16:05:00Z', icon: <FolderOpen className="size-3.5" /> },
    { id: 'f5', name: 'notes.txt', kind: '文档', description: '临时笔记', updatedAt: '2026-10-19T11:22:00Z', icon: <FileText className="size-3.5" /> },
    { id: 'f6', name: 'archive', kind: '文件夹', description: '已归档', updatedAt: '2026-10-18T08:01:00Z', icon: <Folder className="size-3.5" /> },
  ];
  return (
    <section aria-label="文件浏览" className="flex h-full min-h-0 flex-col">
      <PaneHeader title="文件浏览">
        <span className="text-xs text-muted-foreground tabular-nums">{items.length} 项</span>
      </PaneHeader>
      <div className="min-h-0 flex-1 overflow-hidden px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)]">
        <ResourceList
          label="示例文件"
          items={items}
          query={query}
          onQueryChange={setQuery}
          selectionMode="single"
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          actions={[
            { id: 'open', label: '打开', onAction: () => undefined },
            { id: 'rename', label: '重命名', onAction: () => undefined },
          ]}
          emptyMessage="没有匹配的文件"
        />
      </div>
    </section>
  );
}

function SettingsPage() {
  const [autosave, setAutosave] = useState(true);
  const [telemetry, setTelemetry] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [panel, setPanel] = useState('bottom');
  return (
    <section aria-label="偏好设置" className="flex h-full min-h-0 flex-col">
      <PaneHeader title="偏好设置">
        <span className="text-2xs text-muted-foreground">本地示例 · 不会保存到服务器</span>
      </PaneHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-[var(--rui-content-padding)]">
        <div className="mx-auto grid max-w-[var(--rui-container-md)] gap-[var(--rui-content-gap)]">
          <SettingsSection title="编辑器" description="控制草稿保存与面板位置。">
            <SettingsRow label="自动保存" description="停止输入后写入本地草稿。" htmlFor="gallery-autosave">
              <Switch id="gallery-autosave" size="sm" checked={autosave} onCheckedChange={setAutosave} />
            </SettingsRow>
            <SettingsRow label="底部面板" description="事件与输出的默认位置。">
              <SelectInput size="xs" aria-label="底部面板" value={panel} onValueChange={setPanel} options={[{ value: 'bottom', label: '底部' }, { value: 'right', label: '右侧' }, { value: 'hidden', label: '隐藏' }]} />
            </SettingsRow>
            <SettingsRow label="自动换行" description="长行在阅读区折行显示。" htmlFor="gallery-wrap">
              <Switch id="gallery-wrap" size="sm" checked={wrap} onCheckedChange={setWrap} />
            </SettingsRow>
          </SettingsSection>
          <SettingsSection title="隐私" description="示例开关，不上传任何数据。" variant="plain">
            <SettingsRow label="诊断数据" description="仅用于演示交互状态。" htmlFor="gallery-telemetry">
              <Switch id="gallery-telemetry" size="sm" checked={telemetry} onCheckedChange={setTelemetry} />
            </SettingsRow>
          </SettingsSection>
        </div>
      </div>
    </section>
  );
}

function renderPage(page: PageId) {
  switch (page) {
    case 'trace':
      return <TracePage />;
    case 'events':
      return <EventsPage />;
    case 'inspector':
      return <InspectorPage />;
    case 'commands':
      return <CommandsPage />;
    case 'dashboard':
      return <DashboardPage />;
    case 'files':
      return <FilesPage />;
    case 'settings':
      return <SettingsPage />;
  }
}

/** Interactive example gallery for the public Lab / GitHub Pages site. */
export function Gallery({ lockedDensity }: { lockedDensity?: DensityMode } = {}) {
  const [page, setPage] = useState<PageId>(readPage);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark'));
  const [density, setDensity] = useState<DensityMode>(() => readDensity(lockedDensity ?? 'dense'));
  const activeDensity = lockedDensity ?? density;
  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set('view', lockedDensity === 'dense' ? 'dense' : 'gallery');
    url.searchParams.set('page', page);
    url.searchParams.set('theme', theme);
    if (!lockedDensity) url.searchParams.set('density', density);
    else url.searchParams.delete('density');
    history.replaceState(null, '', url);
    document.title = `${pages.find((item) => item.id === page)!.label} · 示例画廊 · Reito UI`;
  }, [page, theme, density, lockedDensity]);
  const groups = ['工作流', '应用'] as const;
  const pageButtons = (
    <>
      {groups.map((group) => (
        <div key={group} className="grid gap-0.5">
          <p className="px-1.5 text-2xs text-muted-foreground">{group}</p>
          {pages.filter((item) => item.group === group).map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="xs"
              aria-current={item.id === page ? 'page' : undefined}
              className="h-7 justify-start px-1.5 text-xs text-muted-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      ))}
    </>
  );
  return (
    <ReitoThemeProvider root mode={theme} density={activeDensity}>
      <TooltipProvider>
        <div className="gallery-shell reito-root flex h-dvh flex-col overflow-hidden bg-background text-foreground">
          <header className="gallery-header flex h-7 shrink-0 items-center gap-2 border-b bg-card px-[var(--rui-content-padding)]">
            <a href={import.meta.env.BASE_URL} className="text-xs font-semibold">Reito UI</a>
            <LayoutDashboard className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="text-xs font-medium">示例画廊</span>
            <span className="gallery-header-title text-2xs text-muted-foreground">可交互 · 本地占位数据</span>
            <div className="gallery-header-controls ml-auto flex min-w-0 flex-wrap items-center justify-end gap-1.5">
              {!lockedDensity && (
                <ToggleGroup
                  size="xs"
                  variant="outline"
                  spacing={0}
                  aria-label="密度"
                  value={[density]}
                  onValueChange={(next) => next[0] && setDensity(next[0] as DensityMode)}
                >
                  {densities.map((item) => (
                    <ToggleGroupItem key={item} value={item} aria-label={densityLabel[item]}>
                      {densityLabel[item]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}
              <Button variant="ghost" size="icon-xs" aria-label={theme === 'dark' ? '切换到浅色' : '切换到深色'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun /> : <Moon />}
              </Button>
            </div>
          </header>
          <nav aria-label="示例页面" className="gallery-page-tabs">
            {pages.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="xs"
                aria-current={item.id === page ? 'page' : undefined}
                className="text-xs text-muted-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
                onClick={() => setPage(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </nav>
          <div className="flex min-h-0 min-w-0 flex-1">
            <aside className="gallery-sidebar flex w-[var(--rui-sidebar-width-narrow)] shrink-0 flex-col border-r bg-card">
              <nav aria-label="示例页面" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1.5">
                {pageButtons}
              </nav>
              <p className="border-t px-2 py-1 text-2xs text-muted-foreground">本地示例数据</p>
            </aside>
            <main className="gallery-main-area min-h-0 min-w-0 flex-1 overflow-hidden">{renderPage(page)}</main>
          </div>
        </div>
      </TooltipProvider>
    </ReitoThemeProvider>
  );
}

/** Backward-compatible dense entry used by existing tests and deep links. */
export function DenseExamples() {
  return <Gallery lockedDensity="dense" />;
}
