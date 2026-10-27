import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { usePrefersReducedMotion } from '../shared.js';

export type MarqueeLogo = {
  name: string;
  svg?: ReactNode;
  src?: string;
  color?: string;
  scale?: number;
  href?: string;
};
export type LogoMarqueeProps = {
  logos: MarqueeLogo[];
  speed?: number;
  direction?: 'left' | 'right';
  rows?: 1 | 2;
  gap?: number;
  pauseOnHover?: boolean;
  grayscale?: boolean;
  labels?: 'none' | 'below' | 'beside';
  label?: string;
  className?: string;
};

function LogoMark({
  logo,
  grayscale,
  labels,
}: {
  logo: MarqueeLogo;
  grayscale: boolean;
  labels: LogoMarqueeProps['labels'];
}) {
  const mark =
    logo.svg ??
    (logo.src ? (
      <img src={logo.src} alt="" className="h-[var(--rui-control-height-sm)] w-auto" />
    ) : (
      <span className="font-medium">{logo.name.slice(0, 1)}</span>
    ));
  const body = (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-muted-foreground',
        grayscale && 'grayscale hover:grayscale-0 focus-visible:grayscale-0',
        labels === 'below' && 'flex-col',
      )}
      style={{ color: logo.color, transform: logo.scale ? `scale(${logo.scale})` : undefined }}
    >
      {mark}
      {labels !== 'none' ? (
        <span className="text-[length:var(--rui-font-caption)]">{logo.name}</span>
      ) : null}
    </span>
  );
  if (logo.href) {
    return (
      <a
        href={logo.href}
        className="rounded-[var(--rui-radius)] focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring"
      >
        {body}
      </a>
    );
  }
  return body;
}

/** Endless trusted-by strip. Reduced motion shows a wrapping static row. */
export function LogoMarquee({
  logos,
  speed = 40,
  direction = 'left',
  rows = 1,
  gap,
  pauseOnHover = true,
  grayscale = true,
  labels = 'none',
  label = '合作品牌',
  className,
}: LogoMarqueeProps) {
  const reduced = usePrefersReducedMotion();
  const split =
    rows === 2
      ? [logos.filter((_, index) => index % 2 === 0), logos.filter((_, index) => index % 2 === 1)]
      : [logos];
  const duration = `${Math.max(8, Math.round(80 / Math.max(8, speed)))}s`;

  return (
    <section
      aria-label={label}
      className={cn('grid min-w-0 gap-[var(--rui-content-gap)] overflow-hidden', className)}
    >
      {split.map((row, index) => {
        const reverse = (direction === 'right') !== (index === 1);
        const style = {
          '--affect-marquee-duration': duration,
          gap: gap ? `calc(${gap} * var(--rui-space-1) / 4)` : 'var(--rui-content-gap)',
        } as CSSProperties;
        if (reduced) {
          return (
            <div key={index} className="flex flex-wrap items-center justify-center" style={style}>
              {row.map((logo) => (
                <LogoMark key={logo.name} logo={logo} grayscale={grayscale} labels={labels} />
              ))}
            </div>
          );
        }
        return (
          <div
            key={index}
            className={cn(
              'flex overflow-hidden',
              pauseOnHover && 'hover:[&_[data-track]]:[animation-play-state:paused]',
            )}
          >
            <div
              data-track=""
              className={cn(
                'flex min-w-max items-center',
                reverse
                  ? 'animate-[affect-marquee-reverse_var(--affect-marquee-duration)_linear_infinite]'
                  : 'animate-[affect-marquee_var(--affect-marquee-duration)_linear_infinite]',
              )}
              style={style}
            >
              {[...row, ...row].map((logo, logoIndex) => (
                <span key={`${logo.name}-${logoIndex}`} className="px-[var(--rui-content-gap)]">
                  <LogoMark logo={logo} grayscale={grayscale} labels={labels} />
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
