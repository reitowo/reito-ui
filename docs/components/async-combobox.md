# AsyncCombobox

`AsyncCombobox` 是宿主加载数据的单选搜索框。组件管理防抖、取消、过期结果保护和可见状态；数据源、网络客户端、鉴权、缓存持久化与业务搜索仍由宿主实现。

```tsx
import { AsyncCombobox } from '@reito/ui/basic';

export function RepositoryPicker() {
  const [query, setQuery] = useState('');
  const [value, setValue] = useState<string | null>(null);
  return <AsyncCombobox
    label="仓库"
    query={query}
    onQueryChange={setQuery}
    value={value}
    onValueChange={setValue}
    minQueryLength={2}
    loadOptions={async (query, { signal }) => {
      const response = await fetch(`/api/repositories?q=${encodeURIComponent(query)}`, { signal });
      if (!response.ok) throw new Error('仓库查询失败');
      return response.json();
    }}
  />;
}
```

`loadOptions(query, { signal })` 返回 `{ value, label, description?, disabled? }[]`。每次有效查询都会产生新请求；查询变化、重试或卸载会中止旧 signal，请求序号再阻止无法真正取消的旧 Promise 覆盖新结果。错误显示原消息与重试按钮，重试保留当前查询。

`query / onQueryChange` 与 `value / onValueChange` 可分别受控；`defaultQuery / defaultValue` 提供未受控初值。`minQueryLength` 以下显示 idle 提示，`debounceMs` 默认 200ms。`initialOptions` 可提供初始结果；`selectedOption` 让初始受控值在当前结果页不存在时仍有标签，运行期间选中过的选项会在组件内缓存。

当前组件为单选。异步多选与跨结果页 chip 保留将在 SELECT-01 的下一提交通过 `AsyncMultiSelect` 提供。
