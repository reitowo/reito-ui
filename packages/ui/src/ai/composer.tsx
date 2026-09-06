import { useId, useRef, useState, type ReactNode } from 'react';
import { ArrowUp, LoaderCircle, Square } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Textarea } from '../primitives/textarea.js';
import { classes } from './shared.js';

export interface ComposerProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit: (text: string) => void | Promise<void>;
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

/** Clears only a successfully submitted, unchanged draft. Rejected submissions remain editable. */
export function Composer({ value, defaultValue = '', onValueChange, onSubmit, onStop, running = false, disabled = false, placeholder = '描述你的下一步…', label = '消息草稿', submitLabel = '发送消息', stopLabel = '停止生成', toolbar, context, hint = 'Enter 发送 · Shift + Enter 换行', error, className }: ComposerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const text = value ?? internalValue;
  const currentText = useRef(text);
  currentText.current = text;
  const inFlight = useRef(false);
  const composing = useRef(false);
  const hintId = useId();
  const errorId = useId();
  const errorMessage = error ?? submissionError;

  function update(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    currentText.current = nextValue;
    onValueChange?.(nextValue);
    if (submissionError) setSubmissionError('');
  }

  async function submit() {
    if (disabled || running || inFlight.current || !currentText.current.trim()) return;
    const submittedText = currentText.current;
    inFlight.current = true;
    setSubmitting(true);
    setSubmissionError('');
    try {
      await onSubmit(submittedText);
      if (currentText.current === submittedText) update('');
    } catch (reason) {
      setSubmissionError(reason instanceof Error ? reason.message : '提交失败，草稿已保留。请重试。');
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return <form className={classes('grid min-w-0 gap-2', className)} onSubmit={event => { event.preventDefault(); void submit(); }} aria-label={`${label}输入区`}>
    <div className="overflow-hidden rounded-[var(--rui-radius-composer)] border border-input bg-[var(--rui-composer-bg)] shadow-xs focus-within:ring-[length:var(--rui-outline-width)] focus-within:ring-ring/30">
      {context && <div className="flex min-w-0 flex-wrap gap-1.5 px-[var(--rui-content-padding)] pt-[var(--rui-content-gap-sm)]">{context}</div>}
      <Textarea
        aria-label={label}
        aria-describedby={[hint ? hintId : '', errorMessage ? errorId : ''].filter(Boolean).join(' ') || undefined}
        aria-invalid={Boolean(errorMessage)}
        className="min-h-[var(--rui-composer-input-height)] resize-y rounded-none border-0 bg-transparent px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-base shadow-none focus-visible:ring-0 md:text-base dark:bg-transparent"
        value={text}
        rows={2}
        disabled={disabled || submitting}
        placeholder={placeholder}
        onChange={event => update(event.target.value)}
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={() => { composing.current = false; }}
        onKeyDown={event => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && !composing.current && event.keyCode !== 229) {
            event.preventDefault();
            void submit();
          }
        }}
      />
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
