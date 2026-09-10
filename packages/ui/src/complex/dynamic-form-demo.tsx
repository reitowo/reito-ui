import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useWatch, FormError, FormField } from './form.js';
import { AsyncForm, useAsyncForm } from './async-form.js';
import { Input } from '../primitives/input.js';
import { Switch } from '../primitives/switch.js';
import { Button } from '../primitives/button.js';
import { SelectInput } from "../basic/select-input.js";
import type { StandardSchemaV1 } from '@standard-schema/spec';

type Draft = { name: string; mode: 'personal' | 'team'; teamName: string; notifications: boolean; email: string };
type Payload = { name: string; mode: Draft['mode']; notifications: boolean; teamName?: string; email?: string };
type Definition = { name: keyof Draft; label: string; kind: 'text' | 'mode' | 'switch'; visible?: (values: Draft) => boolean };
const definitions: Definition[] = [
  { name: 'name', label: '工作区名称', kind: 'text' },
  { name: 'mode', label: '工作区类型', kind: 'mode' },
  { name: 'teamName', label: '团队名称', kind: 'text', visible: values => values.mode === 'team' },
  { name: 'notifications', label: '接收通知', kind: 'switch' },
  { name: 'email', label: '通知邮箱', kind: 'text', visible: values => values.notifications },
];

export interface DynamicFormDemoProps {
  disabled?: boolean;
  initialMode?: Draft['mode'];
  initialNotifications?: boolean;
  hiddenValuePolicy?: 'retain' | 'discard';
  submitBehavior?: 'success' | 'error';
}

/** Executable configuration recipe, not a JSON/schema form-builder engine. */
export function DynamicFormDemo({ disabled = false, initialMode = 'personal', initialNotifications = false, hiddenValuePolicy = 'retain', submitBehavior = 'success' }: DynamicFormDemoProps) {
  const defaults = useMemo<Draft>(() => ({ name: 'Graphite', mode: initialMode, teamName: '', notifications: initialNotifications, email: '' }), [initialMode, initialNotifications]);
  const [receipt, setReceipt] = useState<Payload>();
  const handle = useAsyncForm<Draft, Payload>({ defaultValues: defaults, mode: 'onBlur', validate: values => {
    const issues: StandardSchemaV1.Issue[] = [];
    if (values.name.trim().length < 2) issues.push({ path: ['name'], message: '名称至少需要 2 个字符' });
    if (values.mode === 'team' && !values.teamName.trim()) issues.push({ path: ['teamName'], message: '请填写团队名称' });
    if (values.notifications && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) issues.push({ path: ['email'], message: '请输入有效通知邮箱' });
    return issues.length ? { issues } : { value: { name: values.name.trim(), mode: values.mode, notifications: values.notifications,
      ...(values.mode === 'team' ? { teamName: values.teamName.trim() } : {}), ...(values.notifications ? { email: values.email } : {}) } };
  } });
  const { form } = handle;
  const values = { ...defaults, ...useWatch({ control: form.control }) } as Draft;
  const previousDefaults = useRef(defaults);
  useLayoutEffect(() => {
    if (previousDefaults.current !== defaults) { previousDefaults.current = defaults; handle.reset(defaults); setReceipt(undefined); }
  }, [defaults, handle.reset]);
  useLayoutEffect(() => {
    const hidden = definitions.filter(definition => definition.visible && !definition.visible(values));
    for (const definition of hidden) {
      form.clearErrors(definition.name);
      if (hiddenValuePolicy === 'discard') form.resetField(definition.name, { defaultValue: '' });
    }
  }, [values.mode, values.notifications, hiddenValuePolicy, form]);
  return <div className="grid min-w-0 gap-[var(--rui-content-gap)]">
    <p className="text-sm text-muted-foreground">{hiddenValuePolicy === 'retain' ? '隐藏字段保留草稿，重新显示时恢复。' : '隐藏字段清除草稿，重新显示时从默认值开始。'} 隐藏字段不校验、不提交。</p>
    <AsyncForm handle={handle} disabled={disabled} aria-label="动态工作区设置" onReset={() => setReceipt(undefined)} onSubmit={async (payload, context) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      if (!context.isCurrent()) return;
      if (submitBehavior === 'error') throw new Error('本地保存失败');
      setReceipt(payload);
    }}>
      {definitions.filter(definition => !definition.visible || definition.visible(values)).map(definition => <FormField key={definition.name} control={form.control} name={definition.name} label={definition.label}
        render={({ field, controlProps }) => definition.kind === 'switch'
          ? <Switch {...controlProps} ref={field.ref} name={field.name} checked={!!field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} />
          : definition.kind === 'mode'
            ? <SelectInput {...controlProps} ref={field.ref} name={field.name} onBlur={field.onBlur} onValueChange={field.onChange} value={String(field.value)} options={[
    {
        value: "personal",
        label: "个人"
    },
    {
        value: "team",
        label: "团队"
    }
]}/>
            : <Input {...field} {...controlProps} value={String(field.value ?? '')} />} />)}
      <FormError />
      <div className="flex flex-wrap gap-[var(--rui-content-gap-sm)]"><Button type="submit">保存配置</Button><Button type="reset" variant="outline">重置配置</Button></div>
    </AsyncForm>
    <p role="status" className="text-xs text-muted-foreground">{handle.state.isSubmitting ? '保存中' : receipt ? '已保存本地配置' : '本地条件表单示例'}</p>
    {receipt && <pre aria-label="配置提交数据" className="overflow-auto rounded-md bg-muted p-[var(--rui-content-padding)] text-xs">{JSON.stringify(receipt, null, 2)}</pre>}
  </div>;
}
