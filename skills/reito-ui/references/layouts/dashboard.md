# Dashboard layout

Use this reference for any dashboard, admin console, task workspace, list-detail screen or
"application with a sidebar". It is the fixed shell. Do not design a different one from divs.

Sources of truth: `docs/recipes/dashboard-workspace.md` and the Storybook entry
`复杂/DashboardRecipe 工作面配方` (`apps/storybook/stories/complex/DashboardRecipe.stories.tsx`).
The example below uses the same components through public package imports and replaces the
story's remaining raw text classes with `Heading`, `Text`, `Stack` and `Panel`.

## Component tree

```
ReitoThemeProvider root mode tokens          global theme (one per app)
└─ SidebarProvider                           navigation open state, mobile overlay
   ├─ Sidebar collapsible="icon"
   │  ├─ SidebarHeader → Text variant="interface"           product name
   │  ├─ SidebarContent → SidebarGroup → SidebarGroupLabel
   │  │                   → SidebarMenu → SidebarMenuItem → SidebarMenuButton isActive
   │  └─ SidebarFooter → Text variant="caption" tone="muted"
   └─ host container (fills the remaining width; the only layout div)
      └─ AppShell header footer              title bar + status bar, no statistics strip
         └─ WorkspacePreset                  main work + inspector; narrow = one active panel
            ├─ workspace: { title, actions, content }
            │  └─ Stack inset gap="section"  the single inset owner of the pane body
            │     ├─ DataTable loading error emptyMessage onRetry
            │     └─ Grid → Panel (flush for ItemGroup / Empty / table)
            └─ inspector: { title, description, content }
               └─ Stack inset → Form → FormField… → FormError → Inline (submit, reset)
   ApplicationSearch                          optional command search dialog
```

Scroll ownership: `WorkspacePreset` renders one `WorkspacePane` per slot and each pane body is the
scroll region. Do not add `overflow-auto` to children, and do not wrap the shell in a scrolling
page. The host gives the shell a viewport height once.

Routing: a product with URLs maps the current path to `section` and the slot content. Keep the shell
mounted across routes; only the slot `title`, `actions` and `content` change.

## Copy-paste structure

