import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Copy,
  Ellipsis,
  FolderOpen,
  Moon,
  Newspaper,
  Pencil,
  RefreshCw,
  Sun,
  Trash2,
} from 'lucide-react';
import './nanchuang.css';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Checkbox,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  Progress,
  ReitoThemeProvider,
  SelectInput,
  SettingsRow,
  SettingsSection,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  TooltipProvider,
  type DensityMode,
} from '@reito/ui';

const pages = [
  { id: 'dashboard', label: '本期', group: '这一期' },
  { id: 'files', label: '稿件', group: '这一期' },
  { id: 'events', label: '审稿', group: '这一期' },
  { id: 'inspector', label: '作者', group: '这一期' },
  { id: 'trace', label: '校样', group: '这一期' },
  { id: 'commands', label: '发稿', group: '编辑室' },
  { id: 'settings', label: '室规', group: '编辑室' },
] as const;
type PageId = (typeof pages)[number]['id'];
const densities: DensityMode[] = ['dense', 'compact', 'comfortable'];
const densityLabel: Record<DensityMode, string> = { dense: '高密', compact: '紧凑', comfortable: '舒适' };
const issue = '第 42 期';
const sections = ['封面', '城市', '书评'] as const;
type ColumnId = 'pitch' | 'draft' | 'proof' | 'press';
const columns: { id: ColumnId; title: string }[] = [
  { id: 'pitch', title: '选题' },
  { id: 'draft', title: '改稿' },
  { id: 'proof', title: '校对' },
  { id: 'press', title: '付印' },
];
const placeLabel: Record<string, string> = { bottom: '桌沿', right: '右手边', hidden: '先收起' };

const earlierDraft = ['雨季的书店', '', '周四的雨从梧桐上落下来。', '周宁把伞搁在书店门口，台灯只亮着一盏。', '店名还叫「旧雨」。'].join('\n');
const openingDraft = [
  '雨季的书店',
  '',
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
].join('\n');

type Piece = { id: string; title: string; owner: string; column: ColumnId; summary: string };
type Note = { id: string; author: string; body: string; piece: string; resolved: boolean };
type Person = { id: string; name: string; role: string; group: string; section: string; note: string; out: boolean };
type Milestone = { id: string; time: string; title: string; detail: string };
type Revision = { id: string; label: string; body: string };
type CheckItem = { id: string; label: string; done: boolean };

const initialPieces: Piece[] = [
  { id: 'meet', title: '选题会记录', owner: '林夏', column: 'pitch', summary: '靠窗那张桌子定了封面。' },
  { id: 'city', title: '城南短讯', owner: '苏晚', column: 'pitch', summary: '雨停之前先压着。' },
  { id: 'book', title: '雨季的书店', owner: '周宁', column: 'draft', summary: '雨夜的后半还差一截。' },
  { id: 'tree', title: '梧桐那一段', owner: '陈麦', column: 'draft', summary: '「梧桐」出现了两次。' },
  { id: 'cover', title: '封面字体', owner: '阿禾', column: 'proof', summary: '宋体书名留下，雨点要重画。' },
  { id: 'review', title: '书评：旧雨', owner: '老裴', column: 'proof', summary: '店名改成南窗之后，导语要重写。' },
  { id: 'paper', title: '纸张档期', owner: '江岸', column: 'press', summary: '周五前不定纸，周一上不了架。' },
];
const initialNotes: Note[] = [
  { id: 'n1', author: '林夏', body: '开头留下。店名改成「南窗」。', piece: '雨季的书店', resolved: false },
  { id: 'n2', author: '陈麦', body: '第三段的梧桐和后文重复了。', piece: '雨季的书店', resolved: false },
  { id: 'n3', author: '周宁', body: '补上了「她没有打伞」。', piece: '雨季的书店', resolved: true },
  { id: 'n4', author: '阿禾', body: '书名改宋体，墨色浅一度。', piece: '封面字体', resolved: true },
  { id: 'n5', author: '江岸', body: '印刷厂退回：油墨未干，书名晕开了。', piece: '封面字体', resolved: false },
  { id: 'n6', author: '林夏', body: '书名留下，雨点重画。', piece: '封面字体', resolved: false },
];
const initialPeople: Person[] = [
  { id: 'lin', name: '林夏', role: '主编', group: '编辑部', section: '封面', note: '这一期她坐靠窗。', out: false },
  { id: 'zhou', name: '周宁', role: '作者', group: '作者', section: '封面', note: '第二稿今晚交。', out: false },
  { id: 'chen', name: '陈麦', role: '校对', group: '编辑部', section: '城市', note: '夜校之后还在看第三段。', out: false },
  { id: 'he', name: '阿禾', role: '美编', group: '编辑部', section: '封面', note: '雨点还要重画。', out: false },
  { id: 'jiang', name: '江岸', role: '印务', group: '外协', section: '封面', note: '周五前要定纸。', out: false },
  { id: 'su', name: '苏晚', role: '作者', group: '作者', section: '城市', note: '短讯还压在选题栏。', out: false },
  { id: 'pei', name: '老裴', role: '作者', group: '作者', section: '书评', note: '导语等店名定下来。', out: false },
];
const initialMilestones: Milestone[] = [
  { id: 'm1', time: '18:02', title: '选题会', detail: '林夏在靠窗的桌子上定了封面。' },
  { id: 'm2', time: '18:10', title: '定下封面', detail: '封面定为《雨季的书店》，作者周宁。' },
  { id: 'm3', time: '18:36', title: '二稿', detail: '周宁补上雨夜的后半。' },
  { id: 'm4', time: '19:20', title: '一校', detail: '陈麦圈出重复的「梧桐」。' },
  { id: 'm5', time: '19:36', title: '送印', detail: '问江岸印务档期。周五前不定纸，周一上不了架。' },
  { id: 'm6', time: '19:52', title: '校样被退回', detail: '油墨未干，雨点把书名晕开了。' },
  { id: 'm7', time: '20:06', title: '重画雨点', detail: '阿禾留下宋体书名，雨点重画。' },
];
const initialChecks: CheckItem[] = [
  { id: 'k1', label: '书名定稿', done: true },
  { id: 'k2', label: '封面重画', done: false },
  { id: 'k3', label: '校对条清完', done: false },
  { id: 'k4', label: '纸张确认', done: false },
  { id: 'k5', label: '送江岸印务', done: false },
];

