import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowUp, File, LoaderCircle, Square, UserRound } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Textarea } from '../primitives/textarea.js';
import { ContextPill } from './context.js';
import { classes } from './shared.js';

export type ComposerMentionKind = 'file' | 'person';

export interface ComposerMentionItem {
  id: string;
  label: string;
  kind: ComposerMentionKind;
  description?: string;
  keywords?: readonly string[];
  disabled?: boolean;
}

export interface ComposerMentionValue {
  key: string;
  itemId: string;
  label: string;
  kind: ComposerMentionKind;
  start: number;
  end: number;
}

export interface ComposerCommandItem {
  id: string;
  label: string;
  description?: string;
  keywords?: readonly string[];
  /** Text replacing the slash query. Omit it for an action-only command. */
  insertText?: string;
  disabled?: boolean;
}

export interface ComposerContextItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ComposerDraft {
  text: string;
  mentions: ComposerMentionValue[];
  contextIds: string[];
}

export interface ComposerProps {
  value?: string;
  defaultValue?: string;
  draft?: ComposerDraft;
  defaultDraft?: ComposerDraft;
  onValueChange?: (value: string) => void;
  onDraftChange?: (draft: ComposerDraft) => void;
  onSubmit: (text: string) => void | Promise<void>;
  /** When provided, handles submission instead of the legacy string callback. */
  onSubmitDraft?: (draft: ComposerDraft) => void | Promise<void>;
  commandItems?: readonly ComposerCommandItem[];
  mentionItems?: readonly ComposerMentionItem[];
  contextItems?: readonly ComposerContextItem[];
  onCommandSelect?: (command: ComposerCommandItem, draft: ComposerDraft) => void;
  onMentionSelect?: (mention: ComposerMentionValue, draft: ComposerDraft) => void;
  onContextRemove?: (contextId: string) => void;
  onStop?: () => void;
  running?: boolean;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  submitLabel?: string;
  stopLabel?: string;
  toolbar?: ReactNode;
  context?: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
}

type ComposerTrigger = { kind: 'command' | 'mention'; start: number; end: number; query: string };
type ComposerSuggestion = { key: string; label: string; description?: string; disabled?: boolean; command?: ComposerCommandItem; mention?: ComposerMentionItem };

function validMentions(text: string, mentions: readonly ComposerMentionValue[]) {
  return mentions.filter(mention => mention.start >= 0 && mention.end <= text.length && mention.start < mention.end && text.slice(mention.start, mention.end) === `@${mention.label}`);
}

function rebaseMentions(previous: string, next: string, mentions: readonly ComposerMentionValue[]) {
  let start = 0;
  while (start < previous.length && start < next.length && previous[start] === next[start]) start += 1;
  let previousEnd = previous.length;
  let nextEnd = next.length;
  while (previousEnd > start && nextEnd > start && previous[previousEnd - 1] === next[nextEnd - 1]) {
    previousEnd -= 1;
    nextEnd -= 1;
  }
  const delta = nextEnd - previousEnd;
  return validMentions(previous, mentions).flatMap(mention => {
    if (mention.end <= start) return [mention];
    if (mention.start >= previousEnd) return [{ ...mention, start: mention.start + delta, end: mention.end + delta }];
    return [];
  });
}

function triggerAt(text: string, caret: number): ComposerTrigger | undefined {
  const before = text.slice(0, caret);
  const match = /(^|\s)([/@])([^\s/@]*)$/.exec(before);
  if (!match) return undefined;
  const start = match.index + match[1].length;
  return { kind: match[2] === '/' ? 'command' : 'mention', start, end: caret, query: match[3] };
}

function searchable(item: { label: string; description?: string; keywords?: readonly string[] }, query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  return !normalized || [item.label, item.description ?? '', ...(item.keywords ?? [])].some(value => value.toLocaleLowerCase().includes(normalized));
}

function sameDraft(left: ComposerDraft, right: ComposerDraft) {
  return left.text === right.text
    && left.contextIds.join('\u0000') === right.contextIds.join('\u0000')
    && left.mentions.length === right.mentions.length
    && left.mentions.every((mention, index) => {
      const other = right.mentions[index];
      return other && mention.key === other.key && mention.itemId === other.itemId && mention.label === other.label && mention.kind === other.kind && mention.start === other.start && mention.end === other.end;
    });
}

