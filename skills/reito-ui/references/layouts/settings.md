# Settings layout

Use this reference for preferences, account, workspace and project settings. A settings page is a
document of labelled rows, not a form wizard and not a grid of cards. Inside a dashboard it is the
`content` of the workspace slot (see [dashboard.md](dashboard.md)); standalone it sits in a
`Stack inset` below a `PageHeader`.

Storybook: `复杂/SettingsSection 设置分组`, `复杂/PropertyList 属性编辑`. The Workbench settings surface
(`npm run dev:workbench`) shows the same rows inside a full application.

## Component tree

```
Stack inset gap="section"                     the single inset owner
├─ PageHeader title description actions       only when not already titled by a WorkspacePane
├─ SettingsSection title description actions  one per topic; variant="outlined" (default)
│  ├─ SettingsRow label description htmlFor   horizontal: Switch, SelectInput, short value
│  └─ SettingsRow orientation="vertical"      text inputs, textareas, radio groups
└─ SettingsSection variant="plain"            when the parent surface already has a border
```

Read-only facts (IDs, plan, region) use `PropertyList` instead of disabled inputs.

## Structure

```tsx
import { useId, useState } from 'react';
import { Input, PageHeader, Stack, Switch } from '@reito/ui/basic';
import { SettingsRow, SettingsSection } from '@reito/ui/complex';

export function WorkspaceSettings() {
  const nameId = useId();
  const syncId = useId();
  const [name, setName] = useState('Acme');
  const [sync, setSync] = useState(true);
  return (
    <Stack inset gap="section">
      <PageHeader title="Workspace" description="Changes apply to every member." />
      <SettingsSection title="General">
        <SettingsRow label="Name" description="Shown in navigation" htmlFor={nameId} orientation="vertical">
          <Input id={nameId} value={name} onChange={(event) => setName(event.target.value)} />
        </SettingsRow>
        <SettingsRow label="Sync" description="Keep drafts on every device" htmlFor={syncId}>
          <Switch id={syncId} checked={sync} onCheckedChange={setSync} />
        </SettingsRow>
      </SettingsSection>
    </Stack>
  );
}
```

## Common mistakes

| Mistake | Use instead |
| --- | --- |
| One `Card` per setting | Rows inside one `SettingsSection` |
| `SettingsSection` (outlined) inside a `Panel` or `Card` | `variant="plain"` inside a bordered parent |
| `className="w-44"` to size a text input in a horizontal row | `orientation="vertical"` for free text |
| A label `<span>` beside the control plus `aria-label` | `SettingsRow label htmlFor` |
| Disabled inputs for read-only facts | `PropertyList` |
| A density or theme switch added because the Lab has one | Only when the product explicitly requests it |
