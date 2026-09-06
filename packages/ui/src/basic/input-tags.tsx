import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type ClipboardEvent, type KeyboardEvent, type ReactNode } from 'react';
import { AlertCircle, Check, Plus, RotateCcw, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Label } from '../primitives/label.js';
import { Spinner } from '../primitives/spinner.js';
import { cn } from '../lib/utils.js';
import { useAsyncOptions, type AsyncOptionsLoader, type AsyncSelectOption } from './async-options.js';

export type InputTagsDuplicateBehavior = 'ignore' | 'reject' | 'allow';
export type InputTagsRejectReason = 'duplicate' | 'limit';
export type InputTagsSuggestion = AsyncSelectOption;
export type InputTagsSuggestionLoader = AsyncOptionsLoader;

export interface InputTagsRejection {
  reason: InputTagsRejectReason;
  value: string;
  duplicateIndex?: number;
}

export interface InputTagsCreateContext { signal: AbortSignal }
export type InputTagsCreateHandler = (value: string, context: InputTagsCreateContext) => void | Promise<void>;

export interface InputTagsProps {
  label: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  onReject?: (rejection: InputTagsRejection) => void;
  onCreateTag?: InputTagsCreateHandler;
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
  pasteSeparators?: string[];
  splitOnPaste?: boolean;
  duplicateBehavior?: InputTagsDuplicateBehavior;
  caseSensitive?: boolean;
  normalize?: (value: string) => string;
  suggestions?: InputTagsSuggestion[];
  loadSuggestions?: InputTagsSuggestionLoader;
  suggestionMinQueryLength?: number;
  suggestionDebounceMs?: number;
  suggestionLoadingMessage?: string;
  suggestionEmptyMessage?: string;
  suggestionRetryLabel?: string;
  createLabel?: (value: string) => ReactNode;
  disabledTags?: string[];
  tagErrors?: Record<string, string>;
  className?: string;
}

const defaultSeparators = [',', '，'];
const defaultPasteSeparators = [',', '，', '\r\n', '\n', '\t'];
const emptySuggestions: InputTagsSuggestion[] = [];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
}

function splitTagText(value: string, separators: string[]) {
  const valid = [...new Set(separators.filter(Boolean))].sort((a, b) => b.length - a.length);
  return valid.length ? value.split(new RegExp(valid.map(escapeRegExp).join('|'), 'g')) : [value];
}