/** Clears only a successfully submitted, unchanged draft. Rejected submissions remain editable. */
export function Composer({ value, defaultValue = '', draft, defaultDraft, onValueChange, onDraftChange, onSubmit, onSubmitDraft, commandItems = [], mentionItems = [], contextItems: suppliedContextItems, onCommandSelect, onMentionSelect, onContextRemove, onStop, running = false, disabled = false, placeholder = '描述你的下一步…', label = '消息草稿', submitLabel = '发送消息', stopLabel = '停止生成', toolbar, context, hint = 'Enter 发送 · Shift + Enter 换行', error, className }: ComposerProps) {
  const [internalDraft, setInternalDraft] = useState<ComposerDraft>(() => defaultDraft ?? { text: defaultValue, mentions: [], contextIds: [] });
  const contextItems = suppliedContextItems ?? (draft?.contextIds ?? internalDraft.contextIds).map(id => ({ id, label: id } as ComposerContextItem));
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [candidateTrigger, setTrigger] = useState<ComposerTrigger>();
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const mentionSequence = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedOptionRef = useRef<HTMLButtonElement>(null);
  const text = draft?.text ?? value ?? internalDraft.text;
  const currentDraft = useRef<ComposerDraft>({
    text,
    mentions: validMentions(text, draft?.mentions ?? internalDraft.mentions),
    contextIds: contextItems.map(item => item.id),
  });
  currentDraft.current = { text, mentions: validMentions(text, draft?.mentions ?? internalDraft.mentions), contextIds: contextItems.map(item => item.id) };
  const inFlight = useRef(false);
  const composing = useRef(false);
  const hintId = useId();
  const errorId = useId();
  const suggestionId = useId();
  const errorMessage = error ?? submissionError;
  const trigger = !disabled && !submitting && candidateTrigger &&
    text.slice(candidateTrigger.start, candidateTrigger.end) === `${candidateTrigger.kind === 'command' ? '/' : '@'}${candidateTrigger.query}` &&
    (candidateTrigger.kind === 'command' ? commandItems.length : mentionItems.length) ? candidateTrigger : undefined;

  const suggestions: ComposerSuggestion[] = trigger?.kind === 'command'
    ? commandItems.filter(item => searchable(item, trigger.query)).map(item => ({ key: `command:${item.id}`, label: item.label, description: item.description, disabled: item.disabled, command: item }))
    : trigger?.kind === 'mention'
      ? mentionItems.filter(item => searchable(item, trigger.query)).map(item => ({ key: `mention:${item.kind}:${item.id}`, label: item.label, description: item.description, disabled: item.disabled, mention: item }))
      : [];
  const usableSuggestions = suggestions.filter(item => !item.disabled);
  const selectedKey = usableSuggestions[Math.min(activeSuggestion, usableSuggestions.length - 1)]?.key;

  useEffect(() => {
    selectedOptionRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selectedKey, trigger?.query]);

  function focusAt(position: number) {
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(position, position);
    });
  }

  function update(next: ComposerDraft) {
    const normalized = { ...next, mentions: validMentions(next.text, next.mentions), contextIds: contextItems.map(item => item.id) };
    if (draft === undefined) setInternalDraft(normalized);
    currentDraft.current = normalized;
    onValueChange?.(normalized.text);
    onDraftChange?.(normalized);
    if (submissionError) setSubmissionError('');
  }

  function updateText(nextText: string, caret?: number) {
    update({ ...currentDraft.current, text: nextText, mentions: rebaseMentions(currentDraft.current.text, nextText, currentDraft.current.mentions) });
    const nextTrigger = triggerAt(nextText, caret ?? nextText.length);
    setTrigger(nextTrigger);
    setActiveSuggestion(0);
  }

  function replaceTrigger(replacement: string) {
    if (!trigger) return currentDraft.current;
    const previous = currentDraft.current;
    const nextText = `${previous.text.slice(0, trigger.start)}${replacement}${previous.text.slice(trigger.end)}`;
    const next = { ...previous, text: nextText, mentions: rebaseMentions(previous.text, nextText, previous.mentions) };
    update(next);
    setTrigger(undefined);
    setActiveSuggestion(0);
    focusAt(trigger.start + replacement.length);
    return next;
  }

  function selectSuggestion(suggestion: ComposerSuggestion) {
    if (disabled || inFlight.current || suggestion.disabled) return;
    if (suggestion.command) {
      const next = replaceTrigger(suggestion.command.insertText ?? '');
      onCommandSelect?.(suggestion.command, next);
      return;
    }
    if (suggestion.mention && trigger) {
      const item = suggestion.mention;
      const token = `@${item.label}`;
      const previous = currentDraft.current;
      const replacement = `${token} `;
      const nextText = `${previous.text.slice(0, trigger.start)}${replacement}${previous.text.slice(trigger.end)}`;
      let key: string;
      do { key = `${item.kind}:${item.id}:${++mentionSequence.current}`; } while (previous.mentions.some(mention => mention.key === key));
      const mention: ComposerMentionValue = { key, itemId: item.id, label: item.label, kind: item.kind, start: trigger.start, end: trigger.start + token.length };
      const next = { ...previous, text: nextText, mentions: [...rebaseMentions(previous.text, nextText, previous.mentions), mention] };
      update(next);
      setTrigger(undefined);
      setActiveSuggestion(0);
      focusAt(trigger.start + replacement.length);
      onMentionSelect?.(mention, next);
    }
  }

  function removeMention(key: string) {
    if (disabled || inFlight.current) return;
    const mention = currentDraft.current.mentions.find(item => item.key === key);
    if (!mention) return;
    const trailing = currentDraft.current.text[mention.end] === ' ' ? 1 : 0;
    const nextText = `${currentDraft.current.text.slice(0, mention.start)}${currentDraft.current.text.slice(mention.end + trailing)}`;
    const delta = mention.end + trailing - mention.start;
    update({ ...currentDraft.current, text: nextText, mentions: currentDraft.current.mentions.filter(item => item.key !== key).map(item => item.start > mention.start ? { ...item, start: item.start - delta, end: item.end - delta } : item) });
    focusAt(mention.start);
  }

  async function submit() {
    if (disabled || running || inFlight.current || !currentDraft.current.text.trim()) return;
    const submittedDraft = currentDraft.current;
    inFlight.current = true;
    setSubmitting(true);
    setSubmissionError('');
    try {
      if (onSubmitDraft) await onSubmitDraft(submittedDraft);
      else await onSubmit(submittedDraft.text);
      if (sameDraft(currentDraft.current, submittedDraft)) update({ text: '', mentions: [], contextIds: contextItems.map(item => item.id) });
    } catch (reason) {
      setSubmissionError(reason instanceof Error ? reason.message : '提交失败，草稿已保留。请重试。');
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return <form className={classes('grid min-w-0 gap-2', className)} onSubmit={event => { event.preventDefault(); void submit(); }} aria-label={`${label}输入区`}>
    <div className="overflow-hidden rounded-[var(--rui-radius-composer)] border border-input bg-[var(--rui-composer-bg)] shadow-xs focus-within:ring-[length:var(--rui-outline-width)] focus-within:ring-ring/30">
      {Boolean(context || contextItems.length || currentDraft.current.mentions.length) && <div role="group" aria-label="草稿上下文与提及" className="flex min-w-0 flex-wrap gap-1.5 px-[var(--rui-content-padding)] pt-[var(--rui-content-gap-sm)]">
        {context}
        {contextItems.map(item => <ContextPill key={item.id} label={item.label} icon={item.icon} disabled={disabled || submitting || item.disabled} onRemove={onContextRemove ? () => onContextRemove(item.id) : undefined}>{item.label}</ContextPill>)}
        {currentDraft.current.mentions.map(mention => <ContextPill key={mention.key} label={`@${mention.label}`} icon={mention.kind === 'file' ? <File /> : <UserRound />} disabled={disabled || submitting} onRemove={() => removeMention(mention.key)}>@{mention.label}</ContextPill>)}
      </div>}
      <Textarea
        ref={textareaRef}
        aria-label={label}
        aria-describedby={[hint ? hintId : '', errorMessage ? errorId : ''].filter(Boolean).join(' ') || undefined}
        aria-invalid={Boolean(errorMessage)}
        aria-autocomplete={commandItems.length || mentionItems.length ? 'list' : 'none'}
        aria-controls={trigger ? suggestionId : undefined}
        aria-activedescendant={trigger && usableSuggestions.length ? `${suggestionId}-${usableSuggestions[Math.min(activeSuggestion, usableSuggestions.length - 1)]?.key}` : undefined}
        className="min-h-[var(--rui-composer-input-height)] resize-y rounded-none border-0 bg-transparent px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-base shadow-none focus-visible:ring-0 md:text-base dark:bg-transparent"
        value={text}
        rows={2}
        disabled={disabled || submitting}
        placeholder={placeholder}
        onChange={event => updateText(event.target.value, event.target.selectionStart)}
        onSelect={event => {
          if (composing.current) return;
          const next = event.currentTarget.selectionStart === event.currentTarget.selectionEnd
            ? triggerAt(event.currentTarget.value, event.currentTarget.selectionStart) : undefined;
          if (next?.start === candidateTrigger?.start && next?.end === candidateTrigger?.end && next?.query === candidateTrigger?.query && next?.kind === candidateTrigger?.kind) return;
          setTrigger(next);
          setActiveSuggestion(0);
        }}
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={event => { composing.current = false; setTrigger(triggerAt(event.currentTarget.value, event.currentTarget.selectionStart)); setActiveSuggestion(0); }}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing || composing.current || event.keyCode === 229) return;
          if (trigger && usableSuggestions.length) {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveSuggestion(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + usableSuggestions.length) % usableSuggestions.length);
              return;
            }
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              const selected = usableSuggestions[Math.min(activeSuggestion, usableSuggestions.length - 1)];
              if (selected) selectSuggestion(selected);
              return;
            }
          }
          if (trigger && event.key === 'Escape') {
            event.preventDefault();
            setTrigger(undefined);
            return;
          }
          if (trigger && event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); return; }
          if (event.key === 'Tab') setTrigger(undefined);
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && !composing.current && event.keyCode !== 229) {
            event.preventDefault();
            void submit();
          }
        }}
      />
      {trigger && <div id={suggestionId} role="listbox" aria-label={trigger.kind === 'command' ? '斜杠命令' : '提及建议'} className="max-h-[var(--rui-container-md)] min-w-0 overflow-y-auto border-t border-border bg-popover p-[var(--rui-content-gap-sm)]">
        {suggestions.length ? <div className="grid gap-1">{suggestions.map(suggestion => {
          const usableIndex = usableSuggestions.findIndex(item => item.key === suggestion.key);
          const selected = usableIndex >= 0 && usableIndex === Math.min(activeSuggestion, usableSuggestions.length - 1);
          return <button
            key={suggestion.key}
            ref={selected ? selectedOptionRef : undefined}
            id={`${suggestionId}-${suggestion.key}`}
            type="button"
            role="option"
            aria-selected={selected}
            disabled={suggestion.disabled}
            tabIndex={-1}
            className={classes('grid min-w-0 rounded-md px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-left text-sm hover:bg-accent focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:outline-ring disabled:opacity-50', selected && 'bg-accent')}
            onMouseDown={event => event.preventDefault()}
            onClick={() => selectSuggestion(suggestion)}
          ><span className="truncate font-medium">{trigger.kind === 'command' ? '/' : '@'}{suggestion.label}</span>{suggestion.description && <span className="truncate text-xs text-muted-foreground">{suggestion.description}</span>}</button>;
        })}</div> : <p className="px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-xs text-muted-foreground">没有匹配项</p>}
      </div>}
      <div className="flex min-w-0 flex-wrap items-center gap-2 px-[var(--rui-content-gap-sm)] pb-[var(--rui-content-gap-sm)]">
        {toolbar && <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">{toolbar}</div>}
        {running ? <Button type="button" size="sm" variant="outline" className="ml-auto" aria-label={stopLabel} disabled={disabled || !onStop} onClick={event => { event.preventDefault(); onStop?.(); }}><Square className="size-3.5" aria-hidden="true" />停止</Button>
          : <Button type="submit" size="sm" className="ml-auto" aria-label={submitting ? '正在提交' : submitLabel} disabled={disabled || submitting || !text.trim()}>{submitting ? <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" /> : <ArrowUp className="size-4" aria-hidden="true" />}</Button>}
      </div>
    </div>
    {errorMessage && <p id={errorId} role="alert" className="text-sm text-destructive">{errorMessage}</p>}
    {hint && <div id={hintId} className="text-xs text-muted-foreground">{hint}</div>}
  </form>;
}
