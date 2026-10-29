# Release validation: 0.5.7

Date: 2026-10-11 (Asia/Shanghai).

Scope: approved shared editor, control-shape, breadcrumb, density and Lab inspector changes after 0.5.6. The primary checkout's Kanban implementation, stories, tests, public export, catalog registration and count changes remain excluded. Release scope is 138 families (72 basic, 42 complex, 24 AI). Existing local drafts are preserved.

The clean release checkout reuses the existing managed checkout. Root/workspace versions and internal dependencies are synchronized to 0.5.7. The lockfile preserves the previous dependency graph and optional-platform packages. Local Lab, Workbench and static Storybook use isolated ports 5193, 5195 and 6017; the user's running workspace is not stopped.

Build, check, release-version policy and both npm tarball export/file contracts passed. The tokens archive has 13 files including the new catalog module and declarations; the UI archive has 190 files. Generated catalog and token consistency are part of the checks.

The first local 249-test release selection completed with 246 passes and three diagnostics in 10.2 minutes. One caught a zero-size Card measurement before the preview became visible in light/comfortable mode. The test now waits for the visible card and retries the same exact geometry contract, including dynamic token updates; no expected dimension was relaxed. The other two checks passed their assertions but failed during context teardown because a concurrent focused editor run shared and cleared the trace directory. That supplementary configuration now uses a separate output directory. All three affected checks passed a serial rerun (26.1 seconds). This is reported as the original run plus repair checks, not an uninterrupted 249-pass run.

The four focused RichTextEditor task alignment/focus checks also passed across both themes and densities (16.2 seconds).

Evidence is stored in `.logs/release-057-build.log`, `.logs/release-057-check.log`, `.logs/release-057-tests.log`, `.logs/release-057-repair-tests.log`, `.logs/release-057-editor-tests.log`, `.logs/release-057-pack.log`, and `.logs/release-057-pack-check.log`. Visual comparisons and limitations are documented in the editor-focus, component-shape, comfortable-density, token-inspector and overview-caption validation notes.

Publication requires the tag's GitHub release workflow to pass and official npm versions/integrity to match its verified archives. Website deployment is checked separately.
