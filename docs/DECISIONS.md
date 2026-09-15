# Decision log

Append-only. Newest first. One entry per decision that a future agent would otherwise
reopen, get wrong, or waste time re-deriving.

Keep entries short: what was decided, why, and what it rules out. Link the commit.

---

## 2026-09-14 — One record → one element, resolved through the SSOT, not per-surface

**Problem:** `ElementSymbol2D` and the glyph kit existed, but only `/design/elements` and
`/design/lab` used them. Every other surface that wanted to draw an object either had no 2D
projection at all (`/design/floor` was WebGL-only) or would have had to decide for itself
which glyph stands for a decision, an exception, an agent. That is how two projections of the
same company drift into disagreeing about what exists.

**Decided:** one function, `elementForRecord()` in `lib/design/recordElements.ts`, is the only
way a surface resolves a record to an element. Callers never name a glyph id.

**Deliberately partial, and that is the point.** It maps only the record types the world
actually draws: `company`, `domain`, `workflow`, `person`, `agent`, `decision`, `exception`.
`RecordType` has seventeen members and `ELEMENTS` has fifteen elements, but `ELEMENTS` also
carries a `rendered` flag precisely because an element can be fully modelled and still be a
glyph nobody renders — `step-node`, `record-token`, `verification-marker`, `outcome-marker`,
`tool-glyph`, `knowledge-object` and `permission-boundary` are all `rendered: false` today.
Mapping them anyway would let a 2D projection show objects the 3D world has no counterpart
for. `undefined` is a real answer here, and callers render nothing for it.

Three elements name two record types in their own `drivenBy` prose — `decision-gate`
("Decision / Authority"), `action-pulse` ("ExecutionStep / ActivityEvent") and
`permission-boundary` ("AuthorityLimit / RoleGrant"). Choosing which half is canonical is a
product decision, not a rendering one, so only the half the world demonstrably draws is
mapped. `validateRecordElements()` throws if the map ever names an element the registry does
not define, or one marked `rendered: false`.

**Applied:** `/design/floor` now has both projections. The 2D plan (`WorldPlan2D`) draws every
domain and every object on it from `listPickableRecords()` — the same function whose output
`scripts/check-pickable-records.ts` proves against the real 3D pick tables — resolved through
`elementForRecord()`. So the plan and the floor cannot disagree about which objects exist or
which glyph stands for one; neither is free to decide. Verified: 4 domains, 52 record buttons,
exactly the 52 the 3D world draws.

**Rules out:** a surface picking glyph ids directly; a second record→glyph table anywhere;
drawing an object for a record type the world does not render.

## 2026-09-14 — `vinext@1.0.0-beta.9` + `@vitejs/plugin-rsc@0.5.34` verified safe to apply

**Closes the "still needs" item this repo's own dependency-advisory note left open:** "someone
to actually try `vinext@1.0.0-beta.9`, confirm the dev server boots, `npm run check` stays
green, and a real page loads, before touching `package.json`." Done, in an isolated `rsync`
copy of the tree (`/tmp/vinext-probe`), never touching the shared `package.json`/lockfile
`package*.json` owns — that path is Codex's active claim.

**New finding the earlier semver check missed:** `vinext@1.0.0-beta.9` peer-requires
`@vitejs/plugin-rsc@^0.5.34`; this repo is pinned to `0.5.26`. The earlier note ("every
advisory's fix path resolves to `beta.9`, `isSemVerMajor: false`") checked `vinext`'s own
semver only, not its peer requirement — bumping `vinext` alone fails to install at all.
Both packages move together. Checked `@vitejs/plugin-rsc`'s own changelog (`vitejs/vite-plugin-react`,
0.5.28→0.5.34): no breaking changes documented, mostly RSC transform refinements.

**A false alarm worth recording so nobody re-derives it:** the first attempt (delete
`package-lock.json`, fresh `npm install`) hit a real build failure — `@rolldown/binding-darwin-arm64`
failed to `dlopen` (`__TEXT` load command content extends beyond end of file). This looked
like an incompatibility from the bump. It wasn't: a control build on the **unmodified**
repo (exact committed lockfile, `npm ci`) uses the identical `vite@8.0.13` → `rolldown@1.0.1`
→ `@rolldown/binding-darwin-arm64` chain and built clean. Deleting the lockfile let npm
re-resolve the entire dependency graph fresh rather than reuse the verified tree, and
something in that fresh resolution (not identified further — not this investigation's
question) produced a bad native binary on this machine. Repeating the bump the way a real
PR would do it — keep the lockfile, `npm install vinext@1.0.0-beta.9 @vitejs/plugin-rsc@0.5.34`
(2 packages changed, not 71) — built clean on the first try.

