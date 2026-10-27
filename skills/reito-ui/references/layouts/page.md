# Ordinary page regions

Use this path for operations, list and form pages, including a simple sidebar. For resizable
list-detail workspaces with an inspector, use dashboard.md instead. Use public package imports.

```text
Shell
  Shell.Sidebar: navigation
  Shell.Main
    Shell.Topbar: breadcrumbs or toolbar
    Shell.Content: scrolling work area
      Page inset
        Page.Header: title, description, actions
        Page.Content
          summary or Tabs
          Panel
            Panel.Header: section title and actions
            Panel.Content: records, form or Empty
            Panel.Footer: pagination or secondary actions
```

- Shell.Content scrolls; it does not add padding. The host supplies shell height.
- Page inset supplies the page edge. Page owns header-to-content spacing; Page.Content owns gaps.
- Panel.Content owns one inset. Use Panel flush for ItemGroup, Table or Empty; do not pad them again.
- Put Tabs inside Page.Content. Tabs.Content contains the Panel and owns the navigation gap.
- Keep actions in the Header slot of their owner or with the affected record. No app margin rules.
- Panel needs title (shortcut or Panel.Header) or aria-label. Nested panels keep separate IDs.
- Existing title shortcuts use these same regions. Do not pass title and also add another Header/Content.
- App code supplies data, loading/error state, routes and commands; it does not restyle these regions.

See RegionPageDemo and RegionShellDemo in [the portable public recipe](../../assets/workbench.tsx).
They demonstrate message admission and permission tabs with empty/loading/error/record states.
Their compiled consumer test has no app CSS, Tailwind plugin or source aliases.
