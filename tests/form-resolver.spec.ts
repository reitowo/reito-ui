import { expect, test } from '@playwright/test';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { createFormControl, type FieldErrors, type ResolverOptions } from 'react-hook-form';
import { schemaResolver } from '../packages/ui/src/complex/form-resolver';

function schema<Input, Output = Input>(
  validate: StandardSchemaV1.Props<Input, Output>['validate'],
): StandardSchemaV1<Input, Output> {
  return { '~standard': { version: 1, vendor: 'reito-ui-test', validate } };
}

test('schema-wide issues prevent submission instead of disappearing with RHF root errors', async () => {
  const draft = { password: 'secret', confirmation: 'different' };
  const passwordSchema = schema<typeof draft>(input => {
    const values = input as typeof draft;
    return values.password === values.confirmation
      ? { value: values }
      : { issues: [{ message: '两次密码必须一致' }] };
  });
  const form = createFormControl({ defaultValues: draft, resolver: schemaResolver(passwordSchema) });
  let submissions = 0;
  let invalid: FieldErrors<typeof draft> | undefined;

  await form.handleSubmit(() => { submissions += 1; }, errors => { invalid = errors; })();

  expect(submissions).toBe(0);
  expect(invalid).toMatchObject({ _form: { message: '两次密码必须一致' } });
  expect(form.getValues()).toEqual(draft);
});

test('nested and array field errors remain at the original paths alongside schema-wide errors', async () => {
  const draft = { profile: { email: 'invalid' }, rules: [{ key: '' }] };
  const nestedSchema = schema<typeof draft>(() => ({
    issues: [
      { path: ['profile', 'email'], message: '邮箱格式无效' },
      { path: [{ key: 'rules' }, { key: 0 }, { key: 'key' }], message: '规则名不能为空' },
      { message: '至少启用一条规则' },
    ],
  }));
  const resolve = schemaResolver(nestedSchema);
  const options: ResolverOptions<typeof draft> = { fields: {}, shouldUseNativeValidation: false };

  const result = await resolve(draft, undefined, options);

  expect(result.values).toEqual({});
  expect(result.errors).toMatchObject({
    profile: { email: { message: '邮箱格式无效' } },
    rules: [{ key: { message: '规则名不能为空' } }],
    _form: { message: '至少启用一条规则' },
  });
});

test('parsed output and raw mode preserve the Standard Schema value contract', async () => {
  const draft = { amount: '12.5' };
  const amountSchema = schema<typeof draft, { amount: number }>(input => ({
    value: { amount: Number((input as typeof draft).amount) },
  }));
  const options: ResolverOptions<typeof draft> = { fields: {}, shouldUseNativeValidation: false };

  const parsed = await schemaResolver(amountSchema)(draft, undefined, options);
  const raw = await schemaResolver(amountSchema, { raw: true })(draft, undefined, options);

  expect(parsed).toEqual({ values: { amount: 12.5 }, errors: {} });
  expect(raw).toEqual({ values: { amount: '12.5' }, errors: {} });
  expect(draft).toEqual({ amount: '12.5' });
});

test('a rejected async validator releases submission state and allows retry with the same draft', async () => {
  let failValidation = true;
  const draft = { name: '研究工作台' };
  const asyncSchema = schema<typeof draft>(async input => {
    if (failValidation) throw new Error('校验服务暂时不可用');
    return { value: input as typeof draft };
  });
  const form = createFormControl({ defaultValues: draft, resolver: schemaResolver(asyncSchema) });
  const states: boolean[] = [];
  const unsubscribe = form.subscribe({
    formState: { isSubmitted: true, errors: true },
    callback: state => { if (typeof state.isSubmitting === 'boolean') states.push(state.isSubmitting); },
  });
  let submissions = 0;
  let invalid: FieldErrors<typeof draft> | undefined;

  try {
    await form.handleSubmit(() => { submissions += 1; }, errors => { invalid = errors; })();
    expect(submissions).toBe(0);
    expect(invalid).toMatchObject({ _form: { message: '校验服务暂时不可用' } });
    expect(states.at(-1)).toBe(false);
    expect(form.getValues()).toEqual(draft);

    failValidation = false;
    await form.handleSubmit(values => {
      submissions += 1;
      expect(values).toEqual(draft);
    })();
    expect(submissions).toBe(1);
    expect(states.at(-1)).toBe(false);
    expect(form.getValues()).toEqual(draft);
  } finally {
    unsubscribe();
  }
});