```tsx
import '@reito/tokens/css';
import '@reito/ui/styles.css';
import { Fragment, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { LayoutDashboard, ListTodo, Plus, Settings } from 'lucide-react';
import {
  Badge, Button, Empty, EmptyDescription, EmptyHeader, EmptyTitle, Grid, Heading, Inline,
  Input, Item, ItemContent, ItemGroup, ItemSeparator, Panel, ReitoThemeProvider, Sidebar,
  SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider,
  SidebarTrigger, Stack, Text, type ThemeTokenOverrides,
} from '@reito/ui/basic';
import {
  AppShell, DataTable, Form, FormError, FormField, WorkspacePreset, useForm,
  type WorkspacePresetView,
} from '@reito/ui/complex';

// Global theme: typed, code-controlled, defined once.
const appTheme: ThemeTokenOverrides = { semantic: { 'radius-surface': 'var(--rui-radius-lg)' } };

type Section = 'overview' | 'tasks' | 'settings';
type Task = { id: string; title: string; owner: string; status: 'todo' | 'done' };

const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export function App() {
  return (
    <ReitoThemeProvider root mode="system" tokens={appTheme}>
      <Dashboard />
    </ReitoThemeProvider>
  );
}

function Dashboard() {
  const [section, setSection] = useState<Section>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<WorkspacePresetView>({
    navigationOpen: false, inspectorOpen: true, activePanel: 'workspace',
  });
  const form = useForm<{ title: string }>({ defaultValues: { title: '' } });
  const columns = useMemo<ColumnDef<Task>[]>(() => [
    { accessorKey: 'title', header: 'Task' },
    { accessorKey: 'owner', header: 'Owner' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => (
      <Badge variant={row.original.status === 'done' ? 'secondary' : 'outline'}>{row.original.status}</Badge>
    ) },
  ], []);

  const content = section === 'tasks' ? (
    <Stack inset gap="section">
      <DataTable data={tasks} columns={columns} getRowId={(row) => row.id} caption="Tasks"
        emptyMessage="No tasks yet. Add one from the inspector." />
    </Stack>
  ) : section === 'overview' ? (
    <Stack inset gap="section">
      <Grid>
        <Panel title="Recent work" flush>
          {tasks.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No recent work</EmptyTitle>
                <EmptyDescription>Tasks you change appear here.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ItemGroup>
              {tasks.slice(0, 3).map((task, index) => (
                <Fragment key={task.id}>
                  {index > 0 && <ItemSeparator />}
                  <Item>
                    <ItemContent>
                      <Heading level={3} size="item">{task.title}</Heading>
                      <Text variant="caption" tone="muted">{task.owner}</Text>
                    </ItemContent>
                  </Item>
                </Fragment>
              ))}
            </ItemGroup>
          )}
        </Panel>
      </Grid>
    </Stack>
  ) : (
    <Stack inset gap="section">
      {/* See layouts/settings.md */}
    </Stack>
  );

  const current = sections.find((item) => item.id === section)!;
  return (
    <SidebarProvider className="h-svh min-h-0 overflow-hidden">
      <Sidebar collapsible="icon">
        <SidebarHeader><Text as="span" variant="interface">Acme Ops</Text></SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sections.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton tooltip={item.label} isActive={section === item.id}
                      onClick={() => setSection(item.id)}>
                      <item.icon /><span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter><Text as="span" variant="caption" tone="muted">v1.0</Text></SidebarFooter>
      </Sidebar>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <AppShell
          className="h-full rounded-none border-0"
          header={
            <Inline>
              <SidebarTrigger aria-label="Toggle navigation" />
              <Heading level={1} size="item">Acme Ops</Heading>
            </Inline>
          }
          footer={<span role="status">{tasks.length} tasks</span>}
        >
          <WorkspacePreset
            className="h-full rounded-none border-0"
            title={current.label}
            view={view}
            onViewChange={setView}
            workspace={{
              title: current.label,
              actions: (
                <Button size="sm" onClick={() => setView({ ...view, inspectorOpen: true })}>
                  <Plus />New
                </Button>
              ),
              content,
            }}
            inspector={{
              title: 'New task',
              description: 'Saved to local state in this example',
              content: (
                <Stack inset>
                  <Form form={form} aria-label="New task" onSubmit={(draft) => {
                    setTasks((list) => [
                      { id: crypto.randomUUID(), title: draft.title, owner: 'Me', status: 'todo' },
                      ...list,
                    ]);
                    form.reset();
                  }}>
                    <FormField control={form.control} name="title" label="Title" required
                      rules={{ required: 'Enter a title' }}
                      render={({ field, controlProps }) => <Input {...field} {...controlProps} />} />
                    <FormError />
                    <Inline>
                      <Button type="submit"><Plus />Add task</Button>
                      <Button type="reset" variant="outline">Clear</Button>
                    </Inline>
                  </Form>
                </Stack>
              ),
            }}
          />
        </AppShell>
      </div>
    </SidebarProvider>
  );
}
```

The `className` values on `SidebarProvider`, the host container, `AppShell` and
`WorkspacePreset` are the shell's structural contract (viewport height, flex fill, removing the
standalone frame of `AppShell`). Copy them exactly. They are the only classes in this layout; do
not add more for spacing or typography.

`DataTable` states: pass `loading`, `error` with `onRetry`, and `emptyMessage`. Do not render a
separate spinner or error paragraph beside the table.

## Common mistakes

| Mistake | Use instead |
| --- | --- |
| A custom `<div className="flex h-screen">` shell with a hand-made sidebar | `SidebarProvider` + `Sidebar` + `AppShell` + `WorkspacePreset` |
| Skipping `AppShell` and putting the toolbar inside the page content | `AppShell header`; page actions go in the workspace slot `actions` |
| `p-4` / `px-6 py-4` on pane content | `Stack inset` once per pane body |
| Double inset: `Stack inset` around a padded `Panel` body containing another `Stack inset` | One inset owner per surface; `Panel flush` for lists, tables and `Empty` |
| `text-sm font-semibold` titles, `text-xs text-muted-foreground` captions | `Heading size="section/item"`, `Text variant="caption" tone="muted"` |
| A `Card` per task row or per statistic | `ItemGroup`/`Item` or `DataTable` inside one `Panel flush` |
| A decorative statistics strip at the top of every dashboard | Start with the actual work: table, queue or editor |
| `overflow-auto` on inner divs, or a scrolling `body` around the shell | Pane bodies own scroll; the host sets the height once |
| Hard-coded `h-8`, `text-[13px]`, `size="xs"` everywhere to look "dense" | Default control sizes; change density through `ReitoThemeProvider density` |
| A compact/comfortable switch in the product toolbar | Density is set in code; only add a switch when the product asks for it |
| Re-implementing loading/empty/error with raw text | `DataTable` state props, `Empty`, `Spinner`, `Alert` |
| Wrapping a region in `className="bg-…"` to theme it | Nested `ReitoThemeProvider` with `colors`/`tokens` |
