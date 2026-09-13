# Mirror — World Elements

Status: active semantic contract
Owner: semantic object layer (`components/company-world/assets`, `nodes/DomainContent.tsx`, `lib/model/domain.ts`, `data/company.ts`)
Last aligned with implementation: 2026-09-13

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

| Object | Represents | Driven by |
|---|---|---|
| Workflow bay | one workflow | one per entry in `Domain.workflows[]` |
| Bay floor plate | the workflow's footprint on the island | constant per bay; grid derived from `workflows.length` |
| Desk | one human seat working that workflow | one per `Workflow.humans` |
| Seated figure | a human role currently at that seat | one per `Workflow.humans` |
| Desk screen | the tooling the seat works through | one per desk |
| Screen glow intensity | how much of that workflow runs itself | `Workflow.autonomy` |
| Throughput column | volume moving through that workflow | height ∝ `Workflow.throughput` |
| Column lit segments | the autonomous share of that volume | `Workflow.autonomy` × column height |
| Partition | boundary between adjacent workflows | derived from the bay grid |
| Gate pylon | a workflow stopped and awaiting a human | present when `Workflow.state` is `attention`/`critical` |
| Standing / moving figure | an agent mid-task | one per `Domain.agents[]`, posed by `Agent.activity` |
| Island signal strip, edges, tints | semantic state | `Domain.state` (existing state layer) |

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
| `openItems` | `count(workflows where state is attention or critical)` |

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

## Requests to the UI-shell session

These sit in files this layer does not own.

1. **`nodes/DomainIsland.tsx`** — `<DomainContent shape={index} …>` passes an
   array position, which is the reason island content could not mean anything.
   Needs to pass the record: `<DomainContent domain={domain} accent={token.edge} />`.
   *(Agreed with the user and applied as a single-line change; no other line in
   that file was touched.)*

2. **Island footprint should encode share of company activity.** The table above
   has no row for footprint because this layer cannot set it — `scale` comes from
   `layouts/companyLayout.ts` and the platform size from `DomainIsland.tsx`, both
   shell-owned. Today scale is a hand-tuned composition value (0.96–1.05).
   `Domain.activeWork` (82 / 146 / 47 / 19) is the field that should drive it, so
   that a busy domain is visibly a bigger place. Suggested:
   `scale = 0.92 + 0.22 * (activeWork / maxActiveWork)`, applied in the layout so
   the curated composition still owns position.

3. **Agent figures need `running` and `reducedMotion` to animate.** The object
   table promises a *moving* figure for an agent mid-task; today they are posed
   by `Agent.activity` but static, with a status mote whose brightness is how
   loudly the activity asks for a person. Animating them properly requires the
   two signals `DomainIsland` already receives, passed down to `DomainContent`,
   so the motion can stop when work is paused or the viewer asked for reduced
   motion. Animating without them would make the scene render continuously and
   break the zero-draw-call idle guarantee, so this layer deliberately did not.


4. **Connection pulses should carry real events.** `connections/Connection.tsx`
   currently pulses on an index-derived `offset`. `data/company.ts` exports
   `feed: FeedEvent[]` with a `domainId`; one pulse per event on that domain's
   path would make motion mean "this happened" rather than "time is passing",
   which is what the contract asks of motion.

5. **A route for the design system.** The element sheet and the floor become real routes
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

6. **Delete tiers 1 and 2 from `app/tokens.css`.** Every one of those 65 declarations is
   now emitted from `lib/tokens/`, verified identical name-for-name and value-for-value by
   `npm run check:tokens` (0 mismatches). They currently exist twice with the same values,
   which is harmless but is exactly the duplication this work removes. Keep tier 3
   (`--panel-*`, `--card-radius`, `--pill-radius`, `--summary-gap`) hand-authored — it is
   per-component plumbing with no TypeScript consumer, and generating it would add a build
   step to values only CSS reads. Keep the file and its header comment; delete the two
   blocks. Run `npm run check` afterwards.

7. **Record the observe → build → verify product loop in `PRODUCT_STRUCTURE.md`.** This is
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

## Ownership

This file is the coordination channel between the two sessions working this branch.
Declared here rather than in conversation, because conversation does not survive a
`git pull`.

**Owned by the 3D / design-system session:**

- `components/company-world/**`
- `lib/tokens/**`
- `lib/design/**`
- `public/models/**`
- `tools/glyph-kit/**`
- `WORLD_ELEMENTS.md`

**Owned by the UI-shell session:** `app/**`, `components/company/**`, and everything
not listed above.

Anything needed in a file this session does not own becomes a numbered request below,
with the exact change spelled out. Request 1 is the pattern that worked.

### Asset provenance

`public/models/innerflect-v1/*.glb` are build artifacts of the glyph kit generator
(`source/generate_innerflect_v1.py`), committed because the geometry source of truth is
Python → GLB. `CHECKSUMS.sha256` sits beside them: if a GLB stops matching, someone
hand-edited a binary and the provenance chain is broken. Verify with:

```
cd public/models/innerflect-v1 && shasum -a 256 -c CHECKSUMS.sha256
```

The kit's own colours never reach the screen — `conformGlyph` replaces every material at
load so that state, not the asset, decides colour. What the kit genuinely owns is the
glTF material **name** on each mesh, which is the contract the role map keys on.

## Change discipline

1. Add the field to `lib/model/domain.ts` and the data to `data/company.ts`.
2. Add the row to the object table above.
3. Then draw it.

An object that reaches the screen without a row here is a bug, not a flourish.
