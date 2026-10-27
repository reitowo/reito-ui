import { useState } from 'react';
import { Paperclip, RotateCcw, X } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../basic/composition.js';
import { Badge } from '../primitives/badge.js';
import { Button } from '../primitives/button.js';
import { Textarea } from '../primitives/textarea.js';
import { cn } from '../lib/utils.js';
import { cardClass, surfaceClass, type AffectAppearance } from './shared.js';

export type DraftContact = { name: string; email: string };
export type DraftTone = { id: string; label: string; body: (contact: DraftContact) => string };
export type EmailDraftProps = {
  reference?: string;
  account?: string;
  amount?: string;
  status?: string;
  agent?: string;
  contacts?: DraftContact[];
  attachment?: string | null;
  tones?: DraftTone[];
  link?: { label: string; href: string };
  onSend?: (email: { to: DraftContact; body: string; attachment: string | null }) => void;
  onDiscard?: () => void;
  appearance?: AffectAppearance;
  className?: string;
};

const defaultContacts: DraftContact[] = [
  { name: '示例联系人', email: 'alex@example.com' },
  { name: '财务组', email: 'billing@example.com' },
];
const defaultTones: DraftTone[] = [
  {
    id: 'friendly',
    label: '友好',
    body: (contact) => `你好 ${contact.name.split(' ')[0]}，这是本地示例草稿，没有发送真实邮件。`,
  },
  {
    id: 'short',
    label: '简短',
    body: (contact) => `${contact.name}，这是一封简短的本地示例。`,
  },
  {
    id: 'formal',
    label: '正式',
    body: (contact) => `尊敬的 ${contact.name}：这是一封正式语气的本地示例草稿。`,
  },
];

type Phase = 'draft' | 'sent' | 'discarded';

/** Agent-written email for review. Send and discard stay local. */
export function EmailDraft({
  reference = 'INV-1042',
  account = '本地示例账户',
  amount = '¥8,900',
  status = '待发送',
  agent = '本地助手',
  contacts = defaultContacts,
  attachment = 'quote.pdf',
  tones = defaultTones,
  link,
  onSend,
  onDiscard,
  appearance = 'default',
  className,
}: EmailDraftProps) {
  const [to, setTo] = useState(contacts[0] ?? { name: '', email: '' });
  const [tone, setTone] = useState(tones[0]?.id ?? 'friendly');
  const [file, setFile] = useState(attachment);
  const [phase, setPhase] = useState<Phase>('draft');
  const [composing, setComposing] = useState(false);
  const currentTone = tones.find((item) => item.id === tone) ?? tones[0];
  const [body, setBody] = useState(() => currentTone?.body(to) ?? '');

  function applyTone(next: DraftTone) {
    setTone(next.id);
    setBody(next.body(to));
  }

  if (phase !== 'draft') {
    return (
      <section aria-label="邮件草稿结果" className={cn(surfaceClass(appearance), className)}>
        <Inline
          className={cn(cardClass(appearance), 'justify-between p-[var(--rui-content-padding)]')}
        >
          <Text as="span" variant="interface">
            {phase === 'sent' ? `已记录发送给 ${to.name}` : '已丢弃草稿'}
          </Text>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setPhase('draft');
            }}
          >
            <RotateCcw aria-hidden="true" />
            撤销
          </Button>
        </Inline>
      </section>
    );
  }

  return (
    <section aria-label="邮件草稿" className={cn(surfaceClass(appearance), className)}>
      <Stack className={cn(cardClass(appearance), 'p-[var(--rui-content-padding)]')}>
        <Inline className="justify-between">
          <Stack gap="none">
            <Inline>
              <Heading size="item">{reference}</Heading>
              <Badge variant="secondary">{status}</Badge>
            </Inline>
            <Text variant="caption" tone="muted">
              {account} · {agent}
            </Text>
          </Stack>
          <Text as="span" variant="interface">
            {amount}
          </Text>
        </Inline>
        <Inline>
          {contacts.map((contact) => (
            <Button
              key={contact.email}
              type="button"
              size="sm"
              variant={contact.email === to.email ? 'secondary' : 'ghost'}
              onClick={() => {
                setTo(contact);
                if (currentTone) setBody(currentTone.body(contact));
              }}
            >
              {contact.name}
            </Button>
          ))}
        </Inline>
        <Inline>
          {tones.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="xs"
              variant={item.id === tone ? 'secondary' : 'ghost'}
              onClick={() => applyTone(item)}
            >
              {item.label}
            </Button>
          ))}
        </Inline>
        <Textarea
          value={body}
          rows={5}
          aria-label="邮件正文"
          onChange={(event) => setBody(event.target.value)}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !composing) {
              event.preventDefault();
              onSend?.({ to, body, attachment: file });
              setPhase('sent');
            }
          }}
        />
        {link ? (
          <a
            href={link.href}
            className="text-[length:var(--rui-font-caption)] text-accent underline-offset-4 hover:underline"
          >
            {link.label}
          </a>
        ) : null}
        {file ? (
          <Inline>
            <Paperclip className="size-3.5 text-muted-foreground" aria-hidden="true" />
            <Text as="span" variant="caption">
              {file}
            </Text>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="移除附件"
              onClick={() => setFile(null)}
            >
              <X />
            </Button>
          </Inline>
        ) : null}
        <Inline className="justify-end">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              onDiscard?.();
              setPhase('discarded');
            }}
          >
            丢弃
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!to.email || !body.trim()}
            onClick={() => {
              onSend?.({ to, body, attachment: file });
              setPhase('sent');
            }}
          >
            发送
          </Button>
        </Inline>
      </Stack>
    </section>
  );
}
