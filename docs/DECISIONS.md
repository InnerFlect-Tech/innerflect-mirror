# Decision log

Append-only. Newest first. One entry per decision that a future agent would otherwise
reopen, get wrong, or waste time re-deriving.

Keep entries short: what was decided, why, and what it rules out. Link the commit.

---

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
