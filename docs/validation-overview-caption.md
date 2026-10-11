# Overview caption removal

Date: 2026-10-11 (Asia/Shanghai).

Reference: the user's dark/compact overview screenshot selecting the static `Component atlas` caption beside the brand and version. The user approved removing this redundant subtitle. The overview now retains the brand/version and functional toolbar actions; the unused caption CSS selectors were removed. The functional Home navigation link is outside this change.

The rendered dark/compact overview was inspected at 1303 × 1244. Its toolbar contains Reito UI, version, theme, color examples and component details, with no caption or replacement label. Evidence: `.logs/overview-caption-removed.png`.

Build passed. All five existing overview interaction checks passed, including search/reset and both themes/densities. Logs: `.logs/overview-caption-build.log`, `.logs/overview-caption-tests.log` and `.logs/overview-caption-check.log`.
