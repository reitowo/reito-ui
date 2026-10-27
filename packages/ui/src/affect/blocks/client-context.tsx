import { useMemo, useState } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { Label } from '../../primitives/label.js';
import { Textarea } from '../../primitives/textarea.js';
import { Switch } from '../../primitives/switch.js';
import { cn } from '../../lib/utils.js';
import { initials, usePrefersReducedMotion } from '../shared.js';

export type ContextKpi = { id: string; label: string; value: string; change?: string };
export type ContextReport = { id: string; name: string; summary?: string };
export type ContextFile = { name: string; type: 'pdf' | 'xlsx' | 'csv' | 'doc' };
export type ContextEntry = {
  id: string;
  kind: 'note' | 'report' | 'files' | 'integration';
  text?: string;
  report?: string;
  files?: ContextFile[];
  app?: string;
  connected?: boolean;
  at?: string;
  author?: string;
};
export type ContextClient = {
  id: string;
  name: string;
  meta?: string;
  mark?: string;
  kpis?: ContextKpi[];
  reports?: ContextReport[];
  context?: ContextEntry[];
};
export type ClientContextProps = {
  clients?: ContextClient[];
  me?: { name: string; avatar?: string };
  onAddContext?: (clientId: string, text: string, files: File[]) => void;
  onCreateClient?: (name: string) => void;
  className?: string;
};

const sampleClients: ContextClient[] = [
  {
    id: 'northwind',
    name: 'Northwind',
    meta: '零售 · 月结',
    mark: 'N',
    kpis: [
      { id: 'arr', label: 'ARR', value: '$96k', change: '+8%' },
      { id: 'nps', label: 'NPS', value: '54', change: '+4' },
      { id: 'open', label: '未决', value: '3' },
    ],
    reports: [{ id: 'q1', name: 'Q1 回顾', summary: '席位增长，退款下降。' }],
    context: [
      {
        id: 'n1',
        kind: 'note',
        text: '下周对一下 @Q1 回顾 里的退款口径。',
        author: 'Lena Hart',
        at: '今天',
      },
      { id: 'r1', kind: 'report', report: 'Q1 回顾' },
      { id: 'f1', kind: 'files', files: [{ name: 'usage.csv', type: 'csv' }] },
      { id: 'i1', kind: 'integration', app: '账单', connected: true },
    ],
  },
  {
    id: 'contour',
    name: 'Contour',
    meta: '代理 · 项目制',
    mark: 'C',
    kpis: [{ id: 'hours', label: '本月工时', value: '42h' }],
    reports: [],
    context: [{ id: 'n2', kind: 'note', text: '合同续签待确认。', author: 'Alex', at: '昨天' }],
  },
];

