# Innerflect Mirror — Cockpit HTML

Standalone shell prototype, intentionally isolated from the shared application.

## Contract

- The document is exactly `100dvh` and never scrolls.
- Sidebar and command bar are stable cockpit furniture.
- The content stage owns all remaining width and height through CSS Grid.
- Internal product surfaces must use `min-width: 0`, `min-height: 0`, and manage their own overflow.
- CSS Grid owns the invariant frame. A panel library is reserved for optional, user-resizable inspector splits inside the stage.
- The wordmark is `Innerflect`; the five-line mark follows the canonical supplied brand form.
- `Company` is a single dominant, interactive 3D system view rather than a dashboard grid.
- Active company functions determine which domain platforms exist in the 3D model and which filters exist throughout the product.
- The 3D vocabulary uses the canonical Innerflect V2 GLBs: company core, domain platform, human/agent/tool glyphs, knowledge, decision and risk objects.
- Semantic labels and controls remain accessible DOM overlays; WebGL is reserved for the spatial model.
- Motion is restrained to inspection parallax and a subtle living-core pulse, with reduced-motion support.
- Global commands are data-driven and share the same page activation and scope state as visible navigation; no parallel navigation model is allowed.
- `⌘/Ctrl + K` opens an accessible modal command surface with search, grouped results, arrow navigation, Enter execution, Escape dismissal and focus restoration.

## Navigation proposal

Stable product surfaces: `Company · Work · Decisions · Knowledge · Impact · Settings`.
`Mirror · Builder` is a global operating mode, not a destination in navigation.

Configurable company domains are filters, not universal navigation: the prototype uses
`Market · Sales · Delivery · Finance`, but the enabled set belongs to each company's
constitution. Every stable surface reorganises the same company records through the
selected domain. Page modules are text-only sortable placeholders so information
architecture can be tested while the Company composition establishes the shared 3D language.

## Company world composition

1. The company core is the invariant centre and represents the whole operating system.
2. Each enabled function creates one connected domain platform around the core.
3. Glyphs identify the kind of active capability on a platform; colour communicates state only.
4. Connection paths communicate operational relationships, not decoration.
5. The function dock changes the company constitution live; downstream pages inherit the same enabled set.

## Interaction architecture

- One `activatePage` function owns navigation from the rail, settings and command centre.
- Command items are declarative data (`group`, `label`, `detail`, `keywords`, `run`) rendered with event delegation.
- Domain scope is shared state, so selecting a scope through Command K updates the same View controls and page composition.
- The command centre becomes a bottom sheet on phone-sized screens while retaining the same keyboard and semantic model.
