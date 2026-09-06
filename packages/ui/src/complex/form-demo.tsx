import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import { Form, FormError, FormField, schemaResolver, useFieldArray, useForm, type UseFormProps } from './form.js';
import { Button } from '../primitives/button.js';
import { Input } from '../primitives/input.js';
import { Checkbox } from '../primitives/checkbox.js';
import { Spinner } from '../primitives/spinner.js';
import { NativeSelect, NativeSelectOption } from '../primitives/native-select.js';
import { Field, FieldError, FieldLabel } from '../primitives/field.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../primitives/select.js';
import { Switch } from '../primitives/switch.js';

// Local asynchronous work, not a network request or an animation duration.
const localWork = () => new Promise<void>(resolve => setTimeout(resolve, 300));
const initialValues = { name: 'Graphite 工作区', email: 'reito@example.com', confirmEmail: 'reito@example.com', notifications: true };
type SettingsValues = typeof initialValues;
export interface FormDemoProps {
  disabled?: boolean;
  validationMode?: UseFormProps<SettingsValues>['mode'];
  showDescriptions?: boolean;
  submitBehavior?: 'success' | 'error' | 'field-error';
  showScenarioControl?: boolean;
}

export function FormDemo({ disabled = false, validationMode = 'onBlur', showDescriptions = true, submitBehavior = 'success', showScenarioControl = true }: FormDemoProps) {
  const [behavior, setBehavior] = useState(submitBehavior);
  const scenarioId = useId();
  const effectiveBehavior = showScenarioControl ? behavior : submitBehavior;
  const [receipt, setReceipt] = useState<SettingsValues>();
  const [attempts, setAttempts] = useState(0);
  const schema = useMemo(() => z.object({
    name: z.string().trim().min(2, '名称至少需要 2 个字符'),
    email: z.email('请输入有效邮箱'),
    confirmEmail: z.string(),
    notifications: z.boolean(),
  }).superRefine(async (value, context) => {
    if (value.email !== value.confirmEmail) context.addIssue({ code: 'custom', path: ['confirmEmail'], message: '两次邮箱不一致' });
    if (value.name === '已占用') {
      await localWork();
      context.addIssue({ code: 'custom', path: ['name'], message: '名称已被占用' });
    }
  }), []);
  const form = useForm<SettingsValues>({ defaultValues: initialValues, mode: validationMode, resolver: schemaResolver(schema) });
  const { isSubmitting, isValidating, isDirty } = form.formState;
  return <div className="grid min-w-0 gap-[var(--rui-content-gap)]">
    {showScenarioControl && <Field>
      <FieldLabel htmlFor={scenarioId}>提交结果</FieldLabel>
      <NativeSelect id={scenarioId} aria-label="提交结果" value={behavior} disabled={disabled || isSubmitting} onChange={event => setBehavior(event.target.value as typeof behavior)}>
        <NativeSelectOption value="success">本地成功</NativeSelectOption>
        <NativeSelectOption value="error">本地保存失败</NativeSelectOption>
        <NativeSelectOption value="field-error">字段错误</NativeSelectOption>
      </NativeSelect>
    </Field>}
    <Form form={form} aria-label="工作区设置" disabled={disabled} onReset={() => { setReceipt(undefined); setAttempts(0); }} onSubmit={async value => {
      setReceipt(undefined); setAttempts(current => current + 1);
      await localWork();
      if (effectiveBehavior === 'error') throw new Error('本地保存失败');
      if (effectiveBehavior === 'field-error') { form.setError('email', { type: 'server', message: '邮箱暂不可用' }); return; }
      setReceipt(value);
    }}>
      <FormField control={form.control} name="name" label="工作区名称" required description={showDescriptions ? '至少 2 个字符；输入“已占用”可检查异步校验。' : undefined}
        render={({ field, controlProps }) => <Input {...field} {...controlProps} />} />
      <FormField control={form.control} name="email" label="通知邮箱" required description={showDescriptions ? '用于当前工作区的通知配置。' : undefined}
        render={({ field, controlProps }) => <Input {...field} {...controlProps} type="email" />} />
      <FormField control={form.control} name="confirmEmail" label="确认邮箱" required
        render={({ field, controlProps }) => <Input {...field} {...controlProps} type="email" />} />
      <FormField control={form.control} name="notifications" label="启用通知"
        render={({ field, controlProps }) => <Checkbox {...controlProps} name={field.name} ref={field.ref} checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} />} />
      <FormError />
      <div className="flex flex-wrap items-center gap-[var(--rui-content-gap-sm)]">
        <Button type="submit" size="sm">{isSubmitting && <Spinner />}{isSubmitting ? '保存中…' : '保存设置'}</Button>
        <Button type="reset" size="sm" variant="outline">重置</Button>
        <span className="text-xs text-muted-foreground">{isValidating ? '校验中…' : isDirty ? '有未保存修改' : '尚未修改'}</span>
      </div>
    </Form>
    <p role="status" className="text-xs text-muted-foreground">{receipt ? '已保存本地设置' : '本地示例，不发送请求'} · 提交次数={attempts}</p>
    {receipt && <pre aria-label="提交数据" className="overflow-auto rounded-md bg-muted p-[var(--rui-content-padding)] font-mono text-xs">{JSON.stringify(receipt, null, 2)}</pre>}
  </div>;
}

