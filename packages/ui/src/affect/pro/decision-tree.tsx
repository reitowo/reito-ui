import { useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Textarea } from '../../primitives/textarea.js';
import { cn } from '../../lib/utils.js';

export type DecisionFlag = { text: string; note: string; source?: string };
export type DecisionText = string | Array<string | DecisionFlag>;
export type DecisionOption = { label: string; effects?: DecisionText[]; pick?: boolean };
export type Decision = {
  id: string;
  question: string;
  context?: string;
  agent: string;
  model?: string;
  icon?: ReactNode;
  risk?: 'high' | 'medium' | 'low';
  options: DecisionOption[];
};
export type DecisionChoice = { index: number; option: DecisionOption } | { other: string };
export type DecisionTreeProps = {
  decisions: Decision[];
  onChoose?: (decision: Decision, choice: DecisionChoice) => string | void | Promise<string | void>;
  allowOther?: boolean;
  title?: string;
  className?: string;
};

const riskLabel = { high: '高风险', medium: '中风险', low: '低风险' };

function renderEffect(effect: DecisionText, key: string) {
  if (typeof effect === 'string')
    return (
      <Text key={key} variant="caption" tone="muted">
        {effect}
      </Text>
    );
  return (
    <Text key={key} variant="caption" tone="muted">
      {effect.map((part, index) =>
        typeof part === 'string' ? (
          <span key={`${key}-${index}`}>{part}</span>
        ) : (
          <abbr key={`${key}-${index}`} title={part.note} className="text-warning no-underline">
            {part.text}
          </abbr>
        ),
      )}
    </Text>
  );
}

/** Recreated from public Decision Tree docs. Not Pro source. */
export function DecisionTree({
  decisions,
  onChoose,
  allowOther = true,
  title = '决策',
  className,
}: DecisionTreeProps) {
  const [cursor, setCursor] = useState(0);
  const [done, setDone] = useState<Record<string, string>>({});
  const [otherOpen, setOtherOpen] = useState(false);
  const [other, setOther] = useState('');
  const pending = decisions.filter((item) => !done[item.id]);
  const current = pending[Math.min(cursor, Math.max(0, pending.length - 1))];
  const live = useMemo(
    () => (current ? (done[current.id] ?? `${pending.length} 项待决定`) : '没有待决定的事项'),
    [current, done, pending.length],
  );

  async function choose(decision: Decision, choice: DecisionChoice) {
    const answer = await onChoose?.(decision, choice);
    const label = 'other' in choice ? (answer ?? choice.other) : choice.option.label;
    setDone((currentDone) => ({
      ...currentDone,
      [decision.id]: String(answer ?? `已选：${label}`),
    }));
    setOtherOpen(false);
    setOther('');
    setCursor(0);
  }

  return (
    <section
      className={cn(
        '@container grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">{title}</Heading>
        <Text variant="caption" tone="muted" aria-live="polite">
          {live}
        </Text>
      </Inline>
      {current ? (
        <Stack className="@md:grid @md:grid-cols-2">
          <Stack gap="small">
            <Inline>
              {current.icon}
              <Text variant="caption" tone="muted">
                {current.agent}
                {current.model ? ` · ${current.model}` : ''}
              </Text>
              {current.risk && current.risk !== 'low' ? (
                <Badge variant={current.risk === 'high' ? 'destructive' : 'secondary'}>
                  {riskLabel[current.risk]}
                </Badge>
              ) : null}
            </Inline>
            <Text variant="interface">{current.question}</Text>
            {current.context ? (
              <Text variant="caption" tone="muted">
                {current.context}
              </Text>
            ) : null}
            {pending.length > 1 ? (
              <Inline>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  aria-keyshortcuts="ArrowLeft J"
                  onClick={() => setCursor((value) => Math.max(0, value - 1))}
                >
                  上一项
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  aria-keyshortcuts="ArrowRight K"
                  onClick={() => setCursor((value) => Math.min(pending.length - 1, value + 1))}
                >
                  下一项
                </Button>
              </Inline>
            ) : null}
          </Stack>
          <ul className="grid gap-[var(--rui-content-gap-sm)]">
            {current.options.map((option, index) => (
              <li key={option.label}>
                <button
                  type="button"
                  aria-keyshortcuts={String(index + 1)}
                  aria-label={`${option.label}${option.pick ? '，代理倾向' : ''}`}
                  className={cn(
                    'grid w-full gap-1 rounded-[var(--rui-radius)] border border-border p-2 text-left',
                    option.pick && 'border-ring bg-muted',
                  )}
                  onClick={() => void choose(current, { index, option })}
                >
                  <Inline className="justify-between">
                    <Text as="span" variant="interface">
                      {index + 1}. {option.label}
                    </Text>
                    {option.pick ? <Badge variant="secondary">代理倾向</Badge> : null}
                  </Inline>
                  {option.effects?.map((effect, effectIndex) =>
                    renderEffect(effect, `${option.label}-${effectIndex}`),
                  )}
                </button>
              </li>
            ))}
            {allowOther ? (
              <li>
                {otherOpen ? (
                  <Stack
                    gap="small"
                    className="rounded-[var(--rui-radius)] border border-border p-2"
                  >
                    <label htmlFor="affect-decision-other">
                      <Text variant="interface">其他指示</Text>
                    </label>
                    <Textarea
                      id="affect-decision-other"
                      value={other}
                      rows={2}
                      onChange={(event) => setOther(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey && other.trim()) {
                          event.preventDefault();
                          void choose(current, { other: other.trim() });
                        }
                        if (event.key === 'Escape') setOtherOpen(false);
                      }}
                    />
                    <Inline>
                      <Button
                        type="button"
                        size="xs"
                        disabled={!other.trim()}
                        onClick={() => void choose(current, { other: other.trim() })}
                      >
                        发送
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        onClick={() => setOtherOpen(false)}
                      >
                        取消
                      </Button>
                    </Inline>
                  </Stack>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-keyshortcuts={String(current.options.length + 1)}
                    onClick={() => setOtherOpen(true)}
                  >
                    {current.options.length + 1}. 其他…
                  </Button>
                )}
              </li>
            ) : null}
          </ul>
        </Stack>
      ) : (
        <Text variant="caption" tone="muted">
          所有决策已处理。
        </Text>
      )}
    </section>
  );
}
