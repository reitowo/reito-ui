import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { classes } from './shared.js';
import { highlightCode } from './code-highlight.js';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  onCopy?: (code: string) => void | Promise<void>;
  copyable?: boolean;
  /** `inline` drops the toolbar for dense trace rows; copy moves to a hover action. */
  variant?: 'default' | 'embedded' | 'inline';
  className?: string;
}

/** Grammar-based highlighting with exact source copying and plain-text fallback. */
export function CodeBlock({
  code,
  language = 'text',
  filename,
  onCopy,
  copyable = true,
  variant = 'default',
  className,
}: CodeBlockProps) {
  const highlighted = useMemo(() => highlightCode(code, language), [code, language]);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState('');
  const currentCode = useRef(code);
  const inFlight = useRef(false);
  currentCode.current = code;
  useEffect(() => {
    setCopied(false);
    setError('');
  }, [code]);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  async function copy() {
    if (inFlight.current) return;
    const copiedCode = code;
    inFlight.current = true;
    setCopying(true);
    setError('');
    try {
      if (onCopy) await onCopy(code);
      else await navigator.clipboard.writeText(code);
      if (currentCode.current === copiedCode) setCopied(true);
    } catch {
      if (currentCode.current === copiedCode) setError('复制失败，请选择代码手动复制。');
    } finally {
      inFlight.current = false;
      setCopying(false);
    }
  }
  const copyLabel = copied ? '代码已复制' : '复制代码';
  const copyIcon = copied ? (
    <Check className="size-3" aria-hidden="true" />
  ) : (
    <Copy className="size-3" aria-hidden="true" />
  );
  if (variant === 'inline') {
    return (
      <div
        data-slot="code-block"
        data-variant="inline"
        className={classes(
          'group/code-block relative min-w-0 overflow-hidden rounded-xs bg-sunken',
          className,
        )}
      >
        {code ? (
          <pre
            tabIndex={0}
            aria-label={`${filename || language}代码`}
            className="max-h-80 overflow-auto px-2 py-0.5 font-mono text-xs leading-[var(--rui-line-caption)] focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring"
          >
            <code
              data-slot="code-content"
              data-language={highlighted.language}
              data-highlighted={highlighted.highlighted}
            >
              {highlighted.content}
            </code>
          </pre>
        ) : (
          <p className="px-2 py-0.5 text-xs text-muted-foreground">没有可显示的代码</p>
        )}
        {copyable && code && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute top-0 right-0 bg-sunken opacity-0 group-hover/code-block:opacity-100 focus-visible:opacity-100"
            disabled={copying}
            aria-label={copyLabel}
            title={copyLabel}
            onClick={() => {
              void copy();
            }}
          >
            {copyIcon}
          </Button>
        )}
        {error && (
          <p role="alert" className="px-2 py-0.5 text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
  return (
    <div
      data-slot="code-block"
      data-variant={variant}
      className={classes(
        'min-w-0 overflow-hidden',
        variant === 'default' && 'rounded-lg border bg-muted/30',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2 border-b px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]">
        <span
          className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground"
          title={filename || language}
        >
          {filename || language}
        </span>
        {copyable && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="gap-1.5"
            disabled={!code || copying}
            aria-label={copyLabel}
            onClick={() => {
              void copy();
            }}
          >
            {copyIcon}
            <span className="inline-grid">
              <span aria-hidden="true" className="invisible col-start-1 row-start-1">
                已复制
              </span>
              <span className="col-start-1 row-start-1">{copied ? '已复制' : '复制'}</span>
            </span>
          </Button>
        )}
      </div>
      {code ? (
        <pre
          tabIndex={0}
          aria-label={`${filename || language}代码`}
          className="max-h-96 overflow-auto p-[var(--rui-content-padding)] font-mono text-xs leading-6 dense:leading-[var(--rui-line-caption)] focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring"
        >
          <code
            data-slot="code-content"
            data-language={highlighted.language}
            data-highlighted={highlighted.highlighted}
          >
            {highlighted.content}
          </code>
        </pre>
      ) : (
        <p className="p-[var(--rui-content-padding)] text-sm text-muted-foreground">
          没有可显示的代码
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="border-t px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