const contactsSchema = z.object({
  workspace: z.object({ name: z.string().min(2, '名称至少需要 2 个字符') }),
  contacts: z.array(z.object({ email: z.email('请输入有效邮箱') })).min(1, '至少添加一个联系人'),
}).superRefine((value, context) => {
  if (new Set(value.contacts.map(contact => contact.email)).size !== value.contacts.length) context.addIssue({ code: 'custom', message: '联系人邮箱不能重复' });
});
type ContactsValues = z.infer<typeof contactsSchema>;

/** An explicit recipe built from FormField and the engine's field array; not a schema-generated form builder. */
export interface FormArrayDemoProps {
  disabled?: boolean;
  readOnly?: boolean;
  initialCount?: number;
  showFieldState?: boolean;
  validationMode?: UseFormProps<ContactsValues>['mode'];
}
export function FormArrayDemo({ disabled = false, readOnly = false, initialCount = 1, showFieldState = false, validationMode = 'onSubmit' }: FormArrayDemoProps = {}) {
  const arrayErrorId = useId();
  const defaults = useMemo(() => ({ workspace: { name: '研究工作区' }, contacts: Array.from({ length: Math.max(0, Math.min(5, initialCount)) }, (_, index) => ({ email: index === 0 ? 'reito@example.com' : `contact${index + 1}@example.com` })) }), [initialCount]);
  const form = useForm<ContactsValues>({ defaultValues: defaults, resolver: schemaResolver(contactsSchema), mode: validationMode });
  const contacts = useFieldArray({ control: form.control, name: 'contacts' });
  const [receipt, setReceipt] = useState('');
  const previousDefaults = useRef(defaults);
  const nextFocus = useRef<number | undefined>(undefined);
  const addButton = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (previousDefaults.current !== defaults) { previousDefaults.current = defaults; form.reset(defaults); setReceipt(''); }
  }, [defaults, form]);
  useLayoutEffect(() => {
    if (nextFocus.current === undefined) return;
    const index = nextFocus.current; nextFocus.current = undefined;
    if (contacts.fields.length) form.setFocus(`contacts.${Math.min(index, contacts.fields.length - 1)}.email`);
    else addButton.current?.focus();
  }, [contacts.fields, form]);
  const arrayError = form.formState.errors.contacts?.root?.message ?? form.formState.errors.contacts?.message;
  return <Form form={form} disabled={disabled} aria-label="联系人设置" onSubmit={value => { if (!readOnly) setReceipt(`已保存 ${value.contacts.length} 个联系人`); }} onReset={() => setReceipt('')}>
    <FormField control={form.control} name="workspace.name" label="工作区名称" render={({ field, controlProps }) => <Input {...field} {...controlProps} readOnly={readOnly} />} />
    {contacts.fields.map((contact, index) => <div key={contact.id} data-field-id={contact.id} className="grid gap-[var(--rui-content-gap-sm)]">
      <FormField control={form.control} name={`contacts.${index}.email`} label={`联系人 ${index + 1} 邮箱`} render={({ field, fieldState, controlProps }) => <>
        <Input {...field} {...controlProps} readOnly={readOnly} />
        {showFieldState && <span className="text-xs text-muted-foreground" data-touched={fieldState.isTouched} data-dirty={fieldState.isDirty}>{fieldState.isTouched ? '已触碰' : '未触碰'} · {fieldState.isDirty ? '已修改' : '未修改'}</span>}
      </>} />
      <div className="flex gap-[var(--rui-content-gap-sm)]">
        <Button type="button" size="xs" variant="ghost" disabled={readOnly || index === 0} onClick={() => contacts.move(index, index - 1)}>上移联系人 {index + 1}</Button>
        <Button type="button" size="xs" variant="ghost" disabled={readOnly} onClick={() => { nextFocus.current = index; contacts.remove(index); }}>移除联系人 {index + 1}</Button>
      </div>
    </div>)}
    {!contacts.fields.length && <p className="text-sm text-muted-foreground">暂无联系人，添加后可继续填写。</p>}
    {arrayError && <FieldError id={arrayErrorId}>{arrayError}</FieldError>}
    <FormError />
    <div className="flex flex-wrap gap-[var(--rui-content-gap-sm)]">
      <Button ref={addButton} type="button" size="sm" variant="outline" disabled={readOnly} aria-invalid={!!arrayError} aria-describedby={arrayError ? arrayErrorId : undefined} onClick={() => contacts.append({ email: '' })}>添加联系人</Button>
      <Button type="submit" size="sm" disabled={readOnly}>保存联系人</Button>
      <Button type="reset" size="sm" variant="ghost" disabled={readOnly}>重置</Button>
    </div>
    <p role="status" className="text-xs text-muted-foreground">{receipt || '嵌套与数组字段示例；重复邮箱会显示全表单错误。'}</p>
  </Form>;
}

