import { Fragment, useState, type KeyboardEvent, type ReactNode } from 'react';
import { LoaderCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '../primitives/button.js';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '../primitives/dropdown-menu.js';
import { Separator } from '../primitives/separator.js';
import { cx } from './shared.js';

export type ToolbarSize = 'xs' | 'sm';
export type ToolbarOverflow = 'scroll' | 'menu';
export type ToolbarItemKind = 'action' | 'toggle';
export type ToolbarItemOverflow = 'auto' | 'never' | 'always';

export interface ToolbarItem {
  id: string;
  label: ReactNode;
  /** Plain text for accessible names, titles, menu typeahead and loading announcements. */
  textValue?: string;
  icon?: ReactNode;
  kind?: ToolbarItemKind;
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  onSelect?: () => void;
  disabled?: boolean;
  loading?: boolean;
  shortcut?: string;
  showLabel?: boolean;
  variant?: 'default' | 'ghost' | 'destructive';
  /** `never` remains on the bar; `always` stays in the menu when menu overflow is active. */
  overflow?: ToolbarItemOverflow;
}

export interface ToolbarGroup {
  id: string;
  label: string;
  items: readonly ToolbarItem[];
}

export interface ToolbarProps {
  label: string;
  groups: readonly ToolbarGroup[];
  size?: ToolbarSize;
  showLabels?: boolean;
  disabled?: boolean;
  overflow?: ToolbarOverflow;
  /** Maximum `auto` items shown in menu mode after space is reserved for `never` items. */
  maxVisibleItems?: number;
  overflowLabel?: string;
  status?: ReactNode;
  onItemSelect?: (item: ToolbarItem) => void;
  className?: string;
  contentClassName?: string;
}

type PlacedGroup = ToolbarGroup & { items: ToolbarItem[] };

function textValue(item: ToolbarItem) {
  return item.textValue ?? (typeof item.label === 'string' ? item.label : undefined);
}

function placeItems(groups: readonly ToolbarGroup[], overflow: ToolbarOverflow, maxVisibleItems: number) {
  if (overflow === 'scroll') {
    return { visible: groups.map(group => ({ ...group, items: [...group.items] })), hidden: [] as PlacedGroup[] };
  }

  const neverCount = groups.flatMap(group => group.items).filter(item => item.overflow === 'never').length;
  let automaticSlots = Math.max(0, Math.floor(maxVisibleItems) - neverCount);
  const visible: PlacedGroup[] = [];
  const hidden: PlacedGroup[] = [];

  for (const group of groups) {
    const visibleItems: ToolbarItem[] = [];
    const hiddenItems: ToolbarItem[] = [];
    for (const item of group.items) {
      if (item.overflow === 'never') visibleItems.push(item);
      else if (item.overflow === 'always') hiddenItems.push(item);
      else if (automaticSlots > 0) {
        visibleItems.push(item);
        automaticSlots -= 1;
      } else hiddenItems.push(item);
    }
    if (visibleItems.length) visible.push({ ...group, items: visibleItems });
    if (hiddenItems.length) hidden.push({ ...group, items: hiddenItems });
  }
  return { visible, hidden };
}

function isUnavailable(item: ToolbarItem, disabled: boolean) {
  return disabled || Boolean(item.disabled) || Boolean(item.loading);
}

/** A compact desktop command bar with groups, toggle state, reachable overflow and roving focus. */
export function Toolbar({
  label,
  groups,
  size = 'xs',
  showLabels = false,
  disabled = false,
  overflow = 'scroll',
  maxVisibleItems = 4,
  overflowLabel = '更多操作',
  status,
  onItemSelect,
  className,
  contentClassName,
}: ToolbarProps) {
  const placed = placeItems(groups, overflow, maxVisibleItems);
  const firstEnabledId = placed.visible.flatMap(group => group.items).find(item => !isUnavailable(item, disabled))?.id;
  const [focusedId, setFocusedId] = useState<string | undefined>(firstEnabledId);
  const visibleIds = new Set(placed.visible.flatMap(group => group.items).filter(item => !isUnavailable(item, disabled)).map(item => item.id));
  const overflowTriggerId = '__toolbar-overflow__';
  const tabStopId = focusedId && (visibleIds.has(focusedId) || (focusedId === overflowTriggerId && placed.hidden.length))
    ? focusedId
    : firstEnabledId ?? (placed.hidden.length ? overflowTriggerId : undefined);

  function activate(item: ToolbarItem) {
    if (isUnavailable(item, disabled)) return;
    if (item.kind === 'toggle') item.onPressedChange?.(!item.pressed);
    item.onSelect?.();
    onItemSelect?.(item);
  }

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    if (!(event.target instanceof HTMLButtonElement) || event.target.dataset.toolbarRoving !== 'true') return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button[data-toolbar-roving="true"]:not(:disabled)'))
      .filter(button => button.getClientRects().length > 0);
    const current = buttons.indexOf(event.target);
    if (current < 0 || !buttons.length) return;
    event.preventDefault();
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = event.key === 'ArrowRight' ? !rtl : rtl;
    const next = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? buttons.length - 1
        : (current + (forward ? 1 : -1) + buttons.length) % buttons.length;
    const button = buttons[next];
    button?.focus();
    button?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function buttonFor(item: ToolbarItem) {
    const name = textValue(item);
    const itemDisabled = isUnavailable(item, disabled);
    const revealLabel = item.showLabel ?? (showLabels || !item.icon);
    return <Button
      key={item.id}
      type="button"
      data-toolbar-item={item.id}
      data-toolbar-roving="true"
      size={revealLabel ? size : size === 'xs' ? 'icon-xs' : 'icon-sm'}
      variant={item.kind === 'toggle' && item.pressed ? 'secondary' : item.variant ?? 'ghost'}
      disabled={itemDisabled}
      aria-label={name}
      aria-pressed={item.kind === 'toggle' ? Boolean(item.pressed) : undefined}
      aria-keyshortcuts={item.shortcut}
      aria-busy={item.loading || undefined}
      title={name && item.shortcut ? `${name}（${item.shortcut}）` : name}
      tabIndex={itemDisabled ? -1 : tabStopId === item.id ? 0 : -1}
      onFocus={() => setFocusedId(item.id)}
      onClick={() => activate(item)}
    >
      {item.loading ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : item.icon}
      {revealLabel && <span className="truncate">{item.label}</span>}
    </Button>;
  }

  return <div
    data-slot="toolbar"
    data-size={size}
    data-overflow={overflow}
    role="toolbar"
    aria-label={label}
    aria-orientation="horizontal"
    aria-disabled={disabled || undefined}
    className={cx('flex min-w-0 items-center gap-[var(--rui-space-1)] rounded-lg border border-border bg-muted/30 p-[var(--rui-space-1)]', className)}
    onKeyDown={navigate}
  >
    <div data-slot="toolbar-items" className={cx('flex min-w-0 items-center gap-[var(--rui-space-1)]', overflow === 'scroll' && 'overflow-x-auto', contentClassName)}>
      {placed.visible.map((group, groupIndex) => <Fragment key={group.id}>
        {groupIndex > 0 && <Separator orientation="vertical" className="h-[var(--rui-space-4)] shrink-0" />}
        <div role="group" aria-label={group.label} className="flex shrink-0 items-center gap-[var(--rui-space-1)]">
          {group.items.map(buttonFor)}
        </div>
      </Fragment>)}
    </div>
    {placed.hidden.length > 0 && <DropdownMenu>
      <DropdownMenuTrigger render={<Button
        type="button"
        data-toolbar-roving="true"
        size={size === 'xs' ? 'icon-xs' : 'icon-sm'}
        variant="ghost"
        aria-label={overflowLabel}
        title={overflowLabel}
        disabled={disabled}
        tabIndex={disabled ? -1 : tabStopId === overflowTriggerId ? 0 : -1}
        onFocus={() => setFocusedId(overflowTriggerId)}
      />}>
        <MoreHorizontal aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-max">
        {placed.hidden.map((group, groupIndex) => <Fragment key={group.id}>
          {groupIndex > 0 && <DropdownMenuSeparator />}
          <DropdownMenuGroup>
            <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
            {group.items.map(item => {
              const name = textValue(item);
              const itemDisabled = isUnavailable(item, disabled);
              const content = <>
                {item.loading ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : item.icon}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
              </>;
              return item.kind === 'toggle'
                ? <DropdownMenuCheckboxItem
                    key={item.id}
                    data-toolbar-item={item.id}
                    checked={Boolean(item.pressed)}
                    disabled={itemDisabled}
                    label={name}
                    aria-keyshortcuts={item.shortcut}
                    aria-busy={item.loading || undefined}
                    onCheckedChange={() => activate(item)}
                  >{content}</DropdownMenuCheckboxItem>
                : <DropdownMenuItem
                    key={item.id}
                    data-toolbar-item={item.id}
                    disabled={itemDisabled}
                    variant={item.variant === 'destructive' ? 'destructive' : 'default'}
                    label={name}
                    aria-keyshortcuts={item.shortcut}
                    aria-busy={item.loading || undefined}
                    onClick={() => activate(item)}
                  >{content}</DropdownMenuItem>;
            })}
          </DropdownMenuGroup>
        </Fragment>)}
      </DropdownMenuContent>
    </DropdownMenu>}
    {status && <div data-slot="toolbar-status" className="ml-auto shrink-0 px-[var(--rui-space-1)] text-xs text-muted-foreground">{status}</div>}
  </div>;
}
