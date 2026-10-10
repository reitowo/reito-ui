# Code delivery validation

Date: 2026-10-10.

The delivery includes the component atlas, runtime theme colors and theme menu,
shared surface/action geometry, interaction stability fixes, and source
organization checks. Package versions remain 0.5.2; this is a source delivery.

The existing local Kanban draft is excluded, including its public export,
catalog entry, story, documentation, and tests. The delivered catalog contains
72 basic, 42 complex, and 24 AI families: 138 total. The local workspace still
contains 139 families. Earlier validation records describe that workspace and
remain accurate for their recorded runs.

Validation of the exact staged source snapshot:

- `npm run build`: passed for UI, Lab, Storybook, and Workbench. Existing large
  bundle warnings remain.
- `npm run check`: passed, including source formatting, token generation,
  catalog consistency, design constraints, token audit, and workspace types.
- Two overview-loading interaction checks passed. They verify the standalone
  basic preview dependency boundary and direct component rendering with state
  preservation during scrolling, theme/density changes, and reset.
- `git diff --cached --check`: passed.

The snapshot used the installed root and workspace dependencies through local
directory junctions. Its first build attempt lacked the workspace dependency
junctions and failed to resolve the correct Zod/resolver packages; the final
build with all workspace dependencies passed. The snapshot test server reported
a font serving allow-list warning caused by those junctions, and the previously
observed React state-update warning. The two tests passed; this is not a claim
of zero console warnings or a new visual comparison.

Local logs: `.logs/commit-snapshot-build-final.log`,
`.logs/commit-snapshot-check.log`, and
`.logs/commit-snapshot-interactions.log`. The preceding broad validation is
recorded in [validation-component-source.md](validation-component-source.md).

The overview preview-count assertion now follows the generated manifest, so
the test checks the delivered catalog rather than assuming a local draft count.
