import { Star } from 'lucide-react';
import { Heading, Stack, Text } from '../../basic/composition.js';
import { Avatar, AvatarFallback, AvatarImage } from '../../primitives/avatar.js';
import { cn } from '../../lib/utils.js';
import { initials, usePrefersReducedMotion } from '../shared.js';

export type Testimonial = {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  verified?: boolean;
};
export type TestimonialWallProps = {
  items: Testimonial[];
  columns?: 1 | 2 | 3;
  speed?: number;
  pauseOnHover?: boolean;
  label?: string;
  className?: string;
};

function Card({ item }: { item: Testimonial }) {
  return (
    <article className="rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]">
      <Stack gap="small">
        {item.rating ? (
          <p className="flex gap-0.5 text-muted-foreground" aria-label={`${item.rating} 星`}>
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={cn('size-3', index < item.rating! && 'fill-current')}
                aria-hidden="true"
              />
            ))}
          </p>
        ) : null}
        <Text variant="interface">“{item.quote}”</Text>
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {item.avatar ? <AvatarImage src={item.avatar} alt="" /> : null}
            <AvatarFallback>{initials(item.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Heading size="item">
              {item.name}
              {item.verified ? <span className="ml-1 text-muted-foreground">✓</span> : null}
            </Heading>
            <Text variant="caption" tone="muted">
              {[item.role, item.company].filter(Boolean).join(' · ')}
            </Text>
          </div>
        </div>
      </Stack>
    </article>
  );
}

/** Landing-page quote wall. Reduced motion shows a static wrapping grid. */
export function TestimonialWall({
  items,
  columns = 3,
  speed = 24,
  pauseOnHover = true,
  label = '用户评价',
  className,
}: TestimonialWallProps) {
  const reduced = usePrefersReducedMotion();
  const cols = Math.min(3, Math.max(1, columns));
  const buckets = Array.from({ length: cols }, (_, index) =>
    items.filter((_, itemIndex) => itemIndex % cols === index),
  );
  const duration = `${Math.max(12, Math.round(120 / Math.max(8, speed)))}s`;

  if (reduced) {
    return (
      <section
        aria-label={label}
        className={cn(
          'grid grid-cols-[repeat(auto-fit,minmax(min(100%,var(--rui-container-xs)),1fr))] gap-[var(--rui-content-gap)]',
          className,
        )}
      >
        {items.map((item) => (
          <Card key={`${item.name}-${item.quote}`} item={item} />
        ))}
      </section>
    );
  }

  return (
    <section
      aria-label={label}
      className={cn(
        'grid max-h-[var(--rui-container-lg)] grid-cols-[repeat(auto-fit,minmax(min(100%,var(--rui-container-xs)),1fr))] gap-[var(--rui-content-gap)] overflow-hidden',
        className,
      )}
    >
      {buckets.map((bucket, index) => (
        <div
          key={index}
          className={cn(
            'overflow-hidden',
            pauseOnHover && 'hover:[&_[data-col]]:[animation-play-state:paused]',
          )}
          style={{
            maskImage: 'linear-gradient(transparent, CanvasText 10%, CanvasText 90%, transparent)',
          }}
        >
          <div
            data-col=""
            className={cn(
              'grid gap-[var(--rui-content-gap)]',
              index % 2
                ? 'animate-[affect-column_calc(var(--affect-col-duration)*1.1)_linear_infinite_reverse]'
                : 'animate-[affect-column_var(--affect-col-duration)_linear_infinite]',
            )}
            style={{ '--affect-col-duration': duration } as never}
          >
            {[...bucket, ...bucket].map((item, itemIndex) => (
              <Card key={`${item.name}-${itemIndex}`} item={item} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
