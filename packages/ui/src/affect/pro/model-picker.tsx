import { useState, type ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../primitives/popover.js';
import { Button } from '../../primitives/button.js';
import { Switch } from '../../primitives/switch.js';
import { Label } from '../../primitives/label.js';
import { Inline, Stack, Text } from '../../basic/composition.js';
import { cn } from '../../lib/utils.js';
import { NumberTicker } from '../motion/number-ticker.js';

export type PickerModel = {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode;
  speed?: number;
  quality?: number;
  cost?: number;
  latencyMs?: number;
  pricePerM?: number;
};
export type ModelPickerProps = {
  models: PickerModel[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  thinking?: boolean;
  defaultThinking?: boolean;
  onThinkingChange?: (on: boolean) => void;
  webSearch?: boolean;
  defaultWebSearch?: boolean;
  onWebSearchChange?: (on: boolean) => void;
  effort?: 'low' | 'medium' | 'high';
  defaultEffort?: 'low' | 'medium' | 'high';
  onEffortChange?: (effort: 'low' | 'medium' | 'high') => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'start' | 'end';
  side?: 'bottom' | 'top';
  className?: string;
};

const effortFactor = { low: 1.6, medium: 2.5, high: 4 };

function Bars({ value, label }: { value?: number; label: string }) {
  const n = Math.min(5, Math.max(0, value ?? 0));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${label} ${n} / 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={cn('h-1 w-3 rounded-full', index < n ? 'bg-accent' : 'bg-muted')}
        />
      ))}
    </span>
  );
}

/** Recreated from public Model Picker docs. */
export function ModelPicker({
  models,
  value,
  defaultValue,
  onChange,
  thinking,
  defaultThinking = false,
  onThinkingChange,
  webSearch,
  defaultWebSearch = false,
  onWebSearchChange,
  effort,
  defaultEffort = 'medium',
  onEffortChange,
  open,
  defaultOpen = false,
  onOpenChange,
  align = 'start',
  side = 'bottom',
  className,
}: ModelPickerProps) {
  const [internal, setInternal] = useState(defaultValue ?? models[0]?.id ?? '');
  const [think, setThink] = useState(defaultThinking);
  const [search, setSearch] = useState(defaultWebSearch);
  const [level, setLevel] = useState(defaultEffort);
  const [menu, setMenu] = useState(defaultOpen);
  const [hover, setHover] = useState<string | null>(null);
  const currentId = value ?? internal;
  const thinkingOn = thinking ?? think;
  const searchOn = webSearch ?? search;
  const effortLevel = effort ?? level;
  const opened = open ?? menu;
  const preview = models.find((item) => item.id === (hover ?? currentId)) ?? models[0];
  const current = models.find((item) => item.id === currentId) ?? models[0];
  const latency = preview?.latencyMs
    ? Math.round(preview.latencyMs * (thinkingOn ? effortFactor[effortLevel] : 1))
    : undefined;

  function pick(id: string) {
    if (value === undefined) setInternal(id);
    onChange?.(id);
    if (open === undefined) setMenu(false);
    onOpenChange?.(false);
  }

  return (
    <div className={className}>
      <Popover
        open={opened}
        onOpenChange={(next) => {
          if (open === undefined) setMenu(next);
          onOpenChange?.(next);
        }}
      >
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" size="sm" aria-haspopup="listbox">
              {current?.name ?? '选择模型'}
              {thinkingOn ? ' · 思考' : ''}
            </Button>
          }
        />
        <PopoverContent
          align={align}
          side={side}
          className="w-[min(100%,var(--rui-container-sm))] p-[var(--rui-content-padding)]"
        >
          <Stack>
            <div role="listbox" aria-label="模型" className="grid gap-1">
              {models.map((model) => {
                const varies = model.speed == null && model.quality == null && model.cost == null;
                return (
                  <button
                    key={model.id}
                    type="button"
                    role="option"
                    aria-selected={model.id === currentId}
                    className={cn(
                      'grid gap-1 rounded-[var(--rui-radius)] px-2 py-1.5 text-left',
                      'focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring',
                      model.id === currentId && 'bg-muted',
                    )}
                    onMouseEnter={() => setHover(model.id)}
                    onFocus={() => setHover(model.id)}
                    onClick={() => pick(model.id)}
                  >
                    <Inline className="justify-between">
                      <span className="text-[length:var(--rui-font-interface)]">{model.name}</span>
                      {varies ? (
                        <Text as="span" variant="caption" tone="muted">
                          视任务而定
                        </Text>
                      ) : null}
                    </Inline>
                    {model.description ? (
                      <Text variant="caption" tone="muted">
                        {model.description}
                      </Text>
                    ) : null}
                    {!varies ? (
                      <Inline>
                        <Bars value={model.speed} label="速度" />
                        <Bars value={model.quality} label="质量" />
                        <Bars value={model.cost} label="成本" />
                      </Inline>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <Inline>
              <Switch
                checked={thinkingOn}
                onCheckedChange={(next) => {
                  if (thinking === undefined) setThink(next);
                  onThinkingChange?.(next);
                }}
                id="affect-thinking"
              />
              <Label htmlFor="affect-thinking">扩展思考</Label>
            </Inline>
            {thinkingOn ? (
              <Inline>
                {(['low', 'medium', 'high'] as const).map((item) => (
                  <Button
                    key={item}
                    type="button"
                    size="xs"
                    variant={item === effortLevel ? 'secondary' : 'ghost'}
                    onClick={() => {
                      if (effort === undefined) setLevel(item);
                      onEffortChange?.(item);
                    }}
                  >
                    {item === 'low' ? '低' : item === 'medium' ? '中' : '高'}
                  </Button>
                ))}
              </Inline>
            ) : null}
            <Inline>
              <Switch
                checked={searchOn}
                onCheckedChange={(next) => {
                  if (webSearch === undefined) setSearch(next);
                  onWebSearchChange?.(next);
                }}
                id="affect-web"
              />
              <Label htmlFor="affect-web">联网搜索</Label>
            </Inline>
            <Inline className="justify-between">
              <Text as="span" variant="caption" tone="muted">
                首 token
              </Text>
              <span className="text-[length:var(--rui-font-caption)]">
                {latency != null ? (
                  <NumberTicker value={latency} format={{ maximumFractionDigits: 0 }} />
                ) : (
                  '—'
                )}
                {latency != null ? ' ms' : ''}
              </span>
              <Text as="span" variant="caption" tone="muted">
                {preview?.pricePerM != null ? `$${preview.pricePerM}/M` : ''}
              </Text>
            </Inline>
          </Stack>
        </PopoverContent>
      </Popover>
    </div>
  );
}
