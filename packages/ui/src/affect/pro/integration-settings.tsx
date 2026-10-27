import { useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { Label } from '../../primitives/label.js';
import { Switch } from '../../primitives/switch.js';
import { cn } from '../../lib/utils.js';

export type IntegrationSettingsValues = {
  enabled: boolean;
  siteUrl: string;
  timeZone: string;
  apiKey: string;
};
export type IntegrationSettingsProps = {
  name: string;
  logo?: ReactNode;
  count?: number;
  meta?: string;
  defaultValues?: Partial<IntegrationSettingsValues>;
  siteHint?: string;
  timeZones?: string[];
  onGenerateKey?: () => string | Promise<string>;
  onSave?: (values: IntegrationSettingsValues) => void | Promise<void>;
  onToggle?: (enabled: boolean) => void;
  className?: string;
};

const zones = ['(GMT +08:00) 上海', '(GMT +01:00) 柏林', '(GMT +00:00) 伦敦', '(GMT -05:00) 纽约'];

function validUrl(value: string) {
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value.trim());
}

/** Recreated from public Integration Settings docs. Not Pro source. */
export function IntegrationSettings({
  name,
  logo,
  count,
  meta,
  defaultValues,
  siteHint = '不含协议的站点地址',
  timeZones = zones,
  onGenerateKey,
  onSave,
  onToggle,
  className,
}: IntegrationSettingsProps) {
  const initial: IntegrationSettingsValues = {
    enabled: defaultValues?.enabled ?? true,
    siteUrl: defaultValues?.siteUrl ?? '',
    timeZone: defaultValues?.timeZone ?? timeZones[0],
    apiKey: defaultValues?.apiKey ?? '',
  };
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState('');
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const invalid = values.siteUrl.length > 0 && !validUrl(values.siteUrl);

  function patch(partial: Partial<IntegrationSettingsValues>) {
    setValues((current) => ({ ...current, ...partial }));
  }

  async function generate() {
    const key = onGenerateKey
      ? await onGenerateKey()
      : `rk_${Math.random().toString(36).slice(2, 10)}`;
    patch({ apiKey: key });
    setLive('已生成新密钥，请立即复制。');
  }

  async function save() {
    setBusy(true);
    try {
      await onSave?.(values);
      setSaved(values);
      setLive('已保存');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={cn(
        'grid max-w-md gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Inline>
          <span className="grid size-8 place-items-center rounded-[var(--rui-radius)] bg-muted">
            {logo}
          </span>
          <Stack gap="small">
            <Heading size="item">
              {name}
              {count != null ? <Badge variant="secondary">{count}</Badge> : null}
            </Heading>
            <Text variant="caption" tone="muted">
              {values.enabled ? meta : '已暂停'}
            </Text>
          </Stack>
        </Inline>
        <Inline>
          <Label htmlFor="affect-integration-enabled">启用</Label>
          <Switch
            id="affect-integration-enabled"
            checked={values.enabled}
            onCheckedChange={(checked) => {
              const next = checked === true;
              patch({ enabled: next });
              onToggle?.(next);
            }}
          />
        </Inline>
      </Inline>
      {values.enabled ? (
        <Stack>
          <label className="grid gap-1">
            <Text variant="caption">API 密钥</Text>
            <Inline>
              <Input value={values.apiKey} readOnly placeholder="尚未生成" />
              <Button type="button" size="xs" variant="outline" onClick={() => void generate()}>
                生成
              </Button>
            </Inline>
          </label>
          <label className="grid gap-1">
            <Text variant="caption">站点地址</Text>
            <Input
              value={values.siteUrl}
              aria-invalid={invalid || undefined}
              aria-describedby="affect-integration-site-hint"
              onChange={(event) => patch({ siteUrl: event.target.value })}
            />
            <Text
              id="affect-integration-site-hint"
              variant="caption"
              className={invalid ? 'text-destructive' : 'text-muted-foreground'}
            >
              {invalid ? '地址无效' : siteHint}
            </Text>
          </label>
          <fieldset className="grid gap-1">
            <legend>
              <Text variant="caption">时区</Text>
            </legend>
            <Inline>
              {timeZones.map((zone) => (
                <Button
                  key={zone}
                  type="button"
                  size="xs"
                  variant={values.timeZone === zone ? 'secondary' : 'ghost'}
                  onClick={() => patch({ timeZone: zone })}
                >
                  {zone}
                </Button>
              ))}
            </Inline>
          </fieldset>
        </Stack>
      ) : null}
      {dirty ? (
        <Inline className="justify-end">
          <Button type="button" size="xs" variant="ghost" onClick={() => setValues(saved)}>
            放弃
          </Button>
          <Button type="button" size="xs" disabled={invalid || busy} onClick={() => void save()}>
            {busy ? '保存中' : '保存'}
          </Button>
        </Inline>
      ) : null}
      <Text variant="caption" tone="muted" aria-live="polite">
        {live}
      </Text>
    </section>
  );
}
