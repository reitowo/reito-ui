# RichTextEditor focus and task alignment validation

Date: 2026-10-11 (Asia/Shanghai).

Reference: the user's two annotated screenshots of RichTextEditor in the local component overview, dark theme and compact density. They identify an overly bright editor boundary and task checkboxes that do not align with their text. No external product reference was needed for this correction.

## Shared changes

The task label previously used the extra-small control height (24px in compact density) while the text line measured 21.125px. This placed each checkbox center 1.4375px below its first text line. The shared editor stylesheet now derives the label height from the same interface font and relaxed line-height tokens as the document. Checked and unchecked items both measured a center offset of 0px in the composed Lab page.

The editor surface previously combined a brighter border with an exterior focus ring, and toolbar focus activated the same frame. The document now changes only its existing border when focus-visible; toolbar controls retain their own focus treatment. Focus adds no box shadow and does not change the surface bounds. Forced-colors mode retains an explicit Highlight border.

## Actual validation

- `npm run build`: passed.
- `npm run check`: passed.
- Full `tests/rich-text-editor.spec.ts`: 90 passed in 2.0 minutes, including the new light/dark and compact/comfortable alignment and focus checks.
- Live dark/compact overview: checked and unchecked task centers both match the first text line, with no exterior focus shadow.
- `git diff --check`: passed.

Evidence is saved in `.logs/editor-focus-alignment-live.png`, `.logs/editor-focus-alignment-metrics.json`, and the build, check, and test logs with the `editor-focus-alignment` prefix. The live screenshot keeps the surrounding component card visible for comparison with the user's reference. It shows the existing local catalog, including unrelated Kanban draft work.

## Delivery boundary

These editor changes are local follow-up fixes made after the 0.5.6 publication started. They are not included in the published 0.5.6 npm packages or tag. The ordinary editor padding, typography and toolbar geometry remain as before; this validation covers the reported focus boundary and task-row alignment rather than claiming a broader redesign.
