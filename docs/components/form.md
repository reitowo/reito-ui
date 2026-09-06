# Form 表单管理

Form 复用 React Hook Form 的值、字段状态与校验，并使用现有 Graphite Field、Input 和其他控件。入口：`@reito/ui/complex`。工作区新增版本尚未重新打包，已有 0.4.1 tarball 不包含此增量。

## 基本用法

```tsx
import { Form, FormField, FormError, useForm, schemaResolver } from '@reito/ui/complex';
import { Input, Button } from '@reito/ui/basic';
import { z } from 'zod'; // 消费项目自行选择、安装支持 Standard Schema 的验证库

const schema = z.object({ name: z.string().min(2, '名称至少需要 2 个字符') });

function Settings() {
  const form = useForm({
    defaultValues: { name: '研究工作区' },
    resolver: schemaResolver(schema),
    mode: 'onBlur',
  });
  return (
    <Form form={form} aria-label="工作区设置" onSubmit={async values => {
      await saveSettings(values); // 宿主实现；抛错会显示错误并保留草稿
    }}>
      <FormField control={form.control} name="name" label="名称" required
        render={({ field, controlProps }) => <Input {...field} {...controlProps} />} />
      <FormError />
      <Button type="submit">保存</Button>
      <Button type="reset" variant="outline">重置</Button>
    </Form>
  );
}
```

`defaultValues` 是初始/重置基线。外部数据更新使用 RHF 的 `values` 或 `reset(nextValues)`；表单成功后不会自动清空草稿。`useWatch`、`useFormState`、`useFormContext`、`useFieldArray` 同入口导出。Form 是真正的 HTML form，不能在其内嵌套另一层 Form；嵌套数据使用 `workspace.name` 等字段路径。

## 公开契约

| API | 用途与边界 |
| --- | --- |
| `Form` | `form`、`onSubmit`、`onInvalid`、`disabled` 与原生 form 属性。关闭浏览器原生校验弹泡，由 resolver/rules 统一呈现。整个异步校验与提交有同步互斥锁。 |
| `FormField` | `control`、类型安全的 `name`、`rules`、`label`、`description`、`required`、`id`、`disabled`、`render` 等 Controller 参数。`required` 提供语义提示，真正的必填规则仍写入 schema/rules。 |
| `render` | 收到 `field`、`fieldState`、`formState`、`controlProps`。后者提供 id、disabled、aria-invalid/required/describedby；放到可聚焦输入或 Trigger。 |
| `FormError` | 显示全表单 schema 错误及提交异常；字段错误由 FormField 就近展示。 |
| `schemaResolver` | 适配 Standard Schema，支持异步、输入/输出类型及 `{raw:true}`。验证库是消费方选择，运行包不依赖 Zod。 |

Schema 的无路径错误使用保留名称 `_form`；不要将 `_form` 或 RHF 保留的 `root` 当作业务字段。官方 resolver 将无路径错误放入 `root`，而 RHF 提交时清除 root；本适配器避免该错误丢失。校验器异常转为全表单错误，可保留草稿并重试。

提交失败可抛出 `Error`；宿主可用 `form.setError('email', {type:'server', message:'邮箱暂不可用'})` 回填字段错误。失败后首个无效的可聚焦控件在解锁后获得焦点。没有字段错误的全表单提示通过 `role=alert` 宣告。

指针按下后触发的 blur 校验会等到点击完成/取消再处理，防止错误行插入把按钮或复选框移出尚未完成的点击；Tab 失焦即时处理。中文候选确认 Enter 不提交，普通 Enter 保留原生表单行为。

## 控件适配

