# AsyncMultiSelect

`AsyncMultiSelect` 用于从宿主加载的远程结果中选择多个值。它与 `AsyncCombobox` 共享请求取消、过期响应保护和状态呈现，并额外缓存已选选项，使当前结果页不再包含某个值时，chip 仍显示稳定标签。

```tsx
import { AsyncMultiSelect } from '@reito/ui/basic';

export function MemberPicker() {
  const [query, setQuery] = useState('');
  const [value, setValue] = useState<string[]>([]);
  return <AsyncMultiSelect
    label="成员"
    name="member"
    query={query}
    onQueryChange={setQuery}
    value={value}
    onValueChange={setValue}
    minQueryLength={2}
    loadOptions={async (query, { signal }) => {
      const response = await fetch(`/api/members?q=${encodeURIComponent(query)}`, { signal });
      if (!response.ok) throw new Error('成员查询失败');
      return response.json();
    }}
  />;
}
```

`loadOptions(query, { signal })` 返回 `{ value, label, description?, disabled? }[]`。组件在查询改变、重试或卸载时中止旧 signal，并用请求序号忽略无法真正取消的旧 Promise。`minQueryLength` 以下显示 idle；有效查询具有 loading、ready/empty 和 error/retry 状态。

`query / onQueryChange` 与 `value / onValueChange` 可分别受控；`defaultQuery / defaultValue` 提供非受控初值。选中后只清空查询，不清空已有值。`selectedOptions` 用于解析初始受控值；之后加载和选中过的选项保存在组件实例生命周期内。该缓存只保存显示元数据，不负责请求结果持久化或失效策略。

`name` 会让 Base UI 生成同名原生表单值；多选时可通过 `FormData.getAll(name)` 读取。`required` 只在当前没有选中值时约束查询输入。`disabled`、`error`、描述关联和选项级禁用保留原生或 ARIA 语义。

固定本地 options 使用 `MultiSelect`；任意文本标签使用 `InputTags`；单个远程值使用 `AsyncCombobox`。创建新选项、分组、全选范围和虚拟化分别属于后续 `SELECT-02` / `SELECT-03`。
