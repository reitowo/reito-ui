import { useMemo, useState } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Checkbox } from '../../primitives/checkbox.js';
import { Input } from '../../primitives/input.js';
import { Label } from '../../primitives/label.js';
import { cn } from '../../lib/utils.js';
import { SegmentedControl } from '../segmented-control.js';

export type InvoiceParty = { name: string; lines: string[] };
export type InvoiceLine = {
  id: string;
  name: string;
  qty: number;
  rate: number;
  tax: number;
  group?: string;
};
export type InvoiceCreditProps = {
  seller?: InvoiceParty;
  buyer?: InvoiceParty;
  invoiceNo?: string;
  creditNo?: string;
  invoiceDate?: string;
  dueDate?: string;
  period?: string;
  lines?: InvoiceLine[];
  currency?: string;
  onIssue?: (credits: Record<string, number>, total: number) => void;
  className?: string;
};

const sampleLines: InvoiceLine[] = [
  { id: 'plan', name: 'Growth plan', qty: 1, rate: 1250, tax: 0.2 },
  {
    id: 'api',
    name: 'API calls (per 1k)',
    qty: 18420,
    rate: 0.42,
    tax: 0.2,
    group: 'Metered usage',
  },
];

function money(currency: string, value: number) {
  return `${currency}${value.toFixed(2)}`;
}

function lineTotal(line: InvoiceLine) {
  return line.qty * line.rate;
}

/** Recreated from public Invoice & Credit Note docs. Not Pro source. */
export function InvoiceCredit({
  seller = { name: 'Reito Studio', lines: ['Graphite 表面', 'Local example'] },
  buyer = { name: 'Northwind', lines: ['Billing contact'] },
  invoiceNo = 'INV-2041',
  creditNo = 'CN-0117',
  invoiceDate = '2026-03-01',
  dueDate = '2026-03-31',
  period = '2026-02',
  lines = sampleLines,
  currency = '$',
  onIssue,
  className,
}: InvoiceCreditProps) {
  const [view, setView] = useState<'invoice' | 'credit'>('invoice');
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [issued, setIssued] = useState(false);
  const grouped = useMemo(() => {
    const map = new Map<string, InvoiceLine[]>();
    for (const line of lines) {
      const key = line.group ?? '';
      map.set(key, [...(map.get(key) ?? []), line]);
    }
    return [...map.entries()];
  }, [lines]);
  const credits = Object.fromEntries(
    lines
      .filter((line) => picked[line.id])
      .map((line) => [line.id, Math.min(lineTotal(line), amounts[line.id] ?? lineTotal(line))]),
  );
  const pretax = Object.values(credits).reduce((sum, value) => sum + value, 0);
  const tax = lines
    .filter((line) => picked[line.id])
    .reduce((sum, line) => sum + (credits[line.id] ?? 0) * line.tax, 0);
  const total = pretax + tax;

  function issue() {
    setIssued(true);
    onIssue?.(credits, total);
  }

  return (
    <section className={cn('grid min-w-0 gap-[var(--rui-content-gap)]', className)}>
      <SegmentedControl
        aria-label="单据"
        kind="tabs"
        value={view}
        onChange={setView}
        options={[
          { value: 'invoice', label: '发票' },
          { value: 'credit', label: '贷记单' },
        ]}
      />
      <div className="relative">
        <article
          aria-hidden={view !== 'invoice'}
          inert={view !== 'invoice' ? true : undefined}
          className={cn(
            'rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
            view === 'credit' && 'absolute inset-x-0 top-0 h-8 overflow-hidden opacity-60',
          )}
        >
          <Sheet
            title="发票"
            number={invoiceNo}
            seller={seller}
            buyer={buyer}
            invoiceDate={invoiceDate}
            dueDate={dueDate}
            period={period}
            groups={grouped}
            currency={currency}
          />
        </article>
        <article
          aria-hidden={view !== 'credit'}
          inert={view !== 'invoice' ? undefined : true}
          className={cn(
            'rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
            view === 'invoice' && 'absolute inset-x-0 top-0 h-8 overflow-hidden opacity-60',
          )}
        >
          <Sheet
            title="贷记单"
            number={creditNo}
            seller={seller}
            buyer={buyer}
            invoiceDate={invoiceDate}
            dueDate={dueDate}
            period={period}
            groups={grouped}
            currency={currency}
            credit
            picked={picked}
            amounts={amounts}
            onPick={(id, next) => setPicked((prev) => ({ ...prev, [id]: next }))}
            onAmount={(id, value, max) =>
              setAmounts((prev) => ({ ...prev, [id]: Math.min(max, Math.max(0, value)) }))
            }
          />
          <Inline className="mt-[var(--rui-content-gap)] justify-between">
            <Text variant="caption">合计含税 {money(currency, total)}</Text>
            <Button type="button" onClick={issue} disabled={!Object.keys(credits).length || issued}>
              {issued ? '已开具' : '开具贷记单'}
            </Button>
          </Inline>
        </article>
      </div>
    </section>
  );
}

