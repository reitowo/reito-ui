import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { LoaderCircle } from 'lucide-react';
import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '../lib/utils.js';
import { type AffectAppearance } from './shared.js';

const variants = ['primary', 'secondary', 'ghost', 'destructive'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

export type AffectButtonProps = Omit<ComponentPropsWithRef<'button'>, 'color'> & {
  variant?: (typeof variants)[number];
  size?: (typeof sizes)[number];
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  appearance?: AffectAppearance;
};

/** Public MIT Button surface on --rui-* tokens. Not a Reito Button alias. */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  appearance = 'default',
  children,
  className,
  disabled,
  type = 'button',
  ...rest
}: AffectButtonProps) {
  const tone = variants.includes(variant) ? variant : 'primary';
  const scale = sizes.includes(size) ? size : 'md';
  const hasLabel = children != null && children !== false && children !== '';
  const iconOnly = !hasLabel && Boolean(icon || iconRight);
  const text = typeof children === 'string' ? children : undefined;
  return (
    <ButtonPrimitive
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-slot="affect-button"
      data-rui-affect-button=""
      data-variant={tone}
      data-size={scale}
      data-loading={loading || undefined}
      data-icon-only={iconOnly || undefined}
      data-appearance={appearance}
      className={cn('affect-button font-medium', className)}
      {...rest}
    >
      {icon || loading ? (
        <span className="affect-button__icon" aria-hidden="true">
          {loading ? <LoaderCircle className="affect-button__spinner" /> : icon}
        </span>
      ) : null}
      {hasLabel ? (
        <span className="affect-button__label" data-text={text}>
          {children}
        </span>
      ) : null}
      {!loading && iconRight ? (
        <span className="affect-button__icon" aria-hidden="true">
          {iconRight}
        </span>
      ) : null}
    </ButtonPrimitive>
  );
}
