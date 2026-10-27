import { useState } from 'react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { SegmentedControl } from '../segmented-control.js';
import { AppShell, type AppShellProps } from './app-shell.js';
import { Toaster, toast } from './toaster.js';
import { UsageMeter } from './usage-meter.js';

export type SettingsBillingTab = 'General' | 'Members' | 'Billing' | 'API keys';
export type SettingsBillingScreenProps = Pick<
  AppShellProps,
  'onNavigate' | 'workspace' | 'user' | 'className'
> & {
  defaultTab?: SettingsBillingTab;
};

const tabs: SettingsBillingTab[] = ['General', 'Members', 'Billing', 'API keys'];
const invoices = [
  { id: 'INV-104', date: '2026-09-01', amount: '$29', status: '已付' },
  { id: 'INV-105', date: '2026-10-01', amount: '$29', status: '已付' },
];
const plans = [
  { id: 'pro', name: '专业版', price: { month: 29, year: 24 }, current: true },
  { id: 'team', name: '团队版', price: { month: 79, year: 66 }, current: false },
];

/** Recreated from public Settings & Billing docs. Not Pro source. */
export function SettingsBillingScreen({
  defaultTab = 'Billing',
  onNavigate,
  workspace = 'Acme',
  user = { name: 'Alex Morgan' },
  className,
}: SettingsBillingScreenProps) {
  const [tab, setTab] = useState<SettingsBillingTab>(defaultTab);
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [name, setName] = useState(workspace);
  return (
    <AppShell
      active="Settings"
      workspace={workspace}
      user={user}
      onNavigate={onNavigate}
      header={{ title: '设置' }}
      className={className}
    >
      <div className="relative grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
        <div role="tablist" aria-label="设置" className="flex gap-1">
          {tabs.map((item) => (
            <Button
              key={item}
              type="button"
              size="xs"
              role="tab"
              aria-selected={tab === item}
              variant={tab === item ? 'secondary' : 'ghost'}
              onClick={() => setTab(item)}
            >
              {item === 'General'
                ? '通用'
                : item === 'Members'
                  ? '成员'
                  : item === 'Billing'
                    ? '账单'
                    : 'API 密钥'}
            </Button>
          ))}
        </div>
        {tab === 'General' ? (
          <label className="grid max-w-sm gap-1">
            <Text variant="caption">工作区名称</Text>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
        ) : null}
        {tab === 'Members' ? (
          <ul className="grid gap-1">
            {[user.name, '林可'].map((member) => (
              <li
                key={member}
                className="flex items-center justify-between rounded-[var(--rui-radius)] border border-border px-2 py-1"
              >
                <Text>{member}</Text>
                <Button type="button" size="xs" variant="ghost" aria-label={`管理 ${member}`}>
                  管理
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        {tab === 'API keys' ? (
          <div className="grid max-w-lg gap-[var(--rui-content-gap)]">
            <Inline className="justify-between">
              <Text>rk_demo_****12</Text>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() =>
                  toast.success('已复制密钥', { description: '本地示例，没有真实密钥' })
                }
              >
                复制
              </Button>
            </Inline>
          </div>
        ) : null}
        {tab === 'Billing' ? (
          <div className="grid gap-[var(--rui-content-gap)]">
            <div className="grid gap-[var(--rui-content-gap)] @lg:grid-cols-2">
              <section className="grid gap-1 rounded-[var(--rui-radius)] border border-border p-[var(--rui-content-padding)]">
                <Heading size="item">当前方案</Heading>
                <Text variant="caption" tone="muted">
                  专业版 · 月付 $29
                </Text>
                <Text variant="caption">支付方式 · 尾号 4242</Text>
              </section>
              <UsageMeter
                title={workspace}
                plan="专业版"
                total={10000}
                used={[
                  { label: '对话', value: 3980 },
                  { label: '搜索', value: 1640 },
                ]}
                resetAt="2026-11-17"
              />
            </div>
            <Inline className="justify-between">
              <Heading size="item">方案比较</Heading>
              <SegmentedControl
                aria-label="计费周期"
                value={period}
                onChange={setPeriod}
                options={[
                  { value: 'month', label: '月付' },
                  { value: 'year', label: '年付' },
                ]}
              />
            </Inline>
            <ul className="grid gap-[var(--rui-content-gap)] @md:grid-cols-2">
              {plans.map((plan) => (
                <li
                  key={plan.id}
                  className="grid gap-1 rounded-[var(--rui-radius)] border border-border p-[var(--rui-content-padding)]"
                >
                  <Inline className="justify-between">
                    <Text variant="interface">{plan.name}</Text>
                    {plan.current ? <Badge variant="secondary">当前</Badge> : null}
                  </Inline>
                  <Text>
                    ${period === 'month' ? plan.price.month : plan.price.year}
                    <Text as="span" variant="caption" tone="muted">
                      {' '}
                      / {period === 'month' ? '月' : '月（年付）'}
                    </Text>
                  </Text>
                  <Button type="button" size="xs" variant={plan.current ? 'ghost' : 'default'}>
                    {plan.current ? '管理' : '升级'}
                  </Button>
                </li>
              ))}
            </ul>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[length:var(--rui-font-caption)]">
                <caption className="sr-only">发票</caption>
                <thead>
                  <tr>
                    <th className="border-b border-border py-1 font-medium">编号</th>
                    <th className="border-b border-border py-1 font-medium">日期</th>
                    <th className="border-b border-border py-1 font-medium">金额</th>
                    <th className="border-b border-border py-1 font-medium">状态</th>
                    <th className="border-b border-border py-1 font-medium">
                      <span className="sr-only">下载</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((item) => (
                    <tr key={item.id}>
                      <td className="border-b border-border py-1">{item.id}</td>
                      <td className="border-b border-border py-1">{item.date}</td>
                      <td className="border-b border-border py-1">{item.amount}</td>
                      <td className="border-b border-border py-1">{item.status}</td>
                      <td className="border-b border-border py-1">
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          aria-label={`下载 ${item.id}`}
                        >
                          下载
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        <Toaster position="bottom-right" inline />
      </div>
    </AppShell>
  );
}
