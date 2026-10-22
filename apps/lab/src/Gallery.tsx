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
  List,
  Moon,
  Newspaper,
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
  { id: 'trace', label: '封面进程', group: '这一期' },
  { id: 'events', label: '审稿', group: '这一期' },
  { id: 'inspector', label: '作者', group: '这一期' },
  { id: 'dashboard', label: '本期', group: '这一期' },
  { id: 'commands', label: '编辑台', group: '编辑室' },
  { id: 'files', label: '稿件柜', group: '编辑室' },
  { id: 'settings', label: '室规', group: '编辑室' },
] as const;
type PageId = (typeof pages)[number]['id'];
const densities: DensityMode[] = ['dense', 'compact', 'comfortable'];
const densityLabel: Record<DensityMode, string> = { dense: '高密', compact: '紧凑', comfortable: '舒适' };

const issue = '第 42 期';
const cover = '《雨季的书店》';
const manuscriptLines = [
  '# 雨季的书店',
  '周四的雨从梧桐上落下来。',
  '周宁把伞搁在书店门口，台灯只亮着一盏。',
  '林夏在第三段旁边写：再短一句。',
  '店名原来叫「旧雨」，她改成了「南窗」。',
  '陈麦圈出重复的「梧桐」，问要不要换成雨声。',
  '阿禾把封面书名改成宋体，墨色浅了一度。',
  '江岸印务来电：周五前不定纸，赶不上周一上架。',
  '第二稿把雨夜的后半补上了。',
  '校对条停在「她没有打伞」。',
  '封面打样寄到编辑室时，边角还是潮的。',
  '林夏说：书名留下，雨点重画。',
];

function manuscript(lines: number, from = 0) {
  return Array.from({ length: Math.max(1, lines) }, (_, index) => manuscriptLines[(from + index) % manuscriptLines.length]).join('\n');
}

type TraceEntry = {
  id: string;
  time: string;
  kind: 'open' | 'eval';
  title: string;
  duration: string;
  tag: string;
  url?: string;
  inputLines?: number;
  from?: number;
  output?: string;
  outputLines?: number;
  error?: string;
  turn?: string;
};
const traceEntries: TraceEntry[] = [
  { id: 't1', time: '18:02:10', kind: 'open', title: '选题会开始', duration: '40分', tag: '进编辑室', url: `${issue}选题会 · 靠窗那张桌子` },
  { id: 't2', time: '18:10:04', kind: 'open', title: '定下封面', duration: '6分', tag: '封面选题', url: `封面定为${cover} · 作者周宁` },
  { id: 't3', time: '18:18:22', kind: 'eval', title: '读周宁的开头', duration: '12分', tag: '读稿', inputLines: 13, from: 2, output: '林夏：开头留下。店名改成「南窗」。', outputLines: 4, turn: '第一轮' },
  { id: 't4', time: '18:28:42', kind: 'eval', title: '核对书店段落', duration: '8分', tag: '读稿', inputLines: 10, from: 4, output: '陈麦：第三段的梧桐和后文重复了。', outputLines: 6 },
  { id: 't5', time: '18:36:18', kind: 'eval', title: '补雨夜的后半', duration: '20分', tag: '改稿', inputLines: 9, from: 6, output: '周宁补上了「她没有打伞」。', outputLines: 9 },
  { id: 't6', time: '18:58:05', kind: 'eval', title: '通读全文', duration: '15分', tag: '读稿', inputLines: 4, from: 3, output: '林夏：书名留下，雨点重画。', outputLines: 7 },
  { id: 't7', time: '19:12:40', kind: 'eval', title: '检查小标题', duration: '4分', tag: '结构', inputLines: 10, from: 8, output: '小标题停在「灯还亮着」。', outputLines: 5 },
  { id: 't8', time: '19:20:11', kind: 'eval', title: '看封面字体', duration: '6分', tag: '版式', inputLines: 11, from: 5, output: '阿禾：书名改宋体，墨色浅一度。', outputLines: 3 },
  { id: 't9', time: '19:31:02', kind: 'eval', title: '试改封面标题', duration: '2分', tag: '改点', inputLines: 5, from: 7, output: '这一改先压住。纸还没定。', outputLines: 2 },
  { id: 't10', time: '19:36:44', kind: 'eval', title: '问印刷厂档期', duration: '3分', tag: '付印', inputLines: 3, from: 9, output: '江岸印务：周五前不定纸，周一上不了架。', outputLines: 2 },
  { id: 't11', time: '19:44:09', kind: 'eval', title: '等校样回来', duration: '26分', tag: '等样', inputLines: 4, from: 10, output: '校样到了，边角还是潮的。', outputLines: 2 },
  { id: 't12', time: '19:52:18', kind: 'eval', title: '封面被退回', duration: '1分', tag: '退样', inputLines: 8, from: 11, error: '江岸印务退回封面：油墨未干，雨点把书名晕开了。' },
  { id: 't13', time: '20:06:33', kind: 'open', title: '重新送印', duration: '8分', tag: '再送', url: '校样退回后，阿禾重画雨点，再送江岸印务' },
];

