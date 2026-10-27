import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { tokenMetrics } from '@reito/tokens/metrics';
import { cn } from '../../lib/utils.js';
import { usePrefersReducedMotion } from '../shared.js';

export type TiltCardProps = {
  children: ReactNode;
  maxTilt?: number;
  glare?: boolean;
  scale?: number;
  perspective?: number;
  className?: string;
};

/** Recreated from public Tilt Card docs. Reduced motion keeps the card flat. */
export function TiltCard({
  children,
  maxTilt = 10,
  glare = true,
  scale = 1.02,
  perspective,
  className,
}: TiltCardProps) {
  const reduced = usePrefersReducedMotion();
  const depth = perspective ?? tokenMetrics['container-lg'] * 2;
  const root = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, px: 50, py: 50, hover: false });

  function move(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType === 'touch') return;
    const box = root.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((event.clientX - box.left) / box.width) * 100;
    const py = ((event.clientY - box.top) / box.height) * 100;
    setTilt({
      x: ((py - 50) / 50) * -maxTilt,
      y: ((px - 50) / 50) * maxTilt,
      px,
      py,
      hover: true,
    });
  }

  const style = {
    '--affect-tilt-x': `${tilt.x}deg`,
    '--affect-tilt-y': `${tilt.y}deg`,
    '--affect-tilt-scale': tilt.hover ? scale : 1,
    '--affect-tilt-depth': `calc(${depth} * 1px)`,
    '--affect-glare-x': `${tilt.px}%`,
    '--affect-glare-y': `${tilt.py}%`,
  } as CSSProperties;

  return (
    <div
      ref={root}
      className={cn('inline-block [perspective:var(--affect-tilt-depth)]', className)}
      style={style}
      onPointerMove={move}
      onPointerLeave={() => setTilt({ x: 0, y: 0, px: 50, py: 50, hover: false })}
    >
      <div
        className={cn(
          'relative rounded-[var(--rui-radius-surface)] border border-border bg-card shadow-sm',
          !reduced && 'origin-center transition-transform duration-[var(--rui-motion-duration)]',
        )}
        style={
          reduced
            ? undefined
            : {
                transform:
                  'rotateX(var(--affect-tilt-x)) rotateY(var(--affect-tilt-y)) scale(var(--affect-tilt-scale))',
              }
        }
      >
        {children}
        {glare && !reduced ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-40"
            style={{
              background: `radial-gradient(circle at var(--affect-glare-x) var(--affect-glare-y), var(--rui-background), transparent 55%)`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
