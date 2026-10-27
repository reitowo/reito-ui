import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { tokenMetrics } from '@reito/tokens/metrics';
import { Folder } from 'lucide-react';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { Label } from '../../primitives/label.js';
import { cn } from '../../lib/utils.js';
import { Text } from '../../basic/composition.js';
import { usePrefersReducedMotion } from '../shared.js';
import { IllustrationFrame, Mark } from './frame.js';

export type GlassFolderProps = { label?: string; className?: string };
/** Recreated from public Glass Folder docs. Generic marks only. */
export function GlassFolder({
  label = '磨砂文件夹里装着三份示意文档',
  className,
}: GlassFolderProps) {
  return (
    <IllustrationFrame label={label} className={cn('group', className)}>
      <div
        className="grid h-full place-items-center p-[var(--rui-content-padding)]"
        aria-hidden="true"
      >
        <div className="relative">
          {['一', '二', '三'].map((name, index) => (
            <span
              key={name}
              className={cn(
                'absolute top-0 left-1/2 h-16 w-12 -translate-x-1/2 rounded-[var(--rui-radius)] border border-border bg-card motion-reduce:translate-y-0',
                'transition-transform group-hover:-translate-y-2',
              )}
              style={{
                transform: `translate(-50%, calc(${index} * var(--rui-space-1) * -1)) rotate(${(index - 1) * 4}deg)`,
              }}
            />
          ))}
          <Folder className="relative size-20 text-accent transition-transform motion-reduce:transition-none group-hover:translate-y-1" />
        </div>
      </div>
    </IllustrationFrame>
  );
}

export type GlowKeyboardProps = {
  prompts?: string[];
  placeholder?: string;
  onSubmit?: (text: string) => void;
  label?: string;
  className?: string;
};
const hiking = ['规划一次周末徒步', '根据天气调整路线', '列出需要带的装备'];

/** Recreated from public Glow Keyboard docs. Demo typing stops on focus. */
export function GlowKeyboard({
  prompts = hiking,
  placeholder = 'Ask AI anything...',
  onSubmit,
  label = '玻璃键盘上方的示例对话输入',
  className,
}: GlowKeyboardProps) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState('');
  const [demo, setDemo] = useState(!reduced);
  const [prompt, setPrompt] = useState(0);
  const [lit, setLit] = useState<string | null>(null);
  const keys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'A', 'S', 'D', 'F', 'G', 'H'];

  useEffect(() => {
    if (!demo || reduced) return;
    const target = prompts[prompt % prompts.length] ?? '';
    if (value.length >= target.length) {
      const wait = window.setTimeout(() => {
        onSubmit?.(value);
        setValue('');
        setPrompt((current) => current + 1);
      }, tokenMetrics['motion-duration-lg'] * 3);
      return () => window.clearTimeout(wait);
    }
    const wait = window.setTimeout(
      () => {
        const next = target.slice(0, value.length + 1);
        setValue(next);
        setLit(next.slice(-1).toUpperCase());
      },
      tokenMetrics['motion-duration'] + (value.length % 3) * 40,
    );
    return () => window.clearTimeout(wait);
  }, [demo, onSubmit, prompt, prompts, reduced, value]);

  return (
    <IllustrationFrame label={label} className={className}>
      <div className="grid h-full content-end gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit?.(value);
            setValue('');
          }}
        >
          <Label htmlFor="affect-glow-input" className="sr-only">
            {placeholder}
          </Label>
          <Input
            id="affect-glow-input"
            value={value}
            placeholder={placeholder}
            onFocus={() => setDemo(false)}
            onChange={(event) => {
              setDemo(false);
              setValue(event.target.value);
              setLit(event.target.value.slice(-1).toUpperCase());
            }}
          />
        </form>
        <div className="grid grid-cols-6 gap-1" aria-hidden="true">
          {keys.map((key) => (
            <span
              key={key}
              className={cn(
                'grid h-[var(--rui-control-height-sm)] place-items-center rounded-[var(--rui-radius)] border border-border bg-card text-[length:var(--rui-font-caption)]',
                lit === key && 'bg-accent-soft text-accent',
              )}
            >
              {key}
            </span>
          ))}
        </div>
      </div>
    </IllustrationFrame>
  );
}

export type IntegrationFlowItem = {
  name: string;
  icon?: ReactNode;
  title?: string;
  mono?: boolean;
};
export type IntegrationFlowProps = {
  items?: IntegrationFlowItem[];
  label?: string;
  className?: string;
};

