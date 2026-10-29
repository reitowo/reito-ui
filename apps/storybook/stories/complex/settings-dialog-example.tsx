import { useId, useRef, useState } from 'react';
import { SettingsRow, SettingsSection } from '../../../../packages/ui/src/complex/index.js';
import {
  Alert, AlertDescription, Button, Dialog, DialogClose, DialogContent,
  DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  Field, FieldContent, FieldDescription, FieldLabel, RadioGroup, RadioGroupItem,
  Spinner, Switch,
} from '../../../../packages/ui/src/basic.js';

const scopes = [
  { value: 'mention', label: '仅提及我', description: '只提醒直接提及你的消息。' },
  { value: 'replies', label: '提及与回复', description: '同时提醒这些消息的后续回复。' },
  { value: 'topic', label: '整个话题', description: '提醒提及所在话题中的后续消息。' },
];

/** Local state only: no messaging service or persistence. */
export function SettingsDialogExample({ state = 'ready' }: { state?: 'ready' | 'loading' | 'error' }) {
  const id = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [newOnly, setNewOnly] = useState(true);
  const [scope, setScope] = useState('mention');
  const [saved, setSaved] = useState({ enabled: true, newOnly: true, scope: 'mention' });
  const [status, setStatus] = useState('');
  const [loadState, setLoadState] = useState(state);

  function changeOpen(next: boolean) {
    if (next) {
      setEnabled(saved.enabled);
      setNewOnly(saved.newOnly);
      setScope(saved.scope);
      setLoadState(state);
    }
    setOpen(next);
  }

  return <>
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger render={<Button variant="outline" />}>打开提醒设置</DialogTrigger>
      <DialogContent initialFocus={titleRef} className="sm:max-w-lg max-h-[calc(100dvh-var(--rui-space-8))] overflow-y-auto">
        <DialogHeader className="pr-8">
          <DialogTitle ref={titleRef} tabIndex={-1} className="outline-none">提醒设置</DialogTitle>
          <DialogDescription>设计讨论 · 本地组件示例</DialogDescription>
        </DialogHeader>
        {loadState === 'loading' ? <div role="status" className="flex items-center gap-2 py-4"><Spinner />正在读取示例设置…</div>
          : loadState === 'error' ? <Alert variant="destructive" role="alert"><AlertDescription>示例设置读取失败。请重试。</AlertDescription></Alert>
          : <SettingsSection title="提醒规则" variant="plain">
            <SettingsRow label="桌面提醒" htmlFor={`${id}-enabled`} description="为这段讨论开启提醒。" descriptionId={`${id}-enabled-description`}>
              <Switch id={`${id}-enabled`} aria-describedby={`${id}-enabled-description`} checked={enabled} onCheckedChange={setEnabled} />
            </SettingsRow>
            <SettingsRow label="仅新消息" htmlFor={`${id}-new`} description="开启后只提醒新收到的消息。" descriptionId={`${id}-new-description`}>
              <Switch id={`${id}-new`} aria-describedby={`${id}-new-description`} checked={newOnly} onCheckedChange={setNewOnly} disabled={!enabled} />
            </SettingsRow>
            <SettingsRow label="提醒范围" labelId={`${id}-scope-label`} description="选择需要提醒的消息。" descriptionId={`${id}-scope-description`} orientation="vertical">
              <RadioGroup aria-labelledby={`${id}-scope-label`} aria-describedby={`${id}-scope-description`} value={scope} onValueChange={value => setScope(String(value))} disabled={!enabled}>
                {scopes.map(option => <Field orientation="horizontal" key={option.value} data-disabled={!enabled}>
                  <RadioGroupItem id={`${id}-scope-${option.value}`} value={option.value} aria-describedby={`${id}-scope-${option.value}-description`} />
                  <FieldContent>
                    <FieldLabel htmlFor={`${id}-scope-${option.value}`}>{option.label}</FieldLabel>
                    <FieldDescription id={`${id}-scope-${option.value}-description`}>{option.description}</FieldDescription>
                  </FieldContent>
                </Field>)}
              </RadioGroup>
            </SettingsRow>
          </SettingsSection>}
        <DialogFooter>
          {loadState === 'error' && <Button variant="ghost" onClick={() => setLoadState('ready')}>重试</Button>}
          <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
          <Button disabled={loadState !== 'ready'} onClick={() => {
            setSaved({ enabled, newOnly, scope });
            setStatus('已保存本地示例设置');
            setOpen(false);
          }}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <p role="status" className="mt-2 text-sm text-muted-foreground">{status}</p>
  </>;
}
