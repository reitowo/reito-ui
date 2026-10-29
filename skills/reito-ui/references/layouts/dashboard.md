# Dashboard composition

Use the public Dashboard family from @reito/ui/basic. No application stylesheet is needed.

```tsx
<DashboardGroup>
  <DashboardSidebar>
    <DashboardSidebarHeader>{brand}</DashboardSidebarHeader>
    <DashboardSidebarContent>
      <DashboardNavigationMenu groups={groups} onNavigate={navigate} />
    </DashboardSidebarContent>
    <DashboardSidebarFooter>{identity}</DashboardSidebarFooter>
  </DashboardSidebar>
  <DashboardPanel header={<DashboardNavbar title={title} actions={actions} />}>
    <Page inset>
      <Page.Header title={title} />
      <Page.Content>{panels}</Page.Content>
    </Page>
  </DashboardPanel>
</DashboardGroup>
```

DashboardGroup owns available height/width. Use height="parent" inside a bounded host.
DashboardNavbar includes the separate desktop collapse and mobile toggle controls.
DashboardSidebarContent scrolls independently; Footer stays at the bottom. DashboardPanel owns one
scrolling DashboardBody without padding. Page and Panel.Content own their respective single insets.
Use DashboardNavigationMenu for full-width active/disabled rows and mobile auto-close. Applications
supply content, routes and business state, not media queries, hidden regions or fixed positioning.

For navigation/work/inspector slots use WorkspaceLayout from @reito/ui/complex inside DashboardPanel.
Its versioned state uses useWorkspaceLayoutState. Two resizable panes use ResizableWorkspace and
useResizableWorkspaceState. Keep these state owners separate from dashboard navigation.

Use DashboardDemo from [the executable recipe](../../assets/workbench.tsx). Forms, lists, controls,
portals and nested themes keep their public Reito contracts and preserve local drafts.
