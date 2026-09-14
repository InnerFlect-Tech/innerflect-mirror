# Mirror — World Elements

Status: active semantic contract
Owner: semantic object layer (`components/company-world/assets`, `nodes/DomainContent.tsx`, `lib/model/domain.ts`, `data/company.ts`)
Last aligned with implementation: 2026-09-14

`PRODUCT_STRUCTURE.md` is the authority for what the product means.
`99 System/AI/Rules/Code/threejs-r3f.md` is the authority for how the scene is written.
This file is the authority for **what each object in the world represents**.

## The rule

> Nothing is placed in the world unless it maps to a field on a record, and the
> mapping is written down here.

Twenty desks because twenty looked good makes this a diorama. Six desks because
there are six workflows makes it a model. A reader must be able to point at any
object on any island and be told, from this table, which field put it there.

Two corollaries the implementation is held to:

1. **No count is a literal.** Every repeat count is `record.something.length` or
   a field value. If a number appears in the renderer, it is a *scale* (how many
   world-units one unit of throughput is worth), never a *quantity*.
2. **No branch on identity.** The renderer never asks `id === 'finance'`. It asks
   the record what it contains. A fifth domain added to `data/company.ts`
   populates itself with no renderer change.

## Object table

| Object | Represents | Driven by | Resolves to |
|---|---|---|---|
| Workflow bay | one workflow | one per entry in `Domain.workflows[]` | `workflow:<id>` |
| Bay floor plate | the workflow's footprint on the island | constant per bay; grid from `workflows.length` | `workflow:<id>` |
| Desk | one human seat working that workflow | one per `Workflow.humans` | `workflow:<id>` |
| Seated figure | a human role at that seat | one per `Workflow.humans` | `workflow:<id>` |
| Desk screen | the tooling the seat works through | one per desk | `workflow:<id>` |
| Screen glow intensity | how much of that workflow runs itself | `Workflow.autonomy` | — |
| Throughput column | volume moving through that workflow | height ∝ `Workflow.throughput` | `workflow:<id>` |
| Column lit segment | the autonomous share of that volume | `Workflow.autonomy` × height | `workflow:<id>` |
| Partition | boundary between adjacent workflows | derived from the bay grid | `workflow:<id>` |
| **Gate pylon** | **a decision waiting on a person** | **one per `Decision` record whose `workflowId` matches** | `decision:<id>` |
| **Hotspot** | **something wrong, uncertain or unsafe** | **one per OPEN `Exception` record for that workflow** | `exception:<id>` |
| Chair | the seat itself, behind each figure | one per `Workflow.humans` | `workflow:<id>` |
| Standing figure | an agent | one per `Domain.agents[]`; pose from `Agent.activity` | `agent:<id>` |
| Agent status mote | how loudly the agent's activity asks for a person | `Agent.activity` | `agent:<id>` |
| Island signal strip, edges, tints | semantic state | `Domain.state` | `domain:<id>` |
| Island footprint (scale) | share of company activity | `Domain.activeWork` against the busiest domain, 0.92–1.14 | `domain:<id>` |
| Agent mote motion | how urgently the agent's activity asks for a person, while work flows | `Agent.activity` × `running`; still when paused or reduced-motion | `agent:<id>` |
| Pulse along a connection | one recent event on that domain; position on the path is recency | one per `feed[]` entry whose `domainId` matches; no event, no pulse | `domain:<id>` |

Every row above resolves to a record you can open. That is not decoration: the island
merges into two meshes to hold the draw-call budget, so a raycast returns "the island"
unless something maps the hit back. `assets/pickTable.ts` records the triangle range each
part occupies as it is built, and `refAt()` binary-searches a `faceIndex` back to the
record. One draw call preserved, per-object picking gained. `npm run check:picks` fails if
the table ever stops covering every triangle exactly once.

### What changed, and why it matters

Two rows used to be justified by a colour rather than a record:

- **Gate pylon** was `present when Workflow.state is attention/critical`. A pylon inferred
  from state stands for nothing — it cannot be opened, and it claims a person is needed
  without saying what for. It is now one per `Decision` record.
- **Hotspot** did not exist; risk was implied by `Domain.openItems`, a count derived from
  which workflows happened to be coloured. `openItems` now counts OPEN `Exception` records,
  and each one draws its own object.

They are deliberately separate shapes, because a decision waiting and an exception open are
not the same fact. Drawing one shape for both was why the world could not tell you which it
was. The visible consequence: `mk-signal` gains a pylon (it has a real decision pending) and
`fn-revrec` loses one (it has an exception, not a decision) — the world is now reporting
what is actually true rather than what the colour suggested.

### What each mapping is worth reading as

- **Skyline** — scan the columns and you have read volume across the company
  without a chart. A tall dark column is a high-volume workflow that humans
  still drive; a tall lit column is volume the company has genuinely handed over.
- **Floor** — scan the desks and you have read where human effort actually sits.
  Delivery has five desks because five people work delivery workflows.
- **Pylons** — the only objects that interrupt the field. Three exist in the
  whole world right now, because `openItems` totals three.

## Derived fields — the drift guard

`Domain.processes`, `Domain.people` and `Domain.openItems` were authored numbers
that the HTML surfaces already publish. They are now **derived** from
`Domain.workflows[]` by `defineDomain()` in `data/company.ts`:

| Field | Derivation |
|---|---|
| `processes` | `workflows.length` |
| `people` | `sum(workflows[].humans)` |
| `openItems` | `count(OPEN Exception records in this domain)` |

This is the mechanism that makes the rule enforceable rather than aspirational.
The island cannot show six desks while the label says four people, because both
read the same array. Authoring a workflow with a human changes the label and the
island in the same commit, or neither.

`activeWork` and `metric` remain authored: they are observations about the
domain, not a shape of its workflow set.

## Model additions

Added to `lib/model/domain.ts`:

```ts
export type Workflow = {
  id: string;
  name: string;
  /** Actions per day moving through this workflow. Drives column height. */
  throughput: number;
  /** Earned autonomy for this workflow, 0–100. Drives the lit share. */
  autonomy: number;
  /** Human seats working it. Drives desks and seated figures. */
  humans: number;
  /** Workflow-level state. `attention`/`critical` raise a gate pylon. */
  state: SceneState;
};
```

`WorldDomain` — the `Pick<>` that guarantees the scene is a projection — gains
`workflows` and `agents`, because the island can no longer be drawn without them.

### Throughput scale

`THROUGHPUT_FULL_SCALE = 250` actions/day is the world constant a full-height
column represents. It lives beside the renderer because it is a unit conversion,
not a fact about the company. It is deliberately a *shared* constant rather than
a per-island normalisation: normalising each island against its own maximum
would make every domain look equally busy and destroy cross-domain comparison,
which is the one thing a skyline is for.

