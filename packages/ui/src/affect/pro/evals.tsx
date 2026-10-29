import { useState } from 'react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { SegmentedControl } from '../segmented-control.js';
import { AppShell, type AppShellProps } from './app-shell.js';
import { InlineDiff } from './inline-diff.js';
import { KpiChart } from './kpi-chart.js';

export type EvalsScreenProps = Pick<
  AppShellProps,
  'onNavigate' | 'workspace' | 'user' | 'className'
>;

const cases = [
  { id: 'tone', name: '语气保持克制', pass: true },
  { id: 'cite', name: '引用本地来源', pass: true },
  { id: 'length', name: '不超过 120 字', pass: false },
];

/** Recreated from public Evals docs. Not Pro source. */
export function EvalsScreen({
  onNavigate,
  workspace = 'Acme',
  user = { name: 'Alex Morgan' },
  className,
}: EvalsScreenProps) {
  const [version, setVersion] = useState('v3');
  const [picked, setPicked] = useState(cases[0]?.id);
  const [filter, setFilter] = useState<'all' | 'fail'>('all');
  const visible = cases.filter((item) => (filter === 'fail' ? !item.pass : true));
  return (
    <AppShell
      active="Evals"
      workspace={workspace}
      user={user}
      onNavigate={onNavigate}
      header={{ title: '评测' }}
      className={className}
    >
      <div className="grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)] @lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="grid gap-[var(--rui-content-gap)]">
          <Inline className="justify-between">
            <Heading size="item">通过率</Heading>
            <Inline>
              {['v2', 'v3'].map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="xs"
                  variant={version === item ? 'secondary' : 'ghost'}
                  onClick={() => setVersion(item)}
                >
                  {item}
                </Button>
              ))}
              <Button type="button" size="xs">
                运行评测
              </Button>
            </Inline>
          </Inline>
          <KpiChart
            title={`${version} 通过率`}
            value={version === 'v3' ? '67%' : '50%'}
            delta={version === 'v3' ? 17 : -8}
            labels={['一', '二', '三', '四']}
            series={[
              { label: '通过', values: version === 'v3' ? [50, 50, 67, 67] : [40, 50, 50, 50] },
            ]}
          />
          <SegmentedControl
            aria-label="筛选"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: '全部' },
              { value: 'fail', label: '失败' },
            ]}
          />
          <ul className="grid gap-1">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[var(--rui-radius)] px-2 py-1 text-left"
                  onClick={() => setPicked(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setPicked(item.id);
                    }
                  }}
                >
                  <Text as="span">{item.name}</Text>
                  <Badge variant={item.pass ? 'secondary' : 'destructive'}>
                    {item.pass ? '通过' : '失败'}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section className="grid gap-[var(--rui-content-gap)]">
          <Heading size="item">提示改动</Heading>
          <Text variant="caption" tone="muted">
            用例 {visible.find((item) => item.id === picked)?.name ?? ''}
          </Text>
          <InlineDiff
            original="用两段话总结，语气正式。"
            suggested="用一段话总结，语气克制，并点出来源。"
            label="提示词"
          />
        </section>
      </div>
    </AppShell>
  );
}