**Verified, in the isolated probe:**
- `tsc --noEmit`, `oxlint`, `check:tokens` — clean.
- `npm run build` — succeeds, same five stages, same timing profile as the unmodified
  control build.
- `vinext start` (the actual production server, not dev mode) serving the build: all nine
  routes — `/`, `/mirror`, `/processes`, `/approvals`, `/knowledge`, `/outcomes`, `/settings`,
  `/design/elements`, `/design/floor`, `/design/ecosystem` — return `200` with real rendered
  content (`Mirror · Innerflect` title, hydrated company-state text).
- `npm audit`: 11 advisories → 9 (1 low, 8 high). The `esbuild`/Windows-only advisory and one
  `vite` moderate both cleared; `sharp`, `undici`, `ws`, `react-server-dom-webpack`,
  `miniflare`/`wrangler` remain — unrelated to this pair, tracked separately.
- **Not fully clean:** `npm run check`'s `check:glyphs` step failed in the probe — but only
  because `/tmp/vinext-probe` is an `rsync` copy with no `.git`, and that step's own
  `git diff --exit-code` has nothing to diff against outside a git repo. Artifact of the
  test method, not of the bump; `tsc`/`oxlint`/`check:tokens` already passed by that point,
  and `check:glyphs`/`check:records`/`check:picks` do not touch either bumped package.

**Rules out:** bumping `vinext` without `@vitejs/plugin-rsc` (install fails outright);
re-diagnosing a `rolldown` native-binary load failure as a version-bump incompatibility —
it reproduces on the unmodified repo too when the lockfile is discarded, and is unrelated
to either package. Whoever applies this to the real `package.json`: use `npm install
vinext@1.0.0-beta.9 @vitejs/plugin-rsc@0.5.34` against the existing lockfile, not a fresh
`npm install` after deleting it.

## 2026-09-14 — `/design/lab` canvas: `@xyflow/react`, not a custom SVG canvas

**Researched before writing any component code**, per request 13's own directive. Question:
does the zero-dependency native-pointer-events pattern `EcosystemBoard.tsx` already uses
hold up for a node/port graph with undo/redo and keyboard operation, or has a library become
the pragmatic default since this stack was last touched?

**Found:** React Flow (`@xyflow/react`, MIT, ~15kB gzipped, actively maintained) has
purpose-built accessibility for exactly this shape of UI — Tab moves focus through nodes and
edges, Enter/Space select, arrow keys move a focused node, ARIA roles and descriptions are
generated automatically, and focus-follow keeps the moved node in view. A hand-rolled
SVG/pointer-events canvas gets none of this for free; industry commentary from 2026 frames
pan/zoom/drag/connect/selection/accessibility as "weeks of undifferentiated work" when built
from scratch. Canvas-based renderers only outperform DOM-based ones at roughly
thousands-of-nodes scale — irrelevant here, where the whole registry is fifteen elements.

**Decided:** build `/design/lab` on `@xyflow/react`, not a custom canvas. This reverses the
"do not add a canvas library before proving the interactions cannot be met with the existing
stack" instruction in request 13 — proven now, in the other direction: the existing stack
(native pointer events) cannot meet criterion 7 (full keyboard operation) without
re-implementing what the library already ships, tested, for free.

**Not yet applied:** adding the dependency requires editing `package.json`, which is under
Codex's active claim (`docs/STATUS.md`, 2026-09-14). This session instead built the part of
request 13 that needs no new dependency: `lib/design/composition.ts` (`validatePlacement()`,
`paletteByFamily()`, `validatePalette()`) and `scripts/check-composition.ts`, both verified
green. Whoever adds `@xyflow/react` can wire the canvas directly against these — the
placement rule and the palette are already the composition contract, not something the
canvas component needs to re-derive.

**Rules out:** a hand-rolled SVG/Canvas node editor for `/design/lab`; re-deriving the
composition rules inside a React Flow node-type component instead of calling
`validatePlacement()`.

