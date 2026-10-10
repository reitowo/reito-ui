import { cn } from '../lib/utils.js';
import * as ResizablePrimitive from 'react-resizable-panels';

function ResizablePanelGroup({ className, ...props }: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn('flex h-full w-full aria-[orientation=vertical]:flex-col', className)}
      {...props}
    />
  );
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        [
          // Layout
          'relative flex w-px items-center justify-center',
          // Surface
          'bg-border ring-offset-background',
          // Layout
          'after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2',
          // Keyboard focus
          'focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring focus-visible:outline-hidden',
          // Component state
          'aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full',
          'aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2',
          // Child and composition rules
          '[&[aria-orientation=horizontal]>div]:rotate-90',
        ],
        className,
      )}
      {...props}
    >
      {withHandle && <div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border" />}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
