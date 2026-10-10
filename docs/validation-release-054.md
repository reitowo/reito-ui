# Release validation: 0.5.4

Date: 2026-10-10.

The v0.5.3 release workflow passed build, static checks and generated-file
consistency, then failed its interaction gate: 199 passed, 16 failed. The npm
publish job was skipped. That tag is preserved; 0.5.4 is the next release attempt.

The failed diagnostics showed:

- Cold development-server navigation still displayed the opening fallback after
  the tests' five-second readiness window. Overview and task-card checks now
  wait up to 30 seconds for their actual content; geometry assertions are intact.
- Code-copy geometry tests depended on the Linux host clipboard. The test now
  supplies an asynchronous clipboard callback, as the catalog probe already did.
- Theme tests sampled computed colors before the selected color had settled.
  They now poll the actual computed result while retaining color/isolation checks.
- Storybook's automatic axe scan could overlap the explicit table scan. The
  test retries only the exact already-running error; other errors and actual
  violations still fail.

Local targeted repeat: all 20 tests passed in 1.7 minutes, covering all failed
categories and both themes/densities where applicable. The existing React
development warning remains. No component implementation or visual tokens were
changed for this repair.

Evidence: `.logs/release-053-failed.log`, `.logs/release-053-failures/`, and
`.logs/release-test-repair.log`. The new release still requires the full GitHub
quality gate and npm publication; this record does not claim those have finished.
