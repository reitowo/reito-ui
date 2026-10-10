# Release validation: 0.5.5

Date: 2026-10-11. Release scope: component tokens, compact menu density,
inset validation glow and ScrollArea inset spacing. The local Kanban draft and
its catalog additions are excluded; the release catalog contains 138 families
(72 basic, 42 complex, 24 AI).

Versions are synchronized across the root, five workspaces, lockfile and internal
dependencies. The public token configuration types and component guides are
included. The generated catalog records the two new stories without adding a
component family.

Local verification uses a separate clean checkout of the intended release,
without stashing or overwriting the primary workspace's drafts. Evidence is
saved under `.logs/release-055-*.log`: clean install, full build, static checks,
package construction and package-contract validation. Related interaction
results and inspected visual references are recorded in the per-change documents.

The release workflow now selects 239 tests in 33 files, including the new
component-token, menu, validation and scroll-area contracts. Its fresh cloud
quality gate must succeed before npm publication; a test inventory is not a
passing test run. Publication is complete only after the official registry reports
both packages at 0.5.5 and its integrity matches the workflow's verified tarballs.

GitHub Actions, the GitHub release and npm registry provide the final publication
record. Build warnings about existing large chunks do not affect package-contract
validation. No dependency versions were upgraded by this release.
