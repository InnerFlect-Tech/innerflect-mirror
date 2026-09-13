# Decision log

Append-only. Newest first. One entry per decision that a future agent would otherwise
reopen, get wrong, or waste time re-deriving.

Keep entries short: what was decided, why, and what it rules out. Link the commit.

---

## 2026-09-13 — Gate pylons stand for Decisions; hotspots stand for Exceptions

**Decided:** a gate pylon is drawn once per `Decision` record whose `workflowId` matches, and
a hotspot once per OPEN `Exception` record. They are separate shapes.

**Why:** both were previously inferred from colour — the pylon from `Workflow.state`, risk from
`Domain.openItems` (a count of workflows in those same colours). Neither could be opened, and
neither could say what was wrong. A decision waiting and an exception open are different facts;
one shape for both is why the world could not tell you which it was.

**Visible consequence, and the proof it is real:** `mk-signal` gains a pylon (it has a real
decision pending) and `fn-revrec` loses one (it has an exception, not a decision).

**Rules out:** any object whose existence is derived from a colour or an aggregate.
`npm run check:records` fails if an aggregate drifts from the records it summarises.
Commit `e79fedf`.

## 2026-09-13 — The merge is kept; picking resolves through a triangle-range table

**Decided:** islands stay merged into two meshes. Clicks resolve by mapping a raycast's
`faceIndex` through `assets/pickTable.ts` back to a `RecordRef`.

**Why:** merging is what holds the scene at 61 draw calls, and it is also why nothing on an
island could be clicked — once merged, a bay, a desk and a pylon are one mesh. Parts are pushed
in a per-workflow loop, so the owning record is known at build time and the range can be
recorded as it goes in. One draw call preserved, per-object picking gained.

**Rules out:** splitting the island into one mesh per object to make it clickable, which was
the obvious fix and would have cost roughly forty draw calls per island. `npm run check:picks`
fails if the table stops covering every triangle exactly once — a gap makes an object
unclickable, an overlap opens the wrong record, and both fail silently.

## 2026-09-13 — One workflow catalogue; the documented set is a view over it

**Decided:** `lib/model/work.ts` holds the one canonical `Workflow`. `data/work.ts` is a VIEW —
`domains.flatMap(d => d.workflows).filter(isDocumented)` — not a second catalogue.

**Why:** there were two `Workflow` types with **disjoint ids** (4 rich records vs 38 small ones)
and incompatible numbers. The Processes surface listed one Delivery workflow while the Delivery
island drew twelve bays labelled "12 processes".

**Also decided:** the four rich records' `autonomy` values were **dropped**, not kept. Each
equalled its DOMAIN's autonomy rather than its own — the Gate 1 record claimed 73 where the
workflow's real figure is 30.

**Rules out:** reading the difference between "12 processes" and "1 documented workflow" as a
bug. It now means how much is mapped, not which file you are reading. Commit `62c13bd`.

## 2026-09-13 — `lib/model` must never import `data`

**Decided:** `defineDomain()` takes a `DomainContext` parameter carrying the detail map and the
exception list. It does not import them.

**Why:** the first attempt had `lib/model/domain.ts` importing `@/data/workflow-detail`. It
typechecked and **failed at runtime** in the RSC environment. The resolution error was the
symptom; the fault was the dependency running backwards. A model that describes shapes must not
depend on the data filling them, or it cannot be pointed at a real integration later.

**Rules out:** any import from `data/` inside `lib/model/`.

## 2026-09-13 — Record identity is derived, not stored

**Decided:** `RecordRef = { type, id }` in `lib/model/record.ts`, produced by typed helpers
(`domainRef`, `workflowRef`, `agentRef`, …) rather than a `recordType` field on every record.

**Why:** ids alone were never identity — `data/mirror.ts` row ids are `market`, `sales`,
`delivery`, `finance`, byte-identical to the `Domain` ids, and a grep for
`recordType|recordId|entityType` returned zero hits repo-wide. Storing the field would have
meant editing 38 workflow and 8 agent literals to carry a value constant per type and already
known at every call site. The helper gives the same guarantee with no data churn.

## 2026-09-13 — ChatGPT's V2 kit is accepted, including work inside this session's zone

**Decided:** `8acb18d` (the fifteen-element V2 glyph kit) stands, though it landed in
`tools/glyph-kit/**`, `public/models/**` and `lib/design/**` — all declared as this session's.

**Why:** it was verified before being built on: all gates pass, `glyphUrl()` correctly
repointed to `/models/innerflect-v2/`, 15/15 checksums verify, renames are right
(`function-platform` → `domain-platform`, `knowledge-slab` → `knowledge-object`), and
`modelled: false` was left honestly on the six without records. Good work that did the planned
geometry; territory is not worth more than the work.

**Still open:** it ships `permission-boundary.glb` despite its own review stating that
boundaries are procedural rather than GLBs. Raised as request 9 rather than resolved
unilaterally, because it is ChatGPT's own rule to amend or apply.

## 2026-09-13 — The semantic gate is passed; the vocabulary is accepted

**Decided:** the corrections, five missing concepts and eight acceptance criteria in
`WORLD_ELEMENTS.md` are accepted, together with the Mirror/Builder product direction, which
is now written into `PRODUCT_STRUCTURE.md`. Geometry work is unblocked.