## 2026-09-14 — RESEARCH: cmdk 1.1.1's `Command.Input` cannot carry a working `aria-activedescendant`

**For whoever continues `components/company/CommandCenter.tsx` (Codex's active claim) —
request 24 asked for current-practice research before building further; this is that
research, not an implementation.**

**Found, verified against the installed source** (`node_modules/cmdk/dist/index.js`, cmdk
`1.1.1`, the exact version pinned in `package.json`), not just cited from search results:

`CommandInput` renders `<input {...consumerProps} aria-activedescendant={selectedItemId} />`
— the consumer's own props are spread first, then the library unconditionally overwrites
`aria-activedescendant` from its internal `selectedItemId` store value. Passing your own
`aria-activedescendant` prop to `Command.Input` is silently discarded; there is no supported
way to override it from outside. Per the ARIA combobox pattern, this attribute is exactly
what tells a screen reader which row is "active" while real focus stays in the input — so a
stale or absent value is not cosmetic, it is the single most load-bearing accessibility wire
in a command palette.

Two concrete defects follow from how `selectedItemId` is populated:
- **Absent on mount.** The root's initial state sets `selectedItemId: undefined`, and it is
  only computed later, inside a scheduled callback that fires on a `"value"` state change.
  Before the first interaction, `aria-activedescendant` is `undefined`, so React omits the
  attribute entirely — a screen-reader user gets no "active option" announcement at all
  until they move the selection once.
  Also: `CommandList`'s wrapping `div[role="listbox"]` receives the same
  `aria-activedescendant` — that attribute belongs on the combobox input per the APG
  pattern, not the listbox; harmless in practice (nothing reads it there) but worth not
  copying if this is ever reimplemented rather than patched around.
- **Stale after filtering.** The recompute reads the DOM for
  `[aria-selected="true"]` via a scheduled (deferred) callback rather than synchronously
  with the filter/search state change, so there is a window where the announced id can name
  a row the visible list no longer shows as selected, or no longer shows at all.

**Recommended remediation — do not fight the library's internal override.** Add an
independent status region beside `Command.Input`, driven from `cmdk`'s own
`useCommandState` (already imported by the library, exported as public API) rather than
from the DOM:

```tsx
const value = useCommandState((s) => s.value); // the currently-selected item's own `value` prop
// ...
<span className="sr-only" role="status" aria-live="polite">
  {value ? `${labelFor(value)} selected` : 'No selection'}
  {resultCount === 0 ? ' · no matching command' : ` · ${resultCount} results`}
</span>
```

This sidesteps the buggy attribute entirely — a separate `aria-live="polite"` node is
always correct because it is not the thing cmdk overwrites, and it doubles as CMD-03's
"announce result count" and CMD-12's "actionable, announced empty state" requirement from
request 24's acceptance table. `Command.Empty` already exists and is presentational
(`role="presentation"`), so it does not itself announce — the live region is still needed
even with it in place.

**Not applicable here:** the separately-reported "`Command.Dialog` missing `DialogTitle`"
issue does not affect this repo — `CommandCenter.tsx` already composes a raw
`Dialog.Root`/`Dialog.Title`/`Dialog.Description` from `@radix-ui/react-dialog` directly
rather than using cmdk's own bundled `Command.Dialog` wrapper, so that particular upstream
gap is already avoided by the composition choice, not by luck.

**Rules out:** trying to pass a corrected `aria-activedescendant` prop into `Command.Input`
(the library discards it) or patching cmdk itself (upstream, not this repo's surface to
fix) — the live-region workaround above is the one that survives an upstream `cmdk` update
without needing to be re-verified against its internals again.

Sources: [cmdk#413 — stale/absent `aria-activedescendant`](https://github.com/dip/cmdk/issues/413) · [W3C APG Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) · [W3C APG Listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)

## 2026-09-14 — RESEARCH: the world's HTML equivalent stops at domain level, not the record picks under it

**A gap, not a decision — flagging for whoever next touches `CompanyWorkspace.tsx` (UI) or
`DomainIsland.tsx`'s pick surface (3D/design), since it crosses both.**

`CompanyWorld`'s `aria-label` already tells a screen-reader/keyboard user the canvas is
decorative and that "every domain is also selectable from the buttons below the world" —
and that's true today, because `CompanyWorkspace`'s domain-controls `<fieldset>` mirrors
every domain as a real, focusable HTML button. That satisfies `PRODUCT_STRUCTURE.md`'s own
rule ("Labels and all meaningful controls remain accessible HTML. WebGL is the spatial
model only") at the domain level.

Request 10 (closed this session, `5b9776e`) made a *specific* pylon/agent/workflow pick
meaningful in the HTML inspector for the first time — but the only way to *produce* that
pick is still a pointer click on the 3D canvas. A keyboard-only or screen-reader user can
select a domain, but cannot reach "the decision pylon on Finance" or "the agent named Cash
Sentinel" specifically — there is no HTML control for that yet. This matters directly:
`PRODUCT_STRUCTURE.md`'s own "Human-led → Observed → Assisted → Supervised → Autonomous"
promise and request 24's CMD-07 ("Open a record" — search type/id/name → inspector) both
assume every record is reachable without a mouse; today only the Command Centre's future
search will be (once built), not the world itself.

**Checked, not assumed, before writing this:** whether a scene-accessibility library already
solves this for this exact stack. `@react-three/a11y` (`3.0.0`, published 2026-08-07,
peer deps `react-three-fiber >=8`, `three >=0.133.0`, `react >=18` — all satisfied by this
repo's pinned versions) is maintained by pmndrs, the same collective as `@react-three/fiber`
and `drei`, both already dependencies here. It works by syncing a real, absolutely-positioned
HTML element over each focusable 3D object, which is the same "HTML overlay over WebGL"
pattern this repo already uses by hand for domain selection — not a different philosophy,
a packaged version of it.

**Not recommending adoption outright** — this repo already has a working, zero-dependency,
hand-authored version of the same pattern (the domain-controls buttons), and the project's
own standing preference is "no component library... a half-installed library is worse than
either choice" (`PRODUCT_STRUCTURE.md`, Application architecture). The real choice is
between (a) extending the existing hand-rolled HTML-button pattern down to
workflow/agent/decision/exception level — likely a flat, filterable list per focused domain,
not a literal button per pylon — or (b) adopting `@react-three/a11y` if the hand-rolled
version turns out to need focus-ring syncing, hover-state parity, or other machinery the
library already solved. Whoever picks this up should make that call with working code in
front of them, not from this note alone.

**Rules out:** treating request 10's `RecordRef` wiring as accessibility-complete because
`npm run check:picks` passes — that check proves the pick *table* resolves correctly, not
that a non-pointer user can reach a pick at all.

Sources: [@react-three/a11y on npm](https://www.npmjs.com/package/@react-three/a11y) · [pmndrs/react-three-a11y on GitHub](https://github.com/pmndrs/react-three-a11y)

## 2026-09-14 — V2.1 composition decision

**Decided:** the fifteen element semantics remain fixed. All geometry was rebuilt as
composable pieces rather than self-contained sculptures — a Record Token, Risk Hotspot and
Tool previously each carried its own visual environment, so none could read as a subordinate
part of one workflow. `ElementSymbol2D` is the one lightweight 2D projection; there is no
second icon catalogue. Permission Boundary's style unit (posts, rails, materials) is fixed
in the GLB; its extent is procedural, derived at runtime from the `AuthorityLimit` /
`RoleGrant` record. `/design/elements`, `/design/floor` and `/design/lab` prove vocabulary,
reality and grammar respectively — three distinct jobs, not three redundant previews.

**Rules out:** independent 2D icon catalogues, free-standing attachment sculptures with
their own environment, and a generic unconstrained node canvas for `/design/lab`.

Closes WORLD_ELEMENTS.md request 14.

## 2026-09-14 — Three open status decisions, resolved by the user

**1. Ownership-vs-active-claim conflict (recurred on `Scene.tsx`, `EcosystemBoard.tsx`,
`lib/design/**`).** Decided: keep the static Ownership section in `WORLD_ELEMENTS.md` as
the default for an unclaimed path, but a `docs/STATUS.md` active claim always overrides it
while it stands. Rules out rewriting the static section every time work moves between
sessions. See the Ownership section for the exact rule.

**2. Dependency advisories (`npm audit`: 11 issues, 10 high).** Decided: assign
investigation rather than force-upgrade or defer indefinitely. Investigated immediately as
part of this decision, since it took one command: every advisory's fix path resolves to
`vinext@1.0.0-beta.9` (`isSemVerMajor: false`) — the installed version is `beta.5`, four
betas behind on the *same* pinned `1.0.0-beta` line, not the major jump the standing
`docs/STATUS.md` note assumed. This does not mean the bump is safe, only that it is not the
breaking change previously assumed blocking it. Not applied here — a runtime/build-tool
version bump is outside this session's ownership and needs its own verification pass
(dev server boots, `npm run check` still green, a real page loads). Assigned in
`docs/STATUS.md`'s Next Up with these findings, so whoever takes it does not re-derive them.

**3. `healthy` and `active` states.** Decided: merge them into one state. See the comment
above `SceneState` in `lib/model/state.ts` for the full reasoning; the short version is that
`stateLabel` mapped both to the single word "Healthy", so the two states were never visible
as two things to a user. `active` survives as the key because its colour is the one
PRODUCT_STRUCTURE.md already documents as canonical. Implemented across this session's owned
files (`lib/model/state.ts`, `lib/tokens/source/state.ts`, `sceneStates.ts`, `data/**`);
three call sites in files this session does not own now fail `tsc` with the narrowed type —
filed as request 23 in `WORLD_ELEMENTS.md` with exact diffs rather than edited directly.

**Rules out:** re-opening any of the three without new information; a fourth session
independently re-deriving the vinext fix-path investigation.

## 2026-09-14 — This repository is the full Innerflect environment, not a Mirror-only source

**Decided:** the repository and deployment boundary is: this repo is the source and
coordination environment for the complete Innerflect ecosystem — Mirror and Open Mirror,
OS Shop and Forge Shop, Studio and Admin, the shared company graph, typed operation
catalogue, governance, knowledge, agent runtime, integrations, identity/access, audit and
outcomes, plus the design system, ecosystem index, diagrams and conformance tooling. Mirror
remains the operational core and the only product with a live surface; the others are
registered planned entry points in the same repository (`lib/design/ecosystem.ts`,
`PRODUCT_STRUCTURE.md` → *Innerflect ecosystem*), not separate repositories.

**Why:** a new contributor — human or agent — needs to identify every product, audience,
entry point, access boundary and source of truth from the root without recovering a chat
transcript. `AGENTS.md` now opens with this scope and a root `README.md` states it as the
first thing anyone reads, both pointing at `PRODUCT_STRUCTURE.md` for the product/deployment
boundary and `lib/design/ecosystem.ts` for the executable index. Closes WORLD_ELEMENTS.md
request 21.

**Rules out:** a Mirror-only source repository, a second repository per product, and any
document that restates the product/entry-point list instead of pointing at
`lib/design/ecosystem.ts` as the single index.

## 2026-09-13 — OPEN: `healthy` and `active` read identically to a user

**Found:** `stateLabel` maps BOTH `healthy` and `active` to "Healthy". They are distinct
scene states with distinct colours (`#42c8bd` vs `#55cbbb`), and the design route renders a
state switcher with two buttons both reading "Healthy" — which is how this became visible.

**Not decided, deliberately.** `stateLabel` is product copy: `PracticalTable` prints it in a
table cell and an aria-label. Renaming a state from inside a design tool would change what
the product says to a user, which is a product call.

**The options:** give `active` its own label ("Active" — work is flowing, versus "Healthy" —
nothing needs you), or accept that they are one state and collapse them. Two states that look
the same and read the same are one state with extra steps.

**Meanwhile:** `/design/elements` shows the state KEY rather than the label, so the design
surface is honest about which state it is rendering without pre-empting the product decision.

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

## 2026-09-14 — The standalone-prototype ruling extends to the cockpit shell prototype

**Decided:** `prototypes/cockpit-html/index.html`'s Company view is the same anti-pattern
already ruled out on 2026-09-13 ("The design system is routes in the app, not pages beside
it") — a second, hand-rolled implementation of the company scene, built to be reviewed
rather than shipped. It does not import `components/company-world`, loads none of the
fifteen canonical GLBs, carries no record binding, and has no pick table. It is worse than
the prototype that ruling retired: that one at least reused the product's colour tokens by
name (and drifted anyway). This one reimplements Three.js from primitives.

**Why:** the standing ruling's reasoning applies unchanged — "a page can only *assert*
alignment. A route that imports the real tokens *is* alignment." The cockpit's information
architecture ideas (a `Mirror · Builder` mode switch, `100dvh` grid frame, per-surface
domain filters) are worth keeping; its scene is not worth maintaining a second time.

**Resolved this way:**
1. The IA fix it was demonstrating — a non-scrolling `100dvh` CSS Grid shell — is now
   implemented directly in `components/company/AppShell.tsx` / `Rail.tsx` / `TopBar.tsx`
   and `app/globals.css`, not in the standalone file. Request 12 in `WORLD_ELEMENTS.md`
   is closed against the real shell.
2. A reviewable proof of that shell now lives at `/design/shell`, built from the real
   `AppShell`, following the same "routes not pages" precedent as `/design/elements`.
3. `prototypes/cockpit-html/` is left in place rather than deleted — it is the user's own
   commit (`57a89b8`), not an agent's, and retiring someone's own file is their call. It
   should stop being extended with new IA ideas once its ideas have a home in the real app;
   new proposals belong in a `/design/*` route from the start.

**Rules out:** patching the cockpit prototype's Company scene to match the canonical
element set colour-by-colour. That repeats the exact failure mode ("a prototype page that
declared itself 'the single source of truth' had already drifted within days") rather than
fixing it. If the cockpit's `Mirror · Builder` mode toggle is wanted in the product, it
should be proposed as a change to the real `Rail`/`AppShell`, not built a third time.

### Studio, Admin and the main website are live, external products, not planned in-repo routes

`PRODUCT_STRUCTURE.md`, `lib/design/ecosystem.ts`, `README.md` and `AGENTS.md` all
described Studio (`/studio`) and Admin (`/admin`) as planned routes to be built inside
this repository, and had no entry for the main website at all. The user corrected this
directly: Studio is live at `studio.innerflect.tech`, Admin is live and reached by signing
in at `https://innerflect.tech/auth/sign-in` (the user did not confirm a separate
`admin.*` subdomain, so that is how it is represented — not as an invented subdomain), and
the main website is live at `innerflect.tech`.

**Resolved this way:**
1. `lib/design/ecosystem.ts` — `studio` and `admin` nodes and their `ECOSYSTEM_PAGES`
   entries now carry `state: 'external'` (a value `ImplementationState` already supported)
   with `href`/`file` pointing at the real external URLs instead of in-repo paths. A new
   `main-website` node, page, and `EcosystemEntryId`/entry-surface entry were added the
   same way. `validateRegistry()` only checks `file` truthiness, and the repository's own
   `check-ecosystem-registry.ts` only requires an on-disk route for `state: 'live'` pages
   — both are satisfied without any validator change.
2. `PRODUCT_STRUCTURE.md`'s entry-surface table, journey table and product-role table are
   corrected to `live` for all three, with their real hosts named and marked `(external)`
   to distinguish them from canonical in-repo paths.
3. `README.md` and `AGENTS.md` had the same stale "planned, in-repo" framing and are
   corrected the same way.

**Rules out:** inventing a distinct `admin.innerflect.tech` subdomain. The user's answer
described an auth flow through the main domain, not a confirmed separate subdomain, and
this repository is public — infrastructure coordinates are not guessed.

### OS Shop and Forge Shop: a real prototype existed outside the repo, moved in

The user recalled that OS Shop and Forge Shop already existed somewhere and asked to
find them. They were not in this repository, on the live main website, in the vault, or
in any ChatGPT/Codex export — they were static HTML prototypes in a separate, non-git
"tryout" workspace (`~/Documents/Working Projects/tryout/innerflect-platforms/`),
running locally on the user's machine, unreachable from this session's sandbox.

**Resolved this way:**
1. The user's direction: move the files into this repository rather than leave them
   scattered outside it. Copied into `prototypes/innerflect-platforms/` (same precedent
   as `prototypes/cockpit-html/` — an isolated static prototype, not wired into `app/`),
   with a README explaining what it is and why it isn't a real route yet.
2. `lib/design/ecosystem.ts` — `os-shop` and `forge-shop` moved from `state: 'planned'`
   to `state: 'building'` (both the node and the `ECOSYSTEM_PAGES` entry), `source`
   changed from `product('PRODUCT_STRUCTURE.md')` to
   `implementation('prototypes/innerflect-platforms/{os,forge}.html')`. `href`/`file`
   are left pointing at the future `app/shops/os` / `app/shops/forge` routes — those
   still do not exist, and `building` state means my own `check-ecosystem-registry.ts`
   correctly does not require the file to be on disk yet.
3. `PRODUCT_STRUCTURE.md` updated to match, pointing at the prototype location.
4. Real screenshots of `os.html` and `forge.html` captured directly (not through
   `scripts/capture-ecosystem-thumbnails.ts`, which assumes a reachable app route or a
   public URL — this prototype is neither) into
   `public/ecosystem-thumbnails/{os,forge}-shop.png`, matching the naming convention the
   ecosystem board's inspector already reads by page id.

**Rules out:** treating the prototype as `live` or `external` — it is not deployed
anywhere and has no URL. Porting its actual markup into real `app/shops/os` /
`app/shops/forge` routes (React, shared design tokens, real navigation) is separate,
not-yet-started follow-up work; moving the files only stops the design work itself from
living outside version control.

### The ecosystem board: 26 nodes down to 17, and a journey stops being a node

The board had grown to 26 nodes, 49 relations, 19 relation kinds, 6 shapes and
three overlapping taxonomies (`category`, `kind`, shape) that each said
something slightly different about the same node. The user's diagnosis was the
key: **a journey is not an element — it is a set of elements.**

**Resolved this way:**
1. **Journeys became a lens.** `self-builder`, `managed-client` and
   `innerflect-team` stopped being cards. `ECOSYSTEM_JOURNEYS` holds each as an
   ordered list of node ids; the board picks one, numbers its steps and dims
   everything else. A journey can now actually be traced, which it could not be
   when it was three boxes with arrows fanning out.
2. **One operating system, not three.** `own-os`, `managed-os` and
   `innerflect-mirror` were the same object with different owners — 18 of the 49
   edges hung off them. Collapsed to one `operating-system`; who owns it is a
   journey, not a node.
3. **Every node must name a real thing.** The test: can you point at a tool, a
   deliverable or a URL? `operation-catalogue`, `governance`, `agent-runtime`
   and `audit-outcomes` could not — the user said as much about the first two
   ("i dont know whats that"). Deleted. `analytics` (Grafana, Umami) stays
   because it names actual software.
4. **Engines and infrastructure merged into `foundations`.** The split was an
   abstraction nobody felt; both meant "underneath".
5. **Three relation families, not five,** and only structure is drawn by
   default — `dependency` is behind a `Detail` toggle. Bands are labelled on the
   board itself so the legend is not required reading.

`kind` was deleted outright: with four categories that map one-to-one onto four
shapes, a third axis was just drift waiting to happen.

**Net:** 26 → 17 nodes, 49 → 19 lines drawn by default, 6 → 4 shapes, 19 → 8
relation kinds. Layout transposed to four horizontal bands — surfaces on top,
what it stands on at the bottom — which reads as the stack it describes.

**Note for the Open Mirror session:** `data/open-mirror.ts` referenced three
deleted ids. Rather than break it, they were remapped to the nearest surviving
node: `own-os` → `operating-system`, `agent-runtime` → `integration-events`,
`audit-outcomes` → `company-graph`. Re-point them if those are the wrong
anchors — the file is yours, the remap was only to keep it compiling.

### Knowledge Spine is a layer, not its own OS — and every layer stands alone

Two open questions closed by the user in one sentence: *"knowledge base is
always advised but all can work independently."*

**Resolved this way:**
1. **Knowledge Spine stays one of the five layers.** It is not modelled as a
   separate operating system. It is sold as one of the five entry points on
   innerflect.tech, and that is what it is.
2. **The five layers are independently adoptable.** None requires the others;
   a company can start with any one. This needed saying explicitly, because the
   `composed-of` lines on the ecosystem board read as "you need all five" — the
   registry was implying a dependency the product does not have.
3. **"Advised" is a note, not a relation.** Knowledge Spine carries an
   `advised` field on the node explaining why it is the standing
   recommendation. Deliberately *not* a `runs-on` or `composed-of` edge: the
   moment it becomes an edge, the board draws it as a prerequisite and the
   registry starts lying about what a customer has to buy.

**Rules out:** modelling the recommendation as any kind of relation, and
promoting Knowledge Spine to a second operating system. Both would make the
diagram claim a constraint that does not exist.
