# Release validation: 0.5.6

Date: 2026-10-11. This release contains the component-token and compact-state
changes prepared for 0.5.5, plus the matching ScrollArea regression contract.
The v0.5.5 tag is preserved as a release attempt; its old surface-consistency
test still requires the former 8/12px scroll edge and prevents npm publication.

The ScrollArea test now checks the approved 4px edge and overrides its component
padding-y token. The shared horizontal role, scroll geometry, keyboard movement
and fixed-edge assertions remain. Storybook URLs can be set through
REITO_STORYBOOK_URL so a release checkout can use separate local servers without
stopping the user's Lab or Storybook.

Scope remains 138 families (72 basic, 42 complex, 24 AI). Kanban drafts are
preserved in the primary workspace and excluded from the release. Root and
workspace versions, lockfile and internal dependencies are synchronized to 0.5.6.

Local release verification uses a clean checkout, isolated Lab and static
Storybook ports, the 239-test CI selection, full build and check, generated-file
consistency, tarball construction and package-contract validation. Results are
recorded under `.logs/release-056-*.log`; this document describes the gate and
does not count an in-progress run as passed.

Final publication requires the GitHub release workflow to pass and both official
npm package versions and integrity values to match its verified artifacts.
Per-change visual references and theme/density observations remain in the
component token, menu, inset glow and ScrollArea validation documents.