/** Recreated from public Integration Flow docs. Generic marks, no brand SVGs. */
export function IntegrationFlow({
  items = ['邮件', '表格', '聊天', '看板', '账单'].map((name) => ({ name })),
  label = '集成药丸沿弧线轮转到分析中心',
  className,
}: IntegrationFlowProps) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % items.length),
      tokenMetrics['motion-duration-lg'] * 3,
    );
    return () => window.clearInterval(timer);
  }, [items.length, reduced]);

  const current = items[index];
  return (
    <IllustrationFrame label={label} className={className}>
      <div
        className="grid h-full place-items-center p-[var(--rui-content-padding)]"
        aria-hidden="true"
      >
        <div className="relative grid size-40 place-items-center rounded-full border border-dashed border-border">
          {items.map((item, itemIndex) => (
            <Mark
              key={item.name}
              name={item.name}
              className={cn('absolute', itemIndex === index && 'bg-accent-soft text-accent')}
              style={{
                top: `${50 + Math.sin((itemIndex / items.length) * Math.PI * 2) * 42}%`,
                left: `${50 + Math.cos((itemIndex / items.length) * Math.PI * 2) * 42}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
          <div className="grid justify-items-center gap-1">
            {current?.icon ?? <Mark name={current?.name ?? '中'} className="size-12 bg-card" />}
            <Text variant="caption">{current?.title ?? current?.name}</Text>
          </div>
        </div>
      </div>
    </IllustrationFrame>
  );
}

export type OutreachBranchesProps = { label?: string; className?: string };
/** Recreated from public Outreach Branches docs. Generic channel marks. */
export function OutreachBranches({
  label = '一条动作分到邮件、聊天和文档三条支线',
  className,
}: OutreachBranchesProps) {
  const reduced = usePrefersReducedMotion();
  return (
    <IllustrationFrame label={label} className={className}>
      <div
        className="grid h-full place-items-center p-[var(--rui-content-padding)]"
        aria-hidden="true"
      >
        <div className="grid w-full max-w-[var(--rui-container-xs)] grid-cols-3 items-end justify-items-center gap-2">
          {['邮', '聊', '文'].map((name, index) => (
            <div key={name} className="grid justify-items-center gap-2">
              <span
                className={cn(
                  'h-16 w-px bg-border',
                  !reduced &&
                    'animate-[affect-pulse_var(--affect-branch-duration)_linear_infinite]',
                )}
                style={
                  {
                    '--affect-branch-duration': `calc(var(--rui-motion-duration-lg) * 10)`,
                    animationDelay: `calc(${index} * var(--rui-motion-duration-lg))`,
                  } as CSSProperties
                }
              />
              <Mark name={name} />
            </div>
          ))}
          <Mark name="发" className="col-span-3 bg-accent-soft text-accent" />
        </div>
      </div>
    </IllustrationFrame>
  );
}

export type ProjectFlowProps = { theme?: 'light' | 'dark'; label?: string; className?: string };
/** Recreated from public Project Flow docs. Scene cards only. */
export function ProjectFlow({
  theme = 'light',
  label = '客户任务分出子任务、备注和角色',
  className,
}: ProjectFlowProps) {
  const reduced = usePrefersReducedMotion();
  const cards = ['客户', '任务', '备注', '角色', '团队'];
  return (
    <IllustrationFrame
      label={label}
      className={cn(theme === 'dark' && 'bg-card text-card-foreground', className)}
    >
      <div
        className="grid h-full content-center gap-2 p-[var(--rui-content-padding)]"
        aria-hidden="true"
      >
        {cards.map((card, index) => (
          <div
            key={card}
            className={cn(
              'rounded-[var(--rui-radius)] border border-border bg-background px-[var(--rui-compact-surface-padding-x)] py-[var(--rui-cell-padding-y)] text-[length:var(--rui-font-caption)]',
              !reduced && 'motion-safe:animate-in motion-safe:fade-in',
            )}
            style={{ marginLeft: index ? 'var(--rui-space-6)' : undefined }}
          >
            {card}
          </div>
        ))}
      </div>
    </IllustrationFrame>
  );
}

export type VoiceOrbState = 'idle' | 'listening' | 'thinking' | 'speaking';
export type VoiceOrbProps = {
  state?: VoiceOrbState;
  level?: number;
  size?: number;
  dots?: number;
  accent?: string;
  label?: boolean | Partial<Record<VoiceOrbState, string>>;
  interactive?: boolean;
  onPress?: () => void;
  className?: string;
  style?: CSSProperties;
};
const voiceCopy: Record<VoiceOrbState, string> = {
  idle: '待命',
  listening: '正在听',
  thinking: '正在想',
  speaking: '正在说',
};

/** Recreated from public Voice Orb docs. CSS orb, no canvas brand. Hex accent ignored. */
export function VoiceOrb({
  state = 'idle',
  level,
  size,
  dots = 12,
  label = true,
  interactive = true,
  onPress,
  className,
  style,
}: VoiceOrbProps) {
  const reduced = usePrefersReducedMotion();
  const edge = size ?? tokenMetrics['space-16'] * 3;
  const loud = Math.min(1, Math.max(0, level ?? (state === 'idle' ? 0.2 : 0.55)));
  const text =
    label === false
      ? null
      : typeof label === 'object'
        ? (label[state] ?? voiceCopy[state])
        : voiceCopy[state];
  const body = (
    <span
      className={cn(
        'grid place-items-center rounded-full border border-border bg-muted',
        state === 'listening' && 'bg-accent-soft',
        state === 'thinking' && 'border-dashed',
        state === 'speaking' && 'bg-accent-soft',
        !reduced &&
          state !== 'idle' &&
          'animate-[affect-pulse_calc(var(--rui-motion-duration-lg)*7)_ease-in-out_infinite]',
      )}
      style={{
        width: `calc(${edge} * 1px)`,
        height: `calc(${edge} * 1px)`,
        boxShadow:
          state === 'listening'
            ? `0 0 calc(${loud} * var(--rui-space-6)) var(--rui-accent)`
            : undefined,
      }}
    >
      <span className="flex flex-wrap justify-center gap-1" aria-hidden="true">
        {Array.from({ length: Math.min(24, Math.max(6, dots / 40)) }, (_, index) => (
          <span
            key={index}
            className={cn(
              'size-1 rounded-full bg-foreground',
              state !== 'idle' && 'bg-accent',
              interactive && 'hover:opacity-70',
            )}
          />
        ))}
      </span>
    </span>
  );
  return (
    <div className={cn('grid justify-items-center gap-2', className)} style={style}>
      {onPress ? (
        <button type="button" aria-label={text ?? voiceCopy[state]} onClick={onPress}>
          {body}
        </button>
      ) : (
        <span role="img" aria-label={text ?? voiceCopy[state]}>
          {body}
        </span>
      )}
      {text ? (
        <Text variant="caption" aria-live="polite">
          {text}
        </Text>
      ) : null}
    </div>
  );
}

export type Continent =
  | 'north-america'
  | 'south-america'
  | 'europe'
  | 'africa'
  | 'asia'
  | 'oceania';
export type WorldMapProps = {
  continent?: Continent;
  defaultContinent?: Continent;
  onContinentChange?: (continent: Continent) => void;
  showSwitcher?: boolean;
  label?: string | ((continent: Continent) => string);
  className?: string;
};
const continents: Continent[] = [
  'north-america',
  'south-america',
  'europe',
  'africa',
  'asia',
  'oceania',
];
const continentLabel: Record<Continent, string> = {
  'north-america': '北美洲',
  'south-america': '南美洲',
  europe: '欧洲',
  africa: '非洲',
  asia: '亚洲',
  oceania: '大洋洲',
};
const blobs: Record<Continent, { x: number; y: number; w: number; h: number }> = {
  'north-america': { x: 18, y: 18, w: 42, h: 38 },
  'south-america': { x: 32, y: 52, w: 24, h: 36 },
  europe: { x: 58, y: 18, w: 22, h: 22 },
  africa: { x: 56, y: 40, w: 26, h: 36 },
  asia: { x: 72, y: 16, w: 46, h: 40 },
  oceania: { x: 98, y: 58, w: 22, h: 18 },
};

/** Recreated from public World Map docs. Simplified shapes, not Natural Earth paths. */
export function WorldMap({
  continent,
  defaultContinent = 'europe',
  onContinentChange,
  showSwitcher = true,
  label,
  className,
}: WorldMapProps) {
  const [internal, setInternal] = useState(defaultContinent);
  const [open, setOpen] = useState(false);
  const current = continent ?? internal;
  const name =
    typeof label === 'function'
      ? label(current)
      : (label ?? `世界地图，当前突出 ${continentLabel[current]}`);

  function pick(next: Continent) {
    if (continent === undefined) setInternal(next);
    onContinentChange?.(next);
    setOpen(false);
  }

  return (
    <IllustrationFrame label={name} className={className}>
      <div className="grid h-full content-between p-[var(--rui-content-padding)]">
        {showSwitcher ? (
          <div className="relative justify-self-start">
            <Button
              type="button"
              size="xs"
              variant="outline"
              aria-expanded={open}
              aria-haspopup="listbox"
              onClick={() => setOpen((value) => !value)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setOpen(true);
                }
                if (event.key === 'Escape') setOpen(false);
              }}
            >
              {continentLabel[current]}
            </Button>
            {open ? (
              <ul
                role="listbox"
                aria-label="大洲"
                className="absolute z-[var(--rui-z-popover)] mt-1 min-w-28 rounded-[var(--rui-radius)] border border-border bg-card p-1"
              >
                {continents.map((item) => (
                  <li key={item}>
                    <Button
                      type="button"
                      size="xs"
                      role="option"
                      aria-selected={item === current}
                      variant={item === current ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => pick(item)}
                    >
                      {continentLabel[item]}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <span />
        )}
        <svg viewBox="0 0 140 90" className="h-28 w-full text-muted-foreground" aria-hidden="true">
          {continents.map((item) => {
            const blob = blobs[item];
            return (
              <rect
                key={item}
                x={blob.x}
                y={blob.y}
                width={blob.w}
                height={blob.h}
                rx="8"
                className={item === current ? 'fill-accent opacity-80' : 'fill-current opacity-20'}
              />
            );
          })}
        </svg>
      </div>
    </IllustrationFrame>
  );
}