**Why:** `docs/STATUS.md` carried a hard stop — "Do not change or add GLBs until that
vocabulary is accepted." It has now been reviewed with the user and accepted, in full, in one
pass rather than staged. Recorded here because a gate satisfied in a conversation nobody else
can read is not satisfied at all.

**Rules out:** treating any of those 38 items as still open for negotiation. Reopen one only
with a reason, recorded here.

## 2026-09-13 — `Observed` stays a ladder rung; `blocked` stays a control mode

**Decided:** `AUTONOMY_LADDER` keeps `Human-led → Observed → Assisted → Supervised →
Autonomous` unchanged. Control mode is a separate five-value axis — `human-led, assisted,
supervised, autonomous, blocked` — in the new `lib/model/actor.ts`.

**Why:** the review's invariant listed control modes as "human-led, assisted, supervised,
autonomous and blocked", which drops `Observed` and adds `blocked`, and read like a
contradiction of the contract's ladder. It is not one: the model already had both axes and had
simply conflated them. `StageMode` in `work.ts` was the control axis all along, missing only
`assisted`. So the review's list and the contract's ladder are describing different things and
both survive intact.

**Rules out:** a single "mode" enum. `Observed` is a rung, not a mode; `blocked` is a mode, not
a rung. `PRODUCT_STRUCTURE.md` now says so explicitly under Shared domain model.

## 2026-09-13 — RESOLVED: the human glyph stays fully neutral

**Decided (provisionally):** `ELEMENTS.human-glyph.takesState = false`, so every material
on the figure resolves through the neutral set.

**Why:** a person is not a state. The kit agrees — its figure is built mostly from
`Human Neutral`.

**But:** the manifest shows `human-glyph` also carries `Active Teal` and `Warm White`.
Forcing the whole glyph neutral greys out that teal accent, which the kit author may have
intended as "this person is engaged". So the current rule is slightly blunter than the
asset. Open question for a design pass: keep the figure grey but let the accent follow
state, or keep it fully neutral. Visible on `/design/elements` once that route exists.

**Resolved** by the semantic review in `WORLD_ELEMENTS.md` (commit `03728a8`): "the
complete person remains neutral grey. State belongs to the work around the person, never
to the person or a decorative accent on them." So the accent is dropped on purpose, not
lost by accident. `takesState: false` stands.

**Rules out:** re-adding a state-coloured accent to the figure to signal engagement. If a
person's work needs a state, it belongs on the work.

## 2026-09-13 — ChatGPT gets full write on the shared branch; repo is public

**Decided:** the repo is published publicly and ChatGPT commits directly to
`mirror/core-four-world` alongside the two Claude sessions.

**Why:** the user wants both assistants working from identical context with the lowest
possible friction.

**Rules out:** relying on privacy for anything. No secrets, no customer data, no
credentials in this repo, ever. Also means three writers with no CI, so the protocol in
`AGENTS.md` (rebase, small commits, ownership zones) is load-bearing rather than advisory.

## 2026-09-13 — Geometry regeneration is not byte-reproducible

**Decided:** the committed GLBs in `public/models/innerflect-v1/` are artifacts, not a
cache. Do not regenerate casually and commit the result.

**Why:** regenerating with scipy 1.13.1 leaves the glTF JSON identical for all ten models
but changes geometry — `company-core` and `agent-glyph` by ~2.5 world units on ~40 floats,
`decision-gate` by 2e-16. Almost certainly `ConvexHull` face ordering varying by version.

**Rules out:** treating `CHECKSUMS.sha256` as proof that regeneration reproduces the
artifacts. It proves only that nobody hand-edited a binary. Full detail and the fix
(pin scipy, or a deterministic chamfer) in `tools/glyph-kit/README.md`. Commit `6b15fdb`.

## 2026-09-13 — The design system is routes in the app, not pages beside it

**Decided:** `/design/elements` and `/design/floor` become real routes built from the
same components the product renders. The standalone HTML prototype is retired once they
exist.

**Why:** a prototype page that declared itself "the single source of truth" had already
drifted within days — it had `healthy: #55CBBB` where `lib/tokens/state.ts` has
`healthy.label: #42c8bd` and `active.label: #55cbbb`, collapsing two distinct states onto
one colour. A page can only *assert* alignment. A route that imports the real tokens *is*
alignment: if the import breaks, the build breaks.

**Rules out:** any second implementation of the scene for review purposes.

## 2026-09-13 — Python owns geometry and material names, not colour

**Decided:** the glyph kit's Python generator is the source of truth for geometry and for
the glTF material *name* on each mesh. It is deliberately **not** fed the product palette.

**Why:** the runtime conformance layer replaces every material at load, so the kit's baked
colours never reach the screen. Feeding product tokens backwards would churn checksummed
binaries on every colour tweak for zero rendered difference, and would imply the GLB colour
is the shipped colour — which it is not.

**Rules out:** "fixing" the kit by baking product tokens into `MATERIALS`.

## 2026-09-13 — Transmission is stripped from kit assets at load

**Decided:** the conformance layer replaces `KHR_materials_transmission` with clearcoat
over a dark base.

**Why:** measured — the raw kit renders at **229 draw calls with 19 transmissive objects**;
conformed it is **72 calls, 0 transmissive**. Three renders the entire scene into a
separate target once per transmissive object. The budget is 120.

**Rules out:** using the kit's `r3f/InnerFlectGlyphs.tsx` as the integration path — it
clones raw scenes and carries the full transmission cost.
