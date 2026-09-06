import { expect, test } from '@playwright/test';
import { setImmediate } from 'node:timers';
import { createAsyncFormController } from '../packages/ui/src/complex/async-form-controller.js';
import type { StandardSchemaV1 } from '@standard-schema/spec';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((accept, fail) => { resolve = accept; reject = fail; });
  return { promise, resolve, reject };
}

// An event-loop checkpoint lets all queued Promise continuations run without a sleep.
const checkpoint = () => new Promise<void>(resolve => setImmediate(resolve));

async function expectSettled<T>(promise: Promise<T>): Promise<T> {
  const unsettled = Symbol('unsettled');
  const result = await Promise.race([promise, checkpoint().then(() => unsettled)]);
  expect(result, 'The public call must settle even when its underlying task ignores abort.').not.toBe(unsettled);
  return result as T;
}

function harness() {
  let values = { name: 'A' };
  let issues: readonly StandardSchemaV1.Issue[] = [];
  const requests: ReturnType<typeof deferred<StandardSchemaV1.Result<typeof values>>>[] = [];
  const controller = createAsyncFormController({ getValues: () => values, setIssues: next => { issues = next; }, validate: () => { const request = deferred<StandardSchemaV1.Result<typeof values>>(); requests.push(request); return request.promise; } });
  return { controller, requests, issues: () => issues, change: (name: string) => { values = { name }; controller.change(); } };
}
test('ignored abort settles immediately and old finally preserves newer pending', async () => {
  const h = harness();
  const first = h.controller.validate(); await checkpoint();
  h.change('B'); h.change('A');
  const second = h.controller.validate(); await checkpoint();
  expect(await expectSettled(first)).toEqual({ status: 'cancelled' });
  h.requests[0].resolve({ issues: [{ path: ['name'], message: 'old' }] }); await checkpoint();
  expect(h.issues()).toEqual([]); expect(h.controller.getSnapshot().isValidating).toBe(true);
  h.requests[1].resolve({ value: { name: 'A' } });
  expect((await second).status).toBe('valid');
});
test('reset cancels pending submit before host invocation', async () => {
  const h = harness(); let saves = 0;
  const submit = h.controller.submit(() => { saves++; }); await checkpoint();
  h.controller.reset(); expect(await expectSettled(submit)).toEqual({ status: 'cancelled' });
  h.requests[0].resolve({ value: { name: 'A' } }); await checkpoint();
  expect(saves).toBe(0); expect(h.controller.getSnapshot().submitCount).toBe(0);
});
test('reset during host save invalidates scoped errors and ignores late rejection', async () => {
  const h = harness(); const saving = deferred<void>();
  let report!: (name: string, message: string) => void;
  const submit = h.controller.submit((_value, context) => { report = context.setFieldError; return saving.promise; });
  await checkpoint(); h.requests[0].resolve({ value: { name: 'A' } }); await checkpoint();
  h.controller.reset(); expect(await expectSettled(submit)).toEqual({ status: 'cancelled' });
  report('name', 'old server error'); saving.reject(new Error('old failure')); await checkpoint();
  expect(h.issues()).toEqual([]); expect(h.controller.getSnapshot().error).toBeUndefined();
});
test('submission mutex and server errors recover on the next attempt', async () => {
  const h = harness();
  const first = h.controller.submit((_value, context) => context.setFieldError('name', 'unavailable'));
  expect(await h.controller.submit(() => { throw new Error('duplicate'); })).toEqual({ status: 'cancelled' });
  await checkpoint(); h.requests[0].resolve({ value: { name: 'A' } });
  expect((await first).status).toBe('invalid');
  const next = h.controller.submit(() => {}); await checkpoint(); h.requests[1].resolve({ value: { name: 'A' } });
  expect((await next).status).toBe('valid'); expect(h.issues()).toEqual([]);
  expect(h.controller.getSnapshot().isSubmitSuccessful).toBe(true);
});

test('validation snapshots values and delivers transformed output', async () => {
  const values = { name: 'draft' };
  const validation = deferred<StandardSchemaV1.Result<number>>();
  let snapshot: typeof values | undefined;
  let output: number | undefined;
  const controller = createAsyncFormController({ getValues: () => values, setIssues: () => {}, validate: (value: typeof values) => { snapshot = value; return validation.promise; } });
  const submission = controller.submit(value => { output = value; });
  values.name = 'changed outside form'; await checkpoint();
  expect(snapshot).toEqual({ name: 'draft' });
  validation.resolve({ value: 42 }); await submission;
  expect(output).toBe(42);
});
