---
title: 快速开始
description: 用 Page、Panel 与基础控件写出第一个不需要应用 CSS 的工作页面。
---

# 快速开始

本页用公开组件写一个完整的工作页面：页头、筛选面板和记录列表。整个页面不需要任何应用 CSS——控件几何、文字、内距、表面与焦点都由组件库负责，应用只负责内容、路由、业务状态和命令。

## 1. 主题根与第一个页面

```tsx
import '@reito/tokens/css';
import '@reito/ui/styles.css';
import { ReitoThemeProvider, Page, Panel, Button } from '@reito/ui/basic';

export function App() {
  return (
    <ReitoThemeProvider root mode="system">
      <Page
        inset
        title="消息工作台"
        description="查询消息、查看上下文并跟进处理。"
        actions={<Button>新增规则</Button>}
      >
        <Panel title="今日待办">…</Panel>
      </Page>
    </ReitoThemeProvider>
  );
}
```

`Page` 统一页头与内容间距；`Panel` 是一个页面分区，`title` 与 `footer` 由它排版。

## 2. 表单与筛选

```tsx
import { useId, useState } from 'react';
import { Inline, Panel, Field, FieldLabel, Input, SelectInput, Button } from '@reito/ui/basic';

export function Filters() {
  const id = useId();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('');
  return (
    <Panel title="筛选消息">
      <Inline align="end">
        <Field>
          <FieldLabel htmlFor={id}>消息内容</FieldLabel>
          <Input id={id} value={query} onChange={(event) => setQuery(event.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-scope`}>范围</FieldLabel>
          <SelectInput
            id={`${id}-scope`}
            value={scope}
            onValueChange={setScope}
            options={[
              { value: '', label: '全部会话' },
              { value: 'mine', label: '我的会话' },
            ]}
          />
        </Field>
        <Button>查询</Button>
      </Inline>
    </Panel>
  );
}
```

产品单选使用 `SelectInput`（options 数据驱动）或 `Select`（分组与自定义内容）。图标按钮使用 `Button size="icon"` 并提供 `aria-label`。

## 3. 记录列表与空态

记录放进一个 `Panel flush` 中的 `ItemGroup`，而不是每条一张 Card；没有数据时使用 `Empty`：

```tsx
import { Panel, ItemGroup, Item, ItemContent, Heading, Text, Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@reito/ui/basic';

export function Records({ items }: { items: { id: string; name: string; summary: string }[] }) {
  return (
    <Panel title="消息记录" flush>
      {items.length ? (
        <ItemGroup>
          {items.map((item) => (
            <Item key={item.id}>
              <ItemContent>
                <Heading level={3} size="item">{item.name}</Heading>
                <Text>{item.summary}</Text>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>没有匹配的消息</EmptyTitle>
            <EmptyDescription>调整筛选条件后再试。</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </Panel>
  );
}
```

## 组合规则

- 普通页面不写 `p-*`、`gap-*`、`text-*`、`font-*` 等间距或排版 utility，使用 `Stack` / `Inline` / `Grid` 的 `gap`、`Text variant/tone` 与 `Heading size`。
- 每个表面只有一个内距所有者：`Stack inset` 或带内距的 `Panel`；列表、表格与 `Empty` 放在 `Panel flush` 中。
- 带侧栏的应用使用 `SidebarProvider → Sidebar → AppShell → WorkspacePreset`，不要用 div 自己拼外壳。详见 [Dashboard 工作面配方](/docs/recipes/dashboard-workspace)。
- 状态使用公开组件：`Empty`、组件的 `loading`、`Spinner`、`Skeleton`、`FieldError`、`Alert`。

完整规则见 [页面组合与默认主题](/docs/composition) 与 [设计契约](/docs/design-contract)。完整可运行页面见仓库中的 [workbench.tsx](https://github.com/reitowo/reito-ui/blob/main/skills/reito-ui/assets/workbench.tsx)。
