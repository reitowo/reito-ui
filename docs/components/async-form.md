# AsyncForm 异步表单

`useAsyncForm` 管理异步校验与提交的生命周期，`AsyncForm` 复用 Form 的字段、指针/键盘、IME 和错误焦点行为。使用 `@reito/ui/complex` 的导出，配合现有 `FormField`、`FormError` 和基础输入组件。

```tsx
const handle = useAsyncForm({
  defaultValues: { name: '' },
  mode: 'onBlur',
  validate: (value, { signal }) => validateName(value, signal),
});
// validate 返回 Standard Schema 的 { value } 或 { issues }。
<AsyncForm handle={handle} onSubmit={async (value, context) => {
  const result = await save(value, context.signal);
  if (!context.isCurrent()) return;
  if (result.error) context.setFieldError('name', result.error);
}}>
  <FormField control={handle.form.control} name="name" label="名称"
    render={({ field, controlProps }) => <Input {...field} {...controlProps} />} />
  <FormError />
  <Button type="submit">保存</Button>
</AsyncForm>
```

## 状态与请求

- `handle.form` 是 RHF 字段容器，提供值、dirty、touched 和字段错误。异步状态读取 `handle.state`，包括 `isValidating`、`isSubmitting`、`isSubmitted`、`isSubmitSuccessful`、`submitCount`、`validationStatus`；不要将 RHF 自身提交状态当成异步状态。
- `validate` 接收当前值快照和 `{ signal, reason }`，支持 Standard Schema 的同步或异步结果；schema 可通过 `validate: value => schema['~standard'].validate(value)` 适配。校验和转换在此集中定义，不与 `FormField.rules` 或 RHF resolver 混用。
- 每次值变更都使旧快照失效，即便还没触发下一次校验、或值后来改回相同内容。取消会结清调用方等待；忽略 AbortSignal 的服务晚返回也不会写回错误。
- `values` 对象引用改变代表新记录，重建 dirty 基线、清除 touched 和提交状态。同值记录也会取消旧任务；消费方应稳定保存该对象，避免每次渲染创建新对象。
- `handle.reset(values?)` 取消校验/提交并重置字段；提供 values 时它成为新基线。需要处理中允许重置时，将按钮放在 AsyncForm 的禁用 fieldset 外。
- 字段外的校验依赖改变时更新 `validationKey`，或显式调用 `invalidate()`；函数回调可内联，函数身份变化本身不代表新校验配置。
- 宿主提交使用作用域内 `setFieldError` 回填错误。异步成功后的宿主状态更新先检查 `isCurrent()`；取消不能撤销已经发出的网络副作用。
- `mode` 支持 onSubmit/onBlur/onChange/onTouched/all；提交后的 `reValidateMode` 默认 onChange。`handle.validate('manual')` 可主动校验。

## 示例与验收

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-asyncform-异步表单--playground) 提供触发时机、禁用、提交结果和手动返回请求开关。所有结果都是本地交互。

FORM-02 已通过 [验收](../validation-async-form.md)，状态以 [补齐账本](../component-completion.md) 为准。嵌套数组状态迁移和完整动态表单仍由 FORM-03 / FORM-04 跟踪。
