---
name: reito-ui
description: Build or fix React interfaces with Reito UI using public components, composition recipes and the theme system. Use when the user requests Reito UI or Graphite, or an existing Reito application needs layout or theme corrections.
---

# Reito UI

Build the requested screen from public components. The library owns control geometry, typography,
internal spacing, surface shape, focus and portal themes. The application owns content, navigation,
business state and commands.

## Start

Read the installed UI and tokens versions. The composition APIs below target the 0.6.0-next.0
candidate and subsequent compatible versions; 0.5.8 does not export them. Use a matching release or
supplied package artifacts. Consult public types or the component story when a prop is unclear.
Application authors should not need to inspect private component CSS.

Load @reito/tokens/css then @reito/ui/styles.css once. Wrap the application in ReitoThemeProvider
with root, the product's mode, and density="compact". The provider owns document and portal theme
configuration. Only expose a product density switch when requested.

## Compose

Read [the composition contract](references/design-contract.md) for component selection and inset
ownership. [The workbench recipe](assets/workbench.tsx) is a complete public-import example with no
application CSS. It is generated from the same composition used in the Lab and verified against the
compiled package.

- Stack owns vertical gaps; Inline aligns and wraps actions, metadata and fields.
- Grid lays out peer sections and collapses according to available width.
- PageHeader owns title, description and primary actions.
- Panel owns a section heading, actions, footer and one content inset. Use flush for a list, table
  or Empty that already owns its inset.
- Heading separates document level from visual size. Text offers body, interface, caption and
  reading roles. Content remains complete unless the product explicitly needs truncation.
- Field and its label, description and error slots own form spacing. Use Inline align="end" for
  fields and their submit button. Default controls align without height or font overrides.
- ItemGroup and Item compose records; ItemSeparator divides them. Put author and time in one
  Inline align="baseline". ItemActions stay with the record they affect.

Use documented control props. Base UI composition uses render; SelectInput reports values through
onValueChange. Do not assume every component has loading, size or tone. Preserve labels, keyboard
focus, disabled/error/loading states and Chinese IME behavior.

## Theme and shared fixes

For a requested product-wide change, use the provider's typed tokens override. Use a nested provider
for an intentional local variation. Ordinary screens need no overrides to align basic controls.

If a default composition has clipped labels, doubled inset, inconsistent geometry or incorrect
fonts, reproduce it with public components and fix the responsible library component or token.
Keep the example as a behavior check. Avoid accumulating application data-slot selectors or copying
component implementations into features. Application CSS is for genuinely product-specific geometry,
such as a specialized canvas; it is not a prerequisite for ordinary forms, lists or panels.

## Validate

Inspect the composed screen with realistic Chinese/English content, empty/error states and a narrow
container. Verify wrapping, visible labels, focus and preserved drafts. Shared library changes cover
light/dark and supported densities, including a portal and nested theme.

In the library follow AGENTS.md and run the required checks, build and relevant behavior tests.
npm run test:composition checks a compiled consumer without source aliases, a Tailwind compiler or
application CSS. npm run recipe:check prevents the portable example from drifting. Edit the recipe
source at packages/ui/src/basic/composition-demo.tsx and run npm run recipe:build to regenerate it.

Report source changes, local artifacts and published versions separately. Skill use does not grant
package publication, deployment or external-message authority.
