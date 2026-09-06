import { useRef, useState } from 'react';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { AsyncForm, useAsyncForm, type AsyncValidationMode } from './async-form.js';
import { FormError, FormField } from './form.js';
import { Input } from '../primitives/input.js';
import { Button } from '../primitives/button.js';

const defaults = { name: 'Graphite', email: 'reito@example.com', confirmEmail: 'reito@example.com' };
type Values = typeof defaults;
interface Request { id: number; name: string; finish: () => void }
export interface AsyncFormDemoProps { disabled?: boolean; validationMode?: AsyncValidationMode; manualResolution?: boolean; submitBehavior?: 'success' | 'error' | 'field-error' }
export function AsyncFormDemo({ disabled = false, validationMode = 'onBlur', manualResolution = false, submitBehavior = 'success' }: AsyncFormDemoProps) {
  const [record, setRecord] = useState({ id: 1, values: defaults });
  const [requests, setRequests] = useState<Request[]>([]);
  const serial = useRef(0);
  const [receipt, setReceipt] = useState<Values>();
  const handle = useAsyncForm<Values>({
    defaultValues: defaults, values: record.values, mode: validationMode,
    validate: async values => {
      const result = (): StandardSchemaV1.Result<Values> => {
        const issues: StandardSchemaV1.Issue[] = [];
        if (values.name.trim().length < 2) issues.push({ path: ['name'], message: '名称至少需要 2 个字符' });
        if (values.name === '已占用') issues.push({ path: ['name'], message: '名称已被占用' });
        if (!values.email.includes('@')) issues.push({ path: ['email'], message: '请输入有效邮箱' });
        if (values.email !== values.confirmEmail) issues.push({ path: ['confirmEmail'], message: '两次邮箱不一致' });
        return issues.length ? { issues } : { value: { ...values, name: values.name.trim() } };
      };
      // Intentionally ignore cancellation here to demonstrate rejection of late responses.
      if (manualResolution) return new Promise(resolve => {
        const id = ++serial.current;
        setRequests(current => [...current, { id, name: values.name, finish: () => { resolve(result()); setRequests(current => current.filter(request => request.id !== id)); } }]);
      });
      await new Promise(resolve => setTimeout(resolve, 300));
      return result();
    },
  });
  const { form, state } = handle;
  return <div className="grid min-w-0 gap-[var(--rui-content-gap)]">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground">本地记录 {record.id}</span>
      <Button variant="outline" disabled={disabled} onClick={() => { handle.reset(); setReceipt(undefined); }}>重置当前记录</Button>
      <Button variant="outline" disabled={disabled} onClick={() => { setRecord(current => ({ id: current.id + 1, values: { ...defaults } })); setReceipt(undefined); }}>切换同值记录</Button>
    </div>
    <AsyncForm handle={handle} disabled={disabled} aria-label="异步工作区设置" onSubmit={async (values, context) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      if (!context.isCurrent()) return;
      if (submitBehavior === 'error') throw new Error('本地保存失败');
      if (submitBehavior === 'field-error') { context.setFieldError('email', '邮箱暂不可用'); return; }
      setReceipt(values);
    }}>
      <FormField control={form.control} name="name" label="工作区名称" description="输入“已占用”检查异步错误。" render={({ field, controlProps }) => <Input {...field} {...controlProps} />} />
      <FormField control={form.control} name="email" label="通知邮箱" render={({ field, controlProps }) => <Input {...field} {...controlProps} />} />
      <FormField control={form.control} name="confirmEmail" label="确认邮箱" render={({ field, controlProps }) => <Input {...field} {...controlProps} />} />
      <FormError />
      <div className="flex flex-wrap items-center gap-2"><Button type="submit">保存设置</Button><Button variant="ghost" onClick={() => { void handle.validate('manual'); }}>校验当前值</Button></div>
    </AsyncForm>
    <div role="status" className="text-sm text-muted-foreground">{state.isSubmitting ? '提交中' : state.isValidating ? '校验中' : state.validationStatus === 'invalid' ? '校验失败' : state.validationStatus === 'valid' ? '校验通过' : '就绪'} · 提交次数 {state.submitCount} · {form.formState.isDirty ? '已修改' : '未修改'}</div>
    {manualResolution && <div role="group" className="grid gap-2" aria-label="待返回的本地请求">{requests.map(request => <div key={request.id} className="flex flex-wrap items-center gap-2"><span className="text-sm text-muted-foreground">请求 {request.id} · {request.name || '空名称'}</span><Button variant="outline" onClick={request.finish}>返回请求 {request.id}</Button></div>)}</div>}
    {receipt && <pre aria-label="提交数据" className="overflow-auto rounded-md bg-muted p-[var(--rui-content-padding)] text-xs">{JSON.stringify(receipt, null, 2)}</pre>}
  </div>;
}
