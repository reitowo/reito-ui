import { useState } from 'react';
import { Heading, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { NumberTicker } from '../motion/number-ticker.js';
import { SegmentedControl } from '../segmented-control.js';

export type PricingFeature = { label: string; included?: boolean };
export type PricingPlan = {
  id?: string;
  name: string;
  monthly: number;
  yearly: number;
  limits?: string[];
  sync?: string;
  features?: PricingFeature[];
  highlighted?: boolean;
  onSelect?: () => void;
};
export type PricingPlansProps = {
  plans?: PricingPlan[];
  title?: string;
  subtitle?: string;
  defaultBilling?: 'monthly' | 'yearly';
  currency?: string;
  className?: string;
};

const samplePlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 19,
    yearly: 15,
    limits: ['3 个工作区', '基础审查'],
    features: [
      { label: '本地示例目录', included: true },
      { label: '优先支持', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 49,
    yearly: 39,
    limits: ['无限工作区', '代理队列'],
    sync: '年度可省 20%',
    highlighted: true,
    features: [
      { label: '本地示例目录', included: true },
      { label: '优先支持', included: true },
    ],
  },
  {
    id: 'team',
    name: 'Team',
    monthly: 99,
    yearly: 79,
    limits: ['席位管理', '审计导出'],
    features: [
      { label: '本地示例目录', included: true },
      { label: '优先支持', included: true },
    ],
  },
];

/** Recreated from public Pricing Plans docs. Not Pro source. */
export function PricingPlans({
  plans = samplePlans,
  title = 'Choose your plan',
  subtitle,
  defaultBilling = 'yearly',
  currency = '$',
  className,
}: PricingPlansProps) {
  const [billing, setBilling] = useState(defaultBilling);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className={cn('grid min-w-0 gap-[var(--rui-content-gap)]', className)}>
      <Stack gap="small" className="justify-items-center text-center">
        <Heading size="section">{title}</Heading>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
        <SegmentedControl
          aria-label="计费周期"
          value={billing}
          onChange={setBilling}
          options={[
            { value: 'monthly', label: '月付' },
            { value: 'yearly', label: '年付' },
          ]}
        />
      </Stack>
      <div className="grid gap-[var(--rui-content-gap)] @lg:grid-cols-3">
        {plans.map((plan) => {
          const price = billing === 'yearly' ? plan.yearly : plan.monthly;
          const details = open === (plan.id ?? plan.name);
          return (
            <article
              key={plan.id ?? plan.name}
              className={cn(
                'grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
                plan.highlighted && 'border-accent',
              )}
            >
              <Heading size="item">{plan.name}</Heading>
              {plan.sync ? <Badge variant="secondary">{plan.sync}</Badge> : null}
              <p className="text-[length:var(--rui-font-heading)]">
                {currency}
                <NumberTicker value={price} format={{ maximumFractionDigits: 0 }} />
                <Text as="span" variant="caption" tone="muted">
                  /{billing === 'yearly' ? '月 · 年付' : '月'}
                </Text>
              </p>
              <ul className="grid gap-1">
                {plan.limits?.map((item) => (
                  <li key={item}>
                    <Text variant="caption">{item}</Text>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant={plan.highlighted ? 'default' : 'outline'}
                onClick={plan.onSelect}
              >
                选择 {plan.name}
              </Button>
              <Button
                type="button"
                size="xs"
                variant="ghost"
                aria-expanded={details}
                onClick={() => setOpen(details ? null : (plan.id ?? plan.name))}
              >
                {details ? '收起细节' : '查看细节'}
              </Button>
              <ul
                className={cn('grid gap-1', !details && 'hidden')}
                inert={!details ? true : undefined}
              >
                {plan.features?.map((feature) => (
                  <li key={feature.label}>
                    <Text variant="caption" tone={feature.included === false ? 'muted' : undefined}>
                      {feature.included === false ? `${feature.label}（未包含）` : feature.label}
                    </Text>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
