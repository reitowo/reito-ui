import { useThemeColor, type ThemeColor } from '../theme.js';
import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import { cn } from '../lib/utils.js';

function Slider({
  className,
  color,
  style,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: Omit<SliderPrimitive.Root.Props, 'color'> & { color?: ThemeColor }) {
  const colorStyle = useThemeColor(color);
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];

  return (
    <SliderPrimitive.Root
      className={cn('data-horizontal:w-full data-vertical:h-full', className)}
      data-rui-color={color}
      style={
        typeof style === 'function'
          ? (state) => ({ ...colorStyle, ...style(state) })
          : { ...colorStyle, ...style }
      }
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-[var(--rui-opacity-disabled)] data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            index={index}
            aria-label={
              props['aria-label']
                ? `${props['aria-label']}${_values.length > 1 ? ` ${index + 1}` : ''}`
                : undefined
            }
            aria-labelledby={props['aria-labelledby']}
            className={cn([
              // Layout
              'relative block size-3 shrink-0',
              // Surface
              'rounded-full border border-ring bg-[var(--rui-control-thumb)] ring-ring/50',
              // Motion
              'transition-[color,box-shadow]',
              // Layout
              'select-none after:absolute after:-inset-2',
              // Pointer interaction
              'hover:ring-[length:var(--rui-outline-width)]',
              // Keyboard focus
              'focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:outline-hidden',
              // Pointer interaction
              'active:ring-[length:var(--rui-outline-width)]',
              // Disabled state
              'disabled:pointer-events-none disabled:opacity-[var(--rui-opacity-disabled)]',
            ])}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
