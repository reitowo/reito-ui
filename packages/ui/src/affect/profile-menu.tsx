import type { ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../basic/composition.js';
import { Avatar, AvatarFallback, AvatarImage } from '../primitives/avatar.js';
import { Button } from '../primitives/button.js';
import { Progress } from '../primitives/progress.js';
import { cn } from '../lib/utils.js';
import { cardClass, initials, surfaceClass, type AffectAppearance } from './shared.js';

export type ProfileMenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string;
  onSelect?: () => void;
};
export type ProfileSetup = {
  done: number;
  total: number;
  next?: string;
  onContinue?: () => void;
};
export type ProfileMenuProps = {
  name: string;
  email: string;
  avatar?: ReactNode;
  items?: ProfileMenuItem[];
  setup?: ProfileSetup;
  appearance?: AffectAppearance;
  className?: string;
};

const defaultItems: ProfileMenuItem[] = [
  { id: 'settings', label: '账户设置' },
  { id: 'billing', label: '账单' },
  { id: 'sign-out', label: '退出' },
];

/** Account card with user, actions and optional setup progress. */
export function ProfileMenu({
  name,
  email,
  avatar,
  items = defaultItems,
  setup,
  appearance = 'default',
  className,
}: ProfileMenuProps) {
  const percent = setup && setup.total > 0 ? Math.round((setup.done / setup.total) * 100) : 0;
  return (
    <section aria-label={`${name} 的账户`} className={cn(surfaceClass(appearance), className)}>
      <Stack className={cn(cardClass(appearance), 'p-[var(--rui-content-padding)]')}>
        <Inline>
          {avatar ?? (
            <Avatar>
              <AvatarImage alt="" />
              <AvatarFallback>{initials(name)}</AvatarFallback>
            </Avatar>
          )}
          <Stack gap="none">
            <Heading size="item">{name}</Heading>
            <Text variant="caption" tone="muted">
              {email}
            </Text>
          </Stack>
        </Inline>
        <div className="grid">
          {items.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              className="justify-start"
              onClick={item.onSelect}
            >
              {item.icon}
              <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
              {item.badge ? (
                <span className="text-[length:var(--rui-font-caption)] text-muted-foreground">
                  {item.badge}
                </span>
              ) : null}
            </Button>
          ))}
        </div>
        {setup ? (
          <Stack gap="small">
            <Inline className="justify-between">
              <Text as="span" variant="caption" tone="muted">
                资料完成 {setup.done} / {setup.total}
              </Text>
              <Text as="span" variant="caption" tone="muted">
                {percent}%
              </Text>
            </Inline>
            <Progress value={percent} aria-label="资料完成进度" />
            {setup.next && setup.onContinue ? (
              <Button type="button" size="sm" variant="outline" onClick={setup.onContinue}>
                继续：{setup.next}
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </section>
  );
}
