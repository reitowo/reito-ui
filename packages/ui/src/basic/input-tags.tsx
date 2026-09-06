import { useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Label } from '../primitives/label.js';
import { cn } from '../lib/utils.js';

export type InputTagsDuplicateBehavior = 'ignore' | 'reject' | 'allow';
export type InputTagsRejectReason = 'duplicate' | 'limit';

export interface InputTagsRejection {
  reason: InputTagsRejectReason;
  value: string;
  duplicateIndex?: number;
}

export interface InputTagsProps {
  label: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  onReject?: (rejection: InputTagsRejection) => void;
  name?: string;
  id?: string;
  placeholder?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  editable?: boolean;
  maxTags?: number;
  maxLength?: number;
  separators?: string[];
  duplicateBehavior?: InputTagsDuplicateBehavior;
  caseSensitive?: boolean;
  normalize?: (value: string) => string;
  className?: string;
}

const defaultSeparators = [',', '，'];

/** Free-text tags input. Option-backed multiselection remains a separate MultiSelect contract. */
export function InputTags({ label, value, defaultValue = [], onValueChange, onReject, name, id: idProp, placeholder = '输入后按 Enter', description, error, disabled = false, readOnly = false, required = false, editable = true, maxTags, maxLength, separators = defaultSeparators, duplicateBehavior = 'ignore', caseSensitive = false, normalize = value => value.trim(), className }: InputTagsProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<{ index: number; draft: string }>();
  const [notice, setNotice] = useState<{ text: string; error: boolean }>();
  const tags = value ?? internalValue;
  const boundedMax = maxTags === undefined ? undefined : Math.max(0, Math.floor(maxTags));
  const atLimit = boundedMax !== undefined && tags.length >= boundedMax;
  const describedBy = [description ? `${id}-description` : '', error ? `${id}-error` : '', notice ? `${id}-notice` : ''].filter(Boolean).join(' ') || undefined;

  function update(next: string[]) {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }
  function duplicateIndex(candidate: string, except = -1) {
    const comparable = caseSensitive ? candidate : candidate.toLocaleLowerCase();
    return tags.findIndex((tag, index) => index !== except && (caseSensitive ? tag : tag.toLocaleLowerCase()) === comparable);
  }
  function reject(rejection: InputTagsRejection, text: string, hard = true) {
    setNotice({ text, error: hard });
    if (hard) onReject?.(rejection);
  }
  function resolveCandidate(raw: string, replacing = -1) {
    const candidate = normalize(raw);
    if (!candidate) return { candidate, accepted: false };
    if (replacing < 0 && boundedMax !== undefined && tags.length >= boundedMax) {
      reject({ reason: 'limit', value: candidate }, `最多可添加 ${boundedMax} 个标签`);
      return { candidate, accepted: false };
    }
    const existing = duplicateIndex(candidate, replacing);
    if (existing >= 0 && duplicateBehavior !== 'allow') {
      reject({ reason: 'duplicate', value: candidate, duplicateIndex: existing }, duplicateBehavior === 'ignore' ? `已忽略重复标签：${candidate}` : `标签已存在：${candidate}`, duplicateBehavior === 'reject');
      return { candidate, accepted: false };
    }
    setNotice(undefined);
    return { candidate, accepted: true };
  }
  function addTag(raw = draft) {
    const result = resolveCandidate(raw);
    if (!result.candidate) return result;
    if (result.accepted) update([...tags, result.candidate]);
    if (result.accepted || duplicateBehavior === 'ignore') setDraft('');
    return result;
  }
  function removeTag(index: number) {
    const removed = tags[index];
    update(tags.filter((_, itemIndex) => itemIndex !== index));
    setEditing(undefined);
    setNotice(removed ? { text: `已移除标签：${removed}`, error: false } : undefined);
    requestAnimationFrame(() => inputRef.current?.focus());
  }
  function commitEdit() {
    if (!editing) return;
    const candidate = normalize(editing.draft);
    if (!candidate) { removeTag(editing.index); return; }
    const result = resolveCandidate(candidate, editing.index);
    if (!result.accepted) {
      if (duplicateBehavior === 'ignore') setEditing(undefined);
      return;
    }
    update(tags.map((tag, index) => index === editing.index ? result.candidate : tag));
    setEditing(undefined);
  }
  function handleEntryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    const separator = separators.includes(event.key);
    if ((event.key === 'Enter' && draft.trim()) || separator) {
      event.preventDefault();
      addTag();
    }
  }
  function handleEntryChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    if (notice) setNotice(undefined);
    const separator = separators.find(value => value.length > 0 && next.endsWith(value));
    if (separator) {
      const result = addTag(next.slice(0, -separator.length));
      if (!result?.candidate) setDraft('');
      else if (!result.accepted && duplicateBehavior !== 'ignore') setDraft(result.candidate);
      return;
    }
    setDraft(next);
  }

  return <div data-slot="input-tags-field" className={cn('grid min-w-0 gap-2 text-sm', className)}>
    <Label htmlFor={id}>{label}</Label>
    <div data-slot="input-tags" data-disabled={disabled || undefined} data-readonly={readOnly || undefined} aria-invalid={Boolean(error || notice?.error) || undefined} onClick={event => { if (event.target === event.currentTarget && !disabled && !readOnly) inputRef.current?.focus(); }} className="flex min-h-[var(--rui-control-height)] min-w-0 flex-wrap items-center gap-[var(--rui-space-1)] rounded-lg border border-input bg-transparent px-[var(--rui-cell-padding-x)] py-0 transition-colors focus-within:border-ring focus-within:ring-[length:var(--rui-outline-width)] focus-within:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[length:var(--rui-outline-width)] aria-invalid:ring-destructive/20 data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:bg-input/50 data-disabled:opacity-[var(--rui-opacity-disabled)] dark:bg-input/30 dark:data-disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40">
      <ul aria-label={`${label}标签`} className="contents">
        {tags.map((tag, index) => <li key={`${tag}:${index}`} data-tag-index={index} className="inline-flex min-h-[var(--rui-control-height-xs)] min-w-0 max-w-full items-center rounded-sm border border-border bg-muted text-xs text-foreground">
          {editing?.index === index ? <>
            <input autoFocus aria-label={`编辑标签 ${tag}`} value={editing.draft} size={Math.max(1, editing.draft.length)} maxLength={maxLength} onChange={event => { setEditing({ index, draft: event.target.value }); setNotice(undefined); }} onKeyDown={event => { if (event.nativeEvent.isComposing) return; if (event.key === 'Enter') { event.preventDefault(); commitEdit(); } else if (event.key === 'Escape') { event.preventDefault(); setEditing(undefined); setNotice(undefined); } }} className="h-[var(--rui-control-height-xs)] min-w-[var(--rui-control-height-lg)] bg-transparent px-[var(--rui-space-2)] text-xs outline-none" />
            <Button type="button" variant="ghost" size="icon-xs" className="size-[var(--rui-control-height-xs)] rounded-sm" aria-label={`保存标签 ${tag}`} onClick={commitEdit}><Check aria-hidden="true" /></Button>
          </> : <>
            {editable && !readOnly ? <button type="button" aria-label={`编辑标签 ${tag}`} disabled={disabled} onClick={() => { setEditing({ index, draft: tag }); setNotice(undefined); }} className="min-w-0 truncate rounded-sm px-[var(--rui-space-2)] py-[var(--rui-space-1)] text-left outline-none hover:bg-muted-foreground/10 focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring/50">{tag}</button> : <span className="min-w-0 truncate px-[var(--rui-space-2)] py-[var(--rui-space-1)]">{tag}</span>}
            {!readOnly && <Button type="button" variant="ghost" size="icon-xs" className="size-[var(--rui-control-height-xs)] rounded-sm" aria-label={`移除标签 ${tag}`} disabled={disabled} onClick={() => removeTag(index)}><X aria-hidden="true" /></Button>}
          </>}
        </li>)}
      </ul>
      <input ref={inputRef} id={id} value={draft} disabled={disabled} readOnly={readOnly} required={required && tags.length === 0} maxLength={maxLength} aria-describedby={describedBy} aria-invalid={Boolean(error || notice?.error) || undefined} aria-label={label} placeholder={atLimit ? `已达到 ${boundedMax} 个标签上限` : placeholder} onChange={handleEntryChange} onKeyDown={handleEntryKeyDown} className="h-[var(--rui-control-height-xs)] min-w-[var(--rui-control-height-lg)] flex-1 bg-transparent px-[var(--rui-space-1)] text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed" />
      {name && tags.map((tag, index) => <input key={`${name}:${tag}:${index}`} type="hidden" name={name} value={tag} />)}
    </div>
    {description && <p id={`${id}-description`} className="text-xs leading-relaxed text-muted-foreground">{description}</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
    {notice && <p id={`${id}-notice`} role={notice.error ? 'alert' : 'status'} className={cn('text-xs', notice.error ? 'text-destructive' : 'text-muted-foreground')}>{notice.text}</p>}
  </div>;
}
