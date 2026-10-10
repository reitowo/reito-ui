# Release validation: 0.5.6

Date: 2026-10-11. This release contains the component-token and compact-state
changes prepared for 0.5.5, plus the matching ScrollArea regression contract.
The v0.5.5 tag is preserved as a release attempt; its old surface-consistency
test still requires the former 8/12px scroll edge and prevents npm publication.

The surface test now checks approved menu geometry (13px text, 28/36px rows)
and the 4px ScrollArea edge, overriding its component padding-y token. The shared
horizontal role, scroll geometry, keyboard movement and fixed-edge assertions
remain. Storybook URLs can be set through
REITO_STORYBOOK_URL so a release checkout can use separate local servers without
stopping the user's Lab or Storybook. The CI configuration now starts Workbench
for the numeric breakpoint contract; REITO_WORKBENCH_URL allows local isolation.
The manual Tabs axe scan waits only for an already-running scan; actual
violations and other errors still fail.

Scope remains 138 families (72 basic, 42 complex, 24 AI). Kanban drafts are
preserved in the primary workspace and excluded from the release. Root and
workspace versions, lockfile and internal dependencies are synchronized to 0.5.6.

Local release verification uses a clean checkout, isolated Lab and static
Storybook ports, the 239-test CI selection, full build and check, generated-file
consistency, tarball construction and package-contract validation. Results are
recorded under `.logs/release-056-*.log`; this document describes the gate and
does not count an in-progress run as passed. The first local full run completed
232/239 checks. Four failures used old menu dimensions; the other diagnostics
showed a transient static import failure, overlapping axe scans and the missing
Workbench server. Those checks are rerun after the explicit environment and
contract corrections; original diagnostics are preserved.

Final publication requires the GitHub release workflow to pass and both official
npm package versions and integrity values to match its verified artifacts.
Per-change visual references and theme/density observations remain in the
component token, menu, inset glow and ScrollArea validation documents.
