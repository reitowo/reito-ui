import * as React from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '../primitives/field.js';
import { Input } from '../primitives/input.js';

export type InputMaskIncompleteBehavior = 'allow' | 'clear' | 'restore';
export type InputMaskDefinitions = Readonly<Record<string, RegExp>>;
export interface InputMaskDetails { displayValue: string; complete: boolean }

export interface InputMaskProps extends Omit<React.ComponentProps<'input'>, 'value' | 'defaultValue' | 'onChange' | 'size'> {
  mask: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (rawValue: string, details: InputMaskDetails) => void;
  onValueCommit?: (rawValue: string, details: InputMaskDetails) => void;
  definitions?: InputMaskDefinitions;
  incompleteBehavior?: InputMaskIncompleteBehavior;
  incompleteMessage?: React.ReactNode;
  label: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  inputClassName?: string;
}

type MaskAtom = { kind: 'token'; pattern: RegExp; optional: boolean } | { kind: 'literal'; value: string; optional: boolean };
const defaultDefinitions: InputMaskDefinitions = { '9': /[0-9]/, a: /[A-Za-z]/, '*': /[A-Za-z0-9]/ };

function matches(pattern: RegExp, value: string) {
  return new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, '')).test(value);
}

function compileMask(mask: string, definitions: InputMaskDefinitions) {
  const atoms: MaskAtom[] = [];
  let optional = false;
  let escaped = false;
  for (const value of mask) {
    if (escaped) { atoms.push({ kind: 'literal', value, optional }); escaped = false; continue; }
    if (value === '\\') { escaped = true; continue; }
    if (value === '?') { optional = true; continue; }
    const pattern = definitions[value];
    atoms.push(pattern ? { kind: 'token', pattern, optional } : { kind: 'literal', value, optional });
  }
  if (escaped) atoms.push({ kind: 'literal', value: '\\', optional });
  return atoms;
}

function tokenAtoms(atoms: readonly MaskAtom[]) {
  return atoms.filter((atom): atom is Extract<MaskAtom, { kind: 'token' }> => atom.kind === 'token');
}

function sanitize(value: string, atoms: readonly MaskAtom[]) {
  const tokens = tokenAtoms(atoms);
  let raw = '';
  for (const character of value) {
    const token = tokens[raw.length];
    if (!token) break;
    if (matches(token.pattern, character)) raw += character;
  }
  return raw;
}

function parseDisplay(displayValue: string, atoms: readonly MaskAtom[]) {
  let raw = '';
  let atomIndex = 0;
  for (const character of displayValue) {
    let consumedLiteral = false;
    while (atoms[atomIndex]?.kind === 'literal') {
      const literal = atoms[atomIndex] as Extract<MaskAtom, { kind: 'literal' }>;
      atomIndex += 1;
      if (character === literal.value) { consumedLiteral = true; break; }
    }
    if (consumedLiteral) continue;
    const atom = atoms[atomIndex];
    if (atom?.kind === 'token' && matches(atom.pattern, character)) { raw += character; atomIndex += 1; }
  }
  return raw;
}

function format(rawValue: string, atoms: readonly MaskAtom[]) {
  const raw = sanitize(rawValue, atoms);
  if (!raw) return '';
  let display = '';
  let tokenIndex = 0;
  for (const atom of atoms) {
    if (atom.kind === 'token') {
      if (tokenIndex >= raw.length) break;
      display += raw[tokenIndex++];
    } else if (tokenIndex < raw.length) display += atom.value;
  }
  return display;
}

function complete(rawValue: string, atoms: readonly MaskAtom[]) {
  const required = tokenAtoms(atoms).filter(atom => !atom.optional).length;
  return sanitize(rawValue, atoms).length >= required;
}

export function parseMaskValue(displayValue: string, mask: string, definitions: InputMaskDefinitions = defaultDefinitions) {
  return parseDisplay(displayValue, compileMask(mask, definitions));
}

export function formatMaskValue(rawValue: string, mask: string, definitions: InputMaskDefinitions = defaultDefinitions) {
  return format(rawValue, compileMask(mask, definitions));
}

export function isMaskComplete(rawValue: string, mask: string, definitions: InputMaskDefinitions = defaultDefinitions) {
  return complete(rawValue, compileMask(mask, definitions));
}