function Sheet({
  title,
  number,
  seller,
  buyer,
  invoiceDate,
  dueDate,
  period,
  groups,
  currency,
  credit,
  picked,
  amounts,
  onPick,
  onAmount,
}: {
  title: string;
  number: string;
  seller: InvoiceParty;
  buyer: InvoiceParty;
  invoiceDate: string;
  dueDate: string;
  period: string;
  groups: [string, InvoiceLine[]][];
  currency: string;
  credit?: boolean;
  picked?: Record<string, boolean>;
  amounts?: Record<string, number>;
  onPick?: (id: string, next: boolean) => void;
  onAmount?: (id: string, value: number, max: number) => void;
}) {
  return (
    <Stack>
      <Inline className="justify-between">
        <Heading size="item">{title}</Heading>
        <Text variant="caption" tone="muted">
          {number}
        </Text>
      </Inline>
      <div className="grid gap-[var(--rui-content-gap)] @md:grid-cols-2">
        <Party label="开票方" party={seller} />
        <Party label="收票方" party={buyer} />
      </div>
      <Text variant="caption" tone="muted">
        日期 {invoiceDate} · 到期 {dueDate} · 账期 {period}
      </Text>
      {groups.map(([group, rows]) => (
        <div key={group || 'ungrouped'} className="grid gap-1">
          {group ? (
            <Text variant="caption" tone="muted">
              {group}
            </Text>
          ) : null}
          {rows.map((line) => {
            const max = lineTotal(line);
            const selected = picked?.[line.id] ?? false;
            return (
              <div
                key={line.id}
                className="grid items-center gap-2 @md:grid-cols-[auto_minmax(0,1fr)_auto_auto]"
              >
                {credit ? (
                  <>
                    <Checkbox
                      id={`affect-credit-${line.id}`}
                      checked={selected}
                      onCheckedChange={(value) => onPick?.(line.id, value === true)}
                    />
                    <Label htmlFor={`affect-credit-${line.id}`}>{line.name}</Label>
                  </>
                ) : (
                  <Text className="col-span-2">{line.name}</Text>
                )}
                <Text variant="caption" className="hidden @md:block">
                  {line.qty} × {money(currency, line.rate)}
                </Text>
                {credit ? (
                  <Label className="sr-only" htmlFor={`affect-credit-amount-${line.id}`}>
                    {line.name} 金额
                  </Label>
                ) : null}
                {credit ? (
                  <Input
                    id={`affect-credit-amount-${line.id}`}
                    type="number"
                    disabled={!selected}
                    value={amounts?.[line.id] ?? max}
                    onChange={(event) => onAmount?.(line.id, Number(event.target.value), max)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
                    }}
                  />
                ) : (
                  <Text>{money(currency, max)}</Text>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </Stack>
  );
}

function Party({ label, party }: { label: string; party: InvoiceParty }) {
  return (
    <Stack gap="small">
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Heading size="item">{party.name}</Heading>
      {party.lines.map((line) => (
        <Text key={line} variant="caption">
          {line}
        </Text>
      ))}
    </Stack>
  );
}
