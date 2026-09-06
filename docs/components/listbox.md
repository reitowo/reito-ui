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

## 虚拟化与加载边界

大集合设置 `virtual`，可用 `overscan` 调整视口外保留量，`onRangeChange` 接收渲染范围和实际可见范围。虚拟行尺寸由共享密度 token 的 DOM 探针测量；活动项即使位于普通窗口外也会保留在 DOM 中，确保 `aria-activedescendant` 始终引用存在的 option。初始化选择、End/Home 导航和筛选后的活动项变化都会滚动到相应位置。

```tsx
<Listbox
  label="远程资源"
  options={loadedOptions}
  virtual
  overscan={4}
  loading={request.pending}
  loadError={request.error}
  onRetry={request.retry}
  onRangeChange={range => loadAround(range.visibleEndIndex)}
/>
```

首次加载在空列表旁显示 status；刷新已有结果时保留 options 并设置 `aria-busy`，底部显示加载状态；失败通过 `loadError / onRetry` 呈现。组件不发起请求，也不把未加载记录伪装成可选项。宿主根据范围加载或替换 `options`，并保持每项 `value` 稳定。虚拟模式采用固定 token 行高，不呈现分组标题；需要可见分组标题时保留普通模式或由宿主提供扁平的分组标签项。
