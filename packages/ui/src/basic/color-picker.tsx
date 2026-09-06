import * as React from 'react';
import { cn } from '../lib/utils.js';
import { Button } from '../primitives/button.js';
import { Field, FieldDescription, FieldError, FieldLabel } from '../primitives/field.js';
import { Input } from '../primitives/input.js';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../primitives/input-group.js';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover.js';
import { Slider } from '../primitives/slider.js';

export type ColorFormat = 'hex' | 'rgb' | 'hsl';

export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface HsvColor {
  h: number;
  s: number;
  v: number;
}

export interface ColorInputProps {
  label: React.ReactNode;
  value?: string;
  defaultValue?: string;
  format?: ColorFormat;
  allowAlpha?: boolean;
  name?: string;
  placeholder?: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  onValueChange?: (value: string, color: RgbaColor) => void;
  onValueCommit?: (value: string, color: RgbaColor) => void;
}

export interface ColorPickerProps extends ColorInputProps {
  inline?: boolean;
  presets?: readonly string[];
  showChannels?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DEFAULT_COLOR = '#000000';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 0) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function parseChannel(token: string) {
  const value = Number.parseFloat(token);
  if (!Number.isFinite(value)) return null;
  if (token.endsWith('%')) {
    if (value < 0 || value > 100) return null;
    return Math.round(value * 2.55);
  }
  if (value < 0 || value > 255) return null;
  return Math.round(value);
}

function parseAlpha(token: string | undefined) {
  if (token == null) return 1;
  const value = Number.parseFloat(token);
  if (!Number.isFinite(value)) return null;
  const alpha = token.endsWith('%') ? value / 100 : value;
  return alpha >= 0 && alpha <= 1 ? alpha : null;
}

function hslToRgb(hue: number, saturation: number, lightness: number): RgbaColor {
  const h = ((hue % 360) + 360) % 360;
  const s = clamp(saturation / 100, 0, 1);
  const l = clamp(lightness / 100, 0, 1);
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const segment = h / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (segment < 1) [r, g] = [chroma, x];
  else if (segment < 2) [r, g] = [x, chroma];
  else if (segment < 3) [g, b] = [chroma, x];
  else if (segment < 4) [g, b] = [x, chroma];
  else if (segment < 5) [r, b] = [x, chroma];
  else [r, b] = [chroma, x];
  const offset = l - chroma / 2;
  return { r: Math.round((r + offset) * 255), g: Math.round((g + offset) * 255), b: Math.round((b + offset) * 255), a: 1 };
}

function rgbToHsl({ r, g, b }: RgbaColor) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let h = 0;
  if (delta) {
    if (max === red) h = 60 * (((green - blue) / delta) % 6);
    else if (max === green) h = 60 * ((blue - red) / delta + 2);
    else h = 60 * ((red - green) / delta + 4);
  }
  if (h < 0) h += 360;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h, s: s * 100, l: l * 100 };
}

function rgbToHsv({ r, g, b }: RgbaColor): HsvColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let h = 0;
  if (delta) {
    if (max === red) h = 60 * (((green - blue) / delta) % 6);
    else if (max === green) h = 60 * ((blue - red) / delta + 2);
    else h = 60 * ((red - green) / delta + 4);
  }
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : (delta / max) * 100, v: max * 100 };
}

function hsvToRgb({ h, s, v }: HsvColor, alpha = 1): RgbaColor {
  const saturation = clamp(s / 100, 0, 1);
  const value = clamp(v / 100, 0, 1);
  const chroma = value * saturation;
  const segment = (((h % 360) + 360) % 360) / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (segment < 1) [r, g] = [chroma, x];
  else if (segment < 2) [r, g] = [x, chroma];
  else if (segment < 3) [g, b] = [chroma, x];
  else if (segment < 4) [g, b] = [x, chroma];
  else if (segment < 5) [r, b] = [x, chroma];
  else [r, b] = [chroma, x];
  const offset = value - chroma;
  return { r: Math.round((r + offset) * 255), g: Math.round((g + offset) * 255), b: Math.round((b + offset) * 255), a: clamp(alpha, 0, 1) };
}

