import { Heading, Text } from '../../basic/composition.js';
import { AppShell, type AppShellProps } from './app-shell.js';
import { BreakdownChart } from './breakdown-chart.js';
import { CompactBreakdown } from './compact-breakdown.js';
import { DataTable } from './data-table.js';
import { KpiChart } from './kpi-chart.js';

export type AnalyticsScreenProps = Pick<
  AppShellProps,
  'onNavigate' | 'workspace' | 'user' | 'className'
>;

/** Recreated from public Analytics docs. Not Pro source. */
export function AnalyticsScreen({
  onNavigate,
  workspace = 'Acme',
  user = { name: 'Alex Morgan' },
  className,
}: AnalyticsScreenProps) {
  return (
    <AppShell
      active="Analytics"
      workspace={workspace}
      user={user}
      onNavigate={onNavigate}
      header={{ title: '分析' }}
      className={className}
    >
      <div className="grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
        <Heading size="item">收入总览</Heading>
        <div className="grid gap-[var(--rui-content-gap)] @lg:grid-cols-2">
          <KpiChart
            title="收入"
            value="$96.4k"
            delta={7900}
            footer="主要渠道"
            labels={['3/3', '3/4', '3/5', '3/6']}
            series={[
              { label: '自然', values: [4600, 4900, 5200, 5400] },
              { label: '付费', values: [3100, 3400, 3200, 3600] },
            ]}
          />
          <CompactBreakdown
            title="渠道构成"
            delta={0.08}
            items={[
              { label: '自然搜索', value: 46 },
              { label: '付费', value: 28 },
              { label: '推荐', value: 16 },
            ]}
          />
        </div>
        <BreakdownChart
          title="工作量"
          records={[
            { team: '设计', week: '本周', hours: 18 },
            { team: '工程', week: '本周', hours: 26 },
            { team: '设计', week: '上周', hours: 12 },
            { team: '工程', week: '上周', hours: 22 },
          ]}
          dimensions={[
            { key: 'team', label: '团队', values: ['设计', '工程'] },
            { key: 'week', label: '周期', values: ['本周', '上周'] },
          ]}
          measures={[{ key: 'hours', label: '小时', field: 'hours' }]}
        />
        <div className="grid gap-1">
          <Text variant="caption" tone="muted">
            热门产品
          </Text>
          <DataTable
            title="产品"
            columns={[
              { key: 'name', label: '名称', type: 'title' },
              { key: 'channel', label: '渠道', type: 'tag' },
              { key: 'revenue', label: '收入', type: 'number' },
            ]}
            rows={[
              { id: 'seat', name: '席位', channel: '自助', revenue: 42000 },
              { id: 'support', name: '支持', channel: '销售', revenue: 18600 },
            ]}
          />
        </div>
      </div>
    </AppShell>
  );
}