/** Free-text tags input with optional remote suggestions and async creation. */
export function InputTags({ label, value, defaultValue = [], onValueChange, onReject, onCreateTag, name, id: idProp, placeholder = '输入后按 Enter', description, error, disabled = false, readOnly = false, required = false, editable = true, maxTags, maxLength, separators = defaultSeparators, pasteSeparators = defaultPasteSeparators, splitOnPaste = true, duplicateBehavior = 'ignore', caseSensitive = false, normalize = value => value.trim(), suggestions = emptySuggestions, loadSuggestions, suggestionMinQueryLength = 1, suggestionDebounceMs = 160, suggestionLoadingMessage = '正在查找建议…', suggestionEmptyMessage = '没有匹配建议', suggestionRetryLabel = '重试', createLabel = value => <>创建“{value}”</>, disabledTags = [], tagErrors = {}, className }: InputTagsProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const tagRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const composing = useRef(false);
  const createController = useRef<AbortController | undefined>(undefined);
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<{ index: number; draft: string }>();
  const [notice, setNotice] = useState<{ text: string; error: boolean }>();
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [creatingValue, setCreatingValue] = useState<string>();
  const tags = value ?? internalValue;
  const tagsRef = useRef(tags);
  const boundedMax = maxTags === undefined ? undefined : Math.max(0, Math.floor(maxTags));
  const atLimit = boundedMax !== undefined && tags.length >= boundedMax;
  const hasSuggestions = Boolean(loadSuggestions || suggestions.length);
  const suggestionLoader = useMemo<InputTagsSuggestionLoader>(() => loadSuggestions ?? (async query => {
    const term = query.trim().toLocaleLowerCase();
    return suggestions.filter(option => option.label.toLocaleLowerCase().includes(term));
  }), [loadSuggestions, suggestions]);
  const suggestionState = useAsyncOptions({ loadOptions: suggestionLoader, query: draft, minQueryLength: suggestionMinQueryLength, debounceMs: suggestionDebounceMs });
  const visibleSuggestions = useMemo(() => suggestionState.options.filter(option => duplicateBehavior === 'allow' || !tags.some(tag => sameValue(tag, option.value))), [suggestionState.options, duplicateBehavior, tags, caseSensitive]);
  const normalizedDraft = normalize(draft);
  const showCreate = !atLimit && Boolean(normalizedDraft) && !tags.some(tag => sameValue(tag, normalizedDraft)) && !visibleSuggestions.some(option => sameValue(option.value, normalizedDraft));
  const suggestionItemCount = suggestionState.status === 'ready' ? visibleSuggestions.length + (showCreate ? 1 : 0) : 0;
  const popupVisible = hasSuggestions && suggestionsOpen && !disabled && !readOnly;
  const describedBy = [description ? `${id}-description` : '', error ? `${id}-error` : '', notice ? `${id}-notice` : ''].filter(Boolean).join(' ') || undefined;

  useEffect(() => () => createController.current?.abort(), []);
  tagsRef.current = tags;
  useEffect(() => {
    setActiveSuggestion(current => suggestionItemCount ? Math.min(current, suggestionItemCount - 1) : -1);
  }, [draft, suggestionItemCount]);

  function sameValue(left: string, right: string) {
    return caseSensitive ? left === right : left.toLocaleLowerCase() === right.toLocaleLowerCase();
  }
  function update(next: string[]) {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }
  function duplicateIndex(candidate: string, current = tags, except = -1) {
    return current.findIndex((tag, index) => index !== except && sameValue(tag, candidate));
  }
  function reject(rejection: InputTagsRejection, text: string, hard = true) {
    setNotice({ text, error: hard });
    if (hard) onReject?.(rejection);
  }
  function validateCandidates(rawValues: string[]) {
    const accepted: string[] = [];
    const working = [...tags];
    let reported = false;
    let ignored = false;
    for (const raw of rawValues) {
      const candidate = normalize(raw);
      if (!candidate) continue;
      if (boundedMax !== undefined && working.length >= boundedMax) {
        reject({ reason: 'limit', value: candidate }, `最多可添加 ${boundedMax} 个标签`);
        reported = true;
        continue;
      }
      const existing = duplicateIndex(candidate, working);
      if (existing >= 0 && duplicateBehavior !== 'allow') {
        reject({ reason: 'duplicate', value: candidate, duplicateIndex: existing }, duplicateBehavior === 'ignore' ? `已忽略重复标签：${candidate}` : `标签已存在：${candidate}`, duplicateBehavior === 'reject');
        reported = true;
        ignored ||= duplicateBehavior === 'ignore';
        continue;
      }
      accepted.push(candidate);
      working.push(candidate);
    }
    return { accepted, working, reported, ignored };
  }
  function beginAdd(rawValues: string[]) {
    const result = validateCandidates(rawValues);
    if (!result.accepted.length) {
      if (result.ignored) setDraft('');
      return;
    }
    setSuggestionsOpen(false);
    setActiveSuggestion(-1);
    if (!onCreateTag) {
      update(result.working);
      setDraft('');
      if (!result.reported) setNotice(undefined);
      return;
    }
    createController.current?.abort();
    const controller = new AbortController();
    createController.current = controller;
    void (async () => {
      const created: string[] = [];
      let failedCandidate: string | undefined;
      for (const candidate of result.accepted) {
        if (controller.signal.aborted) return;
        setCreatingValue(candidate);
        setNotice({ text: `正在创建标签：${candidate}`, error: false });
        try {
          await onCreateTag(candidate, { signal: controller.signal });
          if (controller.signal.aborted) return;
          created.push(candidate);
        } catch (cause) {
          if (controller.signal.aborted) return;
          const message = cause instanceof Error && cause.message ? cause.message : '创建标签失败';
          setNotice({ text: message, error: true });
          failedCandidate = candidate;
          break;
        }
      }
      if (created.length) {
        const current = tagsRef.current;
        update([...current, ...created.filter(candidate => duplicateBehavior === 'allow' || !current.some(tag => sameValue(tag, candidate)))]);
      }
      setDraft(failedCandidate ?? '');
      if (created.length === result.accepted.length) setNotice(undefined);
      setCreatingValue(undefined);
    })();
  }
  function isTagDisabled(tag: string) {
    return disabledTags.some(item => sameValue(item, tag));
  }
  function removeTag(index: number, focusIndex?: number) {
    const removed = tags[index];
    if (!removed || isTagDisabled(removed)) return;
    update(tags.filter((_, itemIndex) => itemIndex !== index));
    setEditing(undefined);
    setNotice({ text: `已移除标签：${removed}`, error: false });
    requestAnimationFrame(() => {
      if (focusIndex !== undefined) {
        const adjusted = focusIndex > index ? focusIndex - 1 : focusIndex;
        const target = tagRefs.current[adjusted];
        if (target && !target.disabled) { target.focus(); return; }
      }
      inputRef.current?.focus();
    });
  }
  function commitEdit() {
    if (!editing) return;
    const candidate = normalize(editing.draft);
    if (!candidate) { removeTag(editing.index); return; }
    const existing = duplicateIndex(candidate, tags, editing.index);
    if (existing >= 0 && duplicateBehavior !== 'allow') {
      reject({ reason: 'duplicate', value: candidate, duplicateIndex: existing }, duplicateBehavior === 'ignore' ? `已忽略重复标签：${candidate}` : `标签已存在：${candidate}`, duplicateBehavior === 'reject');
      if (duplicateBehavior === 'ignore') setEditing(undefined);
      return;
    }
    update(tags.map((tag, index) => index === editing.index ? candidate : tag));
    setEditing(undefined);
    setNotice(undefined);
  }
  function focusTag(start: number, step: -1 | 1) {
    for (let index = start; index >= 0 && index < tags.length; index += step) {
      const target = tagRefs.current[index];
      if (target && !target.disabled) { target.focus(); return true; }
    }
    return false;
  }
  function handleTagKeyDown(index: number, event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); focusTag(index - 1, -1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); if (!focusTag(index + 1, 1)) inputRef.current?.focus(); }
    else if (event.key === 'Home') { event.preventDefault(); focusTag(0, 1); }
    else if (event.key === 'End') { event.preventDefault(); focusTag(tags.length - 1, -1); }
    else if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); removeTag(index, index - 1); }
  }
  function handleEntryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || composing.current) return;
    if (hasSuggestions && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestion(current => {
        if (!suggestionItemCount) return -1;
        if (event.key === 'ArrowDown') return current < 0 ? 0 : (current + 1) % suggestionItemCount;
        return current < 0 ? suggestionItemCount - 1 : (current - 1 + suggestionItemCount) % suggestionItemCount;
      });
      return;
    }
    if (event.key === 'Escape' && suggestionsOpen) { event.preventDefault(); setSuggestionsOpen(false); return; }
    if (event.key === 'Enter' && suggestionsOpen && activeSuggestion >= 0) {
      event.preventDefault();
      const suggestion = visibleSuggestions[activeSuggestion];
      if (suggestion) {
        if (!suggestion.disabled) beginAdd([suggestion.value]);
      } else if (showCreate) beginAdd([draft]);
      return;
    }
    const separator = separators.includes(event.key);
    if ((event.key === 'Enter' && draft.trim()) || separator) {
      event.preventDefault();
      beginAdd([draft]);
      return;
    }
    if (!draft && (event.key === 'ArrowLeft' || event.key === 'Backspace')) {
      event.preventDefault();
      focusTag(tags.length - 1, -1);
    }
  }
  function applyEntryChange(next: string) {
    if (notice) setNotice(undefined);
    const separator = separators.find(value => value.length > 0 && next.endsWith(value));
    if (separator) {
      const candidate = next.slice(0, -separator.length);
      setDraft(candidate);
      beginAdd([candidate]);
      return;
    }
    setDraft(next);
    setSuggestionsOpen(hasSuggestions);
    setActiveSuggestion(-1);
  }
  function handleEntryChange(event: ChangeEvent<HTMLInputElement>) {
    if (composing.current) {
      setDraft(event.target.value);
      return;
    }
    applyEntryChange(event.target.value);
  }
  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    if (!splitOnPaste || disabled || readOnly || creatingValue) return;
    const pasted = event.clipboardData.getData('text');
    const values = splitTagText(pasted, pasteSeparators);
    if (values.length < 2) return;
    event.preventDefault();
    beginAdd(values);
  }

  return <div data-slot="input-tags-field" className={cn('grid min-w-0 gap-2 text-sm', className)}>
    <Label htmlFor={id}>{label}</Label>
    <div className="relative min-w-0">
      <div data-slot="input-tags" data-disabled={disabled || undefined} data-readonly={readOnly || undefined} aria-invalid={Boolean(error || notice?.error) || undefined} aria-busy={Boolean(creatingValue) || undefined} onClick={event => { if (event.target === event.currentTarget && !disabled && !readOnly) inputRef.current?.focus(); }} className="flex min-h-[var(--rui-control-height)] min-w-0 flex-wrap items-center gap-[var(--rui-space-1)] rounded-lg border border-input bg-transparent px-[var(--rui-cell-padding-x)] py-0 transition-colors focus-within:border-ring focus-within:ring-[length:var(--rui-outline-width)] focus-within:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[length:var(--rui-outline-width)] aria-invalid:ring-destructive/20 data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:bg-input/50 data-disabled:opacity-[var(--rui-opacity-disabled)] dark:bg-input/30 dark:data-disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40">
        <ul aria-label={`${label}标签`} className="contents">
          {tags.map((tag, index) => {
            const tagDisabled = isTagDisabled(tag);
            const tagError = tagErrors[tag];
            return <li key={`${tag}:${index}`} data-tag-index={index} aria-invalid={Boolean(tagError) || undefined} aria-describedby={tagError ? `${id}-tag-error-${index}` : undefined} className="inline-flex min-h-[var(--rui-control-height-xs)] min-w-0 max-w-full items-center rounded-sm border border-border bg-muted text-xs text-foreground aria-invalid:border-destructive">
              {editing?.index === index ? <>
                <input autoFocus aria-label={`编辑标签 ${tag}`} value={editing.draft} size={Math.max(1, editing.draft.length)} maxLength={maxLength} onChange={event => { setEditing({ index, draft: event.target.value }); setNotice(undefined); }} onKeyDown={event => { if (event.nativeEvent.isComposing) return; if (event.key === 'Enter') { event.preventDefault(); commitEdit(); } else if (event.key === 'Escape') { event.preventDefault(); setEditing(undefined); setNotice(undefined); } }} className="h-[var(--rui-control-height-xs)] min-w-[var(--rui-control-height-lg)] bg-transparent px-[var(--rui-space-2)] text-xs outline-none" />
                <Button type="button" variant="ghost" size="icon-xs" className="size-[var(--rui-control-height-xs)] rounded-sm" aria-label={`保存标签 ${tag}`} onClick={commitEdit}><Check aria-hidden="true" /></Button>
              </> : <>
                {editable && !readOnly && !tagDisabled ? <button ref={node => { tagRefs.current[index] = node; }} type="button" aria-label={`编辑标签 ${tag}`} disabled={disabled} onClick={() => { setEditing({ index, draft: tag }); setNotice(undefined); }} onKeyDown={event => handleTagKeyDown(index, event)} className="min-w-0 truncate rounded-sm px-[var(--rui-space-2)] py-[var(--rui-space-1)] text-left outline-none hover:bg-muted-foreground/10 focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring/50">{tag}</button> : <span className="min-w-0 truncate px-[var(--rui-space-2)] py-[var(--rui-space-1)]">{tag}</span>}
                {!readOnly && !tagDisabled && <Button type="button" variant="ghost" size="icon-xs" tabIndex={-1} className="size-[var(--rui-control-height-xs)] rounded-sm" aria-label={`移除标签 ${tag}`} disabled={disabled} onClick={() => removeTag(index)}><X aria-hidden="true" /></Button>}
                {tagError && <><AlertCircle aria-hidden="true" className="mr-[var(--rui-space-1)] size-3 shrink-0 text-destructive" /><span id={`${id}-tag-error-${index}`} className="sr-only">{tagError}</span></>}
              </>}
            </li>;
          })}
        </ul>
        <input ref={inputRef} id={id} data-slot="input-tags-input" role={hasSuggestions ? 'combobox' : undefined} aria-autocomplete={hasSuggestions ? 'list' : undefined} aria-expanded={hasSuggestions ? popupVisible : undefined} aria-controls={hasSuggestions ? `${id}-suggestions` : undefined} aria-activedescendant={popupVisible && activeSuggestion >= 0 ? `${id}-suggestion-${activeSuggestion}` : undefined} value={draft} disabled={disabled} readOnly={readOnly || Boolean(creatingValue)} required={required && tags.length === 0} maxLength={maxLength} aria-describedby={describedBy} aria-invalid={Boolean(error || notice?.error) || undefined} aria-label={label} aria-busy={Boolean(creatingValue) || undefined} placeholder={atLimit ? `已达到 ${boundedMax} 个标签上限` : placeholder} onFocus={() => setSuggestionsOpen(hasSuggestions)} onBlur={() => setSuggestionsOpen(false)} onChange={handleEntryChange} onPaste={handlePaste} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={event => { composing.current = false; applyEntryChange(event.currentTarget.value); }} onKeyDown={handleEntryKeyDown} className="h-[var(--rui-control-height-xs)] min-w-[var(--rui-control-height-lg)] flex-1 bg-transparent px-[var(--rui-space-1)] text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed" />
        {creatingValue && <Spinner aria-label={`正在创建标签：${creatingValue}`} />}
        {name && tags.map((tag, index) => <input key={`${name}:${tag}:${index}`} type="hidden" name={name} value={tag} />)}
      </div>
      {popupVisible && <div id={`${id}-suggestions`} data-slot="input-tags-suggestions" role={suggestionState.status === 'ready' ? 'listbox' : undefined} aria-label={`${label}建议`} className="absolute z-[var(--rui-z-popover)] mt-[var(--rui-space-1)] max-h-64 w-full overflow-auto rounded-lg bg-popover p-[var(--rui-space-1)] text-popover-foreground shadow-md ring-1 ring-foreground/10">
        {suggestionState.status === 'idle' ? <p className="px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-sm text-muted-foreground">请输入至少 {Math.max(1, suggestionMinQueryLength)} 个字符</p>
          : suggestionState.status === 'loading' ? <div role="status" className="flex items-center gap-[var(--rui-space-2)] px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-sm text-muted-foreground"><Spinner aria-hidden="true" />{suggestionLoadingMessage}</div>
            : suggestionState.status === 'error' ? <div className="grid gap-[var(--rui-space-2)] px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)]"><p role="alert" className="flex items-start gap-[var(--rui-space-2)] text-sm text-destructive"><AlertCircle aria-hidden="true" className="mt-[var(--rui-space-1)] size-3 shrink-0" />{suggestionState.loadError}</p><Button type="button" variant="outline" size="xs" className="justify-self-start" onMouseDown={event => event.preventDefault()} onClick={suggestionState.retry}><RotateCcw aria-hidden="true" />{suggestionRetryLabel}</Button></div>
              : <>{visibleSuggestions.map((option, index) => <button id={`${id}-suggestion-${index}`} key={option.value} type="button" role="option" aria-selected={activeSuggestion === index} disabled={option.disabled} data-active={activeSuggestion === index || undefined} onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActiveSuggestion(index)} onClick={() => beginAdd([option.value])} className="flex min-h-[var(--rui-control-height-sm)] w-full items-center rounded-md px-[var(--rui-space-2)] text-left text-sm outline-none data-active:bg-accent data-active:text-accent-foreground disabled:pointer-events-none disabled:opacity-[var(--rui-opacity-disabled)]"><span className="min-w-0"><span className="block truncate">{option.label}</span>{option.description && <span className="block truncate text-xs text-muted-foreground">{option.description}</span>}</span></button>)}
                {showCreate && <button id={`${id}-suggestion-${visibleSuggestions.length}`} type="button" role="option" aria-selected={activeSuggestion === visibleSuggestions.length} data-active={activeSuggestion === visibleSuggestions.length || undefined} onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActiveSuggestion(visibleSuggestions.length)} onClick={() => beginAdd([draft])} className="flex min-h-[var(--rui-control-height-sm)] w-full items-center gap-[var(--rui-space-2)] rounded-md px-[var(--rui-space-2)] text-left text-sm outline-none data-active:bg-accent data-active:text-accent-foreground"><Plus aria-hidden="true" className="size-3.5 shrink-0" />{createLabel(normalizedDraft)}</button>}
                {!visibleSuggestions.length && !showCreate && <div role="option" aria-disabled="true" className="px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-sm text-muted-foreground">{suggestionEmptyMessage}</div>}</>}
      </div>}
    </div>
    {description && <p id={`${id}-description`} className="text-xs leading-relaxed text-muted-foreground">{description}</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
    {notice && <p id={`${id}-notice`} role={notice.error ? 'alert' : 'status'} className={cn('text-xs', notice.error ? 'text-destructive' : 'text-muted-foreground')}>{notice.text}</p>}
  </div>;
}