const controlsSchema = z.object({
  access: z.string().min(1, '请选择权限'),
  enabled: z.boolean(),
  retention: z.string().regex(/^\d+$/, '请输入整数').transform(Number).refine(value => value >= 1 && value <= 365, '保留天数应为 1 至 365'),
});
export function FormControlsDemo() {
  const form = useForm<z.input<typeof controlsSchema>, unknown, z.output<typeof controlsSchema>>({
    defaultValues: { access: '', enabled: true, retention: '30' }, resolver: schemaResolver(controlsSchema),
  });
  const [receipt, setReceipt] = useState('');
  return <Form form={form} aria-label="控件适配设置" onSubmit={value => setReceipt(`${value.access} · 保留 ${value.retention} 天（${typeof value.retention}）· ${value.enabled ? '启用' : '停用'}`)} onReset={() => setReceipt('')}>
    <FormField control={form.control} name="access" label="访问权限" required render={({ field, controlProps }) =>
      <Select name={field.name} value={field.value || null} onValueChange={field.onChange} disabled={controlProps.disabled} items={[{ value: 'reader', label: '只读' }, { value: 'editor', label: '可编辑' }]}>
        <SelectTrigger {...controlProps} ref={field.ref} onBlur={field.onBlur}><SelectValue placeholder="选择权限" /></SelectTrigger>
        <SelectContent><SelectItem value="reader">只读</SelectItem><SelectItem value="editor">可编辑</SelectItem></SelectContent>
      </Select>} />
    <FormField control={form.control} name="retention" label="保留天数" description="输入保留字符串草稿，校验成功后提交数字。" render={({ field, controlProps }) => <Input {...field} {...controlProps} inputMode="numeric" />} />
    <FormField control={form.control} name="enabled" label="启用归档" render={({ field, controlProps }) => <Switch {...controlProps} ref={field.ref} name={field.name} checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} />} />
    <FormError />
    <div className="flex gap-[var(--rui-content-gap-sm)]"><Button type="submit" size="sm">保存归档</Button><Button type="reset" size="sm" variant="outline">重置</Button></div>
    <p role="status" className="text-xs text-muted-foreground">{receipt || '选择、开关和 schema 输出转换使用同一 Form。'}</p>
  </Form>;
}
