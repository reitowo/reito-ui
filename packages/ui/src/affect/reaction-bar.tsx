import { Heart, MessageCircle, Repeat2, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../primitives/button.js';
import { cn } from '../lib/utils.js';
import { NumberTicker } from './motion/number-ticker.js';

export type ReactionKey = 'like' | 'comment' | 'repost' | 'share';
export type ReactionState = { count: number; active?: boolean };
export type ReactionBarProps = {
  reactions?: Partial<Record<ReactionKey, ReactionState>>;
  onReact?: (key: ReactionKey, state: Required<ReactionState>) => void;
  actions?: ReactionKey[];
  className?: string;
};

const labels: Record<ReactionKey, [string, string]> = {
  like: ['喜欢', '喜欢'],
  comment: ['评论', '评论'],
  repost: ['转发', '转发'],
  share: ['分享', '分享'],
};
const icons = { like: Heart, comment: MessageCircle, repost: Repeat2, share: Share2 };
const clean = (n: unknown) =>
  typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;

/** Social action pill. Counts roll through NumberTicker. */
export function ReactionBar({
  reactions,
  onReact,
  actions = ['like', 'comment', 'repost', 'share'],
  className,
}: ReactionBarProps) {
  const [state, setState] = useState<Record<ReactionKey, Required<ReactionState>>>(() => {
    const next = {} as Record<ReactionKey, Required<ReactionState>>;
    for (const key of actions) {
      next[key] = {
        count: clean(reactions?.[key]?.count),
        active: Boolean(reactions?.[key]?.active),
      };
    }
    return next;
  });

  function toggle(key: ReactionKey) {
    setState((current) => {
      const item = current[key] ?? { count: 0, active: false };
      const next = {
        ...current,
        [key]: { active: !item.active, count: Math.max(0, item.count + (item.active ? -1 : 1)) },
      };
      onReact?.(key, next[key]);
      return next;
    });
  }

  return (
    <div
      role="group"
      aria-label="反应"
      className={cn(
        'inline-flex flex-wrap items-center rounded-full border border-border bg-card p-0.5',
        className,
      )}
    >
      {actions.map((key) => {
        const Icon = icons[key];
        const item = state[key] ?? { count: 0, active: false };
        const [idle, active] = labels[key];
        return (
          <Button
            key={key}
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={item.active}
            aria-label={`${item.active ? active : idle} ${item.count}`}
            onClick={() => toggle(key)}
            className={cn('rounded-full', item.active && 'text-accent')}
          >
            <Icon
              className={cn('size-3.5', item.active && key === 'like' && 'fill-current')}
              aria-hidden="true"
            />
            <NumberTicker value={item.count} className="tabular-nums" />
          </Button>
        );
      })}
    </div>
  );
}
