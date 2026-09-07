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

`loadOptions(query, { signal })` 返回 `{ value, label, description?, group?, disabled? }[]`。组件在查询改变、重试或卸载时中止旧 signal，并用请求序号忽略无法真正取消的旧 Promise。`minQueryLength` 以下显示 idle；有效查询具有 loading、ready/empty 和 error/retry 状态。

`query / onQueryChange` 与 `value / onValueChange` 可分别受控；`defaultQuery / defaultValue` 提供非受控初值。选中后只清空查询，不清空已有值。`selectedOptions` 用于解析初始受控值；之后加载和选中过的选项保存在组件实例生命周期内。该缓存只保存显示元数据，不负责请求结果持久化或失效策略。

`name` 会让 Base UI 生成同名原生表单值；多选时可通过 `FormData.getAll(name)` 读取。`required` 只在当前没有选中值时约束查询输入。`disabled`、`error`、描述关联和选项级禁用保留原生或 ARIA 语义。

`group` 会在当前远程结果页中生成分组标签。`showSelectAll` 提供三态的“全选当前结果”和批量清除：只增减当前结果中的非禁用项，保留其他结果页的已选值；禁用且已选的值不能由 chip 或批量清除移除。

`onCreateOption(query)` 可以返回选项或 Promise。成功后选项进入实例缓存并立即选中，失败时保留查询并显示错误；宿主负责持久化。精确匹配已有结果时不会提供重复创建动作。创建只在 ready 状态开放，不会掩盖加载或请求错误。

## 虚拟化与远程增量加载

`virtual` 与 `MultiSelect` 共享窗口化、可变行高、键盘活动项定位和 `onVirtualRangeChange`。当可见窗口距当前结果尾部不超过 `loadMoreThreshold` 项时，组件会调用 `loadMoreOptions(query, { signal, offset })`；`offset` 是当前已加载的选项数。

```tsx
<AsyncMultiSelect
  label="远程资源"
  virtual
  hasMore={page.hasMore}
  selectedOptions={selectedRecords}
  loadOptions={(query, { signal }) => api.search({ query, offset: 0, signal })}
  loadMoreOptions={(query, { signal, offset }) =>
    api.search({ query, offset, signal }).then(result => result.options)
  }
  onLoadMoreError={(error, query) => report(error, query)}
/>
```

查询变化会中止旧的增量请求；过期 Promise 不会追加到新结果。失败保留弹层与已有结果，并提供 `loadMoreRetryLabel` 指定的重试动作。`selectedOptions` 或已加载缓存保证窗口外、当前页外的已选 chip 继续显示标签。

`hasMore` 由宿主根据服务端游标或总量更新。组件只合并本次返回的选项，不推断总量，也不保存服务端游标。远程增量加载当前只在 `virtual` 模式下触发。

固定本地 options 使用 `MultiSelect`；任意文本标签使用 `InputTags`；单个远程值使用 `AsyncCombobox`。
