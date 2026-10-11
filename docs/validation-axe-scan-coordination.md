# Accessibility scan coordination

Date: 2026-10-11 (Asia/Shanghai).

The main-branch CI run 38128372332 completed with 248 passing checks and one failure in the dark/comfortable narrow DynamicForm check. The error was `Axe is already running`, raised because Storybook's automatic accessibility addon and the manual Playwright scan share one axe runtime. The release workflow 38128374443 passed all 249 checks on the same application commit and published 0.5.7.

`tests/axe-scan.ts` now centralizes the existing wait behavior previously duplicated in Tabs and PropertyList. DynamicForm and ordinary Form use the same helper. The helper only retries the scanner's busy error, waits at most five seconds to acquire it, and then returns the actual violations. Other errors and an acquisition timeout still fail. Existing run options and contexts are preserved: Form scans the document; the other callers scan its body. Storybook automatic accessibility checks remain enabled.

Three deterministic regression checks use the real axe runtime, including an asynchronous custom check that keeps a scan active. They verify that a busy scan can finish before the manual scan returns a genuine missing-image-alt violation, that unknown-rule errors propagate, and that a scanner which never releases reaches the bounded timeout. These checks are included in the CI selection.

Local results:

- Full build and check passed.
- Explicit TypeScript validation of the helper, regressions and four affected test files passed.
- The four affected suites passed all 48 checks (1.1 minutes), including DynamicForm, ordinary Form, Tabs/table focus, and rich PropertyList in both themes/densities.
- The final context-preservation run passed all seven checks (18.1 seconds): three scanner regressions and four document-context Form checks.
- `git diff --check` passed.

Evidence: `.logs/axe-race-build.log`, `.logs/axe-race-check.log`, `.logs/axe-race-tests-typecheck.log`, `.logs/axe-race-helper-tests.log`, `.logs/axe-race-integration-tests.log`, and `.logs/axe-race-context-tests.log`. The original cloud diagnostic remains in `.logs/release-057-main-ci-failure.log` in the primary checkout.

This changes test scheduling rather than component rendering or published package contents. Existing Kanban drafts remain outside the isolated fix checkout. The main-branch CI rerun verifies the resulting full selection of 252 checks; its final result is recorded separately when it completes.