const timelineLanes = [
  { id: 'pitch', label: '选题' },
  { id: 'draft', label: '改稿' },
  { id: 'press', label: '付印' },
];
const timelineEvents: MiniTimelineEvent[] = Array.from({ length: 49 }, (_, index) => {
  const lane = index < 2 || index % 13 === 0 || index === 48 ? 'pitch' : index % 6 === 4 ? 'press' : 'draft';
  return {
    id: `e${index + 1}`,
    lane,
    label: `第 ${index + 1} 步`,
    tone: lane === 'pitch' ? 'info' : index === 18 || index === 31 || index === 32 ? 'danger' : lane === 'press' ? 'info' : 'neutral',
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
    <div className="flex min-h-[calc(var(--rui-control-height)+var(--rui-space-2))] shrink-0 items-center gap-2 px-[var(--rui-content-padding)] py-1">
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
    <section aria-label="封面进程" className="flex h-full min-h-0 flex-col">
      <PaneHeader
        title={
          <>
            南窗<span className="text-xs font-normal text-muted-foreground">/ {cover}</span>
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            <span className="sr-only">本期还在改</span>
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
        label="封面进度"
        className="shrink-0 px-[var(--rui-content-padding)] py-1.5"
        lanes={timelineLanes}
        events={timelineEvents}
        markers={[{ index: 9, label: '选题' }, { index: 22, label: '一校' }, { index: 36, label: '付印' }]}
        value={selected}
        onValueChange={setSelected}
      />
      <div className="relative min-h-0 flex-1">
        <div
          ref={follow.ref}
          onScroll={follow.measure}
          role="region"
          aria-label="改稿记录"
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
                  kind={entry.kind === 'open' ? '送出' : '改稿'}
                  title={entry.title}
                  durationLabel={entry.duration}
                  tag={entry.tag}
                  inputLanguage="markdown"
                  input={entry.inputLines ? manuscript(entry.inputLines, entry.from ?? 0) : undefined}
                  output={entry.output}
                  outputLines={entry.outputLines}
                  error={entry.error}
                >
                  {entry.url && <p className="truncate" title={entry.url}>{entry.url}</p>}
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
const sources = ['林夏', '陈麦', '阿禾', '印刷厂'];
const messages = [
  '开头可以再短一句',
  '第三段的梧桐和后文重复了',
  '封面书名改用宋体',
  '周五前要定下纸张',
  '校样还潮着，先别签发',
  '印刷厂退回：油墨未干，书名晕开了',
  '校样送回编辑室',
  '末段加上：灯还亮着',
];
const levelLabel: Record<LogLevel, string> = { debug: '备忘', info: '通过', warn: '待改', error: '退回' };
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
    payload: JSON.stringify({ 期: issue, 稿: '雨季的书店', 人: sources[index % sources.length], 话: message, 序号: index + 1 }, null, 2),
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
      backLabel={current ? `${current.time} · ${levelLabel[current.level]}` : '这条批注'}
      main={
      <section aria-label="审稿" className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PaneHeader title="审稿">
          <span className="text-xs text-muted-foreground tabular-nums">
            {rows.length} / {eventRows.length}
          </span>
        </PaneHeader>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b px-[var(--rui-content-padding)] pb-1.5">
          <div className="gallery-filter-field relative w-[var(--rui-container-3xs)] min-w-0">
            <Search className="pointer-events-none absolute top-1/2 left-1.5 size-3 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input aria-label="筛选批注" placeholder="筛选批注或同事" value={query} onChange={(event) => setQuery(event.target.value)} className="h-[var(--rui-control-height-sm)] pl-6 text-xs" />
          </div>
          <ToggleGroup multiple size="xs" variant="outline" spacing={0} aria-label="批注类型" value={levels} onValueChange={setLevels}>
            {(['debug', 'info', 'warn', 'error'] as const).map((level) => (
              <ToggleGroupItem key={level} value={level}>
                {levelLabel[level]}
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
                  同事
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={wrap} onCheckedChange={setWrap}>
                  自动换行
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLevels(['debug', 'info', 'warn', 'error'])}>
                <Filter />
                显示全部批注
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <MiniTimeline
          label="批注分布"
          className="shrink-0 border-b px-[var(--rui-content-padding)] py-1.5"
          lanes={sources.map((id) => ({ id, label: id }))}
          events={eventRows.map((row) => ({ id: row.id, lane: row.source, label: `${row.time} ${row.message}`, tone: row.level === 'error' ? 'danger' : row.level === 'warn' ? 'warning' : row.level === 'debug' ? 'neutral' : 'info' }))}
          value={selected}
          onValueChange={setSelected}
        />
        <div className="relative min-h-0 flex-1">
          <div ref={follow.ref} onScroll={follow.measure} className="gallery-table-scroll h-full overflow-y-auto">
            <Table aria-label="审稿">
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-0">时间</TableHead>
                  <TableHead className="w-0">类型</TableHead>
                  {showSource && <TableHead className="w-0">同事</TableHead>}
                  <TableHead>批注</TableHead>
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
                        {levelLabel[row.level]}
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
      <aside aria-label="这条批注" className="flex min-h-0 flex-1 flex-col gap-1">
        <SectionLabel trailing={current?.id}>这条批注</SectionLabel>
        {current && (
          <>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-xs">
              <dt className="text-muted-foreground">时间</dt>
              <dd className="font-mono tabular-nums">{current.time}</dd>
              <dt className="text-muted-foreground">类型</dt>
              <dd>
                <Badge size="xs" variant={levelBadge[current.level]}>{levelLabel[current.level]}</Badge>
              </dd>
              <dt className="text-muted-foreground">同事</dt>
              <dd>{current.source}</dd>
              <dt className="text-muted-foreground">批注</dt>
              <dd className={current.level === 'error' ? 'text-destructive' : undefined}>{current.message}</dd>
            </dl>
            <SectionLabel divider>原文</SectionLabel>
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
  { id: 'm1', name: '林夏', provider: '编辑部', status: 'ready', context: '主编', latency: '已定封面', updated: '10-22 18:12', starred: true },
  { id: 'm2', name: '周宁', provider: '作者', status: 'syncing', context: '封面稿', latency: '还差一截', updated: '10-22 18:36' },
  { id: 'm3', name: '陈麦', provider: '编辑部', status: 'syncing', context: '校对', latency: '停在第三段', updated: '10-22 18:28' },
  { id: 'm4', name: '阿禾', provider: '外协', status: 'ready', context: '美编', latency: '重画雨点', updated: '10-22 19:20' },
  { id: 'm5', name: '江岸', provider: '外协', status: 'failed', context: '印刷', latency: '退回封面', updated: '10-22 19:52' },
  { id: 'm6', name: '苏晚', provider: '作者', status: 'ready', context: '城市', latency: '已交', updated: '10-21 16:40' },
  { id: 'm7', name: '老裴', provider: '作者', status: 'draft', context: '书评', latency: '还在读', updated: '10-21 11:05' },
  { id: 'm8', name: '小林', provider: '外协', status: 'ready', context: '图片', latency: '三张到了', updated: '10-20 15:18' },
  { id: 'm9', name: '顾南', provider: '作者', status: 'syncing', context: '专栏', latency: '在改结尾', updated: '10-20 09:44' },
  { id: 'm10', name: '阿芷', provider: '编辑部', status: 'draft', context: '发行', latency: '等封面', updated: '10-19 17:02' },
];
const statusBadge: Record<ModelRow['status'], { label: string; variant: 'secondary' | 'outline' | 'destructive' }> = {
  ready: { label: '在班', variant: 'secondary' },
  syncing: { label: '在改', variant: 'outline' },
  failed: { label: '退回', variant: 'destructive' },
  draft: { label: '等稿', variant: 'outline' },
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
          复制署名
          <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderOpen />
            转到栏目
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>封面</DropdownMenuItem>
            <DropdownMenuItem>城市</DropdownMenuItem>
            <DropdownMenuItem>书评</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 />
          移出本期
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
      <section aria-label="作者名册" className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PaneHeader title="本期作者">
          <SelectInput
            size="xs"
            aria-label="角色"
            value={provider}
            onValueChange={setProvider}
            options={[
              { value: 'all', label: '全部角色' },
              { value: '编辑部', label: '编辑部' },
              { value: '作者', label: '作者' },
              { value: '外协', label: '外协' },
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
                    {{ provider: '角色', context: '职责', latency: '交稿', updated: '最近' }[key]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="xs">
            <Plus />
            约稿
          </Button>
        </PaneHeader>
        <div className="gallery-table-scroll min-h-0 flex-1 overflow-y-auto border-t">
          <Table aria-label="本期作者">
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>姓名</TableHead>
                {visible.provider && <TableHead>角色</TableHead>}
                <TableHead>状态</TableHead>
                {visible.context && <TableHead className="text-right">职责</TableHead>}
                {visible.latency && <TableHead className="text-right">交稿</TableHead>}
                {visible.updated && <TableHead>最近</TableHead>}
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
                      看这一稿
                    </ContextMenuItem>
                    <ContextMenuItem>
                      <RefreshCw />
                      再约一次
                      <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem variant="destructive">
                      <Trash2 />
                      移出本期
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="shrink-0 border-t px-[var(--rui-content-padding)] py-0.5 text-2xs text-muted-foreground">
          右键一行，可以把人转到别的栏目。本地演示，不会真的改本期。
        </p>
      </section>
      }
      aside={
      <aside aria-label="作者" className="flex min-h-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <h2 className="min-w-0 flex-1 truncate font-mono text-sm font-medium">{current.name}</h2>
          <Badge size="xs" variant={statusBadge[current.status].variant}>{statusBadge[current.status].label}</Badge>
        </div>
        <SectionLabel divider>基本信息</SectionLabel>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-xs">
          <dt className="text-muted-foreground">角色</dt>
          <dd>{current.provider}</dd>
          <dt className="text-muted-foreground">职责</dt>
          <dd>{current.context}</dd>
          <dt className="text-muted-foreground">交稿</dt>
          <dd>{current.latency}</dd>
          <dt className="text-muted-foreground">最近</dt>
          <dd className="font-mono tabular-nums">{current.updated}</dd>
        </dl>
        <SectionLabel divider>参数</SectionLabel>
        <div className="grid gap-1 text-xs">
          <label className="flex items-center justify-between gap-2">
            本期署名
            <Switch size="sm" checked={streaming} onCheckedChange={setStreaming} />
          </label>
          <div className="flex items-center justify-between gap-2">
            <span id="inspector-route">栏目</span>
            <SelectInput size="xs" aria-labelledby="inspector-route" defaultValue="cover" options={[{ value: 'cover', label: '封面' }, { value: 'city', label: '城市' }, { value: 'review', label: '书评' }]} />
          </div>
        </div>
        <SectionLabel divider trailing="3">最近事件</SectionLabel>
        <ul className="grid gap-0.5 font-mono text-xs">
          <li className="flex gap-2"><span className="text-muted-foreground tabular-nums">18:12</span><span className="truncate">林夏定下封面</span></li>
          <li className="flex gap-2"><span className="text-muted-foreground tabular-nums">18:36</span><span className="truncate">周宁补上雨夜</span></li>
          <li className="flex gap-2 text-destructive"><span className="tabular-nums">19:52</span><span className="truncate">印刷厂说油墨未干</span></li>
        </ul>
        <Collapsible>
          <CollapsibleTrigger variant="row" className="bg-sunken">
            <ChevronRight data-slot="collapsible-chevron" className="size-3" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate font-mono text-foreground">名册摘记</span>
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
      <div className="flex min-h-[calc(var(--rui-control-height)+var(--rui-space-2))] shrink-0 items-center gap-2 overflow-x-auto border-b px-[var(--rui-content-padding)] py-1">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>稿件</MenubarTrigger>
            <MenubarContent>
              <MenubarItem><FileText />新建稿件<MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
              <MenubarItem><FolderOpen />打开稿件…<MenubarShortcut>⌘O</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled>导出校样</MenubarItem>
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
        <span className="ml-auto text-2xs text-muted-foreground">本地演示 · 命令不会送出编辑室</span>
      </div>
      <div className="gallery-commands-grid grid min-h-0 flex-1 grid-cols-[minmax(0,var(--rui-container-sm))_minmax(0,1fr)] gap-[var(--rui-content-gap)] overflow-y-auto p-[var(--rui-content-padding)]">
        <section aria-label="命令" className="min-w-0">
          <SectionLabel>编辑台</SectionLabel>
          <Command className="h-auto rounded-[var(--rui-component-menu-popup-radius)] border shadow-none">
            <CommandInput placeholder="找一篇稿，或找一个人…" />
            <CommandList>
              <CommandGroup heading="这一期">
                <CommandItem><FileText />打开{cover}<CommandShortcut>⌘P</CommandShortcut></CommandItem>
                <CommandItem><Search />在稿件里查找<CommandShortcut>⌘F</CommandShortcut></CommandItem>
                <CommandItem><RefreshCw />催一下印刷厂<CommandShortcut>⌘R</CommandShortcut></CommandItem>
              </CommandGroup>
              <CommandGroup heading="编辑室">
                <CommandItem><List />回到封面进程</CommandItem>
                <CommandItem><GitCommitHorizontal />打开审稿</CommandItem>
                <CommandItem><Settings2 />打开室规<CommandShortcut>⌘,</CommandShortcut></CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </section>
        <section aria-label="设置" className="min-w-0">
          <SectionLabel>这一期的约定</SectionLabel>
          <div className="rounded-[var(--rui-component-card-radius)] border bg-card px-[var(--rui-component-card-padding-x)]">
            <SettingRow label="停笔就存" description="周宁停笔一会儿，稿子就收进草稿箱。">
              <Switch size="sm" checked={autosave} onCheckedChange={setAutosave} aria-label="停笔就存" />
            </SettingRow>
            <SettingRow label="校样条" description="改稿时，校样贴在哪一边。">
              <SelectInput size="xs" aria-label="校样条" value={panel} onValueChange={setPanel} options={[{ value: 'bottom', label: '桌沿' }, { value: 'right', label: '右手边' }, { value: 'hidden', label: '先收起' }]} />
            </SettingRow>
            <SettingRow label="点开进程" description="点一条封面进程时，编辑室做什么。">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="xs" />}>
                  打开详情
                  <ChevronRight className="rotate-90" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-auto min-w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>点开一条进程时</DropdownMenuLabel>
                    <DropdownMenuRadioGroup defaultValue="detail">
                      <DropdownMenuRadioItem value="detail">打开详情</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="source">展开原稿</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="copy">抄下批注</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem inset>恢复默认</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SettingRow>
          </div>
          <SectionLabel className="mt-1">夜班</SectionLabel>
          <div className="rounded-[var(--rui-component-card-radius)] border bg-card px-[var(--rui-component-card-padding-x)]">
            <SettingRow label="夜校铃声" description="陈麦改完会响一声。演示开关，不会真的响。">
              <Switch size="sm" checked={telemetry} onCheckedChange={setTelemetry} aria-label="夜校铃声" />
            </SettingRow>
            <SettingRow label="自动换行" description="与视图菜单里的选项是同一个。">
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
    { id: 'task-1', title: '选题会定下封面', area: '林夏', done: true, note: '周四上午，靠窗的桌子上定了《雨季的书店》。' },
    { id: 'task-2', title: '周宁交第二稿', area: '周宁', done: false, note: '雨夜的后半还差一截，她说今晚写完。' },
    { id: 'task-3', title: '陈麦看完第三段', area: '陈麦', done: false, note: '「梧桐」出现了两次，她还没决定留哪一处。' },
    { id: 'task-4', title: '重画被雨打湿的封面', area: '阿禾', done: true, note: '宋体书名留下。晕开的雨点要重画，再送江岸印务。' },
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
      backLabel={current?.title ?? '这件事'}
      main={
      <section aria-label="本期" className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PaneHeader title="本期">
          <span className="text-xs text-muted-foreground tabular-nums">{done} / {tasks.length} 完成</span>
        </PaneHeader>
        <div className="gallery-table-scroll min-h-0 flex-1 overflow-y-auto px-[var(--rui-content-padding)] py-[var(--rui-content-gap)]">
          <div className="mb-3 grid gap-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{issue} · {cover}</span>
              <span className="tabular-nums">{Math.round((done / tasks.length) * 100)}%</span>
            </div>
            <Progress aria-label="本期进度" value={(done / tasks.length) * 100} />
          </div>
          <SectionLabel>截稿前</SectionLabel>
          <Table aria-label="截稿前">
            <TableHeader>
              <TableRow>
                <TableHead>还要做的</TableHead>
                <TableHead>谁</TableHead>
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
      <aside aria-label="这件事" className="flex min-h-0 flex-1 flex-col gap-1">
        <h2 className="text-sm font-medium">{current?.title}</h2>
        <p className="text-xs text-muted-foreground">{current?.note}</p>
        <SectionLabel divider>编辑室里</SectionLabel>
        <ul className="grid gap-1 text-xs">
          <li className="flex gap-2"><Activity className="mt-0.5 size-3 text-muted-foreground" /><span>林夏把封面留在桌上</span></li>
          <li className="flex gap-2"><FileText className="mt-0.5 size-3 text-muted-foreground" /><span>周宁的第二稿收进草稿箱</span></li>
          <li className="flex gap-2"><RefreshCw className="mt-0.5 size-3 text-muted-foreground" /><span>阿禾还在重画雨点</span></li>
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
    { id: 'f1', name: '雨季的书店.md', kind: '封面稿', description: '周宁的第二稿，灯还亮着', updatedAt: '2026-10-22T18:36:00Z', icon: <FileText className="size-3.5" /> },
    { id: 'f2', name: '封面', kind: '文件夹', description: '阿禾的三张草图', updatedAt: '2026-10-22T19:20:00Z', icon: <Folder className="size-3.5" /> },
    { id: 'f3', name: '选题会.md', kind: '会议', description: '林夏记的靠窗那张桌子', updatedAt: '2026-10-22T18:10:00Z', icon: <File className="size-3.5" /> },
    { id: 'f4', name: '校样', kind: '文件夹', description: '边角还潮着的那一份', updatedAt: '2026-10-22T19:44:00Z', icon: <FolderOpen className="size-3.5" /> },
    { id: 'f5', name: '陈麦的批注.txt', kind: '校对', description: '梧桐出现了两次', updatedAt: '2026-10-22T18:28:00Z', icon: <FileText className="size-3.5" /> },
    { id: 'f6', name: '上一期', kind: '文件夹', description: '已经上架', updatedAt: '2026-10-15T08:00:00Z', icon: <Folder className="size-3.5" /> },
  ];
  return (
    <section aria-label="稿件柜" className="flex h-full min-h-0 flex-col">
      <PaneHeader title="稿件柜">
        <span className="text-xs text-muted-foreground tabular-nums">{items.length} 项</span>
      </PaneHeader>
      <div className="min-h-0 flex-1 overflow-hidden px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)]">
        <ResourceList
          label="本期稿件"
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
          emptyMessage="柜子里没有这篇"
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
    <section aria-label="室规" className="flex h-full min-h-0 flex-col">
      <PaneHeader title="室规">
        <span className="text-2xs text-muted-foreground">本地演示 · 不会送出编辑室</span>
      </PaneHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-[var(--rui-content-padding)]">
        <div className="mx-auto grid max-w-[var(--rui-container-md)] gap-[var(--rui-content-gap)]">
          <SettingsSection title="截稿" description="南窗每周五傍晚截稿。这些开关只留在这台机器上。">
            <SettingsRow label="截稿提醒" description="周五傍晚在编辑室响一声。" htmlFor="gallery-deadline">
              <Switch id="gallery-deadline" size="sm" checked={telemetry} onCheckedChange={setTelemetry} />
            </SettingsRow>
            <SettingsRow label="校样放哪" description="改稿时校样条的默认位置。">
              <SelectInput size="xs" aria-label="校样放哪" value={panel} onValueChange={setPanel} options={[{ value: 'bottom', label: '桌沿' }, { value: 'right', label: '右手边' }, { value: 'hidden', label: '先收起' }]} />
            </SettingsRow>
            <SettingsRow label="长行折行" description="稿纸上的长句折到下一行。" htmlFor="gallery-wrap">
              <Switch id="gallery-wrap" size="sm" checked={wrap} onCheckedChange={setWrap} />
            </SettingsRow>
          </SettingsSection>
          <SettingsSection title="夜班" description="演示开关，不会真的通知任何人。" variant="plain">
            <SettingsRow label="留一盏灯" description="陈麦夜校时，编辑室的灯别灭。" htmlFor="gallery-lamp">
              <Switch id="gallery-lamp" size="sm" checked={autosave} onCheckedChange={setAutosave} />
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
    document.title = `${pages.find((item) => item.id === page)!.label} · 南窗 · Reito UI`;
  }, [page, theme, density, lockedDensity]);
  const groups = ['这一期', '编辑室'] as const;
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
              className="h-[var(--rui-control-height-sm)] justify-start px-1.5 text-xs text-muted-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
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
          <header className="gallery-header flex shrink-0 items-center gap-2 border-b bg-card px-[var(--rui-content-padding)]">
            <a href={import.meta.env.BASE_URL} className="text-xs font-semibold">Reito UI</a>
            <Newspaper className="size-[var(--rui-icon-size)] shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="text-xs font-medium">南窗</span>
            <span className="gallery-header-title text-2xs text-muted-foreground">{issue} · {cover}</span>
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
          <nav aria-label="南窗" className="gallery-page-tabs">
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
              <nav aria-label="南窗" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1.5">
                {pageButtons}
              </nav>
              <p className="border-t px-2 py-1 text-2xs text-muted-foreground">本地演示 · 周五截稿</p>
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
