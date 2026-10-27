import { LoaderCircle } from 'lucide-react';
import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { Button as ReitoButton } from '../primitives/button.js';
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

const variantMap = {
  primary: 'default',
  secondary: 'outline',
  ghost: 'ghost',
  destructive: 'destructive',
} as const;

const cleanVariantMap = {
  primary: 'default',
  secondary: 'secondary',
  ghost: 'ghost',
  destructive: 'destructive',
} as const;

const sizeMap = { sm: 'sm', md: 'default', lg: 'lg' } as const;

/** Affect-shaped button API over Reito Button. Loading and icons stay local; theme comes from tokens. */
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
  const mapped = (appearance === 'clean' ? cleanVariantMap : variantMap)[tone];
  return (
    <ReitoButton
      type={type}
      variant={mapped}
      size={
        iconOnly
          ? scale === 'sm'
            ? 'icon-sm'
            : scale === 'lg'
              ? 'icon-lg'
              : 'icon'
          : sizeMap[scale]
      }
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-appearance={appearance}
      className={cn(className)}
      {...rest}
    >
      {loading ? (
        <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
      ) : (
        icon
      )}
      {hasLabel ? <span className="min-w-0 truncate">{children}</span> : null}
      {!loading ? iconRight : null}
    </ReitoButton>
  );
}
