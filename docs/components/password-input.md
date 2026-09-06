# PasswordInput

`PasswordInput` 在原生密码输入上增加可访问的显隐按钮、规则结果和强度反馈。普通登录字段若不需要这些能力，继续使用 `Input type="password"`。

```tsx
import { PasswordInput, type PasswordRule } from '@reito/ui/basic';

const rules: PasswordRule[] = [
  { id: 'length', label: '至少 10 个字符', test: value => value.length >= 10 },
  { id: 'number', label: '包含数字', test: /\d/ },
  { id: 'symbol', label: '包含符号', test: /[^\p{L}\p{N}]/u },
];

export function NewPassword() {
  const [value, setValue] = useState('');
  return <PasswordInput
    label="新密码"
    value={value}
    onValueChange={setValue}
    onValueCommit={saveDraft}
    rules={rules}
    error={serverError}
    autoComplete="new-password"
  />;
}
```

规则由宿主提供；组件只执行规则并显示通过/未通过状态。默认强度按通过规则的比例映射到 0–4，`getStrength(value, results)` 可替换算法与标签。`feedback={false}` 可关闭规则和强度区域，普通输入行为、标签和错误关联仍保留。

显隐按钮的名称随状态在“显示密码”与“隐藏密码”之间切换，切换后焦点和选区回到输入框。强度使用 `role="meter"`，变化通过礼貌 live region 报告；规则同时用图标和文字表达结果。`readOnly` 会移除显隐操作，`disabled` 禁用输入及按钮。

组件转发输入 ref、`name`、`form`、`required`、`autoComplete` 和其他原生输入属性。业务校验可通过 `onValueChange` 接入 Form 或 schema，并把同步、异步或服务端错误传入 `error`；组件不会保存、传输或判断密码是否泄露。