function hit(query: string, ...parts: string[]) {
  const needle = query.trim();
  return !needle || parts.join('\n').includes(needle);
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

function EmptyCopy({ children }: { children: string }) {
  return <p className="px-[var(--rui-content-padding)] py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

type Desk = {
  query: string;
  issueTitle: string;
  setIssueTitle: (value: string) => void;
  pieces: Piece[];
  movePiece: (id: string, column: ColumnId) => void;
  notes: Note[];
  setNoteResolved: (id: string, resolved: boolean) => void;
  addNote: (note: Omit<Note, 'id'>) => void;
  people: Person[];
  setPersonSection: (id: string, section: string) => void;
  setPersonNote: (id: string, note: string) => void;
  removePerson: (id: string) => void;
  draft: string;
  setDraft: (value: string) => void;
  saved: boolean;
  saveDraft: () => void;
  revisions: Revision[];
  activeRevision: string;
  loadRevision: (id: string) => void;
  milestones: Milestone[];
  proofStatus: string;
  resend: () => void;
  asking: boolean;
  printerNote: string;
  askPrinter: () => void;
  checks: CheckItem[];
  toggleCheck: (id: string, done: boolean) => void;
  wrap: boolean;
  setWrap: (value: boolean) => void;
  deadline: boolean;
  setDeadline: (value: boolean) => void;
  proofPlace: string;
  setProofPlace: (value: string) => void;
  lamp: boolean;
  setLamp: (value: boolean) => void;
  setPage: (page: PageId) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  density: DensityMode;
  setDensity: (density: DensityMode) => void;
  lockedDensity: boolean;
};

const DeskContext = createContext<Desk | null>(null);
function useDesk() {
  const desk = useContext(DeskContext);
  if (!desk) throw new Error('南窗编辑室尚未就绪');
  return desk;
}

function BoardPage() {
  const { query, pieces, movePiece } = useDesk();
  const [selected, setSelected] = useState('book');
  const [pane, setPane] = useState<'main' | 'detail'>('main');
  const visible = pieces.filter((piece) => hit(query, piece.title, piece.owner, piece.summary));
  const current = visible.find((piece) => piece.id === selected) ?? null;
  const ready = pieces.filter((piece) => piece.column === 'press').length;
  const open = (id: string) => {
    setSelected(id);
    setPane('detail');
  };
  return (
    <SplitPane
      pane={pane}
      onBack={() => setPane('main')}
      backLabel={current?.title ?? '稿件'}
      main={
        <section aria-label="本期" className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PaneHeader title="本期">
            <span className="text-xs text-muted-foreground tabular-nums">{ready} / {pieces.length} 已付印</span>
          </PaneHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-[var(--rui-content-padding)] py-[var(--rui-content-gap)]">
            <div className="mb-[var(--rui-content-gap)] grid gap-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>付印进度</span>
                <span className="tabular-nums">{Math.round((ready / pieces.length) * 100)}%</span>
              </div>
              <Progress aria-label="本期进度" value={(ready / pieces.length) * 100} className="gap-0" />
            </div>
            {visible.length === 0 ? <EmptyCopy>没有对上的稿件</EmptyCopy> : (
              <div className="gallery-board">
                {columns.map((column) => {
                  const cards = visible.filter((piece) => piece.column === column.id);
                  return (
                    <section key={column.id} aria-label={column.title} className="gallery-column">
                      <h2 className="flex items-center justify-between text-xs font-medium">
                        {column.title}
                        <span className="tabular-nums text-muted-foreground">{cards.length}</span>
                      </h2>
                      {cards.length === 0 ? <p className="text-xs text-muted-foreground">这一栏空着</p> : cards.map((piece) => (
                        <button
                          key={piece.id}
                          type="button"
                          aria-pressed={piece.id === current?.id}
                          className="w-full rounded-[var(--rui-component-card-radius)] border bg-card px-2 py-1.5 text-left hover:bg-muted aria-pressed:bg-muted"
                          onClick={() => open(piece.id)}
                        >
                          <span className="block text-sm font-medium">{piece.title}</span>
                          <span className="block text-xs text-muted-foreground">{piece.owner}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">{piece.summary}</span>
                        </button>
                      ))}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      }
      aside={
        <aside aria-label="这篇稿件" className="flex min-h-0 flex-1 flex-col gap-2">
          {current ? (
            <>
              <h2 className="text-sm font-medium">{current.title}</h2>
              <p className="text-xs text-muted-foreground">{current.owner} · {current.summary}</p>
              <label className="grid gap-1 text-xs text-muted-foreground">
                移到
                <SelectInput
                  size="xs"
                  aria-label="移到"
                  value={current.column}
                  onValueChange={(value) => movePiece(current.id, value as ColumnId)}
                  options={columns.map((column) => ({ value: column.id, label: column.title }))}
                />
              </label>
            </>
          ) : <p className="text-sm text-muted-foreground">选一篇稿件，把它移到下一栏。</p>}
        </aside>
      }
    />
  );
}

const staticDocs = [
  { id: 'meet', name: '选题会.md', body: '靠窗那张桌子。封面定为《雨季的书店》，作者周宁。' },
  { id: 'note', name: '陈麦的批注.txt', body: '第三段的梧桐和后文重复了。先留着，等周宁改。' },
];

function ManuscriptPage() {
  const { query, draft, setDraft, saved, saveDraft, revisions, activeRevision, loadRevision, notes, wrap } = useDesk();
  const [docId, setDocId] = useState('book');
  const [pane, setPane] = useState<'main' | 'detail'>('main');
  const book = { id: 'book', name: '雨季的书店.md', body: draft };
  const docs = [book, ...staticDocs].filter((doc) => hit(query, doc.name, doc.body));
  const current = docs.find((doc) => doc.id === docId) ?? docs[0];
  const related = notes.filter((note) => note.piece === '雨季的书店' || note.piece === '封面字体');
  return (
    <SplitPane
      pane={pane}
      onBack={() => setPane('main')}
      backLabel="修订和批注"
      main={
        <section aria-label="稿件" className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PaneHeader title="稿件">
            {current?.id === 'book' && (
              <Button size="xs" variant="outline" disabled={saved} onClick={saveDraft}>收进草稿箱</Button>
            )}
          </PaneHeader>
          {docs.length === 0 ? <EmptyCopy>柜子里没有这篇</EmptyCopy> : (
            <div className="gallery-docs flex min-h-0 flex-1">
              <ul className="gallery-doc-list" aria-label="稿件列表">
                {docs.map((doc) => (
                  <li key={doc.id}>
                    <Button
                      variant="ghost"
                      size="xs"
                      aria-current={doc.id === current?.id ? 'true' : undefined}
                      className="h-auto w-full justify-start px-2 py-1 text-left text-xs aria-[current=true]:bg-muted"
                      onClick={() => { setDocId(doc.id); setPane('detail'); }}
                    >
                      {doc.name}
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1 p-[var(--rui-content-padding)]">
                <Textarea
                  aria-label="稿纸"
                  value={current?.id === 'book' ? draft : current?.body ?? ''}
                  readOnly={current?.id !== 'book'}
                  onChange={(event) => setDraft(event.target.value)}
                  className={`min-h-[var(--rui-textarea-min-height)] flex-1 resize-none !text-sm ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
                />
                {current?.id === 'book' && <p className="text-xs text-muted-foreground">{saved ? '已收进草稿箱。' : '改过，还没收进草稿箱。'}</p>}
              </div>
            </div>
          )}
        </section>
      }
      aside={
        <aside aria-label="修订和批注" className="flex min-h-0 flex-1 flex-col gap-2">
          <h2 className="text-sm font-medium">修订</h2>
          <div className="flex flex-wrap gap-1">
            {revisions.map((revision) => (
              <Button key={revision.id} size="xs" variant={revision.id === activeRevision ? 'secondary' : 'outline'} onClick={() => loadRevision(revision.id)}>
                {revision.label}
              </Button>
            ))}
          </div>
          <h2 className="text-sm font-medium">本期批注</h2>
          <ul className="grid gap-2">
            {related.map((note) => (
              <li key={note.id} className="text-xs">
                <span className="font-medium">{note.author}</span>
                <span className="text-muted-foreground"> · {note.resolved ? '已处理' : '待处理'}</span>
                <p className={wrap ? 'whitespace-normal' : 'truncate'}>{note.body}</p>
              </li>
            ))}
          </ul>
        </aside>
      }
    />
  );
}

function ReviewPage() {
  const { query, notes, setNoteResolved, addNote, wrap, setWrap } = useDesk();
  const [status, setStatus] = useState('all');
  const [author, setAuthor] = useState('all');
  const [selected, setSelected] = useState('n5');
  const [pane, setPane] = useState<'main' | 'detail'>('main');
  const [reply, setReply] = useState('');
  const authors = ['all', ...new Set(notes.map((note) => note.author))];
  const visible = notes.filter((note) => {
    const statusOk = status === 'all' || (status === 'open' ? !note.resolved : note.resolved);
    const authorOk = author === 'all' || note.author === author;
    return statusOk && authorOk && hit(query, note.author, note.body, note.piece);
  });
  const current = visible.find((note) => note.id === selected) ?? null;
  const open = (id: string) => {
    setSelected(id);
    setPane('detail');
    setReply('');
  };
  return (
    <SplitPane
      pane={pane}
      onBack={() => setPane('main')}
      backLabel={current ? `${current.author}的批注` : '批注'}
      main={
        <section aria-label="审稿" className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PaneHeader title="审稿">
            <span className="text-xs text-muted-foreground tabular-nums">{visible.length} 条</span>
          </PaneHeader>
          <div className="flex flex-wrap items-center gap-1 px-[var(--rui-content-padding)] py-1">
            <SelectInput
              size="xs"
              aria-label="处理状态"
              value={status}
              onValueChange={setStatus}
              options={[{ value: 'all', label: '全部' }, { value: 'open', label: '待处理' }, { value: 'done', label: '已处理' }]}
            />
            <SelectInput
              size="xs"
              aria-label="批注人"
              value={author}
              onValueChange={setAuthor}
              options={authors.map((name) => ({ value: name, label: name === 'all' ? '所有人' : name }))}
            />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="xs" />}>显示</DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem checked={wrap} onCheckedChange={(checked) => setWrap(checked)}>自动换行</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="gallery-table-scroll min-h-0 flex-1 overflow-y-auto px-[var(--rui-content-padding)] pb-[var(--rui-content-padding)]">
            {visible.length === 0 ? <EmptyCopy>没有待看的批注</EmptyCopy> : (
              <Table aria-label="审稿">
                <TableHeader>
                  <TableRow>
                    <TableHead>谁</TableHead>
                    <TableHead>批注</TableHead>
                    <TableHead>稿件</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((note) => (
                    <TableRow key={note.id} data-state={note.id === current?.id ? 'selected' : undefined} className="cursor-default" onClick={() => open(note.id)}>
                      <TableCell className="font-medium">{note.author}</TableCell>
                      <TableCell className={wrap ? 'whitespace-normal' : undefined}>{note.body}</TableCell>
                      <TableCell className="text-muted-foreground">{note.piece}</TableCell>
                      <TableCell>{note.resolved ? '已处理' : '待处理'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      }
      aside={
        <aside aria-label="这条批注" className="flex min-h-0 flex-1 flex-col gap-2">
          {current ? (
            <>
              <h2 className="text-sm font-medium">{current.author}</h2>
              <p className="text-xs text-muted-foreground">{current.piece}</p>
              <p className={`text-sm ${wrap ? 'whitespace-normal' : ''}`}>{current.body}</p>
              <Button size="xs" variant="outline" onClick={() => setNoteResolved(current.id, !current.resolved)}>
                {current.resolved ? '重新打开' : '处理完'}
              </Button>
              <Textarea aria-label="回复" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="写一句回复" className="!text-sm" />
              <Button
                size="xs"
                disabled={!reply.trim()}
                onClick={() => {
                  addNote({ author: '林夏', body: reply.trim(), piece: current.piece, resolved: false });
                  setReply('');
                }}
              >
                写上批注
              </Button>
            </>
          ) : <p className="text-sm text-muted-foreground">选一条批注。</p>}
        </aside>
      }
    />
  );
}

function PersonMenu({ person, onEdit }: { person: Person; onEdit: () => void }) {
  const { setPersonSection, removePerson } = useDesk();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="xs" aria-label={`${person.name} 操作`} />}>
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-40">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil />
          编辑
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { void navigator.clipboard?.writeText(`${person.name} · ${person.role}`).catch(() => undefined); }}>
          <Copy />
          复制署名
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderOpen />
            转到栏目
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {sections.map((section) => (
              <DropdownMenuItem key={section} onClick={() => setPersonSection(person.id, section)}>{section}</DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => removePerson(person.id)}>
          <Trash2 />
          移出本期
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AuthorsPage() {
  const { query, people, setPersonNote, removePerson, setPage } = useDesk();
  const [group, setGroup] = useState('all');
  const [selected, setSelected] = useState('lin');
  const [pane, setPane] = useState<'main' | 'detail'>('main');
  const [editing, setEditing] = useState(false);
  const [draftNote, setDraftNote] = useState('');
  const visible = people.filter((person) => !person.out && (group === 'all' || person.group === group) && hit(query, person.name, person.role, person.section, person.note));
  const current = visible.find((person) => person.id === selected) ?? visible[0] ?? null;
  const open = (id: string) => {
    setSelected(id);
    setPane('detail');
    setEditing(false);
  };
  return (
    <SplitPane
      pane={pane}
      onBack={() => setPane('main')}
      backLabel={current?.name ?? '作者'}
      main={
        <section aria-label="作者名册" className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PaneHeader title="作者">
            <SelectInput
              size="xs"
              aria-label="分工"
              value={group}
              onValueChange={setGroup}
              options={[
                { value: 'all', label: '全部分工' },
                { value: '编辑部', label: '编辑部' },
                { value: '作者', label: '作者' },
                { value: '外协', label: '外协' },
              ]}
            />
          </PaneHeader>
          <div className="gallery-table-scroll min-h-0 flex-1 overflow-y-auto px-[var(--rui-content-padding)] pb-[var(--rui-content-padding)]">
            {visible.length === 0 ? <EmptyCopy>名册里没有这个人</EmptyCopy> : (
              <Table aria-label="本期作者">
                <TableHeader>
                  <TableRow>
                    <TableHead>姓名</TableHead>
                    <TableHead>分工</TableHead>
                    <TableHead>栏目</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((person) => (
                    <ContextMenu key={person.id}>
                      <ContextMenuTrigger
                        render={<TableRow data-state={person.id === current?.id ? 'selected' : undefined} className="cursor-default" onClick={() => open(person.id)} />}
                      >
                        <TableCell className="font-medium">{person.name}</TableCell>
                        <TableCell className="text-muted-foreground">{person.role}</TableCell>
                        <TableCell>{person.section}</TableCell>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-auto min-w-40">
                        <ContextMenuItem onClick={() => { open(person.id); setPage('files'); }}>看这一稿</ContextMenuItem>
                        <ContextMenuItem onClick={() => { setPersonNote(person.id, `已约${person.name}再交一稿。`); open(person.id); }}>
                          <RefreshCw />
                          再约一次
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => removePerson(person.id)}>移出本期</ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      }
      aside={
        <aside aria-label="作者详情" className="flex min-h-0 flex-1 flex-col gap-2">
          {current ? (
            <>
              <div className="flex items-center gap-1">
                <h2 className="min-w-0 flex-1 truncate text-sm font-medium">{current.name}</h2>
                <PersonMenu person={current} onEdit={() => { setDraftNote(current.note); setEditing(true); }} />
              </div>
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
                <dt className="text-muted-foreground">分工</dt>
                <dd>{current.role}</dd>
                <dt className="text-muted-foreground">栏目</dt>
                <dd>{current.section}</dd>
                <dt className="text-muted-foreground">备注</dt>
                <dd>{current.note}</dd>
              </dl>
              {editing ? (
                <form
                  className="grid gap-1"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setPersonNote(current.id, draftNote.trim() || current.note);
                    setEditing(false);
                  }}
                >
                  <Input aria-label="备注" value={draftNote} onChange={(event) => setDraftNote(event.target.value)} className="!h-[var(--rui-control-height-sm)] !text-sm" />
                  <Button type="submit" size="xs">记下</Button>
                </form>
              ) : (
                <Button size="xs" variant="outline" onClick={() => { setDraftNote(current.note); setEditing(true); }}>改备注</Button>
              )}
            </>
          ) : <p className="text-sm text-muted-foreground">名册是空的。</p>}
        </aside>
      }
    />
  );
}

function ProofPage() {
  const { query, milestones, proofStatus, resend, asking, printerNote, askPrinter, proofPlace } = useDesk();
  const [selected, setSelected] = useState('m6');
  const [pane, setPane] = useState<'main' | 'detail'>('main');
  const visible = milestones.filter((item) => hit(query, item.title, item.detail, item.time));
  const current = visible.find((item) => item.id === selected) ?? visible[0] ?? null;
  return (
    <SplitPane
      pane={pane}
      onBack={() => setPane('main')}
      backLabel={current?.title ?? '校样'}
      main={
        <section aria-label="校样" className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PaneHeader title="校样">
            <Badge size="xs" variant={proofStatus === '已重新送印' ? 'secondary' : 'outline'}>{proofStatus}</Badge>
          </PaneHeader>
          <div className="flex flex-wrap items-center gap-1 px-[var(--rui-content-padding)] py-1">
            <Button size="xs" onClick={resend}>重新送印</Button>
            <Button size="xs" variant="outline" disabled={asking} onClick={askPrinter}>问印刷厂</Button>
            <span className="text-xs text-muted-foreground">校样条在{placeLabel[proofPlace] ?? '桌沿'}</span>
          </div>
          {asking && (
            <p className="flex items-center gap-1 px-[var(--rui-content-padding)] text-xs text-muted-foreground">
              <Spinner className="size-3" aria-label="正在问江岸印务" />
              正在问江岸印务
            </p>
          )}
          {!asking && printerNote && <p className="px-[var(--rui-content-padding)] text-xs">{printerNote}</p>}
          <div className="min-h-0 flex-1 overflow-y-auto px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)]">
            {visible.length === 0 ? <EmptyCopy>没有这一步</EmptyCopy> : (
              <ol className="grid gap-1">
                {visible.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-pressed={item.id === current?.id}
                      className="flex w-full items-baseline gap-2 rounded-[var(--rui-component-card-radius)] px-2 py-1 text-left hover:bg-muted aria-pressed:bg-muted"
                      onClick={() => { setSelected(item.id); setPane('detail'); }}
                    >
                      <time className="text-xs text-muted-foreground tabular-nums" dateTime={item.time}>{item.time}</time>
                      <span className="text-sm">{item.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      }
      aside={
        <aside aria-label="这一步" className="flex min-h-0 flex-1 flex-col gap-2">
          {current ? (
            <>
              <h2 className="text-sm font-medium">{current.title}</h2>
              <p className="text-xs text-muted-foreground tabular-nums">{current.time}</p>
              <p className="text-sm">{current.detail}</p>
            </>
          ) : <p className="text-sm text-muted-foreground">还没有校样记录。</p>}
        </aside>
      }
    />
  );
}

function ShipPage() {
  const { query, issueTitle, setIssueTitle, checks, toggleCheck, wrap, setWrap } = useDesk();
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(issueTitle);
  const visible = checks.filter((item) => hit(query, item.label));
  const done = checks.filter((item) => item.done).length;
  return (
    <section aria-label="发稿" className="flex h-full min-h-0 flex-col">
      <PaneHeader title="发稿">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="xs" />}>本期操作</DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto min-w-40">
            <DropdownMenuItem onClick={() => { setDraftTitle(issueTitle); setRenaming(true); }}>
              <Pencil />
              重命名
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem checked={wrap} onCheckedChange={(checked) => setWrap(checked)}>自动换行</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PaneHeader>
      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--rui-content-padding)] py-[var(--rui-content-gap)]">
        <p className="mb-2 text-sm">《{issueTitle}》 · {done} / {checks.length} 已核对</p>
        {renaming && (
          <form
            className="mb-3 flex flex-wrap items-center gap-1"
            onSubmit={(event) => {
              event.preventDefault();
              const next = draftTitle.trim();
              if (next) setIssueTitle(next);
              setRenaming(false);
            }}
          >
            <Input aria-label="本期标题" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} className="gallery-search !h-[var(--rui-control-height-sm)] !text-sm" />
            <Button type="submit" size="xs">保存标题</Button>
          </form>
        )}
        {visible.length === 0 ? <EmptyCopy>清单里没有这项</EmptyCopy> : (
          <ul className="grid max-w-[var(--rui-container-md)] gap-1">
            {visible.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 border-b py-1">
                <label htmlFor={item.id} className="text-sm">{item.label}</label>
                <Checkbox id={item.id} checked={item.done} onCheckedChange={(checked) => toggleCheck(item.id, checked === true)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function SettingsPage() {
  const desk = useDesk();
  const { query } = desk;
  const show = (label: string) => hit(query, label);
  const any = ['截稿提醒', '校样放哪', '长行折行', '留一盏灯', '密度', '深色'].some((label) => show(label) && (label !== '密度' || !desk.lockedDensity));
  return (
    <section aria-label="室规" className="flex h-full min-h-0 flex-col">
      <PaneHeader title="室规">
        <span className="text-xs text-muted-foreground">只留在这台编辑室</span>
      </PaneHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-[var(--rui-content-padding)]">
        {!any ? <EmptyCopy>室规里没有这项</EmptyCopy> : (
          <div className="mx-auto grid max-w-[var(--rui-container-md)] gap-[var(--rui-content-gap)]">
            {(show('截稿提醒') || show('校样放哪') || show('长行折行')) && (
              <SettingsSection title="截稿" description="南窗每周五傍晚截稿。这些选择留在这台机器上。">
                {show('截稿提醒') && (
                  <SettingsRow label="截稿提醒" description="周五傍晚在编辑室响一声。" htmlFor="gallery-deadline">
                    <Switch id="gallery-deadline" size="sm" checked={desk.deadline} onCheckedChange={desk.setDeadline} />
                  </SettingsRow>
                )}
                {show('校样放哪') && (
                  <SettingsRow label="校样放哪" description="改稿时校样条的默认位置。">
                    <SelectInput size="xs" aria-label="校样放哪" value={desk.proofPlace} onValueChange={desk.setProofPlace} options={[{ value: 'bottom', label: '桌沿' }, { value: 'right', label: '右手边' }, { value: 'hidden', label: '先收起' }]} />
                  </SettingsRow>
                )}
                {show('长行折行') && (
                  <SettingsRow label="长行折行" description="稿纸和批注上的长句折到下一行。" htmlFor="gallery-wrap">
                    <Switch id="gallery-wrap" size="sm" checked={desk.wrap} onCheckedChange={desk.setWrap} />
                  </SettingsRow>
                )}
              </SettingsSection>
            )}
            {show('留一盏灯') && (
              <SettingsSection title="夜班" description="灯只影响这间编辑室的提示。" variant="plain">
                <SettingsRow label="留一盏灯" description="陈麦夜校时，编辑室的灯别灭。" htmlFor="gallery-lamp">
                  <Switch id="gallery-lamp" size="sm" checked={desk.lamp} onCheckedChange={desk.setLamp} />
                </SettingsRow>
              </SettingsSection>
            )}
            {(show('深色') || (show('密度') && !desk.lockedDensity)) && (
              <SettingsSection title="外观" description="字号、控件和深浅都从这里调。">
                {!desk.lockedDensity && show('密度') && (
                  <SettingsRow label="密度" description="高密、紧凑或舒适。">
                    <SelectInput size="xs" aria-label="密度" value={desk.density} onValueChange={(value) => desk.setDensity(value as DensityMode)} options={densities.map((item) => ({ value: item, label: densityLabel[item] }))} />
                  </SettingsRow>
                )}
                {show('深色') && (
                  <SettingsRow label="深色" description="夜校时用深色。" htmlFor="gallery-theme">
                    <Switch id="gallery-theme" size="sm" checked={desk.theme === 'dark'} onCheckedChange={(checked) => desk.setTheme(checked ? 'dark' : 'light')} />
                  </SettingsRow>
                )}
              </SettingsSection>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function renderPage(page: PageId) {
  switch (page) {
    case 'dashboard':
      return <BoardPage />;
    case 'files':
      return <ManuscriptPage />;
    case 'events':
      return <ReviewPage />;
    case 'inspector':
      return <AuthorsPage />;
    case 'trace':
      return <ProofPage />;
    case 'commands':
      return <ShipPage />;
    case 'settings':
      return <SettingsPage />;
  }
}

function readPage(): PageId {
  const page = new URLSearchParams(location.search).get('page');
  return pages.some((item) => item.id === page) ? (page as PageId) : 'dashboard';
}

function readDensity(fallback: DensityMode): DensityMode {
  const value = new URLSearchParams(location.search).get('density');
  return densities.includes(value as DensityMode) ? (value as DensityMode) : fallback;
}

function UserMenu() {
  const { theme, setTheme, density, setDensity, lockedDensity, setPage } = useDesk();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label="林夏的菜单" className="rounded-full bg-muted" />}>
        <Avatar size="sm" className="size-[var(--rui-control-height-xs)]">
          <AvatarFallback>夏</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>林夏 · 主编</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {!lockedDensity && (
          <DropdownMenuRadioGroup value={density} onValueChange={(value) => setDensity(value as DensityMode)}>
            {densities.map((item) => (
              <DropdownMenuRadioItem key={item} value={item}>{densityLabel[item]}</DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )}
        {!lockedDensity && <DropdownMenuSeparator />}
        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun /> : <Moon />}
          {theme === 'dark' ? '切换到浅色' : '切换到深色'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPage('settings')}>室规</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** 南窗 magazine desk. Page ids stay addressable; branding stays inside this example. */
export function Gallery({ lockedDensity }: { lockedDensity?: DensityMode } = {}) {
  const [page, setPage] = useState<PageId>(readPage);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark'));
  const [density, setDensity] = useState<DensityMode>(() => readDensity(lockedDensity ?? 'dense'));
  const [query, setQuery] = useState('');
  const [issueTitle, setIssueTitle] = useState('雨季的书店');
  const [pieces, setPieces] = useState(initialPieces);
  const [notes, setNotes] = useState(initialNotes);
  const [people, setPeople] = useState(initialPeople);
  const [revisions, setRevisions] = useState<Revision[]>([
    { id: 'r1', label: '第一稿', body: earlierDraft },
    { id: 'r2', label: '第二稿', body: openingDraft },
  ]);
  const [activeRevision, setActiveRevision] = useState('r2');
  const [draft, setDraftState] = useState(openingDraft);
  const [saved, setSaved] = useState(true);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [proofStatus, setProofStatus] = useState('校样被退回');
  const [asking, setAsking] = useState(false);
  const [printerNote, setPrinterNote] = useState('');
  const [checks, setChecks] = useState(initialChecks);
  const [wrap, setWrap] = useState(false);
  const [deadline, setDeadline] = useState(false);
  const [proofPlace, setProofPlace] = useState('bottom');
  const [lamp, setLamp] = useState(true);
  const askTimer = useRef<number | undefined>(undefined);
  const activeDensity = lockedDensity ?? density;
  useEffect(() => () => window.clearTimeout(askTimer.current), []);
  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set('view', lockedDensity === 'dense' ? 'dense' : 'gallery');
    url.searchParams.delete('example');
    url.searchParams.set('page', page);
    url.searchParams.set('theme', theme);
    if (!lockedDensity) url.searchParams.set('density', density);
    else url.searchParams.delete('density');
    history.replaceState(null, '', url);
    document.title = `${pages.find((item) => item.id === page)!.label} · 南窗`;
  }, [page, theme, density, lockedDensity]);

  const desk: Desk = {
    query,
    issueTitle,
    setIssueTitle,
    pieces,
    movePiece: (id, column) => setPieces((list) => list.map((piece) => piece.id === id ? { ...piece, column } : piece)),
    notes,
    setNoteResolved: (id, resolved) => setNotes((list) => list.map((note) => note.id === id ? { ...note, resolved } : note)),
    addNote: (note) => setNotes((list) => [...list, { ...note, id: `n${list.length + 1}-${note.body.length}` }]),
    people,
    setPersonSection: (id, section) => setPeople((list) => list.map((person) => person.id === id ? { ...person, section } : person)),
    setPersonNote: (id, note) => setPeople((list) => list.map((person) => person.id === id ? { ...person, note } : person)),
    removePerson: (id) => setPeople((list) => list.map((person) => person.id === id ? { ...person, out: true } : person)),
    draft,
    setDraft: (value) => { setDraftState(value); setSaved(false); },
    saved,
    saveDraft: () => {
      setRevisions((list) => list.map((revision) => revision.id === activeRevision ? { ...revision, body: draft } : revision));
      setSaved(true);
    },
    revisions,
    activeRevision,
    loadRevision: (id) => {
      const revision = revisions.find((item) => item.id === id);
      if (!revision) return;
      setActiveRevision(id);
      setDraftState(revision.body);
      setSaved(true);
    },
    milestones,
    proofStatus,
    resend: () => {
      setProofStatus('已重新送印');
      setMilestones((list) => [...list, { id: `m${list.length + 1}`, time: '现在', title: '重新送印', detail: '校样退回后，阿禾重画雨点，再送江岸印务。' }]);
    },
    asking,
    printerNote,
    askPrinter: () => {
      setAsking(true);
      window.clearTimeout(askTimer.current);
      askTimer.current = window.setTimeout(() => {
        setAsking(false);
        setPrinterNote('周五前可以重印');
      }, 900);
    },
    checks,
    toggleCheck: (id, done) => setChecks((list) => list.map((item) => item.id === id ? { ...item, done } : item)),
    wrap,
    setWrap,
    deadline,
    setDeadline,
    proofPlace,
    setProofPlace,
    lamp,
    setLamp,
    setPage,
    theme,
    setTheme,
    density,
    setDensity,
    lockedDensity: Boolean(lockedDensity),
  };

  const groups = ['这一期', '编辑室'] as const;
  return (
    <ReitoThemeProvider root mode={theme} density={activeDensity}>
      <TooltipProvider>
        <DeskContext.Provider value={desk}>
          <div className="gallery-shell reito-root flex h-dvh flex-col overflow-hidden bg-background text-foreground">
            <header className="gallery-header flex shrink-0 items-center gap-2 border-b bg-card px-[var(--rui-content-padding)]">
              <Button
                nativeButton={false}
                variant="ghost"
                size="icon-xs"
                aria-label="回到示例"
                render={<a href={`${import.meta.env.BASE_URL}?view=examples`} />}
              >
                <ArrowLeft />
              </Button>
              <Newspaper className="size-[var(--rui-icon-size)] shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="text-xs font-medium">南窗</span>
              <span className="gallery-header-title text-xs text-muted-foreground">{issue} · 《{issueTitle}》</span>
              <div className="gallery-header-controls ml-auto flex min-w-0 items-center justify-end gap-1.5">
                <Input
                  type="search"
                  aria-label="在这一期里找"
                  placeholder="找稿件、作者、批注"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="gallery-search !h-[var(--rui-control-height-sm)] !text-sm"
                />
                <UserMenu />
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
                </nav>
                <p className="border-t px-2 py-1 text-2xs text-muted-foreground">
                  {lamp ? '灯还亮着' : '灯关了'} · {deadline ? '周五会响' : '周五傍晚截稿'}
                </p>
              </aside>
              <main className="gallery-main-area min-h-0 min-w-0 flex-1 overflow-hidden">{renderPage(page)}</main>
            </div>
          </div>
        </DeskContext.Provider>
      </TooltipProvider>
    </ReitoThemeProvider>
  );
}

/** Backward-compatible dense entry used by existing tests and deep links. */
export function DenseExamples() {
  return <Gallery lockedDensity="dense" />;
}
