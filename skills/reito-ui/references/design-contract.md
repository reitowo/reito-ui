# Composition contract

Graphite uses neutral surfaces, readable content and quiet chrome. Choose components around the
actual task. The library supplies visual behavior; the application supplies business facts.

## Choose public components

| Need | Components | Composition rule |
| --- | --- | --- |
| Page heading | PageHeader | Title, description, actions; wraps without custom margins |
| Vertical flow | Stack | gap="small/normal/section/none"; inset supplies the outer content edge |
| Actions, metadata, form row | Inline | Wraps; baseline for author/time, end for fields/actions |
| Peer sections | Grid | minColumnWidth="xs/sm/md"; collapses inside narrow containers |
| Section | Panel | title, description, actions, footer; flush for self-inset content |
| Widget | Card and slots | Header/body/footer own their insets; avoid cards around every record |
| Text | Text, Heading | Role controls style; heading level controls document semantics |
| Form | FieldGroup, Field, FieldLabel, FieldDescription, FieldError | Field owns related spacing |
| Value | Input, Textarea, SelectInput, NumberField | Default controls align without page overrides |
| Records | ItemGroup, Item, ItemContent, ItemActions, ItemSeparator | Content determines height |
| Data | Table, DataTable | Tables own cell geometry and selection behavior |
| Empty content | Empty and slots | Put directly in a flush Panel or standalone |
| Scrolling workspace | AppShell, WorkspacePane, ResizableWorkspace | Own scroll regions and panes |
| Settings | SettingsSection, SettingsRow, PropertyList | Reuse existing form and feedback behavior |
| Conversation | Conversation, Message, RichMessage, Composer | Continuous content with one composer |
| Contextual actions | Dialog, Popover, DropdownMenu, Tooltip | Use the nearest provider's theme |

New composition components are exported by @reito/ui/basic. Complex components use @reito/ui/complex;
conversation components use @reito/ui/ai. Consult installed types for complete APIs.

## Inset ownership

A padded Panel supplies the content edge. Stack and Inline separate children without padding unless
explicitly requested. Lists, tables and Empty already own their edge: use Panel flush. Related text
uses small gaps, separate sections use section gaps. No pixel values need to be copied into the app.

## Text and shape

Text roles are body/interface/caption/reading, with optional tone="muted". Heading accepts level
1–4 and size page/section/item. Headings have no browser default margins. Use the same role for the
same meaning across the product. Long content wraps; explicit truncation must preserve access to
complete content. Code retains the shared monospace font.

radius-control is the rectangular control role; radius-surface is the panel/card role. Menus and
composers retain explicit roles. Configure semantic roles through ReitoThemeProvider tokens when a
product needs different defaults. Nested providers and portals retain the selected theme.

## Local 0.6 candidate changes

Default Button/Input/Select align at 32/36/24px for compact/comfortable/dense and share the interface
font role. Explicit sizes remain deliberate variants. Card and Empty use surface radius rather than
composer radius. Empty, fields and list spacing respond to density. These are intentional visual
changes from 0.5.8: validate an existing consumer before upgrading and then remove compensating CSS.
Current numerical scales come from packages/tokens/src/tokens.json and its generated public catalog.

## Executable recipe

[workbench.tsx](../assets/workbench.tsx) uses public imports and has no stylesheet, private selector
or custom reset. Replace its local example state with product content and callbacks. Lab and
Storybook theme controls are inspection tools; the resulting product does not need those controls.
