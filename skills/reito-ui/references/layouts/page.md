# Page composition

Use DashboardGroup → DashboardSidebar + DashboardPanel. DashboardNavbar owns the navigation controls.
The SidebarHeader/Content/Footer names are prefixed DashboardSidebar; use DashboardNavigationMenu for rows.
DashboardBody owns scrolling without padding. Page inset owns page edges; Panel.Content owns one inset.
Page.Header / Page.Content and Panel.Header / Content / Footer stay attached to their parent component.
Lists, tables and Empty use Panel flush. No application media query or navigation geometry is required.
See DashboardDemo and RegionPageDemo in [the public recipe](../../assets/workbench.tsx).
