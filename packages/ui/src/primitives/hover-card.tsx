import { ThemePortalScope } from '../theme.js';
import { tokenMetrics } from '@reito/tokens/metrics';
import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card';
import { popupMotionClassName } from '../lib/state.js';
import { cn } from '../lib/utils.js';

function HoverCard({ ...props }: PreviewCardPrimitive.Root.Props) {
  return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({ ...props }: PreviewCardPrimitive.Trigger.Props) {
  return <PreviewCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

function HoverCardContent({
  className,
  side = 'bottom',
  sideOffset = tokenMetrics['space-1'],
  align = 'center',
  alignOffset = tokenMetrics['space-1'],
  ...props
}: PreviewCardPrimitive.Popup.Props &
  Pick<PreviewCardPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
  return (
    <PreviewCardPrimitive.Portal data-slot="hover-card-portal">
      <ThemePortalScope>
        <PreviewCardPrimitive.Positioner
          align={align}
          alignOffset={alignOffset}
          side={side}
          sideOffset={sideOffset}
          className="isolate z-[var(--rui-z-popover)]"
        >
          <PreviewCardPrimitive.Popup
            data-slot="hover-card-content"
            className={cn(
              [
                // Layout
                'z-[var(--rui-z-popover)] w-64 origin-(--transform-origin)',
                // Surface
                'rounded-lg bg-popover',
                // Spacing
                'px-[var(--rui-compact-surface-padding-x)] py-[var(--rui-compact-surface-padding-y)]',
                // Typography
                'text-sm text-popover-foreground',
                // Surface
                'shadow-md ring-1 ring-foreground/10 outline-hidden',
                // Motion
                popupMotionClassName,
              ],
              className,
            )}
            {...props}
          />
        </PreviewCardPrimitive.Positioner>
      </ThemePortalScope>
    </PreviewCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
