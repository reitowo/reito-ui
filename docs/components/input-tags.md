# InputTags

`InputTags` 用于创建任意字符串标签。值来自固定 options 时使用 `MultiSelect`，避免把自由输入和远程选择混成一个状态模型。

```tsx
import { InputTags } from '@reito/ui/basic';

export function ProjectTags() {
  const [tags, setTags] = useState(['React', 'TypeScript']);
  return <InputTags
    label="项目标签"
    value={tags}
    onValueChange={setTags}
    separators={[',', '，']}
    duplicateBehavior="reject"
    maxTags={8}
    description="按 Enter 或中英文逗号创建标签。"
  />;
}
```

`value / onValueChange` 为受控模式，`defaultValue` 为未受控初值。`duplicateBehavior` 支持 `ignore / reject / allow`，默认比较不区分大小写；`caseSensitive` 可改为区分大小写。`normalize` 在创建和保存编辑时规范文本，默认去除首尾空格。

标签文字按钮进入原位编辑，Enter 保存、Escape 取消；空值保存会删除标签。删除后焦点回到主输入。`readOnly` 保留标签和文本框但移除编辑操作，`disabled` 禁用全部交互。传入 `name` 时，每个标签生成同名隐藏字段，浏览器 `FormData.getAll(name)` 可读取完整数组。

数量到达 `maxTags` 后仍允许查看输入焦点，但新值会以 `limit` 拒绝。`onReject` 接收 `duplicate | limit` 及候选值；`ignore` 重复策略只显示状态并清空草稿，不触发拒绝回调。`error` 表示宿主字段错误，内部拒绝也通过可访问状态文本反馈。

`splitOnPaste` 默认启用；`pasteSeparators` 默认包含中英文逗号、换行和 Tab，一次粘贴只触发一次最终值更新。组合输入期间不会因逗号或 Enter 提前创建，`compositionend` 后才处理最终文本。

`suggestions` 提供本地建议；`loadSuggestions(query, { signal })` 提供宿主异步建议，并复用 AsyncCombobox 的防抖、取消、过期响应保护和 error/retry 状态。`suggestionMinQueryLength / suggestionDebounceMs` 控制触发条件。启用建议时，输入具有 combobox/listbox 语义；方向键选择建议，Enter 提交，Escape 关闭。未匹配的草稿显示明确“创建”项。

`onCreateTag(value, { signal })` 可在标签写入前执行宿主异步校验或创建。期间输入只读并显示进度；失败保留草稿和错误。批量创建按原顺序执行，首次失败后停止，已经成功的标签仍提交。组件卸载或新的创建事务会中止旧 signal。

`disabledTags` 中的标签保留展示但不能编辑或移除；`tagErrors` 以标签原值为键，为单个 chip 提供可见错误图标和隐藏描述。主输入为空时，ArrowLeft 或 Backspace 聚焦最后一个可编辑标签；标签间用左右键、Home / End 导航，Delete / Backspace 删除并恢复相邻焦点。
