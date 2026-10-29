import { useEffect, useState } from 'react';
import { Mic, Plus, Send } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Textarea } from '../../primitives/textarea.js';
import { cn } from '../../lib/utils.js';
import { ShimmerText } from '../motion/shimmer-loader.js';
import { usePrefersReducedMotion } from '../shared.js';

export type WritingAssistantProps = {
  name?: string;
  tagline?: string;
  greeting?: string;
  suggestions?: string[];
  placeholder?: string;
  respond?: (message: string) => string | Promise<string>;
  speech?: 'auto' | 'simulate';
  dictation?: string;
  className?: string;
};

type ChatLine = { id: string; role: 'user' | 'assistant'; text: string };

function sampleWriter(message: string) {
  return `本地示例改写：${message.replace(/[。！？.!?]$/, '')}。`;
}

/** Recreated from public Writing Assistant docs. Not Pro source. */
export function WritingAssistant({
  name = 'Quill',
  tagline = '你的写作助手。',
  greeting = '我们写点什么？',
  suggestions = ['缩短这段', '改得更正式', '翻译成英文'],
  placeholder = '随便问…',
  respond = sampleWriter,
  speech = 'auto',
  dictation = '把这段改得更清楚一些',
  className,
}: WritingAssistantProps) {
  const reduced = usePrefersReducedMotion();
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [draft, setDraft] = useState('');
  const [listening, setListening] = useState(false);
  const [writing, setWriting] = useState(false);
  const welcome = lines.length === 0;

  async function send(text: string) {
    const message = text.trim();
    if (!message || writing) return;
    setDraft('');
    setLines((current) => [...current, { id: `u-${current.length}`, role: 'user', text: message }]);
    setWriting(true);
    const reply = await respond(message);
    setLines((current) => [
      ...current,
      { id: `a-${current.length}`, role: 'assistant', text: reply },
    ]);
    setWriting(false);
  }

  useEffect(() => {
    if (!listening) return;
    type SpeechRec = {
      start: () => void;
      stop: () => void;
      onresult: ((event: { results?: { 0?: { 0?: { transcript?: string } } } }) => void) | null;
      onerror: (() => void) | null;
    };
    const SpeechCtor =
      speech === 'auto'
        ? ((
            window as unknown as {
              SpeechRecognition?: new () => SpeechRec;
              webkitSpeechRecognition?: new () => SpeechRec;
            }
          ).SpeechRecognition ??
          (
            window as unknown as {
              webkitSpeechRecognition?: new () => SpeechRec;
            }
          ).webkitSpeechRecognition)
        : undefined;
    if (!SpeechCtor) {
      const timer = window.setTimeout(() => {
        setDraft(dictation);
        setListening(false);
      }, 700);
      return () => window.clearTimeout(timer);
    }
    const rec = new SpeechCtor();
    rec.onresult = (event) => {
      setDraft(event.results?.[0]?.[0]?.transcript ?? dictation);
      setListening(false);
    };
    rec.onerror = () => {
      setDraft(dictation);
      setListening(false);
    };
    rec.start();
    return () => rec.stop();
  }, [listening, speech, dictation]);

  return (
    <section
      aria-label={name}
      className={cn(
        'grid max-w-sm gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        welcome && 'bg-muted/40',
        className,
      )}
    >
      <Inline className="justify-between">
        <Stack gap="none">
          <Heading size="item">{name}</Heading>
          <Text variant="caption" tone="muted">
            {tagline}
          </Text>
        </Stack>
        {lines.length ? (
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => {
              setLines([]);
              setDraft('');
            }}
          >
            <Plus className="size-3" />
            新对话
          </Button>
        ) : null}
      </Inline>
      {welcome ? (
        <Stack>
          <Text>{greeting}</Text>
          <Inline>
            {suggestions.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void send(item)}
              >
                {item}
              </Button>
            ))}
          </Inline>
        </Stack>
      ) : (
        <ol className="grid max-h-[var(--rui-container-xs)] gap-2 overflow-auto" aria-live="polite">
          {lines.map((line) => (
            <li
              key={line.id}
              className={cn(
                'rounded-[var(--rui-radius)] px-2 py-1 text-[length:var(--rui-font-reading)]',
                line.role === 'user' ? 'bg-muted' : 'bg-background',
              )}
            >
              {line.text}
            </li>
          ))}
          {writing ? (
            <li>
              {reduced ? <Text tone="muted">写作中…</Text> : <ShimmerText>写作中…</ShimmerText>}
            </li>
          ) : null}
        </ol>
      )}
      <form
        className="grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          rows={2}
          aria-label="写作提示"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              void send(draft);
            }
          }}
        />
        <Inline className="justify-end">
          <Button
            type="button"
            size="icon-sm"
            variant={listening ? 'secondary' : 'ghost'}
            aria-pressed={listening}
            aria-label={listening ? '停止口述' : '开始口述'}
            onClick={() => setListening((value) => !value)}
          >
            <Mic />
          </Button>
          <Button type="submit" size="sm" disabled={!draft.trim() || writing}>
            <Send />
            发送
          </Button>
        </Inline>
      </form>
    </section>
  );
}
