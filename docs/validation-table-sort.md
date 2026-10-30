# Table Sort Header Validation

Reference: the supplied iPhone screenshot of the OpMaster cache table. The defects
are the Unicode sort character rendering as an emoji and a second control inset
shifting the header text away from the corresponding body cell.

`TableSortButton` is exported by the public basic entry. It composes the existing
Button and Lucide SVG icons. `direction` is `none`, `ascending` or `descending`;
the consuming `TableHead` keeps `aria-sort` in sync. The table owns the sole
horizontal inset; the sort control adds neither a second inset nor a border.
Application authors supply content and state, not private component CSS overrides.

The table Storybook example and compiled consumer cover vector icons, matching
header/body text origins, disabled sorting, Enter/Space, both themes, all three
densities, row action defaults and the existing portal theme boundary.

Checks completed:

- Initial OpMaster browser regression failed in both 1289px and 390px viewports:
  no SVG icon and a 9px text-origin mismatch.
- Library check first rejected the new source formatting. After formatting it
  reached a stale compiled-export error in the consumer. Building the UI package
  before the same complete check resolved it; final check passed.
- Full library build passed, retaining existing chunk-size warnings.
- Table consumer 6/6 and complete compiled composition consumer 54/54 passed.
  The table tests are included in 54; do not sum overlapping runs.
- OpMaster's new header and existing sorting/tooltip/reminder tests passed 9/9.
  Captured desktop and narrow screenshots were inspected.

The package is a local fixed `0.6.0-next.0` candidate retaining all prior scoped
component fixes. No commit, registry publication or OpMaster deployment was
performed. Actual iPhone/Safari behavior remains a post-deployment visual check;
using inline SVG removes reliance on the system's emoji presentation.
