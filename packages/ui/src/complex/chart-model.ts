export type ChartKind = 'line' | 'area' | 'bar' | 'pie' | 'donut';
export type ChartTone = 'default' | 'muted' | 'success' | 'warning' | 'danger';
export interface ChartSeries { key: string; label: string; tone?: ChartTone }
export interface ChartRow { id: string; label: string; values: Readonly<Record<string, number | null>> }

/** Validate supplied data; missing values stay missing and no aggregation is performed. */
export function validateChartData(rows: readonly ChartRow[], series: readonly ChartSeries[], kind: ChartKind): string | undefined {
  if (!series.length) return '请提供至少一个数据系列';
  if (new Set(series.map(item => item.key)).size !== series.length) return '数据系列 key 必须唯一';
  if (new Set(rows.map(item => item.id)).size !== rows.length) return '数据行 id 必须唯一';
  const polar = kind === 'pie' || kind === 'donut';
  if (polar && series.length !== 1) return '饼图和环形图需要一个数据系列';
  let positive = false;
  for (const row of rows) for (const item of series) {
    const value = row.values[item.key];
    if (value === null) continue;
    if (typeof value !== 'number' || !Number.isFinite(value)) return `${row.label} / ${item.label} 需要有限数值或 null`;
    if (polar && value < 0) return '饼图和环形图不接受负数';
    if (value > 0) positive = true;
  }
  if (polar && rows.length && !positive) return '占比数据总值必须大于零';
  return undefined;
}

export const chartToneColors: Record<ChartTone, string> = {
  default: 'var(--rui-text)',
  muted: 'var(--rui-text-muted)',
  success: 'var(--rui-success)',
  warning: 'var(--rui-warning)',
  danger: 'var(--rui-danger)',
};