export const InputMask = React.forwardRef<HTMLInputElement, InputMaskProps>(function InputMask({
  mask,
  value,
  defaultValue = '',
  onValueChange,
  onValueCommit,
  definitions = defaultDefinitions,
  incompleteBehavior = 'allow',
  incompleteMessage = '输入尚未完整。',
  label,
  description,
  error,
  className,
  inputClassName,
  id: suppliedId,
  name,
  form,
  disabled,
  readOnly,
  required,
  onBlur,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  'aria-describedby': suppliedDescribedBy,
  'aria-invalid': suppliedInvalid,
  ...inputProps
}, forwardedRef) {
  const generatedId = React.useId();
  const id = suppliedId ?? generatedId;
  const atoms = React.useMemo(() => compileMask(mask, definitions), [mask, definitions]);
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(() => sanitize(defaultValue, atoms));
  const rawValue = sanitize(controlled ? value : internalValue, atoms);
  const [displayDraft, setDisplayDraft] = React.useState(() => format(rawValue, atoms));
  const [committedValue, setCommittedValue] = React.useState(rawValue);
  const [touched, setTouched] = React.useState(false);
  const composing = React.useRef(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const isComplete = complete(rawValue, atoms);
  const internalError = touched && (rawValue || required) && !isComplete ? incompleteMessage : undefined;
  const visibleError = error ?? internalError;
  const invalid = Boolean(visibleError) || (suppliedInvalid !== undefined && suppliedInvalid !== false && suppliedInvalid !== 'false');
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = visibleError ? `${id}-error` : undefined;
  const describedBy = [suppliedDescribedBy, descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  React.useEffect(() => { if (!composing.current) setDisplayDraft(format(rawValue, atoms)); }, [rawValue, atoms]);

  const assignRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };
  const details = (raw: string): InputMaskDetails => ({ displayValue: format(raw, atoms), complete: complete(raw, atoms) });
  const emit = (raw: string, commit = false) => {
    const next = sanitize(raw, atoms);
    if (!controlled) setInternalValue(next);
    setDisplayDraft(format(next, atoms));
    onValueChange?.(next, details(next));
    if (commit) { setCommittedValue(next); onValueCommit?.(next, details(next)); }
  };
  const setCaret = (rawCount: number) => requestAnimationFrame(() => inputRef.current?.setSelectionRange(format(rawValue.slice(0, rawCount), atoms).length, format(rawValue.slice(0, rawCount), atoms).length));
  const change = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (composing.current) { setDisplayDraft(event.target.value); return; }
    const caret = event.target.selectionStart ?? event.target.value.length;
    const before = parseDisplay(event.target.value.slice(0, caret), atoms).length;
    const next = parseDisplay(event.target.value, atoms);
    emit(next);
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(format(next.slice(0, before), atoms).length, format(next.slice(0, before), atoms).length));
  };
  const commit = () => {
    setTouched(true);
    if (isComplete || (!rawValue && !required) || incompleteBehavior === 'allow') emit(rawValue, true);
    else if (incompleteBehavior === 'clear') emit('', true);
    else emit(committedValue);
  };
  const keyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || readOnly || composing.current || (event.key !== 'Backspace' && event.key !== 'Delete')) return;
    const start = event.currentTarget.selectionStart ?? 0;
    const end = event.currentTarget.selectionEnd ?? start;
    if (start !== end) return;
    const beforeCount = parseDisplay(event.currentTarget.value.slice(0, start), atoms).length;
    const canonicalBefore = format(rawValue.slice(0, beforeCount), atoms).length;
    if (event.key === 'Backspace' && start > canonicalBefore && beforeCount > 0) {
      event.preventDefault();
      emit(rawValue.slice(0, beforeCount - 1) + rawValue.slice(beforeCount));
      setCaret(beforeCount - 1);
    } else if (event.key === 'Delete' && event.currentTarget.value[start] && start < format(rawValue.slice(0, beforeCount + 1), atoms).length - 1 && beforeCount < rawValue.length) {
      event.preventDefault();
      emit(rawValue.slice(0, beforeCount) + rawValue.slice(beforeCount + 1));
      setCaret(beforeCount);
    }
  };

  return <Field data-slot="input-mask-field" data-disabled={disabled || undefined} data-invalid={invalid || undefined} className={className}>
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    <Input {...inputProps} ref={assignRef} id={id} data-slot="input-mask" value={displayDraft} disabled={disabled} readOnly={readOnly} required={required} form={form} aria-invalid={suppliedInvalid ?? (visibleError ? true : undefined)} aria-describedby={describedBy} className={inputClassName} onChange={change} onKeyDown={keyDown} onBlur={event => { onBlur?.(event); if (!event.defaultPrevented) commit(); }} onCompositionStart={event => { composing.current = true; onCompositionStart?.(event); }} onCompositionEnd={event => { composing.current = false; const next = parseDisplay(event.currentTarget.value, atoms); emit(next); onCompositionEnd?.(event); }} />
    {name && <input type="hidden" name={name} form={form} value={rawValue} disabled={disabled} />}
    {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
    {visibleError && <FieldError id={errorId}>{visibleError}</FieldError>}
  </Field>;
});
