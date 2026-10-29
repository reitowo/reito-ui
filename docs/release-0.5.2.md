# Reito UI 0.5.2

## Changes

- PR #8: SettingsSection adds an optional plain group; SettingsRow adds vertical controls and accessible label/description associations. Existing outlined/horizontal defaults stay compatible.
- InputTime provides a clock-triggered picker with draft confirmation, 12/24-hour display, seconds, range and step limits.
- ColorPicker inherits the input radius; Calendar uses equal horizontal/vertical date pitch; ScrollArea demos use shared row padding; InputOTP defaults to continuous slots; the ImageCompare illustration fills its lower edge.
- Lab navigation uses concise English names while retaining Chinese search. The homepage documents npm installation.
- Include the previously merged Popover list, quiet Tabs/table focus and settings inline icon improvements that were not in the original npm 0.5.1 tarballs.
- Workspace versions and internal references advance together to 0.5.2. Deferred Kanban drafts are excluded.

## Validation and publication policy

- PR review: fresh npm ci, full build and check passed. SelectInput and settings composition browser regression: 11 passed across dark/light and compact/comfortable.
- Settings screenshots were compared with PR #8's validation references. Plain-group separators, label/control associations and compact spacing are preserved. Narrow dialog testing does not replace real browser zoom or screen-reader testing.
- CI includes 170 core interaction checks. SelectInput waits for Storybook's active axe scan without ignoring real accessibility violations.
- Tag v0.5.2 must match every package version and point to a commit on main. The publish workflow validates and packs before publishing tokens, then ui, with npm provenance.
- CI status, registry availability and live Pages behavior must be verified separately; version numbers alone are not evidence of publication.