- Input / Textarea：应用 `{...field} {...controlProps}`。
- Checkbox / Switch：用 `checked={field.value}`、`onCheckedChange={field.onChange}`，并连接 `name`、`ref`、`onBlur` 和 `controlProps`。
- Select：Root 接收 `value` / `onValueChange` / `name` / `disabled`；Trigger 接收 `ref` / `onBlur` / `controlProps`。
- 自定义控件：合并宿主原有的 `aria-describedby`；`field.ref` 必须指向真实输入或可聚焦 Trigger。NumberField / MultiSelect 的高级便捷组件还需要各自的输入 ref / props 通道对齐，不能把根 div ref 当成已完成焦点适配。

Form 的临时提交锁只禁用交互，不把临时 pending 写到 Controller.disabled，以免 RHF 从提交 payload 移除值。主动配置字段级 `disabled` 则沿用 RHF 的数据省略语义。

## Storybook 与范围

[参数调试](http://127.0.0.1:6006/?path=/story/复杂-form-表单管理--playground) 可在同页改变 disabled、校验模式、说明文字及本地提交结果。预设覆盖成功、失败、字段错误、异步校验、嵌套数组、Select/Switch 和 schema 值转换；[Lab](http://127.0.0.1:5173/?layer=complex&component=form) 使用同一演示。

FORM-01 至 FORM-04 已分项验收；异步状态见 [AsyncForm](async-form.md)，条件字段见 [动态配方](dynamic-form.md)，结果按 [账本](../component-completion.md) 单独记录。宿主执行网络请求、权限与持久化；本地示例没有连接服务。

## 嵌套与数组配方

[数组参数调试](http://127.0.0.1:6006/?path=/story/复杂-form-表单管理--array-playground) 在同页调整初始项数、只读、禁用、校验时机和字段状态显示。示例由公开的 `useFieldArray`、`Form`、`FormField` 组合，不新增一个隐含数据模型的表单引擎。

```tsx
const contacts = useFieldArray({ control: form.control, name: 'contacts' });
contacts.fields.map((item, index) => (
  <FormField key={item.id} control={form.control}
    name={`contacts.${index}.email`} label={`联系人 ${index + 1} 邮箱`}
    render={({ field, controlProps }) => <Input {...field} {...controlProps} />} />
));
```

- React key 使用 `item.id`，字段路径仍用当前位置；不能使用数组下标作为 React key。业务记录 ID 应保存在独立字段（如 contactId），不覆盖 RHF 生成的 id。
- 增删与重排使用 `append/remove/move` 等字段数组操作，避免自己修改 `fields` 或仅重排可见 DOM。配方删除后聚焦相邻邮箱；删除最后一项时聚焦添加按钮。数组级必填错误与添加按钮关联。
- 字段错误与 touched 跟随移动/删除后的项路径；dirty 是当前值与 `defaultValues` 对应路径的差异，重排可能让多个位置变 dirty。这是整份草稿相对初始顺序发生改变，不是用户触碰了每一项。不要把 dirty 当成按业务 ID 保存的编辑历史。
- `reset()` 恢复初始嵌套值、数组顺序和字段状态，RHF 可重新生成渲染 id；跨 reset 的业务身份使用自己的 contactId。需要接受新的基线时使用 `reset(nextValues)`。
- 不对数组字段设置 `shouldUnregister: true` 来实现重排；数组操作已负责字段注册迁移。标准 schema 通过 `contacts.1.email` 等路径呈现项错误，全表单重复规则仍显示在 FormError。
- `readOnly` 配方保留可聚焦只读输入并禁用结构操作和提交；`disabled` 使用 Form 的禁用 fieldset。加载/保存互斥与异常恢复沿用 Form / AsyncForm 契约。

依赖与来源：[React Hook Form](https://github.com/react-hook-form/react-hook-form)、[官方 resolvers](https://github.com/react-hook-form/resolvers)、[Standard Schema](https://github.com/standard-schema/standard-schema)、[Nuxt Form](https://ui.nuxt.com/docs/components/form)、[PrimeVue Forms](https://primevue.dev/forms/)。验证结果见 [Form 验收记录](../validation-form.md)。
