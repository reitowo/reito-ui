import { useEffect, useState } from 'react';
import { Check, Copy, RotateCcw, ThumbsDown, ThumbsUp, Volume2 } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { cn } from '../lib/utils.js';
import { usePrefersReducedMotion } from './shared.js';

export type MessageActionKey = 'copy' | 'regenerate' | 'feedback' | 'speak';
export type FeedbackKind = 'up' | 'down';
export type MessageActionsProps = {
  text?: string;
  actions?: MessageActionKey[];
  versions?: number | string[];
  version?: number;
  defaultVersion?: number;
  onVersionChange?: (index: number) => void;
  onCopy?: (text?: string) => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
  onFeedback?: (kind: FeedbackKind | null, reason?: string) => void;
  reasons?: string[];
  onSpeak?: (playing: boolean) => void;
  speaking?: boolean;
  speakDuration?: number;
  quiet?: boolean;
  label?: string;
  className?: string;
};

export function MessageText({
  version,
  children,
  className,
}: {
  version: string | number;
  children: string;
  className?: string;
}) {
  return (
    <p
      key={version}
      className={cn(
        'text-[length:var(--rui-font-reading)] leading-[var(--rui-line-reading)]',
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Quiet action bar under an assistant message. */
export function MessageActions({
  text = '',
  actions = ['copy', 'regenerate', 'feedback', 'speak'],
  versions,
  version,
  defaultVersion,
  onVersionChange,
  onCopy,
  onRegenerate,
  regenerating = false,
  onFeedback,
  reasons = ['不准确', '有害', '其他'],
  onSpeak,
  speaking,
  speakDuration,
  quiet = true,
  label = '消息操作',
  className,
}: MessageActionsProps) {
  const reduced = usePrefersReducedMotion();
  const count = Array.isArray(versions) ? versions.length : (versions ?? 1);
  const [internalVersion, setInternalVersion] = useState(defaultVersion ?? Math.max(0, count - 1));
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackKind | null>(null);
  const [reason, setReason] = useState('');
  const [playing, setPlaying] = useState(false);
  const current = version ?? internalVersion;
  const isSpeaking = speaking ?? playing;

  useEffect(() => {
    if (!isSpeaking || speaking !== undefined) return;
    const duration = speakDuration ?? Math.max(1200, text.length * 40);
    const timer = window.setTimeout(
      () => {
        setPlaying(false);
        onSpeak?.(false);
      },
      reduced ? 0 : duration,
    );
    return () => window.clearTimeout(timer);
  }, [isSpeaking, speaking, speakDuration, text, onSpeak, reduced]);

  function setVersion(index: number) {
    if (version === undefined) setInternalVersion(index);
    onVersionChange?.(index);
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'flex flex-wrap items-center gap-1',
        quiet && 'opacity-70 focus-within:opacity-100 hover:opacity-100',
        className,
      )}
    >
      {actions.includes('copy') ? (
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={copied ? '已复制' : '复制'}
          onClick={async () => {
            try {
              await navigator.clipboard?.writeText(text);
            } catch {
              /* Host clipboard may be unavailable in the preview. */
            }
            onCopy?.(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      ) : null}
      {actions.includes('regenerate') ? (
        <>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="重新生成"
            aria-busy={regenerating}
            disabled={regenerating}
            onClick={onRegenerate}
          >
            <RotateCcw className={cn(regenerating && !reduced && 'animate-spin')} />
          </Button>
          {count > 1 ? (
            <span className="inline-flex items-center gap-1 text-[length:var(--rui-font-caption)] text-muted-foreground">
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label="上一版本"
                disabled={current <= 0}
                onClick={() => setVersion(current - 1)}
              >
                ‹
              </Button>
              {current + 1} / {count}
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label="下一版本"
                disabled={current >= count - 1}
                onClick={() => setVersion(current + 1)}
              >
                ›
              </Button>
            </span>
          ) : null}
        </>
      ) : null}
      {actions.includes('feedback') ? (
        <>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-pressed={feedback === 'up'}
            aria-label="有帮助"
            onClick={() => {
              const next = feedback === 'up' ? null : 'up';
              setFeedback(next);
              onFeedback?.(next);
            }}
          >
            <ThumbsUp className={cn(feedback === 'up' && 'fill-current')} />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-pressed={feedback === 'down'}
            aria-label="没有帮助"
            onClick={() => {
              const next = feedback === 'down' ? null : 'down';
              setFeedback(next);
              onFeedback?.(next);
            }}
          >
            <ThumbsDown className={cn(feedback === 'down' && 'fill-current')} />
          </Button>
        </>
      ) : null}
      {actions.includes('speak') ? (
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-pressed={isSpeaking}
          aria-label={isSpeaking ? '停止朗读' : '朗读'}
          onClick={() => {
            const next = !isSpeaking;
            if (speaking === undefined) setPlaying(next);
            onSpeak?.(next);
          }}
        >
          <Volume2 />
        </Button>
      ) : null}
      {feedback === 'down' ? (
        <div className="flex w-full flex-wrap gap-1">
          {reasons.map((item) => (
            <Button
              key={item}
              type="button"
              size="xs"
              variant={reason === item ? 'secondary' : 'ghost'}
              onClick={() => {
                setReason(item);
                onFeedback?.('down', item);
              }}
            >
              {item}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
