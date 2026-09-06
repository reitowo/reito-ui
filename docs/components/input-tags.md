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

当前基础契约支持 Enter 与单个配置分隔键。粘贴整批拆分、动态建议/创建状态、逐标签禁用或错误、完整标签方向键导航属于 TAGS-02。
