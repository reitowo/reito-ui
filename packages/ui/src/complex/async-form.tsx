import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useForm, type DefaultValues, type FieldPath, type FieldValues } from 'react-hook-form';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { FormFrame, type FormProps } from './form.js';
import { createAsyncFormController } from './async-form-controller.js';

export type AsyncValidationMode = 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all';
export interface AsyncFormOptions<Input extends FieldValues, Output = Input> {
  defaultValues: Input;
  /** A new object is a new record/baseline, even when its field values are equal. */
  values?: Input;
  mode?: AsyncValidationMode;
  reValidateMode?: 'onSubmit' | 'onBlur' | 'onChange';
  /** Change when validation dependencies outside field values change. */
  validationKey?: unknown;
  validate: (values: Input, context: { signal: AbortSignal; reason: 'change' | 'blur' | 'submit' | 'manual' }) => StandardSchemaV1.Result<Output> | Promise<StandardSchemaV1.Result<Output>>;
}

/** RHF manages fields; the coordinator owns asynchronous validation and submission state. */
export function useAsyncForm<Input extends FieldValues, Output = Input>(options: AsyncFormOptions<Input, Output>) {
  const latest = useRef(options);
  latest.current = options;
  const baseline = useRef(options.values ?? options.defaultValues);
  const form = useForm<Input>({ defaultValues: baseline.current as DefaultValues<Input>, mode: 'onSubmit' });
  const resetting = useRef(false);
  const touched = useRef(new Set<string>());
  const [controller] = useState(() => createAsyncFormController<Input, Output>({
    getValues: () => form.getValues(),
    validate: (values, context) => latest.current.validate(values, context),
    setIssues: issues => {
      form.clearErrors();
      const seen = new Set<string>();
      for (const issue of issues) {
        const name = issue.path?.map(segment => typeof segment === 'object' ? segment.key : segment).join('.') || '_form';
        if (!seen.has(name)) form.setError(name as FieldPath<Input>, { type: 'async', message: issue.message });
        seen.add(name);
      }
    },
  }));
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const reset = useCallback((values?: Input) => {
    resetting.current = true;
    controller.reset();
    touched.current.clear();
    if (values !== undefined) baseline.current = values;
    form.reset(baseline.current);
    resetting.current = false;
  }, [controller, form]);
  const external = useRef(options.values);
  const validationKey = useRef(options.validationKey);
  useLayoutEffect(() => {
    if (!Object.is(validationKey.current, options.validationKey)) {
      validationKey.current = options.validationKey;
      controller.invalidate();
    }
  }, [options.validationKey, controller]);
  useLayoutEffect(() => {
    if (external.current !== options.values) {
      external.current = options.values;
      reset(options.values ?? options.defaultValues);
    }
  }, [options.values, options.defaultValues, reset]);
  useEffect(() => {
    const subscription = form.watch((_values, event) => {
      if (resetting.current) return;
      controller.change();
      const current = latest.current;
      const mode = controller.getSnapshot().isSubmitted ? current.reValidateMode ?? 'onChange' : current.mode ?? 'onBlur';
      if (mode === 'onChange' || mode === 'all' || (mode === 'onTouched' && !!event.name && touched.current.has(event.name))) void controller.validate('change');
    });
    return () => { subscription.unsubscribe(); controller.invalidate(); };
  }, [controller, form]);
  const blur = useCallback((name: string) => {
    touched.current.add(name);
    const current = latest.current;
    const mode = controller.getSnapshot().isSubmitted ? current.reValidateMode ?? 'onChange' : current.mode ?? 'onBlur';
    if (mode === 'onBlur' || mode === 'onTouched' || mode === 'all') {
      controller.blur();
      void controller.validate('blur');
    }
  }, [controller]);
  return { form, state, reset, blur, validate: controller.validate, submit: controller.submit, invalidate: controller.invalidate };
}

export type AsyncFormHandle<Input extends FieldValues, Output = Input> = ReturnType<typeof useAsyncForm<Input, Output>>;
export type AsyncFormProps<Input extends FieldValues, Output = Input> = Omit<FormProps<Input>, 'form' | 'onSubmit' | 'onInvalid'> & {
  handle: AsyncFormHandle<Input, Output>;
  onSubmit: Parameters<AsyncFormHandle<Input, Output>['submit']>[0];
  onInvalid?: Parameters<AsyncFormHandle<Input, Output>['submit']>[1];
};
export function AsyncForm<Input extends FieldValues, Output = Input>({ handle, onSubmit, onInvalid, ...props }: AsyncFormProps<Input, Output>) {
  return <FormFrame {...props} form={handle.form} onSubmit={() => {}} submitForm={() => handle.submit(onSubmit, onInvalid)} resetForm={() => handle.reset()} onFieldBlur={handle.blur} />;
}