/** Parses hex, rgb(a) and hsl(a) color strings without accepting browser-dependent named colors. */
export function parseColor(value: string): RgbaColor | null {
  const input = value.trim();
  const hex = /^#([\da-f]{3,8})$/i.exec(input)?.[1];
  if (hex && [3, 4, 6, 8].includes(hex.length)) {
    const expanded = hex.length <= 4 ? [...hex].map(character => character + character).join('') : hex;
    return {
      r: Number.parseInt(expanded.slice(0, 2), 16),
      g: Number.parseInt(expanded.slice(2, 4), 16),
      b: Number.parseInt(expanded.slice(4, 6), 16),
      a: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1,
    };
  }

  const functional = /^(rgba?|hsla?)\((.*)\)$/i.exec(input);
  if (!functional) return null;
  const [name, body] = [functional[1].toLowerCase(), functional[2]];
  const slash = body.split('/').map(part => part.trim());
  if (slash.length > 2) return null;
  const commaSyntax = slash[0].includes(',');
  const parts = slash[0].split(commaSyntax ? /\s*,\s*/ : /\s+/).filter(Boolean);
  let alphaToken: string | undefined = slash[1];
  if (commaSyntax && parts.length === 4) alphaToken = parts.pop();
  if (parts.length !== 3) return null;
  const alpha = parseAlpha(alphaToken);
  if (alpha == null) return null;

  if (name.startsWith('rgb')) {
    const channels = parts.map(parseChannel);
    if (channels.some(channel => channel == null)) return null;
    return { r: channels[0]!, g: channels[1]!, b: channels[2]!, a: alpha };
  }

  const hue = Number.parseFloat(parts[0].replace(/deg$/i, ''));
  const saturation = Number.parseFloat(parts[1]);
  const lightness = Number.parseFloat(parts[2]);
  if (!Number.isFinite(hue) || !parts[1].endsWith('%') || !parts[2].endsWith('%') || saturation < 0 || saturation > 100 || lightness < 0 || lightness > 100) return null;
  return { ...hslToRgb(hue, saturation, lightness), a: alpha };
}

