import type { ComponentProps, MouseEventHandler, ReactNode } from 'react';
import { ChevronDown, LoaderCircle } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { ButtonGroup } from '../primitives/button-group.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '../primitives/dropdown-menu.js';
import { cx } from './shared.js';

export type SplitButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type SplitButtonSize = 'xs' | 'sm' | 'default' | 'lg';

export interface SplitButtonItem {
  id: string;
  label: ReactNode;
  /** Plain text used by menu typeahead when label is not a string. */
  textValue?: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'destructive';
  closeOnSelect?: boolean;
  onSelect?: () => void;
}

export interface SplitButtonProps {
  label: ReactNode;
  items: readonly SplitButtonItem[];
  onAction: MouseEventHandler<HTMLButtonElement>;
  onItemSelect?: (item: SplitButtonItem) => void;
  variant?: SplitButtonVariant;
  size?: SplitButtonSize;
  disabled?: boolean;
  actionDisabled?: boolean;
  menuDisabled?: boolean;
  loading?: boolean;
  menuLoading?: boolean;
  actionLabel?: string;
  menuLabel?: string;
  groupLabel?: string;
  actionShortcut?: string;
  menuShortcut?: string;
  emptyLabel?: ReactNode;
  loadingLabel?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: ComponentProps<typeof DropdownMenu>['onOpenChange'];
  side?: ComponentProps<typeof DropdownMenuContent>['side'];
  align?: ComponentProps<typeof DropdownMenuContent>['align'];
  className?: string;
  contentClassName?: string;
}

const menuButtonSize: Record<SplitButtonSize, ComponentProps<typeof Button>['size']> = {
  xs: 'icon-xs',
  sm: 'icon-sm',
  default: 'icon',
  lg: 'icon-lg',
};

/** A primary command paired with a keyboard-accessible menu of related commands. */
export function SplitButton({
  label,
  items,
  onAction,
  onItemSelect,
  variant = 'default',
  size = 'default',
  disabled = false,
  actionDisabled = false,
  menuDisabled = false,
  loading = false,
  menuLoading = false,
  actionLabel,
  menuLabel = '更多操作',
  groupLabel = '拆分操作',
  actionShortcut,
  menuShortcut,
  emptyLabel = '没有更多操作',
  loadingLabel = '正在加载操作…',
  open,
  defaultOpen,
  onOpenChange,
  side = 'bottom',
  align = 'end',
  className,
  contentClassName,
}: SplitButtonProps) {
  const actionUnavailable = disabled || actionDisabled || loading;
  const menuUnavailable = disabled || menuDisabled;

  return (
    <DropdownMenu
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      disabled={menuUnavailable}
    >
      <ButtonGroup
        data-slot="split-button"
        data-loading={loading || menuLoading || undefined}
        aria-label={groupLabel}
        className={className}
      >
        <Button
          type="button"
          variant={variant}
          size={size}
          disabled={actionUnavailable}
          aria-label={actionLabel}
          aria-keyshortcuts={actionShortcut}
          aria-busy={loading || undefined}
          onClick={onAction}
        >
          {loading && <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />}
          {label}
        </Button>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant={variant}
              size={menuButtonSize[size]}
              disabled={menuUnavailable}
              aria-label={menuLabel}
              title={menuLabel}
              aria-keyshortcuts={menuShortcut}
              aria-busy={menuLoading || undefined}
              className="relative before:absolute before:inset-y-1 before:left-0 before:border-l before:border-current before:opacity-20"
            />
          }
        >
          {menuLoading
            ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
            : <ChevronDown aria-hidden="true" />}
        </DropdownMenuTrigger>
      </ButtonGroup>
      <DropdownMenuContent side={side} align={align} className={cx('w-max', contentClassName)}>
        {menuLoading ? (
          <DropdownMenuItem disabled label={typeof loadingLabel === 'string' ? loadingLabel : undefined}>
            <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
            <span role="status">{loadingLabel}</span>
          </DropdownMenuItem>
        ) : items.length === 0 ? (
          <DropdownMenuItem disabled label={typeof emptyLabel === 'string' ? emptyLabel : undefined}>
            {emptyLabel}
          </DropdownMenuItem>
        ) : items.map(item => {
          const itemUnavailable = item.disabled || item.loading;
          const textValue = item.textValue ?? (typeof item.label === 'string' ? item.label : undefined);
          return (
            <DropdownMenuItem
              key={item.id}
              data-split-button-item={item.id}
              disabled={itemUnavailable}
              variant={item.variant}
              label={textValue}
              aria-label={item.loading && textValue ? `${textValue}，正在执行` : undefined}
              aria-keyshortcuts={item.shortcut}
              aria-busy={item.loading || undefined}
              closeOnClick={item.closeOnSelect}
              onClick={() => {
                if (itemUnavailable) return;
                item.onSelect?.();
                onItemSelect?.(item);
              }}
            >
              {item.loading
                ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
                : item.icon}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
