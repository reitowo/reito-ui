# Popover · 紧凑信息列表

短名称、路径、状态、方法和计数优先放在同一行。不要为一小组字段默认增加标题区、描述段落或卡片分隔。需要解释性长文时才显式使用 `layout="stacked"`。

```tsx
<Popover>
  <PopoverTrigger render={<Button variant="ghost" size="xs" />}>
    查看请求路径
  </PopoverTrigger>
  <PopoverContent variant="list" align="start" aria-label="请求路径">
    <PopoverList aria-label="请求路径列表">
      <PopoverListItem metadata="HEAD · 16 次">
        <code title="/health">/health</code>
      </PopoverListItem>
      <PopoverListItem metadata="HEAD · 3 次">
        <code title="/health/readiness">/health/readiness</code>
      </PopoverListItem>
    </PopoverList>
  </PopoverContent>
</Popover>
```

- `PopoverContent variant="list"` 使用小内距、零组间距及内容宽度，宽高受锚点可用空间限制。普通浮层默认外观不变。
- `PopoverList` 是可聚焦滚动的原生 `ul`，不带选择或菜单行为。使用菜单操作时仍选 DropdownMenu，选择值时选 Listbox。
- `PopoverListItem` 默认 `layout="inline"`：主文字省略溢出，短 `metadata` 保持同排。完整文字仍在 DOM 中；可在文字元素上提供 `title`，或显式使用 `stacked` 展示长文。
- 多个短字段可作为同一个 `metadata` 节点传入。长描述或需要换行的元数据应使用 `layout="stacked"`，而不是压缩字号。
- 没有可见标题时，给 `PopoverContent` 一个 `aria-label`；也可使用 `PopoverTitle`。
- 列表单元格使用 `cell-padding-x/y` 密度角色，根节点默认为 compact。支持 comfortable，但不要为消费应用额外添加密度开关。

Storybook 的 Popover 目录覆盖单行、显式多行、长路径/滚动和空态。只读列表没有禁用、提交或远程加载行为；这些状态由消费场景提供。
