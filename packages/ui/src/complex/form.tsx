import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import {
  FormProvider, useController, useFormContext,
  type ControllerProps, type ControllerRenderProps, type ControllerFieldState,
  type FieldPath, type FieldValues, type FormState, type SubmitErrorHandler, type SubmitHandler, type UseFormReturn,
} from 'react-hook-form';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../primitives/field.js';
import { cn } from '../lib/utils.js';

export { useForm, useFormContext, useFormState, useWatch, useFieldArray } from 'react-hook-form';
export type { FieldValues, FieldPath, UseFormReturn, UseFormProps, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
export { schemaResolver } from './form-resolver.js';

const FormInteractionContext = createContext({ disabled: false, busy: false, deferBlur: (blur: () => void) => blur(), onFieldBlur: (_name: string) => {} });

export interface FormProps<T extends FieldValues, Context = unknown, Output = T>
  extends Omit<ComponentProps<'form'>, 'onSubmit' | 'onInvalid' | 'children'> {
  form: UseFormReturn<T, Context, Output>;
  onSubmit: SubmitHandler<Output>;
  onInvalid?: SubmitErrorHandler<T>;
  disabled?: boolean;
  children: ReactNode;
}

/** RHF owns values/validation. This boundary serializes validation + submission and preserves failed drafts. */
export function Form<T extends FieldValues, Context = unknown, Output = T>({
  ...props
}: FormProps<T, Context, Output>) {
  return <FormFrame {...props} />;
}

/** Shared native interaction boundary for synchronous and managed asynchronous forms. */
export function FormFrame<T extends FieldValues, Context = unknown, Output = T>({
  form, onSubmit, onInvalid, disabled = false, children, className,
  submitForm, resetForm, onFieldBlur = () => {},
  onReset, onCompositionStartCapture, onCompositionEndCapture, onKeyDownCapture, onPointerDownCapture, ...props
}: FormProps<T, Context, Output> & { submitForm?: () => Promise<unknown>; resetForm?: () => void; onFieldBlur?: (name: string) => void }) {
  const locked = useRef(false);
  const composing = useRef(false);
  const focusAfterUnlock = useRef<HTMLFormElement | null>(null);
  const pointerActive = useRef(false);
  const pendingBlur = useRef(new Set<() => void>());
  const [pending, setPending] = useState(false);
  const busy = pending;
  const deferBlur = useCallback((blur: () => void) => {
    if (pointerActive.current) pendingBlur.current.add(blur);
    else blur();
  }, []);
  useEffect(() => {
    let frame: number | undefined;
    const flush = () => {
      pointerActive.current = false;
      const callbacks = [...pendingBlur.current]; pendingBlur.current.clear();
      callbacks.forEach(blur => blur());
    };
    // A blur error must not move a button/checkbox between pointerdown and click.
    // Keyboard blur remains immediate. Pointerup is the fallback for a cancelled click.
    const release = () => { frame = requestAnimationFrame(flush); };
    window.addEventListener('click', flush);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', flush);
    window.addEventListener('blur', flush);
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      window.removeEventListener('click', flush);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', flush);
      window.removeEventListener('blur', flush);
    };
  }, []);
  useLayoutEffect(() => {
    if (pending || !focusAfterUnlock.current) return;
    const element = focusAfterUnlock.current;
    focusAfterUnlock.current = null;
    element.querySelector<HTMLElement>('[aria-invalid="true"]:not([disabled]):not([aria-disabled="true"]):is(input:not([type="hidden"]),textarea,select,button,[tabindex])')?.focus();
  });
  return <FormProvider {...form}>
    <FormInteractionContext.Provider value={{ disabled, busy, deferBlur, onFieldBlur }}>
      <form {...props} noValidate data-slot="form" aria-busy={busy}
        className={cn('min-w-0 font-sans text-sm text-foreground', className)}
        onPointerDownCapture={event => { pointerActive.current = true; onPointerDownCapture?.(event); }}
        onCompositionStartCapture={event => { composing.current = true; onCompositionStartCapture?.(event); }}
        onCompositionEndCapture={event => { composing.current = false; onCompositionEndCapture?.(event); }}
        onKeyDownCapture={event => {
          if (event.key === 'Enter' && (composing.current || event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault();
          onKeyDownCapture?.(event);
        }}
        onReset={event => {
          if (disabled || locked.current) { event.preventDefault(); return; }
          onReset?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault(); if (resetForm) resetForm(); else form.reset();
        }}
        onSubmit={async event => {
          event.preventDefault();
          if (disabled || locked.current || composing.current) return;
          const element = event.currentTarget;
          locked.current = true; setPending(true);
          try {
            if (submitForm) await submitForm();
            else await form.handleSubmit(onSubmit, async (errors, validationEvent) => {
              try { await onInvalid?.(errors, validationEvent); }
              catch (error) { form.setError('root.submit', { type: 'validation-callback', message: error instanceof Error ? error.message : '校验处理失败，请重试' }); }
            })(event);
          } catch (error) {
            form.setError('root.submit', { type: 'submit', message: error instanceof Error ? error.message : '保存失败，请重试' });
          } finally {
            // Restore focus after React commits the unlocked inputs, not during validation.
            focusAfterUnlock.current = element;
            locked.current = false; setPending(false);
          }
        }}>
        <fieldset disabled={disabled || busy} className="m-0 grid min-w-0 gap-[var(--rui-content-gap)] border-0 p-0">
          {children}
        </fieldset>
      </form>
    </FormInteractionContext.Provider>
  </FormProvider>;
}

export interface FormControlProps {
  id: string;
  disabled: boolean;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
  'aria-required': boolean | undefined;
}
export interface FormFieldRenderProps<T extends FieldValues, Name extends FieldPath<T>> {
  field: ControllerRenderProps<T, Name>;
  fieldState: ControllerFieldState;
  formState: FormState<T>;
  /** Apply to the focusable input/trigger, alongside field ref/name/value handlers. */
  controlProps: FormControlProps;
}
export type FormFieldProps<T extends FieldValues, Name extends FieldPath<T> = FieldPath<T>, Output = T> =
  Omit<ControllerProps<T, Name, Output>, 'render'> & {
    label: ReactNode;
    description?: ReactNode;
    required?: boolean;
    id?: string;
    className?: string;
    render: (props: FormFieldRenderProps<T, Name>) => ReactNode;
  };

/** Uses existing Field visuals; render keeps native and Base UI value/ref contracts explicit. */
export function FormField<T extends FieldValues, Name extends FieldPath<T> = FieldPath<T>, Output = T>({
  label, description, required, id: suppliedId, className, render, ...controllerProps
}: FormFieldProps<T, Name, Output>) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const { disabled, busy, deferBlur, onFieldBlur } = useContext(FormInteractionContext);
  // Do not pass transient submit state to RHF.disabled: that would omit values from the payload.
  const controller = useController<T, Name, Output>(controllerProps);
  const error = controller.fieldState.error;
  const hasDescription = description !== undefined && description !== null && description !== '';
  const describedBy = [hasDescription && `${id}-description`, error?.message && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const controlProps: FormControlProps = {
    id, disabled: !!(disabled || busy || controller.field.disabled),
    'aria-invalid': !!error, 'aria-describedby': describedBy, 'aria-required': required || undefined,
  };
  return <Field data-invalid={!!error} data-disabled={controlProps.disabled} className={className}>
    <FieldLabel htmlFor={id}>{label}{required && <span aria-hidden="true">*</span>}</FieldLabel>
    <FieldContent>
      {render({ ...controller, field: { ...controller.field, onBlur: () => deferBlur(() => { controller.field.onBlur(); onFieldBlur(controller.field.name); }) }, controlProps })}
      {hasDescription && <FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
      {error?.message && <FieldError id={`${id}-error`}>{error.message}</FieldError>}
    </FieldContent>
  </Field>;
}

/** Schema-wide errors use the reserved _form key; rejected submissions use root.submit. */
export function FormError({ className, ...props }: ComponentProps<'div'>) {
  const { formState: { errors } } = useFormContext();
  const messages = [errors._form?.message, errors.root?.submit?.message].filter((message): message is string => typeof message === 'string');
  if (!messages.length) return null;
  return <FieldError {...props} className={className}>{messages.join('；')}</FieldError>;
}
