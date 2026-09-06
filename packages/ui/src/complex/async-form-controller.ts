import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { FieldValues } from 'react-hook-form';

type Issue = StandardSchemaV1.Issue;
export type AsyncFormReason = 'change' | 'blur' | 'submit' | 'manual';
export type AsyncFormOutcome<T> = { status: 'valid'; value: T } | { status: 'invalid'; issues: readonly Issue[] } | { status: 'cancelled' };
export interface AsyncFormState {
  isValidating: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  submitCount: number;
  validationStatus: 'idle' | 'pending' | 'valid' | 'invalid';
  error?: string;
}
export interface AsyncSubmitContext {
  signal: AbortSignal;
  isCurrent: () => boolean;
  setFieldError: (name: string, message: string) => void;
}
interface Options<Input, Output> {
  getValues: () => Input;
  validate: (values: Input, context: { signal: AbortSignal; reason: AsyncFormReason }) => StandardSchemaV1.Result<Output> | Promise<StandardSchemaV1.Result<Output>>;
  setIssues: (issues: readonly Issue[]) => void;
  cloneValues?: (values: Input) => Input;
}
const initial = (): AsyncFormState => ({ isValidating: false, isSubmitting: false, isSubmitted: false, isSubmitSuccessful: false, submitCount: 0, validationStatus: 'idle' });
const cancelled = { status: 'cancelled' } as const;
interface Job { abort: AbortController; submission: boolean }

/** Owns async continuations independently of RHF's internal resolver lifecycle. */
export function createAsyncFormController<Input extends FieldValues, Output = Input>(options: Options<Input, Output>) {
  let state = initial();
  let active: Job | undefined;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<AsyncFormState>) => { state = { ...state, ...patch }; listeners.forEach(listener => listener()); };
  const current = (job: Job) => active === job && !job.abort.signal.aborted;
  const retire = () => { const previous = active; active = undefined; previous?.abort.abort(); };
  const invalidate = () => {
    retire();
    publish({ isValidating: false, isSubmitting: false, isSubmitSuccessful: false, validationStatus: 'idle', error: undefined });
  };
  const reset = () => { retire(); options.setIssues([]); state = initial(); listeners.forEach(listener => listener()); };
  // The race is settled by cancellation even when the underlying operation ignores its signal.
  async function wait<T>(job: Job, run: () => T | Promise<T>): Promise<{ value: T } | typeof cancelled> {
    if (!current(job)) return cancelled;
    let release = () => {};
    const aborted = new Promise<typeof cancelled>(resolve => {
      const stop = () => resolve(cancelled);
      job.abort.signal.addEventListener('abort', stop, { once: true });
      release = () => job.abort.signal.removeEventListener('abort', stop);
    });
    try {
      return await Promise.race([Promise.resolve().then(() => current(job) ? run() : Promise.reject(new Error('Cancelled'))).then(value => ({ value })), aborted]);
    } finally { release(); }
  }
  const failure = (job: Job, error: unknown): AsyncFormOutcome<Output> => {
    if (!current(job)) return cancelled;
    const message = error instanceof Error ? error.message : '处理失败，请重试';
    const issues = [{ path: ['_form'], message }];
    options.setIssues(issues);
    publish({ validationStatus: 'invalid', isSubmitSuccessful: false, error: message });
    return { status: 'invalid', issues };
  };
  async function check(job: Job, reason: AsyncFormReason): Promise<AsyncFormOutcome<Output>> {
    const snapshot = (options.cloneValues ?? structuredClone)(options.getValues());
    const result = await wait(job, () => options.validate(snapshot, { reason, signal: job.abort.signal }));
    if (!current(job) || !('value' in result)) return cancelled;
    if (result.value.issues) {
      options.setIssues(result.value.issues);
      publish({ validationStatus: 'invalid' });
      return { status: 'invalid', issues: result.value.issues };
    }
    options.setIssues([]);
    publish({ validationStatus: 'valid' });
    return { status: 'valid', value: result.value.value };
  }
  const start = (submission: boolean): Job => {
    retire();
    const job = { abort: new AbortController(), submission };
    active = job;
    publish({ isValidating: true, isSubmitting: submission, isSubmitSuccessful: false, validationStatus: 'pending', error: undefined,
      ...(submission ? { isSubmitted: true, submitCount: state.submitCount + 1 } : {}) });
    return job;
  };
  const finish = (job: Job) => {
    if (!current(job)) return;
    active = undefined;
    publish({ isValidating: false, isSubmitting: false });
  };
  async function validate(reason: AsyncFormReason = 'manual'): Promise<AsyncFormOutcome<Output>> {
    if (active?.submission) return cancelled;
    const job = start(false);
    try { return await check(job, reason); }
    catch (error) { return failure(job, error); }
    finally { finish(job); }
  }
  async function submit(onValid: (value: Output, context: AsyncSubmitContext) => void | Promise<void>, onInvalid?: (issues: readonly Issue[]) => void | Promise<void>): Promise<AsyncFormOutcome<Output>> {
    if (active?.submission) return cancelled;
    const job = start(true);
    try {
      const result = await check(job, 'submit');
      if (!current(job)) return cancelled;
      publish({ isValidating: false });
      if (result.status === 'invalid') {
        if (onInvalid) await wait(job, () => onInvalid(result.issues));
        return current(job) ? result : cancelled;
      }
      if (result.status !== 'valid') return result;
      const issues: Issue[] = [];
      const context: AsyncSubmitContext = {
        signal: job.abort.signal, isCurrent: () => current(job),
        setFieldError: (name, message) => {
          if (!current(job)) return;
          issues.push({ path: name.split('.'), message });
          options.setIssues(issues.slice());
          publish({ validationStatus: 'invalid', isSubmitSuccessful: false });
        },
      };
      await wait(job, () => onValid(result.value, context));
      if (!current(job)) return cancelled;
      if (issues.length) return { status: 'invalid', issues };
      publish({ isSubmitSuccessful: true });
      return result;
    } catch (error) { return failure(job, error); }
    finally { finish(job); }
  }
  return {
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => state, change: invalidate, invalidate, reset,
    blur: () => { if (!active?.submission) invalidate(); }, validate, submit,
  };
}