export function formatColor(color: RgbaColor, format: ColorFormat = 'hex', allowAlpha = false) {
  const safe = { r: clamp(Math.round(color.r), 0, 255), g: clamp(Math.round(color.g), 0, 255), b: clamp(Math.round(color.b), 0, 255), a: allowAlpha ? clamp(color.a, 0, 1) : 1 };
  if (format === 'hex') {
    const channels = [safe.r, safe.g, safe.b, ...(allowAlpha ? [Math.round(safe.a * 255)] : [])];
    return `#${channels.map(channel => channel.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  }
  if (format === 'rgb') return allowAlpha ? `rgba(${safe.r}, ${safe.g}, ${safe.b}, ${round(safe.a, 2)})` : `rgb(${safe.r}, ${safe.g}, ${safe.b})`;
  const hsl = rgbToHsl(safe);
  return allowAlpha ? `hsla(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%, ${round(safe.a, 2)})` : `hsl(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%)`;
}

function useColorEditor(props: ColorInputProps) {
  const { value, defaultValue = DEFAULT_COLOR, format = 'hex', allowAlpha = false, onValueChange, onValueCommit } = props;
  const controlled = value !== undefined;
  const initial = parseColor(value ?? defaultValue) ?? parseColor(DEFAULT_COLOR)!;
  const lastValid = React.useRef(initial);
  const [internalValue, setInternalValue] = React.useState(() => formatColor(initial, format, allowAlpha));
  const externalValue = controlled ? value : internalValue;
  const parsedExternalColor = parseColor(externalValue ?? '') ?? lastValid.current;
  const externalColor = { ...parsedExternalColor, a: allowAlpha ? parsedExternalColor.a : 1 };
  const canonicalValue = formatColor(externalColor, format, allowAlpha);
  const [draft, setDraft] = React.useState(() => parseColor(externalValue ?? '') ? canonicalValue : (externalValue ?? ''));
  const [draftError, setDraftError] = React.useState<string | null>(parseColor(externalValue ?? '') ? null : '请输入有效的 HEX、RGB 或 HSL 颜色。');
  const draftDirty = React.useRef(false);

  React.useEffect(() => {
    const parsed = parseColor(externalValue ?? '');
    if (parsed) {
      const next = { ...parsed, a: allowAlpha ? parsed.a : 1 };
      lastValid.current = next;
      setDraft(formatColor(next, format, allowAlpha));
      setDraftError(null);
      draftDirty.current = false;
    } else {
      setDraft(externalValue ?? '');
      setDraftError('请输入有效的 HEX、RGB 或 HSL 颜色。');
    }
  }, [allowAlpha, externalValue, format]);

  const apply = React.useCallback((color: RgbaColor, commit = false) => {
    const nextColor = { ...color, a: allowAlpha ? clamp(color.a, 0, 1) : 1 };
    const nextValue = formatColor(nextColor, format, allowAlpha);
    lastValid.current = nextColor;
    if (!controlled) setInternalValue(nextValue);
    setDraft(nextValue);
    setDraftError(null);
    draftDirty.current = false;
    onValueChange?.(nextValue, nextColor);
    if (commit) onValueCommit?.(nextValue, nextColor);
    return nextValue;
  }, [allowAlpha, controlled, format, onValueChange, onValueCommit]);

  const commitDraft = React.useCallback(() => {
    if (!draftDirty.current) return true;
    const parsed = parseColor(draft);
    if (!parsed) {
      setDraftError('请输入有效的 HEX、RGB 或 HSL 颜色。');
      return false;
    }
    apply(parsed, true);
    return true;
  }, [apply, draft]);

  const restoreDraft = React.useCallback(() => {
    setDraft(formatColor(lastValid.current, format, allowAlpha));
    setDraftError(null);
    draftDirty.current = false;
  }, [allowAlpha, format]);

  return { color: externalColor, draft, setDraft, draftError, setDraftError, draftDirty, apply, commitDraft, restoreDraft };
}

const transparencyClass = "bg-[image:repeating-conic-gradient(var(--rui-border)_0_25%,var(--rui-bg)_0_50%)] bg-[length:var(--rui-space-2)_var(--rui-space-2)]";

function ColorTextField({ props, editor, pickerButton }: { props: ColorInputProps; editor: ReturnType<typeof useColorEditor>; pickerButton?: React.ReactNode }) {
  const id = React.useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;
  const invalid = Boolean(props.error || editor.draftError);
  return <Field data-invalid={invalid || undefined} data-disabled={props.disabled || undefined} className={props.className}>
    <FieldLabel htmlFor={id}>{props.label}</FieldLabel>
    <InputGroup data-disabled={props.disabled || undefined}>
      <InputGroupAddon className={cn('overflow-hidden p-0', transparencyClass)}>
        {pickerButton ?? <span aria-hidden="true" className="size-[var(--rui-control-height)] border-r border-border" style={{ backgroundColor: formatColor(editor.color, 'rgb', true) }} />}
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        name={props.name}
        value={editor.draft}
        placeholder={props.placeholder ?? (props.format === 'rgb' ? 'rgb(0, 0, 0)' : props.format === 'hsl' ? 'hsl(0, 0%, 0%)' : props.allowAlpha ? '#000000FF' : '#000000')}
        disabled={props.disabled}
        readOnly={props.readOnly}
        required={props.required}
        spellCheck={false}
        autoComplete="off"
        aria-invalid={invalid || undefined}
        aria-describedby={cn(props.description && descriptionId, invalid && errorId) || undefined}
        className={cn('font-mono uppercase', props.inputClassName)}
        onChange={event => { editor.draftDirty.current = true; editor.setDraft(event.target.value); editor.setDraftError(null); }}
        onBlur={() => { if (!props.readOnly && !props.disabled) editor.commitDraft(); }}
        onKeyDown={event => {
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); editor.commitDraft(); }
          if (event.key === 'Escape') { event.preventDefault(); editor.restoreDraft(); }
        }}
      />
    </InputGroup>
    {props.description && <FieldDescription id={descriptionId}>{props.description}</FieldDescription>}
    {invalid && <FieldError id={errorId}>{props.error ?? editor.draftError}</FieldError>}
  </Field>;
}

export function ColorInput(props: ColorInputProps) {
  const editor = useColorEditor(props);
  return <ColorTextField props={props} editor={editor} />;
}

function ChannelInput({ label, value, min, max, disabled, onChange, onCommit }: { label: string; value: number; min: number; max: number; disabled?: boolean; onChange: (value: number) => void; onCommit: () => void }) {
  const id = React.useId();
  return <label htmlFor={id} className="grid min-w-0 gap-1 text-xs text-muted-foreground">
    <span>{label}</span>
    <Input id={id} type="number" min={min} max={max} value={Math.round(value)} disabled={disabled} className="px-2 font-mono text-xs text-foreground" onChange={event => onChange(clamp(event.currentTarget.valueAsNumber || 0, min, max))} onBlur={onCommit} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); } }} />
  </label>;
}

function ColorPanel({ editor, allowAlpha = false, presets = [], showChannels = true, disabled, readOnly }: { editor: ReturnType<typeof useColorEditor>; allowAlpha?: boolean; presets?: readonly string[]; showChannels?: boolean; disabled?: boolean; readOnly?: boolean }) {
  const hsv = rgbToHsv(editor.color);
  const hueColor = formatColor(hsvToRgb({ h: hsv.h, s: 100, v: 100 }), 'rgb');
  const interactiveDisabled = disabled || readOnly;
  const updateHsv = React.useCallback((next: Partial<HsvColor>, commit = false) => editor.apply(hsvToRgb({ ...hsv, ...next }, editor.color.a), commit), [editor, hsv]);
  const pointColor = React.useCallback((element: HTMLElement, clientX: number, clientY: number) => {
    const rect = element.getBoundingClientRect();
    return hsvToRgb({ h: hsv.h, s: clamp((clientX - rect.left) / rect.width * 100, 0, 100), v: clamp((rect.bottom - clientY) / rect.height * 100, 0, 100) }, editor.color.a);
  }, [editor.color.a, hsv.h]);

  return <div data-slot="color-picker-panel" className="grid w-64 gap-3">
    <div
      role="slider"
      tabIndex={interactiveDisabled ? -1 : 0}
      aria-label="饱和度与亮度"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsv.s)}
      aria-valuetext={`饱和度 ${Math.round(hsv.s)}%，亮度 ${Math.round(hsv.v)}%`}
      aria-disabled={interactiveDisabled || undefined}
      data-slot="color-picker-area"
      className="relative h-32 touch-none overflow-hidden rounded-md border border-border [background:linear-gradient(to_top,var(--rui-color-space-black),transparent),linear-gradient(to_right,var(--rui-color-space-white),transparent)] outline-none focus-visible:border-ring focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring/50"
      style={{ backgroundColor: hueColor }}
      onPointerDown={event => {
        if (interactiveDisabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        editor.apply(pointColor(event.currentTarget, event.clientX, event.clientY));
      }}
      onPointerMove={event => {
        if (interactiveDisabled || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
        editor.apply(pointColor(event.currentTarget, event.clientX, event.clientY));
      }}
      onPointerUp={event => {
        if (interactiveDisabled) return;
        const color = pointColor(event.currentTarget, event.clientX, event.clientY);
        event.currentTarget.releasePointerCapture(event.pointerId);
        editor.apply(color, true);
      }}
      onKeyDown={event => {
        if (interactiveDisabled || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const next = event.key === 'ArrowLeft' ? { s: clamp(hsv.s - step, 0, 100) } : event.key === 'ArrowRight' ? { s: clamp(hsv.s + step, 0, 100) } : event.key === 'ArrowUp' ? { v: clamp(hsv.v + step, 0, 100) } : { v: clamp(hsv.v - step, 0, 100) };
        updateHsv(next, true);
      }}
    >
      <span aria-hidden="true" className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--rui-color-space-white)] shadow-sm ring-1 ring-[var(--rui-color-space-black)]" style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }} />
    </div>

    <div className="grid grid-cols-[var(--rui-control-height)_minmax(0,1fr)] items-center gap-2">
      <span aria-hidden="true" className={cn('size-[var(--rui-control-height)] overflow-hidden rounded-md border border-border', transparencyClass)}><span className="block size-full" style={{ backgroundColor: formatColor(editor.color, 'rgb', true) }} /></span>
      <div className="grid gap-2">
        <Slider aria-label="色相" min={0} max={360} step={1} value={[hsv.h]} disabled={interactiveDisabled} className="[&_[data-slot=slider-track]]:bg-[image:var(--rui-color-picker-hue-gradient)]" onValueChange={value => updateHsv({ h: Array.isArray(value) ? value[0] : value })} onValueCommitted={value => updateHsv({ h: Array.isArray(value) ? value[0] : value }, true)} />
        {allowAlpha && <Slider aria-label="透明度" min={0} max={100} step={1} value={[editor.color.a * 100]} disabled={interactiveDisabled} style={{ '--color-picker-alpha-gradient': `linear-gradient(to right, transparent, ${formatColor(editor.color, 'rgb')})` } as React.CSSProperties} className={cn(transparencyClass, '[&_[data-slot=slider-track]]:bg-[image:var(--color-picker-alpha-gradient)]')} onValueChange={value => editor.apply({ ...editor.color, a: (Array.isArray(value) ? value[0] : value) / 100 })} onValueCommitted={value => editor.apply({ ...editor.color, a: (Array.isArray(value) ? value[0] : value) / 100 }, true)} />}
      </div>
    </div>

    {showChannels && <div className={cn('grid gap-2', allowAlpha ? 'grid-cols-4' : 'grid-cols-3')}>
      <ChannelInput label="R" value={editor.color.r} min={0} max={255} disabled={interactiveDisabled} onChange={r => editor.apply({ ...editor.color, r })} onCommit={() => editor.apply(editor.color, true)} />
      <ChannelInput label="G" value={editor.color.g} min={0} max={255} disabled={interactiveDisabled} onChange={g => editor.apply({ ...editor.color, g })} onCommit={() => editor.apply(editor.color, true)} />
      <ChannelInput label="B" value={editor.color.b} min={0} max={255} disabled={interactiveDisabled} onChange={b => editor.apply({ ...editor.color, b })} onCommit={() => editor.apply(editor.color, true)} />
      {allowAlpha && <ChannelInput label="A %" value={editor.color.a * 100} min={0} max={100} disabled={interactiveDisabled} onChange={a => editor.apply({ ...editor.color, a: a / 100 })} onCommit={() => editor.apply(editor.color, true)} />}
    </div>}

    {presets.length > 0 && <div role="group" aria-label="预设颜色" className="flex flex-wrap gap-2">
      {presets.map(preset => {
        const parsed = parseColor(preset);
        if (!parsed) return null;
        const selected = formatColor(parsed, 'hex', allowAlpha) === formatColor(editor.color, 'hex', allowAlpha);
        return <button key={preset} type="button" aria-label={`选择颜色 ${preset}`} aria-pressed={selected} disabled={interactiveDisabled} className={cn('size-6 overflow-hidden rounded-md border border-border outline-none focus-visible:border-ring focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring/50 disabled:opacity-[var(--rui-opacity-disabled)]', transparencyClass)} onClick={() => editor.apply(parsed, true)}><span className="block size-full" style={{ backgroundColor: formatColor(parsed, 'rgb', true) }} /></button>;
      })}
    </div>}
  </div>;
}

export function ColorPicker({ inline = false, presets, showChannels = true, open, defaultOpen, onOpenChange, ...props }: ColorPickerProps) {
  const editor = useColorEditor(props);
  const panel = <ColorPanel editor={editor} allowAlpha={props.allowAlpha} presets={presets} showChannels={showChannels} disabled={props.disabled} readOnly={props.readOnly} />;
  if (inline) return <div className={cn('grid gap-[var(--rui-content-gap-sm)]', props.className)}><ColorTextField props={{ ...props, className: undefined }} editor={editor} /><div className="w-fit rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-sm">{panel}</div></div>;
  if (props.readOnly) return <ColorTextField props={props} editor={editor} />;

  const trigger = <PopoverTrigger render={<Button type="button" size="icon" variant="ghost" aria-label="打开颜色选择器" disabled={props.disabled} />}><span aria-hidden="true" className="block size-full" style={{ backgroundColor: formatColor(editor.color, 'rgb', true) }} /></PopoverTrigger>;
  return <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
    <ColorTextField props={props} editor={editor} pickerButton={trigger} />
    <PopoverContent align="start" aria-label="颜色选择器" className="w-auto p-3">{panel}</PopoverContent>
  </Popover>;
}
