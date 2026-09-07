# OverlayProvider 命令式浮层

`OverlayProvider` 是复杂层的可选命令式事务入口。它复用基础层 `Dialog`、`Sheet` 和 `AlertDialog`，适合从命令、表格行、异步流程或跨层回调中打开临时界面并等待一个明确结果。局部且固定的浮层继续直接使用声明式基础组件。

```tsx
import { OverlayProvider, useOverlay } from '@reito/ui/complex';

function DeleteButton() {
  const overlay = useOverlay();

  async function confirmDelete() {
    const handle = overlay.open<boolean>({
      kind: 'alert-dialog',
      title: '删除这份草稿？',
      description: '删除后无法从当前工作区恢复。',
      confirmLabel: '删除',
      confirmValue: true,
      destructive: true,
    });
    const outcome = await handle.result;
    if (outcome.status === 'closed' && outcome.value) {
      // 由宿主执行删除。
    }
  }

  return <button onClick={confirmDelete}>删除草稿</button>;
}

export function App() {
  return <OverlayProvider><DeleteButton /></OverlayProvider>;
}
```

`open()` 返回稳定的 `id`、总会结束的 `result` Promise，以及 `close(value)`、`dismiss(reason)`、`patch(options)` 和只读 `isOpen`。服务还提供按 ID 的 `close / dismiss / patch / isOpen` 与 `closeAll`。`isOpen` 是调用时快照查询，不会单独触发消费组件重渲染。

结果使用判别联合：业务完成为 `{ status: 'closed', value }`；取消、Escape、点击外部、命令关闭、批量关闭、父层关闭或 Provider 卸载为 `{ status: 'dismissed', reason }`。不要把关闭原因当作业务成功。

`content` 和 `footer` 可以是 ReactNode，也可以是接收 `close / dismiss / patch / open` 的渲染函数。渲染函数可打开子浮层；栈顶关闭后焦点回到父层入口。关闭非顶层会同时以 `ancestor-close` 结束它上面的子事务。Provider 卸载会以 `provider-unmount` 结束全部未决 Promise，避免调用方永久等待。

`dismissible={false}` 只阻止 Escape 和外部点击，仍应保留明确的完成或取消按钮。`Sheet` 使用 `sheetSide`；`AlertDialog` 默认提供确认与取消。自定义 `footer` 后，宿主负责提供可达关闭入口。`className` 只作用于弹层内容容器，并应继续使用语义类或 `--rui-*` tokens。

Provider 应放在应用主题与密度属性覆盖的树中。Portal 会继承文档根上的 `data-theme` 和 `data-density`；不要依赖局部 wrapper 修补浮层主题。
