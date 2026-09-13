import { tokenMetrics } from "@reito/tokens/metrics"
import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "../lib/utils.js"

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverClose({ ...props }: PopoverPrimitive.Close.Props) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />
}

function PopoverContent({
  className,
  variant = "default",
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = tokenMetrics["space-1"],
  ...props
}: PopoverPrimitive.Popup.Props & { variant?: "default" | "list" } &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-[var(--rui-z-popover)]"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          data-variant={variant}
          className={cn(
            "z-[var(--rui-z-popover)] flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-[var(--rui-duration-fast)] data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            variant === "list" && "w-max max-w-[var(--available-width)] max-h-[var(--available-height)] gap-0 p-1",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

/** Read-only evidence, not an action menu or a selectable listbox. */
function PopoverList({ className, tabIndex = 0, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="popover-list"
      tabIndex={tabIndex}
      className={cn("m-0 min-h-0 min-w-0 list-none overflow-auto overscroll-contain p-0 outline-none focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring", className)}
      {...props}
    />
  )
}

function PopoverListItem({
  className,
  children,
  metadata,
  layout = "inline",
  ...props
}: React.ComponentProps<"li"> & {
  metadata?: React.ReactNode
  layout?: "inline" | "stacked"
}) {
  return (
    <li
      data-slot="popover-list-item"
      data-layout={layout}
      className={cn(
        "flex min-w-0 gap-2 px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-sm leading-normal",
        layout === "inline" ? "items-center" : "flex-col items-start gap-1",
        className
      )}
      {...props}
    >
      <span data-slot="popover-list-label" className={layout === "inline" ? "min-w-0 flex-1 truncate" : "min-w-0 max-w-full whitespace-normal break-words"}>{children}</span>
      {metadata != null && <span data-slot="popover-list-metadata" className={cn("text-muted-foreground", layout === "inline" ? "shrink-0 whitespace-nowrap tabular-nums" : "max-w-full whitespace-normal break-words")}>{metadata}</span>}
    </li>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverList,
  PopoverListItem,
  PopoverTitle,
  PopoverTrigger,
}
