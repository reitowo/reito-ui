import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';

export function schemaResolver<Input extends FieldValues, Context, Output>(
  schema: StandardSchemaV1<Input, Output>,
  options?: { raw?: false },
): Resolver<Input, Context, Output>;
export function schemaResolver<Input extends FieldValues, Context, Output>(
  schema: StandardSchemaV1<Input, Output>,
  options: { raw: true },
): Resolver<Input, Context, Input>;

/**
 * Uses the official Standard Schema resolver, preserving parsed output types.
 * `raw: true` validates the input but returns the original input values.
 *
 * `_form` is reserved for schema-wide errors and validation exceptions; do not
 * use it as a data field name. RHF reserves `root` for submission errors and
 * clears it before deciding whether to call the submit handler, so the
 * standard resolver's pathless issues must move to `_form` to block submission.
 * Schemas should attach ordinary field issues to their actual field paths.
 *
 * A thrown/rejected validator becomes a form error, retaining the draft and
 * allowing another validation attempt. This also keeps an unexpected schema
 * failure from leaving RHF's submission state pending indefinitely.
 */
export function schemaResolver<Input extends FieldValues, Context, Output>(
  schema: StandardSchemaV1<Input, Output>,
  options: { raw?: boolean } = {},
): Resolver<Input, Context, Output | Input> {
  const resolve = options.raw
    ? standardSchemaResolver<Input, Context, Output>(schema, undefined, { raw: true })
    : standardSchemaResolver<Input, Context, Output>(schema);

  return async (values, context, resolverOptions) => {
    try {
      const result = await resolve(values, context, resolverOptions);
      const errors = result.errors as FieldErrors<Input>;
      if (!errors.root) return result;

      const nextErrors = { ...errors };
      delete nextErrors.root;
      return {
        values: {},
        errors: Object.assign(nextErrors, { _form: errors.root }),
      };
    } catch (reason) {
      return {
        values: {},
        errors: Object.assign({} as FieldErrors<Input>, {
          _form: {
            type: 'validate',
            message: reason instanceof Error && reason.message
              ? reason.message
              : '表单校验失败，请重试。',
          },
        }),
      };
    }
  };
}
