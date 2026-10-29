import { useMemo, useState, type KeyboardEvent } from 'react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';

export type UsagePart = { label: string; value: number; color?: string };
export type UsageLimit = {
  label: string;
  used: number;
  total?: number | null;
  unit?: string;
  decimals?: number;
};
export type UsageDay = { label: string; value: number | null };
export type UsagePeriod = { id: string; label: string };
export type UsageState = 'ok' | 'warn' | 'limit';
export type UsageMeterProps = {
  total: number;
  used: UsagePart[];
  limits?: UsageLimit[];
  periods?: UsagePeriod[];
  period?: string;
  defaultPeriod?: string;
  onPeriodChange?: (id: string) => void;
  resetAt?: Date | string | number;
  daily?: UsageDay[];
  onUpgrade?: (state: UsageState) => void;
  title?: string;
  plan?: string;
  unit?: string;
  warnAt?: number;
  upgradeLabel?: string;
  topUpLabel?: string;
  className?: string;
};

const tones = ['bg-primary', 'bg-success', 'bg-warning', 'bg-info', 'bg-destructive'];

function formatNumber(value: number, decimals = 0) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

function resetLabel(resetAt?: Date | string | number) {
  if (resetAt == null) return null;
  const date = new Date(resetAt);
  if (Number.isNaN(date.getTime())) return null;
  const days = Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86_400_000));
  return days === 0 ? '今日重置' : `${days} 天后重置`;
}

