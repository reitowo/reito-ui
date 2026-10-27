# Component source organization

Reito UI uses a layered, compositional design system. Its public layers are
basic, complex, AI, and affect/pattern (`模式`). These describe responsibility
and dependency direction, rather than component size or an inheritance hierarchy.

## Responsibilities

| Layer | Responsibility | Examples |
| --- | --- | --- |
| Tokens | Semantic visual values and generated theme/density bridges | `packages/tokens/src/tokens.json` |
| Interaction libraries | Keyboard behavior, focus, selection, editing, and data models | Base UI, React DayPicker, Tiptap, TanStack Table |
| Styled foundation | Adapt interaction primitives to the shared visual contract | Button, Dialog, Select, Field |
| Composed features | Combine foundation controls and explicit data/state callbacks | AsyncCombobox, DataTable, RichTextEditor, Transfer |
| AI presentation | Compose messages, inputs, tools, decisions, and artifacts | Composer, ToolCall, PermissionRequest |
| Affect / pattern | Token-backed affectUI-shaped surfaces; wrap existing primitives | ToolCallCard, ChatComposer, LogoMarquee |
| Host application | Own business data, network requests, execution, and persistence | Lab demos and consuming applications |

Several patterns coexist:

- **Composition:** build larger controls from existing controls instead of
  inheriting component implementations.
- **Compound components:** expose related parts such as DialogContent and
  DialogFooter, or CardHeader and CardContent, so the host can assemble content.
- **Adapter:** foundation components translate third-party interaction APIs into
  Reito's visual and accessibility contract. Retain the real primitive APIs.
- **Controlled/uncontrolled state:** controlled values use props and callbacks;
  local defaults are available where the component's contract supports them.
- **Slots and render callbacks:** `children`, named content props, Base UI
  `render`, and data render callbacks let the host supply content and actions.
  They are different APIs, not one universal slot mechanism.

This is not a strict atoms/molecules/organisms taxonomy, MVC framework, or a
single headless library: Reito ships styled components and composed behavior.

## Style recipes

Short local layout utilities remain in JSX. Longer class recipes use ordered
groups for layout, spacing, surface, typography, motion, and interaction states.
`cn` and CVA accept arrays; preserve utility order and consumer class precedence
when splitting existing strings. Keep variant and size declarations separate.
Do not add a generic wrapper or a new abstraction just to avoid a short class.

Document-wide descendant typography belongs in scoped component CSS, grouped by
paragraphs/headings, lists, code, tables, and editor-specific state. Use the
existing semantic `--rui-*` variables. Keep these rules in the components layer
so consumer utilities can override them. Import component CSS through the shared
`styles.css` entry so package consumers do not need additional imports.

## Rendering and state

Format JSX and event callbacks across readable lines. Extract repeated rendering
when its responsibility is clear and its behavior is actually shared. For
example, virtual and regular DataTable rows use the same cell-content renderer;
asynchronous selectors share idle/loading/error feedback but keep their own
selection, cache, creation, and virtualization behavior.

Use a render function for content that closes over the current component's
state. Do not declare a new React component inside another component's render;
that changes its identity and can remount inputs. A shared React component should
have an explicit props contract and live at module scope.

## Checks

- `npm run components:format` formats the entire UI source tree.
- `npm run components:check` checks formatting and source organization.
- Static class fragments are limited to 300 characters. Split larger recipes by
  responsibility rather than slicing at arbitrary character positions.
- Class recipes targeting six or more document element types must be expressed
  as scoped document CSS. A few local child selectors remain appropriate.
- `npm run check` includes these checks alongside the existing token, catalog,
  design-contract, and type checks. Passing them does not prove API usability or
  rendered behavior; run the relevant interaction and visual checks as well.

Prettier is pinned as a development dependency. Source organization checks use
the TypeScript AST and do not alter generated token files or third-party code.
