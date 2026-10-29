import { useEffect, useMemo, useState } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { cn } from '../../lib/utils.js';

export type CatalogItem = { name: string; repeat: string; price: number };
export type ScheduleLine = {
  id: string;
  kind: 'product' | 'discount' | 'minimum';
  name: string;
  repeat?: string;
  price?: number;
  percent?: number;
};
export type BillingScheduleValue = {
  phase: string;
  start: string;
  duration: string;
  lines: ScheduleLine[];
};
export type BillingScheduleProps = {
  title?: string;
  phase?: string;
  currency?: string;
  catalog?: CatalogItem[];
  defaultLines?: ScheduleLine[];
  defaultStart?: string;
  onChange?: (schedule: BillingScheduleValue) => void;
  className?: string;
};

const durations = ['1 个月', '3 个月', '6 个月', '12 个月'];
const sampleCatalog: CatalogItem[] = [
  { name: '搭建', repeat: '一次', price: 2400 },
  { name: '席位', repeat: '每月', price: 49 },
  { name: '支持', repeat: '每月', price: 120 },
];

function months(label: string) {
  const value = Number.parseInt(label, 10);
  return Number.isFinite(value) ? value : 1;
}

function endDate(start: string, duration: string) {
  const date = new Date(`${start}T00:00:00`);
  if (Number.isNaN(date.getTime())) return start;
  date.setMonth(date.getMonth() + months(duration));
  return date.toISOString().slice(0, 10);
}

/** Recreated from public Billing Schedule docs. Not Pro source. */
export function BillingSchedule({
  title = '创建账单计划',
  phase = '搭建阶段',
  currency = '$',
  catalog = sampleCatalog,
  defaultLines,
  defaultStart = '2026-01-01',
  onChange,
  className,
}: BillingScheduleProps) {
  const [name, setName] = useState(phase);
  const [start, setStart] = useState(defaultStart);
  const [duration, setDuration] = useState(durations[0]);
  const [lines, setLines] = useState<ScheduleLine[]>(
    defaultLines ?? [
      { id: 'setup', kind: 'product', name: '搭建', repeat: '一次', price: 2400 },
      { id: 'seat', kind: 'product', name: '席位', repeat: '每月', price: 49 },
    ],
  );
  const [openCatalog, setOpenCatalog] = useState(false);
  const end = endDate(start, duration);
  const span = months(duration);
  const totals = useMemo(() => {
    const products = lines.filter((line) => line.kind === 'product');
    const monthly = products
      .filter((line) => line.repeat !== '一次')
      .reduce((sum, line) => sum + (line.price ?? 0), 0);
    const once = products
      .filter((line) => line.repeat === '一次')
      .reduce((sum, line) => sum + (line.price ?? 0), 0);
    const subtotal = once + monthly * span;
    const discount = lines
      .filter((line) => line.kind === 'discount')
      .reduce((sum, line) => sum + (line.percent ?? 0), 0);
    const minimum = lines.find((line) => line.kind === 'minimum')?.price ?? 0;
    const after = Math.max(minimum, subtotal * (1 - discount / 100));
    return { monthly, once, subtotal, after, discount };
  }, [lines, span]);

  useEffect(() => {
    onChange?.({ phase: name, start, duration, lines });
  }, [name, start, duration, lines, onChange]);

  function addProduct(item: CatalogItem) {
    setLines((current) => [
      ...current,
      {
        id: `${item.name}-${current.length}`,
        kind: 'product',
        name: item.name,
        repeat: item.repeat,
        price: item.price,
      },
    ]);
    setOpenCatalog(false);
  }

  return (
    <section
      className={cn(
        '@container grid max-w-xl gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Heading size="item">{title}</Heading>
      <Inline className="justify-between">
        <label className="grid gap-1">
          <Text variant="caption" tone="muted">
            阶段
          </Text>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <Text variant="caption" tone="muted" aria-live="polite">
          {start} → {end}
        </Text>
      </Inline>
      <Inline>
        <label className="grid gap-1">
          <Text variant="caption" tone="muted">
            开始
          </Text>
          <Input type="date" value={start} onChange={(event) => setStart(event.target.value)} />
        </label>
        <fieldset className="grid gap-1">
          <legend>
            <Text variant="caption" tone="muted">
              时长
            </Text>
          </legend>
          <Inline>
            {durations.map((item) => (
              <Button
                key={item}
                type="button"
                size="xs"
                variant={duration === item ? 'secondary' : 'ghost'}
                aria-pressed={duration === item}
                onClick={() => setDuration(item)}
              >
                {item}
              </Button>
            ))}
          </Inline>
        </fieldset>
      </Inline>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[length:var(--rui-font-caption)]">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr>
              <th className="border-b border-border py-1 font-medium">产品</th>
              <th className="@md:table-cell hidden border-b border-border py-1 font-medium">
                重复
              </th>
              <th className="border-b border-border py-1 font-medium">价格</th>
              <th className="border-b border-border py-1 font-medium">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id}>
                <td className="border-b border-border py-1">
                  <label>
                    <span className="sr-only">{line.name} 名称</span>
                    <Input
                      value={line.name}
                      onChange={(event) =>
                        setLines((current) =>
                          current.map((item) =>
                            item.id === line.id ? { ...item, name: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                </td>
                <td className="@md:table-cell hidden border-b border-border py-1">
                  {line.repeat ?? '—'}
                </td>
                <td className="border-b border-border py-1">
                  <label>
                    <span className="sr-only">{line.name} 价格</span>
                    <Input
                      inputMode="decimal"
                      value={String(line.price ?? line.percent ?? 0)}
                      onChange={(event) =>
                        setLines((current) =>
                          current.map((item) =>
                            item.id === line.id
                              ? { ...item, price: Number(event.target.value) || 0 }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                </td>
                <td className="border-b border-border py-1">
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    aria-label={`移除 ${line.name}`}
                    onClick={() =>
                      setLines((current) => current.filter((item) => item.id !== line.id))
                    }
                  >
                    移除
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Inline>
        <div className="relative">
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => setOpenCatalog(!openCatalog)}
          >
            添加产品
          </Button>
          {openCatalog ? (
            <ul className="absolute mt-1 grid min-w-[var(--rui-container-3xs)] rounded-[var(--rui-radius)] border border-border bg-card p-1">
              {catalog.map((item) => (
                <li key={item.name}>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => addProduct(item)}
                  >
                    {item.name} · {currency}
                    {item.price} / {item.repeat}
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          onClick={() =>
            setLines((current) => [
              ...current,
              { id: `disc-${current.length}`, kind: 'discount', name: '折扣', percent: 10 },
            ])
          }
        >
          折扣
        </Button>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          onClick={() =>
            setLines((current) => [
              ...current,
              { id: `min-${current.length}`, kind: 'minimum', name: '最低消费', price: 500 },
            ])
          }
        >
          最低消费
        </Button>
      </Inline>
      <Stack gap="small" aria-live="polite">
        <Text variant="caption" tone="muted">
          一次 {currency}
          {totals.once} · 每月 {currency}
          {totals.monthly} · 小计 {currency}
          {Math.round(totals.subtotal)}
        </Text>
        <Text variant="interface">
          合计 {currency}
          {Math.round(totals.after)}
          {totals.discount ? `（折扣 ${totals.discount}%）` : ''}
        </Text>
      </Stack>
    </section>
  );
}
