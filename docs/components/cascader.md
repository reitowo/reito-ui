# Cascader 级联选择

`Cascader` 用并列层级面板从任意深度的选项树中选择一条完整路径。它适合地区、组织、权限范围和分类等逐级选择；平面分组继续使用 Select、Listbox 或 TreeSelect。

```tsx
import { Cascader, type CascaderOption } from '@reito/ui/complex';

const [path, setPath] = useState<string[]>();

<Cascader
  label="工程类型"
  options={options}
  value={path}
  onValueChange={setPath}
/>
```

每个 `CascaderOption` 需要在整棵选项树中唯一的 `id` 和可读 `label`，可带 `description / disabled / children / loadable`。`value` 是从根到目标的完整 ID 数组；不存在或不连续的尾段不会显示为有效路径。`displayMode="path" | "label"` 只控制触发器文案，不改变值。

默认 `selectionBoundary="leaf"`：点击分支只打开下一层，点击叶节点才提交并关闭。设为 `any` 后，分支底部出现明确的“选择当前层级”操作；键盘 Enter/Space 也可提交当前分支。上下键在同列移动，右键进入子级，左键返回父级，Home/End 到达当前列首尾，Escape 关闭并恢复触发器焦点。

`loadChildren(option, { signal })` 为 `loadable` 节点提供按需子项，组件取消刷新或卸载前的请求、隔离过期结果，并在当前路径上呈现加载、错误和重试。`refreshKey` 清空已解析子项。整体 `loading / loadError / onRetry` 用于初始选项请求；网络、缓存和持久化仍由宿主实现。

传入 `name` 时，隐藏字段使用 JSON 数组保存完整路径，例如 `["frontend","react","component-library"]`；服务端需重复验证路径连续性、禁用项和叶节点规则。`renderOption` 可以补充图标或富文本，但选项内部不能再嵌套交互控件。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-cascader-级联选择--playground) 在同一 Canvas 中调整路径、选择边界、显示方式、清除、禁用、必填、加载与错误；另有 lazy 失败重试、键盘、表单与富内容预设。[Lab](http://127.0.0.1:5173/?layer=complex&component=cascader) 使用同一组件。
