import { useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Heading, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { usePrefersReducedMotion } from '../shared.js';

export type GalleryItem = {
  id: string;
  name: string;
  description: string;
  colors?: [string, string];
  trigger?: string;
  steps?: string[];
  skills?: string[];
  guardrail?: string;
};
export type AgentGalleryProps = {
  title?: string;
  subtitle?: string;
  items?: GalleryItem[];
  defaultIndex?: number;
  className?: string;
};

const sample: GalleryItem[] = [
  {
    id: 'brief',
    name: '简报代理',
    description: '把本周变化收成一页可审查的说明。',
    trigger: '每周一 09:00',
    steps: ['收集差异', '对照规范', '起草简报'],
    skills: ['检索', '摘要'],
    guardrail: '不发送对外邮件',
  },
  {
    id: 'review',
    name: '审查代理',
    description: '对照清单标出风险与待确认项。',
    trigger: '打开审查队列时',
    steps: ['读取清单', '对照差异', '列出问题'],
    skills: ['核对', '引用'],
    guardrail: '不合并分支',
  },
  {
    id: 'follow',
    name: '跟进代理',
    description: '把未关闭事项排进下一次对话。',
    trigger: '会话结束后',
    steps: ['收集未决项', '分组', '写入提示'],
    skills: ['记忆', '排序'],
    guardrail: '不改客户记录',
  },
];

/** Recreated from public Agent Gallery docs. Not Pro source. Hex colors are ignored. */
export function AgentGallery({
  title,
  subtitle,
  items = sample,
  defaultIndex,
  className,
}: AgentGalleryProps) {
  const reduced = usePrefersReducedMotion();
  const start = defaultIndex ?? Math.floor(items.length / 2);
  const [index, setIndex] = useState(Math.min(items.length - 1, Math.max(0, start)));
  const current = items[index];

  function move(next: number) {
    if (!items.length) return;
    setIndex((next + items.length) % items.length);
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(index - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(index + 1);
    }
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={title ?? '代理画廊'}
      className={cn('grid min-w-0 gap-[var(--rui-content-gap)]', className)}
    >
      {title || subtitle ? (
        <Stack gap="small">
          {title ? <Heading size="section">{title}</Heading> : null}
          {subtitle ? (
            <Text variant="caption" tone="muted">
              {subtitle}
            </Text>
          ) : null}
        </Stack>
      ) : null}
      <div className="flex min-w-0 items-stretch gap-[var(--rui-content-gap-sm)]" onKeyDown={onKey}>
        {items.map((item, itemIndex) => {
          const open = itemIndex === index;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={`显示 ${item.name}`}
              aria-pressed={open}
              onClick={() => setIndex(itemIndex)}
              className={cn(
                'min-w-0 overflow-hidden rounded-[var(--rui-radius-surface)] border border-border bg-card text-left',
                open
                  ? 'flex-[2] p-[var(--rui-content-padding)]'
                  : 'flex-1 px-[var(--rui-compact-surface-padding-x)] py-[var(--rui-content-padding)] text-muted-foreground',
                !reduced && 'transition-[flex-grow] duration-[var(--rui-motion-duration-lg)]',
              )}
            >
              <Heading size="item">{item.name}</Heading>
              {open ? (
                <Stack gap="small" className="mt-[var(--rui-content-gap-sm)]">
                  <Text variant="interface">{item.description}</Text>
                  {item.trigger ? (
                    <Text variant="caption" tone="muted">
                      触发：{item.trigger}
                    </Text>
                  ) : null}
                  {item.steps?.length ? (
                    <ol className="grid gap-1 text-[length:var(--rui-font-caption)]">
                      {item.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  ) : null}
                  {item.skills?.length ? (
                    <Text variant="caption" tone="muted">
                      技能：{item.skills.join(' · ')}
                    </Text>
                  ) : null}
                  {item.guardrail ? (
                    <Text variant="caption" tone="muted">
                      护栏：{item.guardrail}
                    </Text>
                  ) : null}
                </Stack>
              ) : (
                <Text variant="caption" className="mt-1 line-clamp-3">
                  {item.description}
                </Text>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <Text variant="caption" tone="muted" aria-live="polite">
          {current ? `${current.name}：${current.description}` : null}
        </Text>
        <div className="flex gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="上一项"
            onClick={() => move(index - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="下一项"
            onClick={() => move(index + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