The mapping is **compressive** — `height ∝ √(throughput / 250)` — not linear.
Throughput across a real company spans an order of magnitude (Market's demand
capture at 240 actions/day against Finance's ownership assignment at 6). Under a
linear scale the top two workflows consume almost the entire height range and
every other bay collapses flat to the plate: accurate, and unreadable. Measured
on the current data, linear put Delivery's tallest column at 0.149 world units
and the islands read as empty.

The square root preserves ordering and cross-domain comparison exactly — taller
is always more, on one shared scale — while giving the long tail enough presence
to be seen and clicked. This is a transform on the *scale*, never on the data,
the same move as a log axis on a chart. Resulting tallest column per island:

| Domain | Busiest workflow | Actions/day | Column height |
|---|---|---|---|
| Market | Demand signal capture | 240 | 0.476 |
| Sales | Follow-up sequencing | 190 | 0.429 |
| Finance | Payment reconciliation | 92 | 0.312 |
| Delivery | Build execution | 62 | 0.264 |

## Performance

The budget is 120 draw calls / 200k triangles; the baseline was 100 / 21k.

Islands are dense — 38 workflow bays, 13 desks, 13 seated figures across the
world — so nothing here may cost a draw call per object.

- All static island content (plates, desks, screens, partitions, columns,
  pylons, seated figures) is **merged into two `BufferGeometry` per island** at
  `useMemo` time: one opaque body, one emissive accent. Two draw calls per
  island, twelve objects or two hundred.
- The merge is keyed on the workflow set, so it rebuilds only when the model
  changes — never per frame, never on hover or selection.
- Agent figures move, so they cannot be merged. They are one `InstancedMesh` per
  island, written with `setMatrixAt` inside `useFrame` against module-scope
  scratch objects. One draw call per island.
- Net: **four draw calls per island** — island body, island accent, agent body,
  agent accent — replacing the previous per-mesh content.

**Measured** on the home scene after implementation, at 1180×940:

| | Draw calls / frame | Triangles / frame | fps |
|---|---|---|---|
| Budget | < 120 | < 200,000 | — |
| Baseline before this work | 100 | 21,000 | 60 |
| **After** | **61** | **19,400** | **60.3** |
| After the design-system phases 1–3 | **61** | **19,407** | demand-idle |
| After record-driven objects + picking (7/8) | **61** | **19,479** | 60 |

`/design/elements` renders all fifteen glyphs at once. Counted statically from the manifest
and the material-role map after the V2.1 rebuild: **4,556 triangles** (2.3% of budget) across
**53 draw calls** — one mesh per material role per glyph, after conformance merges each. The
paired 2D symbols add no WebGL work. 67 calls of headroom remain, so the sheet can grow without
threatening the ceiling.

Phases 1–3 moved every token into `lib/tokens/`, generated the glyph ids, and added a
typed conformance layer — and cost the scene nothing, which was the point: none of it is
imported from the render path yet. The fps column reads "demand-idle" because an
unchanging scene on a demand frame loop draws only a handful of frames per second by
design; the per-frame counts are what the budget is about.

Merging the island content *freed* roughly 39 draw calls against the baseline,
because the previous abstract towers, trees and warehouses were one mesh each
plus a mesh per window sliver. The world is now far denser — 38 workflow bays,
13 desks, 13 seated figures, 8 agents, 3 gate pylons — and costs less to draw
than the four decorative islands it replaced.

Paused, the scene still issues **zero draw calls** over a 2.5s window: nothing
in this layer runs a frame loop, so the demand frame loop is unaffected.

## Unified 2D / 3D visual grammar

The 2026-09-14 visual pass keeps the same fifteen meanings and rebuilds both projections
around one composition rule:

> The workflow path is primary. A Step Node is the repeated unit; actors sit on work,
> evidence attaches to work, controls interrupt work, and live signals travel over work.

The previous kit made every item a self-contained sculpture. That worked in isolation and
failed in combination: a Record Token, Risk Hotspot and Tool each brought its own visual
environment, so none could read as a subordinate part of one workflow. V2.1 removes that
competition.

| Family | Element | Composition role | First appears |
|---|---|---|---|
| Structure | Company Core | root of the company composition | Company |
| Structure | Domain Platform | contains workflows; never an org-chart department | Company |
| Flow | Step Node | repeated primary node | Workflow |
| Flow | Workflow Line | connector whose runtime path spans two nodes | Workflow |
| Actor | Human Glyph | attaches to a step; always neutral grey | Workflow |
| Actor | Agent Glyph | attaches to a step; machine silhouette, state may affect its work | Workflow |
| Attachment | Tool Glyph | secondary object attached to the step using it | Execution |
| Attachment | Knowledge Object | secondary object attached to the step using it | Execution |
| Control | Decision Gate | diamond node with one input and explicit branches | Workflow |
| Control | Permission Boundary | scope around affected work | Execution |
| Signal | Record Token | identifiable business record travelling on the path | Workflow |
| Signal | Action Pulse | event travelling over the path | Execution |
| Signal | Risk Hotspot | overlay on the affected step; never its own environment | Workflow |
| Terminal | Verification Marker | check node; pass/fail is shape before colour | Workflow |
| Terminal | Outcome Marker | flag node that terminates in an observable business result | Workflow |

`lib/design/elements.ts` holds these roles as data. The 3D projection is generated by
`tools/glyph-kit/generate_innerflect_v2.py`; the 2D projection is
`components/company-world/design/ElementSymbol2D.tsx`. Both are keyed by the generated
`GlyphId`, and both consume the same state tokens. A 2D icon with a private palette or a
second semantic list is a regression.

Progressive disclosure is part of the grammar, not a presentation preference:

- **Company zoom:** company and domain structure, overall flow and exceptions only.
- **Workflow zoom:** steps, actors, record token, decisions, verification and outcome.
- **Execution zoom:** tools, knowledge, permission scope, evidence and live action.

The 2D surface is not a simplified product and the 3D surface is not a decorative product.
They are two projections of the same graph. Changing projection must preserve ids, topology,
selection, state, labels and inspector content exactly.

## Registry-driven ecosystem index

The ecosystem map is a real product/design-system surface, not a diagram maintained by hand.
Its executable registry lives in lib/design/ecosystem.ts and is the single index for the
journeys, Shops, products, engines, infrastructure and repository entry points that are safe
to show in the board. The repository boundary is the complete Innerflect environment, not only
Mirror.

The model is deliberately small:

- A node is a stable, source-backed concept. It has an id, kind, category, state, position
  proposal and source pointer. A card must explain what the concept does and where its
  meaning is owned.
- A relation is directional and typed. It says how a user journey, product or engine
  connects to another concept; an unlabeled line is not a valid relation.
- Every ecosystem page is registered with its owning surface, route, file, access boundary,
  purpose and live/building/planned state. No new entry point is real until it is in
  ECOSYSTEM_PAGES.

The two journeys represented by the registry are binding:

1. Self-builder: free/open Mirror → OS Shop patterns → Forge Shop components → the user's
   own operating system.
2. Managed client: managed OS → proprietary Forge → Studio and Mirror; Innerflect operates
   delivery through Admin and its own Mirror.

### Bidirectional change contract

Canonical authority → registry validation → board projection.

Board draft → authenticated typed operation → canonical authority → validation → event or
commit → refreshed registry projection.

Until the authenticated operation exists, a board edit is only a layout proposal. Browser
state and localStorage are never a source of truth. The production write path must record
the actor, reason, revision, permission check, validation result and resulting event. The
public map must never contain secrets, customer data or private infrastructure coordinates.


## Requests to the UI-shell session

These sit in files this layer does not own. ✅ marks one that has landed; the rest are open.
Numbers are never reused, so a reference to "request 5" always means the same thing.

1. ✅ **DONE — `nodes/DomainIsland.tsx`** — `<DomainContent shape={index} …>` passes an
   array position, which is the reason island content could not mean anything.
   Needs to pass the record: `<DomainContent domain={domain} accent={token.edge} />`.
   *(Agreed with the user and applied as a single-line change; no other line in
   that file was touched.)*

2. ✅ **DONE — Island footprint should encode share of company activity.** The table above
   has no row for footprint because this layer cannot set it — `scale` comes from
   `layouts/companyLayout.ts` and the platform size from `DomainIsland.tsx`, both
   shell-owned. Today scale is a hand-tuned composition value (0.96–1.05).
   `Domain.activeWork` (82 / 146 / 47 / 19) is the field that should drive it, so
   that a busy domain is visibly a bigger place. Suggested:
   `scale = 0.92 + 0.22 * (activeWork / maxActiveWork)`, applied in the layout so
   the curated composition still owns position.

3. ✅ **DONE — Agent figures need `running` and `reducedMotion` to animate.** The object
   table promises a *moving* figure for an agent mid-task; today they are posed
   by `Agent.activity` but static, with a status mote whose brightness is how
   loudly the activity asks for a person. Animating them properly requires the
   two signals `DomainIsland` already receives, passed down to `DomainContent`,
   so the motion can stop when work is paused or the viewer asked for reduced
   motion. Animating without them would make the scene render continuously and
   break the zero-draw-call idle guarantee, so this layer deliberately did not.


4. ✅ **DONE — Connection pulses should carry real events.** `connections/Connection.tsx`
   currently pulses on an index-derived `offset`. `data/company.ts` exports
   `feed: FeedEvent[]` with a `domainId`; one pulse per event on that domain's
   path would make motion mean "this happened" rather than "time is passing",
   which is what the contract asks of motion.

5. ✅ **DONE — A route for the design system.** The element sheet and the floor become real routes
   so they are built from the same components the product uses and cannot drift from it.
   The components are exported from `components/company-world/`; the route files are three
   lines each and live in `app/`, which this session does not own:

   ```tsx
   // app/design/elements/page.tsx
   import { ElementSheet } from '@/components/company-world/design/ElementSheet';
   export const metadata = { title: 'Elements \u00b7 Design', robots: 'noindex' };
   export default function Page() { return <ElementSheet />; }
   ```

   `app/design/**` is a new directory, so it collides with nothing. Raised early
   deliberately — it is the only cross-boundary dependency in the design-system plan,
   and it should not become the thing that blocks it.

6. ✅ **DONE — Delete tiers 1 and 2 from `app/tokens.css`.** Every one of those 65 declarations is
   now emitted from `lib/tokens/`, verified identical name-for-name and value-for-value by
   `npm run check:tokens` (0 mismatches). They currently exist twice with the same values,
   which is harmless but is exactly the duplication this work removes. Keep tier 3
   (`--panel-*`, `--card-radius`, `--pill-radius`, `--summary-gap`) hand-authored — it is
   per-component plumbing with no TypeScript consumer, and generating it would add a build
   step to values only CSS reads. Keep the file and its header comment; delete the two
   blocks. Run `npm run check` afterwards.

7. ✅ **DONE (commit `94c7960`) — Record the observe → build → verify product loop in `PRODUCT_STRUCTURE.md`.** This is
   the current product direction and belongs in the product authority before either layer
   implements it. Insert the following after the autonomy ladder in **Product definition**:

   > Mirror has two modes over one company model. **Mirror mode** reconstructs and shows
   > how the company actually operates. **Builder mode** lets a person redesign how it
   > should operate. The system should reconstruct workflows from connected tools first;
   > people review and correct that evidence-backed model rather than drawing the company
   > from a blank canvas.
   >
   > The operating loop is `Connect → Observe → Reconstruct → Improve → Simulate → Approve
   > → Automate → Verify → Learn`. Builder mode is a constrained visual language, not a
   > generic node canvas. Every workflow retains the canonical spine `Trigger → Context →
   > Work → Decision → Action → Verification → Outcome`, and every published step names
   > the record moving through it, its actor, control mode, tools, authority, evidence and
   > observable result.
   >
   > The product distinction is deliberate: workflow tools primarily describe what
   > software should execute; Mirror shows what the company is actually doing across
   > people, AI agents, deterministic systems, knowledge, decisions, permissions,
   > exceptions and verified business outcomes.

   Then add these implementation invariants under **Shared domain model**:

   - Actor identity and control mode are separate. Actor kinds are human, AI agent,
     deterministic system and external system; control modes are human-led, assisted,
     supervised, autonomous and blocked.
   - Every selectable visual object carries a stable record id and record type. Clicking
     it resolves to the same object used by the HTML surfaces.
   - A workflow definition is not an execution. An execution carries the specific business
     record moving through the steps, events, timestamps, decisions, verification and
     outcome.
   - `lib/model/work.ts` and `lib/model/domain.ts` currently declare separate `Workflow`
     shapes. Before Builder mode, establish one canonical workflow identity and derive the
     small world projection from it; do not let two independently authored truths persist.

   Once the product contract lands, the 3D/design plan should express the visual grammar
   from it. Stable nouns may be GLBs; state, motion, history, selection and boundaries are
   procedural. The most important missing world concept is a **Record Token**: the uniquely
   identifiable lead, order, project, invoice or ticket moving through an execution.

8. ✅ **DONE — `ProcessesSurface` now takes `DocumentedWorkflow[]`.** Applied as a two-line change
   (the type import and the prop type); no other line in that file was touched. The workflow
   catalogue is now one array, with the deeply-mapped subset narrowed by `isDocumented()`.
   The surface renders exactly as before — same four workflows, same fields — but they are now
   the same objects the islands draw, with the same ids.

9. ✅ **RESOLVED — Permission Boundary has a fixed style unit and procedural extent.** The
   normalised GLB owns the boundary's posts, rails and material roles so it remains visually
   identical to the kit. It does **not** own the scope. Runtime derives extent from the
   `AuthorityLimit` / `RoleGrant` record and scales or repeats that unit around the affected
   work. This preserves the review's substantive rule: a static asset can never invent an
   authority boundary or decide what it encloses.

10. ⏳ **PARTLY DONE — Widen selection to a `RecordRef`.** `CompanyWorld` now accepts and
    forwards `onSelectRecord`, and `/design/floor` consumes it, so the mechanism is visible
    there. Still open: `CompanyWorkspace` on the product surface tracks a bare `focusedId`
    string, so clicking a pylon on the home page still selects only the island. Original note: `DomainIsland` now resolves a click to the exact
    record under the cursor — a workflow, a decision, an exception, an agent — and calls
    `onSelectRecord(ref)`. Nothing consumes it yet: `CompanyWorkspace` tracks a `focusedId`
    string and does `domains.find((d) => d.id === focusedId)`, so a click on a gate pylon
    still selects only the island. The change is to carry `{ type, id }` instead of a bare
    id and resolve it against the matching collection. Until then the mechanism is proven
    (`npm run check:picks`) but not visible.

    **Before implementing:** this session checked `CompanyWorkspace.tsx` and found it
    already modified in the shared working tree under Codex's active cockpit-production
    claim as of 2026-09-14 — confirm on pickup whether this is already addressed there
    before writing a second fix. If not, research how the current `CockpitShell`/
    `CommandCenter` state pattern (whichever ships from request 24) represents selection,
    rather than bolting a `RecordRef` onto the older `focusedId` pattern this note
    describes — the two may need to converge on one selection model, not two.

11. ✅ **DONE — Collapse the third palette in `app/globals.css`.** Its `:root` hand-declared
    eleven hexes and the whole `--fs-*` scale while the docs claimed one definition existed.
   Five of the eleven were never referenced once. The six that were used are now aliases
   onto `lib/tokens`, verified in-browser as resolving to identical values.

12. ✅ **DONE (UI shell) — Release or implement the fixed cockpit shell before adding more page content.**
   *Implemented directly in the real `AppShell`/`Rail`/`TopBar`, not the standalone prototype.
   `.mirror` is now `height:100dvh;display:grid;grid-template-columns:226px minmax(0,1fr);
   overflow:hidden` — the document never scrolls. `.rail` sits in the grid column instead of
   `position:fixed`. `.main` is a two-row grid (`TopBar` / `.stage`), and `.stage` is the one
   thing that scrolls (`overflow-y:auto;overflow-x:auto;min-width:0;min-height:0`). Verified
   with real layout measurement (CDP `Runtime.evaluate`, not a screenshot guess):
   `docScrollW === innerWidth` and `.stage.scrollWidth === .stage.clientWidth` at a forced
   375px viewport. The canonical wordmark is NOT done — this session has no Drive access to
   fetch `innerflect_favicon_512.png` from `innerflect_logo_pack`; `.mirror-glyph` stays as a
   placeholder until someone supplies the file. A reviewable proof of the contract now lives
   at `/design/shell`, built from the real `AppShell` component — not a description of it.*

   Original request:

12. **Release or implement the fixed cockpit shell before adding more page content.** The
   user has asked Codex to build this, but `app/**` and `components/company/**` remain
   claimed by the UI-shell session while that session is marked idle. Required result:
   preserve the existing left rail and top command bar as one shared `AppShell`, replace
   the invented three-bar `.mirror-glyph` with the canonical
   `innerflect_favicon_512.png` from Drive folder `innerflect_logo_pack`, and provide an
   empty content viewport that always fits inside `100dvh` without document scrolling.
   Use CSS Grid for the invariant frame (`rail / minmax(0,1fr)` and
   `topbar / minmax(0,1fr)`); use `react-resizable-panels` 4.x only for user-resizable
   inspector splits inside that viewport, not for the rail or top bar. The shell needs
   compact-height and narrow-width modes, `min-width: 0`, `min-height: 0`, overflow
   containment, keyboard focus, and reduced-motion support. Please either implement this
   request or release `app/**` and `components/company/**` so Codex can claim and build it
   without another concurrent-write collision.

13. **Build the visual-language laboratory at `/design/lab`.** The user approved the unified
   2D/3D language and explicitly asked for a separate place to drag, connect and test it. This
   is not another product workflow editor and not a replacement for `/design/floor`.

   The three design routes have distinct jobs:

   | Route | Proves |
   |---|---|
   | `/design/elements` | vocabulary — every element alone, paired in 2D and 3D, in every state |
   | `/design/floor` | reality — the production CompanyWorld from real records and real picking |
   | `/design/lab` | grammar — elements can be composed, connected and inspected without drift |

   The lab is correct when:

   1. One in-memory test graph drives both projections. Toggling 2D/3D preserves every id,
      position, connection, state, selection and inspector value.
   2. The palette is generated from `ELEMENTS` and grouped by `family`; it does not duplicate
      ids, labels, colours or icons.
   3. Drag/drop obeys `composition`: nodes go on the path; actors/tools/knowledge attach to a
      step; Record Token and Action Pulse go on an edge; Risk Hotspot overlays a node;
      Permission Boundary encloses a scope. Invalid placement is rejected with a plain reason.
   4. Connections are made through visible input/output ports. Decisions may branch; ordinary
      steps may not silently create branches. The canonical seven-stage spine is validated,
      not automatically fabricated.
   5. Selecting anything opens the same compact inspector contract: stable id + record type,
      state, composition role, `drivenBy`, incoming/outgoing links and attached objects.
   6. State changes recolour both projections from the shared tokens. Human Glyph remains
      completely grey under every state.
   7. The lab supports pan, zoom, move, connect, reconnect, delete, reset, undo/redo and
      keyboard operation. A drag is not interpreted as a click.
   8. Test fixtures are explicitly design-only draft records. Nothing in the lab writes to
      product data or presents representative mock figures as company truth.
   9. Mobile receives the 2D projection and never creates WebGL. Reduced motion stops pulses.
      Paused 3D issues zero draw calls; the populated reference graph stays below 120 calls and
      200k triangles.

   The 3D/design session owns the laboratory component under
   `components/company-world/design/**`. The UI-shell session owns the minimal route under
   `app/design/lab/page.tsx`. Do not add a canvas library before proving the interactions above
   cannot be met with the existing stack; a library choice is an implementation decision, not
   part of the product contract.

    **Before implementing:** the existing text below already says not to add a canvas
    library before proving the interactions can't be met with the existing stack — treat
    that as a research requirement, not a formality. Before writing any drag/connect code,
    check current (2026, not training-data-vintage) practice for: (a) whether a
    zero-dependency approach (native pointer events + SVG/Canvas, the same pattern
    `EcosystemBoard.tsx`'s pan surface already uses) still holds up for undo/redo and
    keyboard reordering at this graph's likely size, or whether a maintained library has
    since become the pragmatic default; (b) accessible drag-and-drop patterns for a
    node-and-port graph specifically — most drag libraries assume list reordering, not
    typed ports with validation, and get this wrong; (c) whichever selection/state pattern
    request 24's Command Centre ships with, so the lab doesn't invent a third one. Record
    the finding in `docs/DECISIONS.md` before writing the component, not after — this repo's
    own history (V2.1, the three-palette collapse) is entirely instances of skipping that
    step and re-deriving the same answer later at higher cost.

    **Research done, progress made (this session, 2026-09-14).** Findings and full
    reasoning in `docs/DECISIONS.md`: build on `@xyflow/react` (MIT, ~15kB), not a custom
    canvas — it has purpose-built keyboard/screen-reader support this criterion set
    requires, which a hand-rolled pointer-events canvas would have to re-implement from
    scratch. Built and verified without needing that dependency yet:
    `lib/design/composition.ts` (`validatePlacement()` enforces exactly the rule this
    criterion states, `paletteByFamily()` + `validatePalette()` satisfy criterion 2) and
    `scripts/check-composition.ts` (25 checks, green, run manually pending a
    `check:composition` entry in `npm run check` — `package.json` is claimed elsewhere).
    Still open: the actual `@xyflow/react` dependency and the canvas component that calls
    these functions. Whoever adds the dependency should wire the canvas directly against
    `validatePlacement()` rather than re-deriving the rule inside a node-type component.

14. ✅ **DONE — Record the V2.1 composition decision in `docs/DECISIONS.md`.** That file is currently
   claimed by the 3D/design session, so this pass did not race it. Add a newest-first entry
   stating: the fifteen semantics remain fixed; all geometry was rebuilt as composable pieces;
   `ElementSymbol2D` is the one lightweight projection; Permission Boundary's style unit is
   fixed while record-driven extent is procedural; and Elements / Floor / Lab prove vocabulary
   / reality / grammar respectively. Rules out independent 2D icon catalogues, free-standing
   attachment sculptures and a generic unconstrained node canvas.

15. ✅ **DONE (UI shell, `a11d85f`) — Remove the obsolete ElementSheet rules from `app/design/design.css` after V2.1 lands.**
   `ElementSheet.module.css` now travels with the shared component, while the old global
   `.sheet*`, `.seg`, `.ghost` and `.eyebrow` selectors describe the retired one-projection
   layout and no longer match its markup. Keep the `.floor-*` rules used by `/design/floor`.
   Verify `/design/elements` is unchanged after removal and `/design/floor` still fills the
   viewport. This is dead-code cleanup, not a visual redesign.


16. ✅ **DONE — Registry-driven ecosystem index.** `lib/design/ecosystem.ts` holds
    `ECOSYSTEM_NODES` (20), `ECOSYSTEM_RELATIONS` (27) and `ECOSYSTEM_PAGES` (18), with
    `validateRegistry()` enforcing no duplicate ids/hrefs, every relation labelled, and now
    (this session) a standing gate rather than a function nobody called:
    `scripts/check-ecosystem-registry.ts` — verified all 27 relations resolve to real
    nodes and every `state: 'live'` page has its route file on disk. Not yet wired into
    `npm run check` (`package.json` claimed elsewhere). `EcosystemBoard.tsx` renders it at
    `/design/ecosystem` (request 17).

17. ✅ **DONE — Ecosystem route and page catalogue.** `app/design/ecosystem/page.tsx`
    exists, verified returning 200, and renders the real `EcosystemBoard`. The registry's
    `ecosystem-design` entry reads `state: 'live'` (request 22, closed).

18. **Typed bidirectional writes.** Board edits remain draft proposals until the authenticated
    operation path validates and records them in canonical state. The same operation contract
    must be usable by humans and agents; local browser state cannot win over a newer revision.

    **Before implementing:** this is unowned — no session has claimed it, and it is the one
    request here that touches real authentication, authorization and write-durability, none
    of which exist anywhere in this repo yet (everything today is read-only mock data).
    Whoever picks this up should research, not assume: current best practice for an
    authenticated typed-operation write path on this stack specifically — Cloudflare
    Workers via `vinext` (React 19 RSC), which constrains the options (e.g. Workers' own
    binding model for KV/D1/Durable Objects vs. an external API, session handling without
    Node-only middleware). Check what's *current* for this stack combination rather than a
    generic Next.js auth pattern, since vinext is a beta compatibility layer and generic
    guidance may not transfer. Also research: how the "human and agent use the same typed
    operation" invariant (AGENTS.md, PRODUCT_STRUCTURE.md) is usually implemented elsewhere
    — a single command/operation bus both a UI action and an agent call go through — before
    designing a bespoke one. This is the highest-risk request in this file; do not start
    writing code before that research is written down in `docs/DECISIONS.md`.

19. ✅ **DONE, standing — Coordination contract.** Not a one-time deliverable: AGENTS.md's
    authority chain, this file's Ownership section (with the 2026-09-14 tie-break rule) and
    the numbered-request list are the mechanism, kept current by every session's own edits.
    Marked done because the mechanism exists and works — evidenced by requests 20–23
    closing through it this week — not because coordination is ever "finished".

20. ✅ **DONE — ecosystem board keyboard navigation.** The pan surface now wires
    `onKeyDown={onPanKeyDown}`, matching its accessible label: arrow keys pan, plus and
    minus zoom, and zero returns to the fitted view.

21. ✅ **DONE — Root repository scope — update `AGENTS.md` and add a root `README.md`.** The first
    screen a human or agent reads must say: *This repository is the source and coordination
    environment for the full Innerflect ecosystem: Mirror, Open Mirror, OS Shop, Forge
    Shop, Studio, Admin, shared engines, infrastructure and design system.* Mirror remains
    the operational core; the repository is not Mirror-only. Point readers to
    `PRODUCT_STRUCTURE.md` for the product/deployment boundary and
    `lib/design/ecosystem.ts` for the executable index. Append the same repository/deployment
    boundary as the newest entry in `docs/DECISIONS.md`; it rules out a Mirror-only source
    repository and duplicated product truths. Acceptance: a new contributor can
    identify every product, audience, entry point, access boundary and source of truth from
    the root without recovering a chat transcript.

22. ✅ **DONE (this session) — Flip `ecosystem-design` to `live` in
    `lib/design/ecosystem.ts`.** Verified first — `curl localhost:3000/design/ecosystem`
    returns 200 and the route renders the real `EcosystemBoard`. `lib/design/ecosystem.ts`
    was not under any active claim (Codex's current claim row lists specific `components/company/*`
    files, `lib/{operations,store}/**` and a short app/** list — not `lib/design/**`), so
    the tie-break rule's static default applied. Closes request 17 fully.

24. **Ecosystem Command Centre, journey catalogue and production-readiness gates.** The
    standalone cockpit proved the interaction, but it is retired and must not become a second
    implementation. Build this in the production shell from the shared ecosystem registry and
    typed operations. This crosses `docs/**`, `app/**`, `components/company/**`, tests and
    infrastructure; owning sessions should land it in reviewable phases.

    **Before implementing further:** Codex has claimed this and is actively building it
    (`docs/STATUS.md`, 2026-09-14) — confirm current progress there before adding to this
    note. Whoever continues it should research current patterns for a typed command
    palette (the `cmdk`/Radix combination already in `package.json` suggests this is
    underway) against real accessibility and keyboard-navigation guidance, not just visual
    parity with the retired standalone cockpit prototype — the whole point of retiring that
    prototype was that a page can only assert alignment, and a Command Centre inherits that
    same risk if built to look right rather than researched to work right for screen readers
    and keyboard-only operation.

    **Canonical artifacts**

    - Add `docs/PRODUCT_READINESS.md` as the execution contract for journeys, acceptance,
      observability and release gates. It references product meaning in
      `PRODUCT_STRUCTURE.md` and routes in `ECOSYSTEM_PAGES`; it does not redefine either.
    - Register every real Command Centre destination in `ECOSYSTEM_PAGES` before exposure.
    - Add one typed command catalogue (suggested `lib/operations/commands.ts`) with stable id,
      intent, required capability, destination or typed operation, availability predicate,
      keywords and audit policy. UI and agents consume it; no component-local duplicate list.
    - Add the production Command Centre under the real shared shell (suggested
      `components/company/CommandCenter.tsx`). It projects the catalogue and never writes
      canonical state directly.
    - Add Playwright journeys under `tests/e2e/command-centre/`, catalogue contract tests,
      accessibility checks, ecosystem route coverage, and a root `CHANGELOG.md` with
      Unreleased plus Added / Changed / Deprecated / Removed / Fixed / Security sections.

    **Required Command Centre journeys**

    | ID | Journey | Ordered steps | Observable completion |
    |---|---|---|---|
    | CMD-01 | Open and dismiss | Any page → `⌘/Ctrl+K` → focus search → Escape or scrim | One modal; inert background; focus restored; no state change |
    | CMD-02 | Keyboard discovery | Open → Arrow Up/Down → active descendant follows → Enter | Visible and announced selection; no focus loss |
    | CMD-03 | Search and aliases | Type page, record, operation or natural-language alias → rank exact intent then availability | Stable result ids and deterministic order |
    | CMD-04 | In-product navigation | Choose a registered page → preserve permitted company context → navigate | URL exists in `ECOSYSTEM_PAGES`; title and focus update |
    | CMD-05 | Cross-product navigation | Search Open Mirror, Shops, Mirror, Studio or Admin → show access boundary → open allowed destination | Product context survives only where authorised |
    | CMD-06 | Change scope | Choose company/domain → validate membership and access → apply shared scope | Every projection uses the same scoped records |
    | CMD-07 | Open a record | Search type/id/name → show type, state and domain → open inspector | HTML, 2D and 3D resolve the same `RecordRef` |
    | CMD-08 | Safe operation | Select action → show target/effect/reversibility → invoke typed operation → verify | Operation, actor, authority, event and audit ids recorded |
    | CMD-09 | Governed operation | Select privileged/irreversible action → policy/evidence → approval, modification or rejection → execute if authorised | No bypass; approval and effect share a correlation id |
    | CMD-10 | Ask the company | Ask → retrieve permitted evidence → answer with sources, freshness and confidence → open cited record | Every material claim resolves to evidence |
    | CMD-11 | Unavailable command | Search action lacking role, integration, data or route → disabled result with exact reason and next step | No dead click or hidden permission failure |
    | CMD-12 | No results | Enter unmatched text → recovery suggestions and available scopes | Actionable, announced empty state |
    | CMD-13 | Slow/offline | Start remote action → progress → timeout/offline → retry or cancel idempotently | No duplicate effect; retry keeps correlation id |
    | CMD-14 | Concurrent revision | Open result → canonical record changes elsewhere → act → detect stale revision → refresh and reconfirm | Browser/local state never overwrites canonical state |
    | CMD-15 | Partial failure | Effect succeeds but verification/audit export is delayed → honest pending state → asynchronous reconciliation | Never report success before required proof exists |
    | CMD-16 | Responsive/assistive | Repeat CMD-01–12 on desktop/tablet/mobile, keyboard, screen reader and reduced motion | Equivalent capability; mobile creates no WebGL context |
    | CMD-17 | Session/tenant boundary | Change account/company or expire session while open → invalidate results → re-authorise safely | No cross-tenant result, cache or telemetry leakage |
    | CMD-18 | Agent parity | Agent discovers and invokes the same command/operation → policy → effect → UI event/audit | Human and agent paths differ only by actor identity |

    **Whole-ecosystem journey groups for `docs/PRODUCT_READINESS.md`**

    1. Identity: sign in/out, invitation, role change, session expiry, company switch and
       tenant isolation.
    2. Self-builder: Open Mirror → connect → reconstruct → review → OS Shop pattern → Forge
       open component → apply through a typed operation.
    3. Managed client: Studio engagement → evidence/approval → Forge capability → publish
       operating change → observe in Mirror → verify outcome.
    4. Innerflect operator: Admin client/integration governance → safe intervention → audit →
       client-visible state without internal-only leakage.
    5. Mirror operator: Company health → domain → workflow/execution → record → decision →
       action → verification → outcome.
    6. Builder: reconstruct → propose → validate canonical spine → simulate → compare →
       approve → publish version → rollback or supersede.
    7. Approvals: receive → evidence/policy/history → approve, modify, decline or simulate →
       record authority → verify downstream effect.
    8. Knowledge: ingest evidence → candidate knowledge → resolve conflict → assign
       owner/trust/freshness → use → reverify or retire.
    9. Agent lifecycle: register → scoped capability → evaluate → supervise → run →
       pause/revoke → audit each operation.
    10. Failure/recovery: integration degradation, stale data, backlog, unsafe action,
        provider outage, partial effect, retry, compensation and escalation.

    **E2E and contract acceptance**

    - Run every CMD id in Chromium, WebKit and Firefox with desktop and mobile projects;
      CMD-01/02/11/12/16 are accessibility-blocking.
    - Use role/name locators and auto-retrying web assertions; no sleeps, coordinate clicks or
      assertions against implementation-only classes.
    - Every mutation asserts operation schema, authorisation, idempotency key, canonical
      revision, event, verification, audit record and user-visible result.
    - Contract-test that destinations exist in `ECOSYSTEM_PAGES`, operation ids exist in the
      typed catalogue, disabled commands give reasons, and products have no private duplicate
      command lists.
    - Use visual snapshots only for invariant shell/dialog states. Run axe and ARIA snapshots
      for dialog, combobox, listbox, groups, options, empty, loading and error states.
    - CI gates: typecheck, lint, the existing six conformance checks, unit/contract tests, E2E
      smoke per PR, full cross-browser suite before release, build, dependency/secret scans,
      migration validation and changelog presence.

    **Error and observability contract**

    - One structured error envelope: stable code, safe user message, retryability, operation
      id, correlation id, trace id, product, page, pseudonymous tenant/company id, actor kind,
      `RecordRef`, timestamp and cause chain. Never log prompts, source documents, credentials,
      customer data or raw provider payloads by default.
    - Error classes: validation, authentication, authorisation, stale revision, dependency,
      timeout, rate limit, unavailable, invariant violation, unsafe/blocked, partial effect and
      unknown. Each maps to one user treatment and one operator severity.
    - Browser boundaries capture `error`, `unhandledrejection`, route/render failures and
      WebGL fallback; server boundaries capture request/job failures. Record once at the owning
      boundary, then correlate rather than duplicate.
    - Emit OpenTelemetry-compatible traces, metrics and structured logs. Trace command → policy
      → operation → effect → event → verification → outcome across queues and agents.
    - Minimum metrics: command open/search/no-result/selection/latency/failure by stable id;
      operation success/failure/retry/compensation; policy denials; approval age; stale
      conflicts; verification delay; integration freshness; Web Vitals; WebGL fallback and
      draw-call budget breaches. Never put high-cardinality text in metric labels.
    - Alerts follow user-impacting SLOs, each with owner, runbook, threshold, deduplication key
      and recovery signal; raw exception volume alone does not page.

    **Release discipline and landing order**

    - Local → preview → staging → production with schema-compatible test data. Every release
      has migration/rollback, feature-flag policy, compatibility window, changelog, owner,
      verification query and runbook.
    - Production-ready means: all blocking journeys green; no critical accessibility,
      security or isolation issue; observability proven by forced failure; rollback/restore
      rehearsed; performance budgets met; canonical data survives refresh, device and actor.
    - Land in order: (1) readiness document and command schema; (2) read-only navigation/search;
      (3) record search/access predicates; (4) typed safe operations; (5) governed operations;
      (6) observability/failure injection; (7) cross-product journeys and release gates.
      Do not expose a command before its journey, error behaviour, telemetry policy and E2E
      acceptance are named.

26. **Deploy the production surface.** (Narrower and more immediate than request 25's
    "Production platform" layer — this is the one concrete blocker sitting in front of it:
    nobody can exercise the golden slice PROD-01 describes without a live deploy target.)
    Raised in conversation, not previously written down —
    per this file's own rule, that means it did not exist as a request until now. Nobody has
    deployed anything from this repo: there is no committed `wrangler.json`/`wrangler.toml`
    at the root (only a build-time-generated `dist/server/wrangler.json` referenced from
    `npm run start`), and no session's environment has Cloudflare credentials. This is
    infrastructure access, not a code change — it needs the user to either provide Cloudflare
    account access to a session, or run the deploy themselves.

    **Before implementing:** whoever gets credentials should research current (not
    training-data-vintage) Cloudflare Workers deployment practice for this exact stack —
    `vinext` is a beta Next-compatible RSC-on-Workers compatibility layer, pinned at
    `1.0.0-beta.5` deliberately (see `docs/DECISIONS.md`, the vinext advisory finding), and
    generic Next.js-on-Cloudflare guidance may already be stale against it or assume a
    different adapter entirely. Confirm current, not remembered: (a) whether `vinext`'s own
    docs/changelog describe a supported `wrangler.json` shape for this version line, since a
    guessed config is worse than no config; (b) whether the repo's public-repo, no-secrets
    rule means deploy should go through GitHub Actions with repo secrets rather than a local
    `wrangler deploy`, so credentials never touch a session's environment or shell history;
    (c) current Cloudflare Workers limits and pricing for this workload (WebGL asset sizes,
    the GLB kit, draw-call/asset-serving pattern) before assuming the free tier suffices.
    Do not write a `wrangler.json` from memory of an older `vinext`/Workers pairing — verify
    against what the pinned version actually expects, first.

27. **Two accessibility research findings, filed against `docs/DECISIONS.md`, not applied
    as code.** Following request 24's and 13's own "research current practice before
    implementing" instruction:

    - **`Command.Input` (cmdk `1.1.1`) cannot carry a working `aria-activedescendant`** —
      verified against the installed source, not just cited. Recommended fix is an
      independent `aria-live="polite"` status region driven from `useCommandState`, not a
      prop override (the library discards one). For whoever continues
      `components/company/CommandCenter.tsx`.
    - **The world's HTML equivalent stops at domain level.** Request 10's `RecordRef` pick
      is only reachable by a pointer click on the 3D canvas — no keyboard/screen-reader path
      reaches a specific pylon, agent or workflow, only the domain it sits on. Checked
      `@react-three/a11y` (pmndrs, actively maintained, peer-deps already satisfied) as a
      possible fit without prescribing it — the call is between extending the existing
      hand-rolled HTML-button pattern or adopting the library, and needs working code in
      front of whoever decides, not this note alone.

      **Progress (this session, 2026-09-14).** Built the non-visual half without adding
      `@react-three/a11y` — consistent with `PRODUCT_STRUCTURE.md`'s standing preference
      against a half-installed library, and it needs no `package.json` edit, which is
      blocked today anyway. `components/company-world/assets/pickableRecords.ts` exports
      `listPickableRecords(domain, records)`: every workflow/agent/decision/exception a
      domain's island draws, as `{ ref, label }`, derived from the same `Domain.workflows`,
      `Domain.agents` and `worldRecords` maps the geometry builder reads — not a second,
      independently-authored list. `scripts/check-pickable-records.ts` proves this by
      construction: every listed ref is cross-checked against the real pick tables
      `buildIslandGeometry`/`buildAgentGeometry` produce (17 checks, green) — the accessible
      list cannot silently name a record the pointer path can't also reach, or vice versa.

      **✅ CLOSED (2026-09-14, toolchain + a11y session).** `CompanyWorkspace.tsx` now calls
      `listPickableRecords()` for every domain and renders a `.record-controls` fieldset —
      52 buttons across the four domains, one per workflow, decision, exception and agent the
      islands actually draw. Each activates `selectRecord()`, which sets `pickedRef` and frames
      that record's own domain, landing in the same state a 3D click produces (`DomainIsland`
      fires `onSelectRecord` then `onSelect`); it sets focus rather than toggling it, so
      re-activating a record cannot unframe the domain it lives on.

      Visually hidden until `:focus-within`, then revealed above the domain pills — the composed
      scene is the product, and 52 permanently visible buttons would be a second, worse
      navigation on top of it; a sighted keyboard user still sees what they tabbed into rather
      than driving an invisible list. Two things worth knowing for anyone touching it:
      `jsx-a11y(prefer-tag-over-role)` rejects `<div role="group">`, so the per-domain groups
      are nested `<fieldset>`s with `sr-only` legends; and `<fieldset>` has a default
      `min-inline-size:min-content` that silently overrode `width:1px` and left an 89px sliver
      visible — fixed with `min-inline-size:0`, the same fix `app/globals.css:46` already
      applies to `.segmented` and `.domain-controls` for exactly this quirk.

      Verified in the running dev server, not just typechecked: 52 buttons in 4 groups, hidden
      state a true 1×1, revealed state 760×327 sitting above the domain pills and inside the
      viewport, and activation setting `aria-pressed="true"`. `npm run check` green (six gates).

    Full detail, sources and exact remediation are in `docs/DECISIONS.md` (both entries
    dated 2026-09-14) — not duplicated here per this file's own rule against a second
    source of truth.

23. ✅ **DONE — `healthy` merged into `active` in `SceneState`.** The user
    decided this directly: the two states shared one user-facing word ("Healthy" in
    `stateLabel`) and existed as a distinction nowhere a person could see it. `active`
    survives as the key because its colour (`#55cbbb`/`#43cec1`) is the one
    PRODUCT_STRUCTURE.md's visual grammar already documents as canonical; `healthy` does
    not. Done in this session's owned files: `lib/model/state.ts`, `lib/tokens/source/state.ts`,
    `components/company-world/tokens/sceneStates.ts`, `data/company.ts`, `data/mirror.ts`,
    `data/decisions-queue.ts`. `PRODUCT_STRUCTURE.md`'s visual-grammar line ("Scene states are
    `neutral · healthy · active · attention · critical`") updated to drop `healthy`. Full
    reasoning is the comment above `SceneState` in `lib/model/state.ts`.

    Three call sites outside this session's ownership now fail `tsc` with the type narrowed —
    exact diffs, each a pure deletion of a now-redundant branch (the `active` and `healthy`
    cases were already identical or overlapping in all three):

    ```diff
    // components/company/Hero.tsx — companyHeadline record
      neutral: { top: 'Company being observed', lines: ['Your company is', 'being observed.'] },
    - healthy: { top: 'Company operating normally', lines: ['Your company is', 'operating normally.'] },
      active: { top: 'Company operating normally', lines: ['Your company is', 'operating normally.'] },
    ```

    ```diff
    // components/company/DomainInspector.tsx — pill derivation
      const pill =
    -   domain.state === 'active' || domain.state === 'healthy'
    +   domain.state === 'active'
          ? 'auto'
    ```

    ```diff
    // components/company-world/design/ElementSheet.tsx — STATES array
      const STATES: SceneState[] = [
        'neutral',
    -   'healthy',
        'active',
        'attention',
        'critical',
      ];
    ```

    `npm run check`'s `tsc` gate is red on the current tip until these three land — that is
    deliberate: the type change is the enforcement mechanism, not a note asking someone to
    remember. Filed rather than applied because two are in `components/company/**`
    (UI-shell) and one is in `components/company-world/design/**` (Codex's active claim).


25. **Whole-environment architecture SSOT and continuous audit — all sessions.** The
    repository must expose the whole Innerflect production system, not only its routes or
    Mirror visuals. The architecture view must say what exists, what is an honest placeholder,
    and what is still missing; a route or attractive screen is not evidence of production
    readiness.

    **Current audited baseline (2026-09-14).** Mirror surfaces, fixture records, the shared
    2D/3D language, the ecosystem registry/board and Cloudflare-compatible frontend build
    exist. At filing time the committed tree has no production identity/tenant boundary,
    persistence schema or migrations, repository/API layer, connector ingestion/webhooks,
    durable jobs/queues/retries, end-to-end operation effects, observability pipeline, CI, or
    proven backup/restore path. Operational figures are fixture-backed. Keep this baseline
    updated from source evidence; do not preserve a stale assessment after a capability lands.

    **One architecture, shown in six layers**

    | Layer | Must cover |
    |---|---|
    | People and journeys | self-builder, managed client, Innerflect operator, human and agent actors |
    | Products and entry points | Open Mirror, OS Shop, Forge Shop, Mirror, Studio, Admin, Innerflect's own Mirror |
    | Experience | shared shell and Command Centre, accessible 2D, semantic 3D, inspectors, design Elements/Floor/Lab |
    | Operating core | company graph, workflow definition/execution, knowledge/evidence, policy/authority/approval, typed operations, agents, verification/outcomes/audit |
    | Data and integrations | identity/tenancy, connectors, ingestion/deduplication, event and relational stores, object/search storage, jobs/queues, notifications |
    | Production platform | environments/deployment, secrets/config, security/privacy, observability/SLOs, billing/entitlements, testing, migrations/rollback/restore |

    One machine-readable registry is the source for the ecosystem board, architecture
    documentation and conformance checks. Each architecture node needs a stable id, kind,
    product/scope, audience and access boundary, owner/source path, dependencies, and evidence.
    Track three independent axes so placeholders cannot masquerade as finished work:

    - implementation: missing · placeholder · functional · retired;
    - data: fixture · sandbox · production;
    - readiness: prototype · internal alpha · private beta · production.

    Names, paths, layouts and visual forms are working placeholders and should become simpler,
    clearer and more coherent as they are tested. The stable contract is the audience, intent,
    access boundary, record identity, typed operation, authority, evidence and outcome. A board
    edit is only a draft until an authenticated typed operation changes canonical source and
    produces an event; the board never becomes a second database.

    **Golden production slice (PROD-01).** Prove the architecture vertically before building
    every surface horizontally:

    `invite/authenticate → authorised company scope → connect one low-risk source →
    ingest/deduplicate event → persistent RecordRef → reconstruct/correct workflow →
    typed action → policy/approval → idempotent effect → event → verification → outcome/audit`.

    The same ids must resolve in Mirror HTML, 2D and 3D and in permitted Studio/Admin views.
    The slice must survive refresh, a second device, retry, concurrent edit, session expiry,
    provider timeout and attempted cross-tenant access.

    **Continuous audit routine**

    - Per coherent commit, fast gate: type/lint and existing conformance checks; architecture
      registry ↔ real route/source parity; no unregistered exposed route; no production claim
      without evidence; no direct fixture import in a production adapter; every mutation and
      selectable visual resolves to a registered operation or `RecordRef`.
    - Nightly once CI exists: PROD-01, tenant/role isolation, dependency and secret scanning,
      accessibility, mobile/no-WebGL parity, failure/retry behavior, and visual/performance
      budgets.
    - Before a release: full browser/device journeys, migration and rollback, backup/restore,
      forced-failure observability, security/privacy review and SLO/runbook proof.
    - Architecture review: remove retired paths and duplicate truths; update status from code,
      tests and telemetry. Generate the board/report rather than manually redrawing it.

    **Linear delivery and ownership.** First restore a green branch, then land the registry and
    gates, then the minimum identity/tenant/data/operation spine, then PROD-01, then project
    that spine into the remaining products, then harden for release. Codex/foundation owns
    contracts and production plumbing; UI owns accessible product projections; 3D/design owns
    semantic spatial projection. Each agent takes one bounded slice at a time and leaves a
    five-bullet maximum handoff. Visual refinement can continue over honest placeholders, but
    “looks complete” never advances either the data or readiness axis.

    **Acceptance.** A new contributor can open one index, distinguish present/placeholder/
    missing at a glance, follow any node to its source, tests and owner, and trace PROD-01
    across every layer. Adding or removing a registered product, page, operation, store or
    integration updates the board and generated architecture automatically or fails the
    audit with an actionable diff. The fast audit belongs in the root check and CI; the full
    audit belongs at release gates. The in-flight `docs/PRODUCT_READINESS.md` work should
    reference this architecture instead of creating a competing catalogue.

## Semantic review for the next element pass

The ten V1 GLBs are present and their geometry is unchanged from the imported kit. The
token root, generated glyph ids, exhaustive material-role contract and typed conformance
layer now exist around them. The conformance layer is not yet used by the home render path.

### Existing elements that need semantic correction

- **Function Platform → Domain Platform.** It represents one portable operating domain,
  never a department. Its definition must not cite rejected org-chart categories such as
  Support.
- **Knowledge Slab → Knowledge Object.** It represents trusted company knowledge in use.
  A document or file may be evidence for that knowledge, but is not the knowledge object.
- **Decision Gate.** Its existence must be justified by a Decision or Authority record,
  not inferred only from a workflow colour or aggregate state.
- **Risk Hotspot.** Its existence must be justified by an identifiable Risk, Exception,
  Policy Conflict or Unsafe Condition record, not by the aggregate `Domain.openItems`.
- **Agent Glyph.** The glyph represents an Agent record; pose and motion may represent
  `Agent.activity`. Identity and activity must not collapse into one field.
- **Human Glyph.** The complete person remains neutral grey. State belongs to the work
  around the person, never to the person or a decorative accent on them.

These are semantic corrections first. Geometry changes only where the neutral silhouette
fails to communicate the corrected meaning.

### Missing concepts required by Mirror and Builder

- **Step Node** — one concrete step, belonging to one of the seven canonical stages:
  Trigger, Context, Work, Decision, Action, Verification or Outcome.
- **Record Token** — the uniquely identifiable lead, order, project, invoice, ticket or
  other business object moving through one execution.
- **Verification Marker** — the recorded check of an action and its pass/fail result.
- **Outcome Marker** — an observable, traceable business result rather than completed
  activity.
- **Permission Boundary** — the authority limit within which an actor may read, decide or
  act.

Handoffs, historical trails, current progress, selection and movement are behaviours or
compositions of these elements, not additional standalone GLBs unless a later semantic
review proves that shape must carry a distinct meaning.

### Acceptance criteria

The next pass is correct when all of the following are true:

1. Every visible semantic object has a row in this file and resolves to a stable record id
   and record type; clicking the 3D object opens the same record used by the HTML surface.
2. Shape identifies object kind without relying on colour. Colour communicates only state,
   and every human remains neutral grey in every state.
3. Actor kind and control mode can vary independently: a human, AI agent, deterministic
   system or external system can participate under the applicable human-led, assisted,
   supervised, autonomous or blocked mode.
4. A composed workflow can visibly answer: what started it, which record is moving, which
   actor performs each step, which tools and knowledge are used, where authority is needed,
   how the action is verified and which outcome resulted.
5. Decision, risk, verification and outcome objects appear only when their corresponding
   records exist. Aggregate counts may summarise those records but never fabricate them.
6. The seven stage variants read as one family while remaining distinguishable by shape or
   composition; labels remain HTML.
7. `/design/elements` proves every element in isolation and pairs its 2D/3D projections;
   `/design/floor` proves the production world from records; `/design/lab` proves composition,
   connection and projection parity. None reimplements the semantic registry or state tokens.
8. Generated-id, material-role and checksum checks still pass, and the composed floor holds
   the measured performance line rather than merely remaining below the 120-call ceiling.

### Verified: the two `Workflow` types describe entirely different catalogues

Request 7 flagged that `lib/model/work.ts` and `lib/model/domain.ts` declare separate
`Workflow` shapes. Checked, and it is worse than divergent fields — the two carry
**disjoint sets of workflows with zero shared ids**:

| Source | Type | Count | Delivery |
|---|---|---|---|
| `data/work.ts` | rich (`outcome`, `stages`, `steps`, `evidence`…) | 4 | 1 |
| `data/company.ts` | small (`throughput`, `autonomy`, `humans`, `state`) | 38 | 12 |

So the product currently tells two stories about the same company: the Processes surface
lists one Delivery workflow, while the Delivery island renders twelve bays and its label
reads "12 processes". Neither is wrong on its own terms; they are simply not the same
catalogue, and nothing relates them but `domainId`.

This is the same failure as the four palettes — two independently authored truths — and it
should be settled the same way: one canonical workflow identity, with the small world
projection derived from it, exactly as request 7 asks. It needs `data/work.ts` and
`components/company/**`, so it cannot be done from this side alone.

## Ownership

This file is the coordination channel between the sessions working this branch.
Declared here rather than in conversation, because conversation does not survive a
`git pull`.

**Tie-break rule, decided by the user 2026-09-14:** the static assignment below is the
*standing default* for a path nobody has claimed today. A `docs/STATUS.md` active claim
always overrides it for as long as that claim stands — whoever is genuinely doing the work
on a path right now owns it, regardless of which session's name is written below. This was
decided rather than rewriting the static list, because the list would otherwise need
rewriting every time work moves, which is the failure it is meant to prevent. It resolves
the ownership-vs-active-claim conflict that recurred on `Scene.tsx`, `EcosystemBoard.tsx`
and `lib/design/**`: in each case, the `docs/STATUS.md` claim was current and correct, and
the static section below was not.

**Owned by the 3D / design-system session:**

- `components/company-world/**`
- `lib/tokens/**`
- `lib/design/**`
- `lib/model/**`
- `data/**`
- `public/models/**`
- `tools/glyph-kit/**`
- `WORLD_ELEMENTS.md`, `PRODUCT_STRUCTURE.md`

`lib/model/**`, `data/**` and `PRODUCT_STRUCTURE.md` moved here on 2026-09-13. The semantic
review asks for objects justified by records rather than by aggregates, and a 3D layer that
cannot add a record cannot satisfy that. Where a change reaches an HTML surface it is still
raised as a numbered request first.

**Owned by the UI-shell session:** `app/**`, `components/company/**`, and everything
not listed above.

Anything needed in a file this session does not own becomes a numbered request below,
with the exact change spelled out. Request 1 is the pattern that worked.

### Asset provenance

`public/models/innerflect-v2/*.glb` are build artifacts of the glyph kit generator
(`tools/glyph-kit/generate_innerflect_v2.py`), committed because the geometry source of truth is
Python → GLB. `CHECKSUMS.sha256` sits beside them: if a GLB stops matching, someone
hand-edited a binary and the provenance chain is broken. Verify with:

```
cd public/models/innerflect-v2 && shasum -a 256 -c CHECKSUMS.sha256
```

The kit's own colours never reach the screen — `conformGlyph` replaces every material at
load so that state, not the asset, decides colour. What the kit genuinely owns is the
glTF material **name** on each mesh, which is the contract the role map keys on.

## Change discipline

1. Add the field to `lib/model/domain.ts` and the data to `data/company.ts`.
2. Add the row to the object table above.
3. Then draw it.

An object that reaches the screen without a row here is a bug, not a flourish.