/** Recreated from public Usage Meter docs. Not Pro source. Hex colors are ignored. */
export function UsageMeter({
  total,
  used,
  limits = [],
  periods,
  period,
  defaultPeriod,
  onPeriodChange,
  resetAt,
  daily = [],
  onUpgrade,
  title = '用量',
  plan,
  unit = '额度',
  warnAt = 0.8,
  upgradeLabel = '升级',
  topUpLabel = '补充额度',
  className,
}: UsageMeterProps) {
  const [internalPeriod, setInternalPeriod] = useState(defaultPeriod ?? periods?.[0]?.id);
  const [part, setPart] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const current = period ?? internalPeriod;
  const spent = used.reduce((sum, item) => sum + item.value, 0);
  const ratio = total ? spent / total : 0;
  const state: UsageState = ratio >= 1 ? 'limit' : ratio >= warnAt ? 'warn' : 'ok';
  const reset = resetLabel(resetAt);
  const peak = Math.max(...daily.map((item) => item.value ?? 0), 1);
  const live = useMemo(() => {
    if (part) {
      const item = used.find((row) => row.label === part);
      return item ? `${item.label} ${formatNumber(item.value)} ${unit}` : '';
    }
    if (day) {
      const item = daily.find((row) => row.label === day);
      return item ? `${item.label} ${item.value == null ? '未到' : formatNumber(item.value)}` : '';
    }
    if (state === 'limit') return `已用完 ${formatNumber(total)} ${unit}`;
    if (state === 'warn')
      return `用量接近上限，已用 ${formatNumber(spent)} / ${formatNumber(total)} ${unit}`;
    return `${formatNumber(spent)} / ${formatNumber(total)} ${unit}`;
  }, [daily, day, part, spent, state, total, unit, used]);

  function pickPeriod(id: string) {
    if (period === undefined) setInternalPeriod(id);
    onPeriodChange?.(id);
  }

  function onBarKey(event: KeyboardEvent<HTMLDivElement>) {
    const index = used.findIndex((item) => item.label === part);
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setPart(
        used[Math.min(used.length - 1, Math.max(0, index + 1))]?.label ?? used[0]?.label ?? null,
      );
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setPart(used[Math.max(0, index - 1)]?.label ?? used[0]?.label ?? null);
    }
    if (event.key === 'Escape') setPart(null);
  }

  function onSparkKey(event: KeyboardEvent<HTMLDivElement>) {
    const index = daily.findIndex((item) => item.label === day);
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setDay(
        daily[Math.min(daily.length - 1, Math.max(0, index + 1))]?.label ?? daily[0]?.label ?? null,
      );
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setDay(daily[Math.max(0, index - 1)]?.label ?? daily[0]?.label ?? null);
    }
    if (event.key === 'Escape') setDay(null);
  }

  return (
    <section
      aria-labelledby="affect-usage-title"
      className={cn(
        'grid max-w-[var(--rui-container-sm)] gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <div className="grid gap-1">
          <Heading id="affect-usage-title" size="item">
            {title}
          </Heading>
          <Text variant="caption" tone="muted">
            {[plan, reset].filter(Boolean).join(' · ')}
          </Text>
        </div>
        {periods?.length ? (
          <div role="radiogroup" aria-label="周期" className="flex gap-1">
            {periods.map((item) => (
              <Button
                key={item.id}
                type="button"
                size="xs"
                role="radio"
                aria-checked={current === item.id}
                variant={current === item.id ? 'secondary' : 'ghost'}
                onClick={() => pickPeriod(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        ) : null}
      </Inline>
      <div className="grid gap-1">
        <Inline className="justify-between">
          <Text variant="caption">
            {formatNumber(spent)} / {formatNumber(total)} {unit}
          </Text>
          <Text
            variant="caption"
            className={state === 'ok' ? 'text-muted-foreground' : 'text-warning'}
          >
            {state === 'limit' ? '已达上限' : state === 'warn' ? '接近上限' : '用量正常'}
          </Text>
        </Inline>
        <div
          role="meter"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={spent}
          aria-label={`${formatNumber(spent)} / ${formatNumber(total)} ${unit}`}
          className="flex h-3 overflow-hidden rounded-full bg-muted outline-none focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50"
          onKeyDown={onBarKey}
        >
          {used.map((item, index) => (
            <button
              key={item.label}
              type="button"
              className={cn(
                'h-full min-w-0',
                tones[index % tones.length],
                part && part !== item.label && 'opacity-[var(--rui-opacity-disabled)]',
              )}
              style={{ width: `${total ? (item.value / total) * 100 : 0}%` }}
              aria-label={`${item.label} ${formatNumber(item.value)}`}
              onClick={() => setPart(part === item.label ? null : item.label)}
            />
          ))}
        </div>
        <ul className="grid gap-1">
          {used.map((item, index) => (
            <li key={item.label}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center justify-between rounded-[var(--rui-radius)] px-1 py-0.5 text-left',
                  part === item.label && 'bg-muted',
                )}
                onClick={() => setPart(part === item.label ? null : item.label)}
              >
                <span className="flex items-center gap-1">
                  <span className={cn('size-2 rounded-full', tones[index % tones.length])} />
                  <Text as="span" variant="caption">
                    {item.label}
                  </Text>
                </span>
                <Text as="span" variant="caption" tone="muted">
                  {formatNumber(item.value)}
                </Text>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {daily.length ? (
        <div
          tabIndex={0}
          aria-label="每日用量"
          className="flex h-8 items-end gap-px outline-none focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50"
          onKeyDown={onSparkKey}
        >
          {daily.map((item) => (
            <button
              key={item.label}
              type="button"
              aria-label={`${item.label} ${item.value == null ? '未到' : formatNumber(item.value)}`}
              className={cn(
                'min-w-0 flex-1 rounded-sm',
                item.value == null ? 'bg-border' : 'bg-primary',
                day === item.label && 'bg-foreground',
              )}
              style={{
                height: `${item.value == null ? 12 : Math.max(12, (item.value / peak) * 100)}%`,
              }}
              onClick={() => setDay(day === item.label ? null : item.label)}
            />
          ))}
        </div>
      ) : null}
      {limits.length ? (
        <ul className="grid gap-2 @md:grid-cols-3">
          {limits.map((item) => {
            const unlimited = item.total == null;
            const share = unlimited || !item.total ? 0 : item.used / item.total;
            return (
              <li key={item.label} className="grid gap-1">
                <Inline className="justify-between">
                  <Text variant="caption">{item.label}</Text>
                  <Text variant="caption" tone="muted">
                    {formatNumber(item.used, item.decimals)}
                    {item.unit ? ` ${item.unit}` : ''} /{' '}
                    {unlimited ? '∞' : formatNumber(item.total ?? 0, item.decimals)}
                  </Text>
                </Inline>
                <div
                  role="meter"
                  aria-label={`${item.label} ${formatNumber(item.used, item.decimals)} / ${unlimited ? '不限' : formatNumber(item.total ?? 0, item.decimals)}`}
                  aria-valuemin={0}
                  aria-valuemax={unlimited ? undefined : (item.total ?? 0)}
                  aria-valuenow={item.used}
                  className="h-1 overflow-hidden rounded-full bg-muted"
                >
                  <span
                    className={cn(
                      'block h-full',
                      share >= warnAt ? 'bg-warning' : 'bg-primary',
                      unlimited && 'bg-muted-foreground',
                    )}
                    style={{ width: unlimited ? '100%' : `${Math.min(100, share * 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      <Inline className="justify-between">
        <Text variant="caption" tone="muted" aria-live="polite">
          {live}
        </Text>
        <Button
          type="button"
          size="xs"
          variant={state === 'ok' ? 'ghost' : 'default'}
          onClick={() => onUpgrade?.(state)}
        >
          {state === 'ok' ? upgradeLabel : topUpLabel}
        </Button>
      </Inline>
    </section>
  );
}
