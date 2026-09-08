# ConfirmPopover

`ConfirmPopover` 在触发器旁显示一个焦点受控的确认面，适合列表行、工具栏和属性面板中的归档、移除或删除操作。它复用 Graphite `Button` 与 Base UI `Popover`，宿主继续持有真正的异步请求和业务结果。

```tsx
import { ConfirmPopover } from '@reito/ui/complex';
import { Button } from '@reito/ui/basic';

<ConfirmPopover
  trigger={<Button variant="outline">删除草稿</Button>}
  title="删除这份草稿？"
  description="删除后无法从当前工作区恢复。"
  destructive
  confirmLabel="删除"
  pendingLabel="正在删除…"
  onConfirm={() => deleteDraft()}
/>
```

## 异步结果

`onConfirm` 可以返回 Promise。请求进行期间，确认与取消按钮都会禁用，确认按钮显示 `pendingLabel`，`role="status"` 提供非打断式状态；重复点击、Escape 和外部点击不会关闭当前确认面。

Promise 成功后组件关闭，并把焦点还给原触发器。Promise 拒绝时组件保持打开，重新启用操作，并把 `getErrorMessage(error)` 的结果放在 `role="alert"` 中。`onConfirmError` 让宿主同时记录错误；`error` 可显示宿主已经拥有的错误状态。

若请求完全由外部状态机驱动，传入 `pending` 与 `error`。`open / onOpenChange` 可受控，`defaultOpen` 只设置初始值。

## 取消与焦点

取消按钮使用真正的 `Popover.Close`，`onCancel` 只负责宿主状态。Escape 与取消都会关闭并恢复触发器焦点。确认面为 modal Popover，Tab 和 Shift+Tab 保持在当前操作内；取消按钮排在确认按钮之前，并获得默认初始焦点，避免危险动作成为默认焦点。

`trigger` 接受一个已有 React 元素，方便复用宿主工具栏或列表行里的 Button。`disabled` 同时禁用触发器和确认动作。图标触发器仍需由宿主提供清楚的 `aria-label`。

## 布局

`side` 与 `align` 控制锚点方向，`className` 只应组合已有布局/token 类。默认宽度、最大视口宽度、内距、间隙、边界、颜色、圆角与按钮尺寸全部来自 Graphite tokens；业务页面无需再覆盖弹层高度或 padding。

必须让用户在执行前阅读较长的法律条款、输入确认文字，或确认行为不应依附某个局部触发器时，使用 `AlertDialog`。`ConfirmPopover` 面向短小、位置明确的局部确认。
