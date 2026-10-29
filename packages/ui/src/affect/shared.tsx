import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../lib/utils.js';

export type AffectAppearance = 'default' | 'clean';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  return reduced;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((word) => Array.from(word).find((char) => /[\p{L}\p{N}]/u.test(char)))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatDuration(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  if (value < 60) return `${value}s`;
  const minutes = Math.floor(value / 60);
  if (minutes < 60) return `${minutes}m ${value % 60}s`;
  const hours = Math.floor(minutes / 60);
  return hours < 24
    ? `${hours}h ${String(minutes % 60).padStart(2, '0')}m`
    : `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export function formatClock(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  const pad = (n: number) => String(n).padStart(2, '0');
  if (value >= 86400) return `${Math.floor(value / 86400)}d ${Math.floor((value % 86400) / 3600)}h`;
  if (value >= 3600)
    return `${Math.floor(value / 3600)}:${pad(Math.floor((value % 3600) / 60))}:${pad(value % 60)}`;
  return `${Math.floor(value / 60)}:${pad(value % 60)}`;
}

export function formatDollars(amount: number) {
  const digits = Math.abs(amount) >= 1 ? 2 : 3;
  return `$${amount.toFixed(digits)}`;
}

export function formatAgo(at: number, now: number) {
  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 45) return `${Math.max(1, seconds)}s 前`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.round(hours / 24)} 天前`;
}

export function useTickingNow(active: boolean, now?: number) {
  const [tick, setTick] = useState(() => now ?? Date.now());
  useEffect(() => {
    if (now != null) {
      setTick(now);
      return;
    }
    if (!active) return;
    const timer = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active, now]);
  return now ?? tick;
}

export function surfaceClass(appearance: AffectAppearance = 'default') {
  return appearance === 'clean'
    ? 'rounded-[var(--rui-radius-surface)] border border-border bg-card text-card-foreground'
    : [
        'rounded-[var(--rui-radius-surface)] bg-muted p-[var(--rui-content-gap-sm)]',
        'text-card-foreground',
      ].join(' ');
}

export function cardClass(appearance: AffectAppearance = 'default') {
  return appearance === 'clean'
    ? 'min-w-0'
    : 'min-w-0 rounded-[var(--rui-radius)] border border-border bg-card';
}

export function affectMotion(className?: string) {
  return cn(
    'transition-[color,background-color,border-color,opacity,transform,box-shadow]',
    'duration-[var(--rui-motion-duration)] ease-[var(--rui-motion-easing)]',
    'motion-reduce:transition-none',
    className,
  );
}

export type DemoNote = { children: ReactNode; className?: string };
export function AffectDemoFrame({ children, className }: DemoNote) {
  return (
    <div className={cn('grid min-w-0 max-w-xl gap-[var(--rui-content-gap)]', className)}>
      {children}
    </div>
  );
}
