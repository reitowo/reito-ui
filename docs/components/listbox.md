# Listbox

`Listbox` 是常驻选择面板，适合工具、成员、资源和偏好等需要持续查看选项的场景。弹出式选择继续使用 Select、Combobox 或 MultiSelect。

```tsx
import { Listbox, type ListboxValue } from '@reito/ui/basic';

export function ToolPicker() {
  const [value, setValue] = useState<ListboxValue>(['react']);
  return <Listbox
    label="启用的工具"
    options={[
      { value: 'react', label: 'React', group: '应用', description: '界面组件' },
      { value: 'storybook', label: 'Storybook', group: '工具', description: '组件工作台' },
    ]}
    selectionMode="multiple"
    value={value}
    onValueChange={setValue}
    searchable
    clearable
    name="tools"
  />;
}
```

`value / defaultValue / onValueChange` 管理单选字符串、复选字符串数组或空值。`activeValue / defaultActiveValue / onActiveValueChange` 单独管理键盘活动项，选择不会和焦点混成一个状态。搜索可由 `query / onQueryChange` 接管；过滤依据 label、字符串 description 和 keywords。

DOM 焦点保留在 `role="listbox"` 容器，活动项通过 `aria-activedescendant` 暴露。方向键、Home、End 移动活动项，Enter 或 Space 选择；多选支持 Shift+方向键、Shift+Space、Shift+点击与 Ctrl/Command+A。禁用项不进入活动顺序或范围。富选项可以包含图标和说明，但不应包含按钮、链接、复选框等交互子元素。

`readOnly` 允许浏览但不修改，`disabled` 保留焦点供滚动和辅助技术读取，同时阻止选择。`required / error / description` 提供字段语义；`name` 在多选时提交重复同名隐藏值。原生表单的 required 阻止提交与错误定位仍应由 Form 适配或宿主 schema 负责。

当前实现渲染全部本地 options。大集合窗口化、远程加载、加载/错误边界与筛选后的非可见活动项属于 LISTBOX-02。