/** Recreated from public Client Context docs. Not Pro source. */
export function ClientContext({
  clients = sampleClients,
  me = { name: 'Lena Hart' },
  onAddContext,
  onCreateClient,
  className,
}: ClientContextProps) {
  const reduced = usePrefersReducedMotion();
  const [list, setList] = useState(clients);
  const [active, setActive] = useState(clients[0]?.id ?? '');
  const [tab, setTab] = useState<'overview' | 'context'>('overview');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | ContextEntry['kind']>('all');
  const [openSwitch, setOpenSwitch] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draftClient, setDraftClient] = useState('');
  const [draft, setDraft] = useState('');
  const [mentions, setMentions] = useState(false);
  const [focusKpi, setFocusKpi] = useState<string | null>(null);
  const [openReport, setOpenReport] = useState<string | null>(null);
  const [notify, setNotify] = useState(true);
  const current = list.find((item) => item.id === active) ?? list[0];
  const entries = useMemo(
    () =>
      (current?.context ?? []).filter((entry) => {
        const hay = `${entry.text ?? ''} ${entry.report ?? ''} ${entry.app ?? ''}`.toLowerCase();
        return (kind === 'all' || entry.kind === kind) && hay.includes(query.trim().toLowerCase());
      }),
    [current, kind, query],
  );
  const mention = current?.reports?.find((item) =>
    item.name.toLowerCase().includes(draft.replace(/^.*@/, '').toLowerCase()),
  );

  function addContext() {
    if (!current || !draft.trim()) return;
    const entry: ContextEntry = {
      id: `local-${Date.now()}`,
      kind: 'note',
      text: draft.trim(),
      author: me.name,
      at: '刚刚',
    };
    setList((prev) =>
      prev.map((item) =>
        item.id === current.id ? { ...item, context: [entry, ...(item.context ?? [])] } : item,
      ),
    );
    onAddContext?.(current.id, draft.trim(), []);
    setDraft('');
    setMentions(false);
  }

  return (
    <section className={cn('grid min-w-0 gap-[var(--rui-content-gap)]', className)}>
      <Inline className="justify-between">
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            aria-expanded={openSwitch}
            aria-haspopup="listbox"
            onClick={() => setOpenSwitch((value) => !value)}
          >
            {current?.mark ?? initials(current?.name ?? '')} {current?.name}
          </Button>
          {openSwitch ? (
            <ul
              role="listbox"
              aria-label="客户"
              className="absolute z-[var(--rui-z-popover)] mt-1 min-w-40 rounded-[var(--rui-radius)] border border-border bg-card p-1"
            >
              {list.map((item) => (
                <li key={item.id}>
                  <Button
                    type="button"
                    size="xs"
                    role="option"
                    aria-selected={item.id === current?.id}
                    variant={item.id === current?.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      setActive(item.id);
                      setOpenSwitch(false);
                    }}
                  >
                    {item.name}
                  </Button>
                </li>
              ))}
              <li>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setCreating(true)}
                >
                  新建客户
                </Button>
              </li>
            </ul>
          ) : null}
        </div>
        <Text variant="caption" tone="muted">
          {current?.meta}
        </Text>
      </Inline>
      {creating ? (
        <form
          className="grid gap-2 rounded-[var(--rui-radius)] border border-border p-[var(--rui-content-padding)]"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draftClient.trim()) return;
            const next = { id: draftClient, name: draftClient.trim(), context: [] };
            setList((prev) => [next, ...prev]);
            setActive(next.id);
            onCreateClient?.(next.name);
            setDraftClient('');
            setCreating(false);
            setOpenSwitch(false);
          }}
        >
          <Label htmlFor="affect-new-client">客户名称</Label>
          <Input
            id="affect-new-client"
            value={draftClient}
            onChange={(event) => setDraftClient(event.target.value)}
          />
          <Inline className="justify-end">
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
              取消
            </Button>
            <Button type="submit">创建</Button>
          </Inline>
        </form>
      ) : null}
      <div role="tablist" aria-label="客户视图" className="flex gap-1">
        {(
          [
            ['overview', '总览'],
            ['context', '上下文'],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            type="button"
            size="sm"
            role="tab"
            aria-selected={tab === id}
            variant={tab === id ? 'secondary' : 'ghost'}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
        ))}
      </div>
      {tab === 'overview' ? (
        <div role="tabpanel" className="grid gap-[var(--rui-content-gap)]">
          <div className="grid gap-[var(--rui-content-gap)] @md:grid-cols-3">
            {(current?.kpis ?? []).map((kpi) => (
              <button
                key={kpi.id}
                type="button"
                aria-pressed={focusKpi === kpi.id}
                onClick={() => setFocusKpi((value) => (value === kpi.id ? null : kpi.id))}
                className={cn(
                  'rounded-[var(--rui-radius)] border border-border bg-card p-[var(--rui-content-padding)] text-left',
                  !reduced && 'motion-safe:animate-in motion-safe:fade-in',
                )}
              >
                <Text variant="caption" tone="muted">
                  {kpi.label}
                </Text>
                <Heading size="item">{kpi.value}</Heading>
                {kpi.change ? (
                  <Text variant="caption" tone="muted">
                    {kpi.change}
                  </Text>
                ) : null}
              </button>
            ))}
          </div>
          <div className="grid gap-1">
            {(current?.reports ?? []).map((report) => (
              <Button
                key={report.id}
                type="button"
                variant="outline"
                className="justify-between"
                aria-expanded={openReport === report.id}
                onClick={() => setOpenReport((value) => (value === report.id ? null : report.id))}
              >
                {report.name}
                <span aria-hidden="true">{openReport === report.id ? '▾' : '▸'}</span>
              </Button>
            ))}
            {openReport ? (
              <Text variant="caption">
                {current?.reports?.find((item) => item.id === openReport)?.summary}
              </Text>
            ) : null}
          </div>
          <Inline>
            <Label htmlFor="affect-client-notify">同步提醒</Label>
            <Switch
              id="affect-client-notify"
              checked={notify}
              onCheckedChange={(value) => setNotify(value === true)}
            />
          </Inline>
        </div>
      ) : (
        <div role="tabpanel" className="grid gap-[var(--rui-content-gap)]">
          <Inline>
            <Label htmlFor="affect-context-search" className="sr-only">
              搜索上下文
            </Label>
            <Input
              id="affect-context-search"
              value={query}
              placeholder="搜索"
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="flex flex-wrap gap-1" role="listbox" aria-label="类型">
              {(
                [
                  ['all', '全部'],
                  ['note', '笔记'],
                  ['report', '报告'],
                  ['files', '文件'],
                  ['integration', '集成'],
                ] as const
              ).map(([id, label]) => (
                <Button
                  key={id}
                  type="button"
                  size="xs"
                  role="option"
                  aria-selected={kind === id}
                  variant={kind === id ? 'secondary' : 'ghost'}
                  onClick={() => setKind(id)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </Inline>
          <ol className="grid gap-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-[var(--rui-radius)] border border-border bg-card p-[var(--rui-content-padding)]"
              >
                <Text variant="caption" tone="muted">
                  {entry.author ?? me.name} · {entry.at ?? ''}
                </Text>
                <Text>
                  {entry.kind === 'note'
                    ? entry.text
                    : entry.kind === 'report'
                      ? `报告 ${entry.report}`
                      : entry.kind === 'files'
                        ? entry.files?.map((file) => file.name).join('、')
                        : `${entry.app} ${entry.connected ? '已连接' : '未连接'}`}
                </Text>
              </li>
            ))}
          </ol>
          <div className="grid gap-2">
            <Label htmlFor="affect-context-draft">添加上下文</Label>
            <Textarea
              id="affect-context-draft"
              value={draft}
              placeholder="写下笔记，用 @ 提及报告"
              onChange={(event) => {
                setDraft(event.target.value);
                setMentions(event.target.value.includes('@'));
              }}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault();
                  addContext();
                }
                if (event.key === 'Escape') setMentions(false);
                if (mentions && mention && (event.key === 'Enter' || event.key === 'Tab')) {
                  event.preventDefault();
                  setDraft((value) => value.replace(/@[^@]*$/, `@${mention.name} `));
                  setMentions(false);
                }
              }}
            />
            {mentions ? (
              <ul role="listbox" aria-label="提及报告">
                {(current?.reports ?? []).map((item) => (
                  <li key={item.id}>
                    <Button
                      type="button"
                      size="xs"
                      role="option"
                      className="justify-start"
                      onClick={() => {
                        setDraft((value) => value.replace(/@[^@]*$/, `@${item.name} `));
                        setMentions(false);
                      }}
                    >
                      {item.name}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
            <Button type="button" onClick={addContext}>
              添加
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
