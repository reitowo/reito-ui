import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "../lib/utils.js"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[length:var(--rui-outline-width)] aria-invalid:ring-destructive/20 data-[size=default]:h-[var(--rui-switch-height)] data-[size=default]:w-[var(--rui-switch-width)] data-[size=sm]:h-[var(--rui-switch-height-sm)] data-[size=sm]:w-[var(--rui-switch-width-sm)] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-[var(--rui-opacity-disabled)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(var(--rui-switch-width)-var(--rui-space-4)-2*var(--rui-border-width))] group-data-[size=sm]/switch:data-checked:translate-x-[calc(var(--rui-switch-width-sm)-var(--rui-space-3)-2*var(--rui-border-width))] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
