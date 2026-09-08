# SplitButton

`SplitButton` 把一个默认命令与一组相关命令放在同一按钮组中。主按钮直接执行默认命令；窄菜单按钮打开 Base UI Menu，保留方向键、Home / End、类型查找、Escape 关闭和焦点恢复。

```tsx
import { SplitButton, type SplitButtonItem } from '@reito/ui/complex';

const items: SplitButtonItem[] = [
  { id: 'copy', label: '保存副本', shortcut: 'Ctrl+Shift+S' },
  { id: 'branch', label: '保存并创建分支', shortcut: 'Ctrl+Alt+S' },
  { id: 'remote', label: '发布到远端', disabled: true },
];

<SplitButton
  label="保存"
  items={items}
  onAction={save}
  onItemSelect={item => runRelatedAction(item.id)}
  actionLabel="保存当前草稿"
  menuLabel="更多保存操作"
  actionShortcut="Ctrl+S"
/>
```

## 状态边界

- `disabled` 禁用整组；`actionDisabled` 与 `menuDisabled` 分别禁用两个按钮。
- `loading` 禁用主操作并显示进度；菜单仍可用于相关命令。`menuLoading` 让菜单保持可打开，并在弹层中说明动作列表正在加载。
- 每个 `SplitButtonItem` 可单独设置 `disabled` 或 `loading`。忙碌条目不可再次执行，其他条目保持可用。
- `open / onOpenChange` 提供受控弹层，`defaultOpen` 提供初始展开。宿主负责异步请求、成功/失败状态与操作结果。

## 标签与快捷键

`actionLabel` 可为复合主按钮内容提供明确名称；`menuLabel` 是菜单按钮的必需可读名称，默认值为“更多操作”。`groupLabel` 命名整个操作组。

`actionShortcut`、`menuShortcut` 与条目的 `shortcut` 会写入 `aria-keyshortcuts`；条目快捷键同时显示在菜单尾部。它们只说明宿主已经绑定的快捷键，组件不会注册全局键盘监听。

当条目 `label` 不是纯字符串时，用 `textValue` 提供菜单类型查找文字：

```tsx
{
  id: 'branch',
  label: <><BranchIcon />保存并创建分支</>,
  textValue: 'branch',
}
```

`variant` 与 `size` 直接使用 Button 的 Graphite 语义变体和四档常规尺寸。菜单按钮自动映射到对应 icon 尺寸；不需要为两半分别写高度或圆角。`side`、`align` 和 `contentClassName` 可调整弹层位置与已有 token 化布局。

## 条目回调

条目的 `onSelect` 处理该条目自己的行为，`onItemSelect(item)` 统一处理所有条目。两者同时提供时都会执行。菜单默认在选择后关闭；仅在交互确实需要留在菜单内时使用 `closeOnSelect={false}`。

空数组不会让菜单按钮消失；打开后会显示 `emptyLabel`，让用户知道当前没有相关操作。若产品希望完全移除菜单，应由宿主改用普通 `Button`。
