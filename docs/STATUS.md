# Status board

**Claim what you are about to touch, before you touch it.** Three agents share one
branch and none of us can see the others' chat logs, so this file is how we avoid
editing the same file at the same time.

Update it twice per work session: once when you start (claim), once when you stop
(release, and say what landed). Keep it current — a stale claim is worse than no claim,
because it makes people route around work that finished hours ago.

If a path you need is claimed by someone else: do not edit it. Either wait, or raise a
numbered request in `WORLD_ELEMENTS.md`.

---

## Active claims

| Agent | Working on | Paths claimed | Since |
|---|---|---|---|
| Claude · 3D/design | — idle — `npm run check` is now **nine gates, 180 checks**: `check:composition`, `check:pickable-records` and `check:ecosystem-registry` were finally wired into `package.json` (released by Codex), so three scripts that existed but gated nothing now actually gate. The registry gate also checks route state in BOTH directions — the one-directional version missed that `/open-mirror` and `/design/lab` had shipped while the registry still called them `planned`; both are now `live`. Before that: the ecosystem board went 26 nodes → 17, journeys became a lens rather than cards, one operating system replaced three, engines+infrastructure merged into foundations, and nodes are draggable. Also fixed a real regression: `setPointerCapture` on pointerdown was stealing the canvas's pointerup, so clicking a domain in the 3D world did nothing on `/` and `/design/floor` alike — capture now starts only once a drag passes the threshold | — | 2026-09-16 |
| Claude · UI shell | — idle, still released per the user's direction so Codex owns the cockpit production pass. Landed `a11d85f` first: request 23's two UI-shell diffs (`Hero.tsx`, `DomainInspector.tsx` — drop the redundant `healthy` branch) and request 15 (dead `.sheet*`/`.seg`/`.ghost`/`.eyebrow` rules in `app/design/design.css`). Neither file is in Codex's claimed list above, so no collision — but not re-claiming the released paths for further work | — | 2026-09-14 |
| Claude · toolchain + a11y | — released — request 13 is built in both projections. 2D on `@xyflow/react` with SSOT glyphs (`ElementSymbol2D`), placement through `validatePlacement()`, docked attachments, undo/redo; 3D in `LabScene3D` driven by the same graph. Criteria 1, 3, 4, 5, 6, 8 and 9 all verified by running it — 11/11 assertions, including the branch guard that had never been exercised. Idle 3D: 0 draw calls; populated: 17 calls / 820 triangles against 120 / 200k; mobile: 0 canvases. Two real bugs found and fixed along the way: non-deterministic seed ids broke hydration and silently swallowed the first click on the page, and nodes never became visible in headless so the route could not be e2e-tested at all. **Known blocker for anyone running e2e:** vinext's dev-server lock is global to the user, so Playwright's `webServer` can never spawn while any dev server is up — see WORLD_ELEMENTS.md request 13 | — | 2026-09-14 |
| Claude · toolchain + a11y (earlier) | — released — landed the two verified dependency bumps (`vinext` beta.5→beta.9, `@vitejs/plugin-rsc` 0.5.26→0.5.34; 11 advisories → 9) against the existing lockfile as `docs/DECISIONS.md` prescribes, and closed request 27's open half: `CompanyWorkspace.tsx` renders `listPickableRecords()` as 52 real buttons so a keyboard or screen-reader user can reach a specific workflow, decision, exception or agent, not just the domain. **Did not** add `@xyflow/react` despite it being decided for request 13 — nothing imports it yet and `PRODUCT_STRUCTURE.md:307` rules that a half-installed library is worse than either choice; it belongs in the same change as the `/design/lab` build. `npm run check` green on the pushed commit | — | 2026-09-14 |
| Codex · cockpit production | — released — landed `f1c63c4`; accessible cmdk/Radix Command Centre follow-up landed through `616ee44` | — | 2026-09-14 |
| Claude · Open Mirror | — released — landed the first **Open Mirror** slice: `app/open-mirror/page.tsx` (the route `ECOSYSTEM_PAGES` has pointed at since before it existed), `data/open-mirror.ts` and `components/company/OpenMirrorSurface.{tsx,module.css}`. Built in the app from the product's own `SurfaceHead`/`SurfaceSummary`/token surface rather than as a fifth static prototype under `prototypes/` — the retired cockpit (request 24, "a page can only assert alignment") is the precedent. The product question it answers: a free edition cannot promise measurement, so it promises **honesty about measurement** — every reconstructed step carries a required `provenance` grade (declared / inferred / observed) and the unverified share is the largest number on the page. Provenance is drawn as fill and weight, never hue, so it does not borrow the state palette (rule 1). Aggregates are counted from the records, never typed beside them. **Did not** flip the `open-mirror` page's state in `lib/design/ecosystem.ts`, though it is now wrong: the page still says `planned` while its node already says `building` and the route exists on disk. That file is mid-change in the working tree for the operating-layers work, and `WORLD_ELEMENTS.md` is mid-change too, so there was nowhere to file this without sweeping someone's in-flight edit — the `ded0c2c` shape. Left as a one-line request for whoever lands the layers change, exact diff: in `ECOSYSTEM_PAGES`, the `open-mirror` row becomes `state: 'building'` with purpose `'The free/open operational twin for self-builders. The entry surface is built at app/open-mirror/page.tsx; reconstruction, grading and the connect step are not.'` | — | 2026-09-14 |

## In flight / blocked

- **RESOLVED — the `Scene.tsx` race.** Reconciled in `2734696`; requests 2, 3 and 4 in
  `WORLD_ELEMENTS.md` are all ✅. The file-level cause (neither session had claimed it here
  first) is folded into the single ownership-conflict escalation below rather than repeated.

- **DONE — dependency advisories, 9 → 1.** Picked up 2026-09-25, after sitting unowned.
  The `vinext` half was already resolved: installed is `1.0.0-beta.9`, so that note was
  stale. Of the 9 remaining, 8 were taken by non-major bumps — `vite` 8.0.13 → 8.3.1,
  `@cloudflare/vite-plugin` 1.37.1 → 1.60.0, `wrangler` 4.92.0 → 4.139.0 (which needed
  `@cloudflare/workers-types` 4 → 5, a types-only major that `tsc` accepts unchanged).

  **The one that cannot be taken, and why Dependabot PR #1 must not be merged as-is:**
  `react-server-dom-webpack@19.3.0` requires React 19.3, and
  `@react-three/fiber@9.7.0` declares `react@">=19 <19.3"`. Taking that bump breaks the
  entire 3D world. It stays open until R3F supports 19.3 — this is a real ceiling, not
  an oversight.

  Verified the way this note used to ask for: `npm run check` green (204 checks), dev
  server boots clean, `/`, `/ecosystem` and `/design/floor` all 200, and the 3D scene
  renders identically to the pre-bump baseline (65 geometries, 23 programs, screenshot
  compared).

  One trap worth recording: bumping wrangler migrates the local miniflare SQLite state
  (`_cf_ALARM` gains a column), so *downgrading* afterwards fails to boot with
  `ERR_RUNTIME_FAILURE`. `rm -rf .wrangler .vinext node_modules/.vite` fixes it — all
  three are gitignored dev state.

- **RESOLVED — `npm run check` red on `4b943d5`.** Request 20 (the missing
  `onKeyDown={onPanKeyDown}` in `EcosystemBoard.tsx`) landed in `88eaadc`. `npm run check`
  is green on the current tip.

- **RESOLVED — the recurring ownership-conflict pattern.** The user decided option (b): the
  static Ownership section in `WORLD_ELEMENTS.md` stays as the default for an unclaimed
  path, and an active claim in this file always overrides it while it stands. Written into
  `WORLD_ELEMENTS.md`'s Ownership section directly. Recorded in `docs/DECISIONS.md`.

- **DONE (this session) — `healthy` merged into `active`.** The user decided this as a
  product call. Implemented in every file this session owns; `tsc` now fails on three call
  sites this session does not own (`components/company/Hero.tsx`,
  `components/company/DomainInspector.tsx`, `components/company-world/design/ElementSheet.tsx`)
  — filed as request 23 in `WORLD_ELEMENTS.md` with exact diffs. **`npm run check` is red
  on this session's own pushed commit until request 23 lands** — deliberately, since the
  type change is the enforcement mechanism. Whoever owns those three files should take it;
  each diff is a one-line deletion of an already-redundant branch.

- **RESOLVED — `tsc` was red mid-edit on `lib/design/ecosystem.ts`.** That was a
  transient working-tree state during the category rework; the category type and its
  consumer landed together. `npm run check` is green on the current tip (204 checks).

  It is uncommitted, so it is invisible to everyone but the tree it is in. It also breaks
  `/design/ecosystem` at runtime — `EcosystemBoard.tsx:148` throws
  `Cannot read properties of undefined (reading 'x')`, because the new category has no
  position the board can read. Verified by stashing only that file: `tsc` goes green, which
  is also how the Open Mirror slice was verified against its own gates (`oxlint`,
  `check:records` and `check-ecosystem-registry` all pass on it). Not touched — it is
  someone's in-flight change, and finishing it for them is how the `ded0c2c` collision
  happened. Flagging it here instead, per this file's own job.

- **Pre-existing, unrelated:** in dev, the Inter woff2 is requested at an absolute host path
  (`localhost:3000/Users/indiasfernandes/.codex/...`) and 404s on every route. Cosmetic in
  dev; worth someone's attention before it reaches a build.

## Note on this session's own commit

The board-consolidation edit above (released the stale `Scene.tsx` claim, merged the two
"In flight / blocked" sections, closed out the resolved `EcosystemBoard` lint bullet) was
written and staged, then landed inside the UI-shell session's `aad078b` rather than its own
commit — that session's `git add -A` picked up this file's working-tree state alongside
its own `AGENTS.md`/`README.md`/`WORLD_ELEMENTS.md` changes before this session committed
separately. Content is correct and on `origin`; attribution is not. Same collision shape as
the `ded0c2c` incident already on record here, smaller blast radius (docs only, no code
overwritten). Not re-committing it — that would duplicate the content. Left as a transparent
note per this file's own rule against silently losing or misattributing work.

Request 22 (`lib/design/ecosystem.ts`, `'planned'` → `'live'` for `ecosystem-design`) is
addressed to this session and is a genuine one-line change, but `lib/design/**` is
Codex's active claim today per the row above — acting on it now would repeat the exact
ownership-vs-active-claim collision this file just escalated. Left open for Codex, or for
whoever resolves the ownership question, to close.

## Hand-off — read this first if you are picking the work up

Everything decided is in `docs/DECISIONS.md`, newest first. Read it before
proposing anything structural; it records what was decided, why, and what each ruling rules
out, so settled questions are not reopened and measurements are not re-derived.

Cross-boundary asks are numbered requests in `WORLD_ELEMENTS.md`. Three have landed (✅);
**open: 9, and the rest of 10**. Requests 2, 3, 4 and 6 closed in the audit pass. Request 9 is addressed to ChatGPT about its own
rule (it shipped `permission-boundary.glb` despite writing that boundaries are procedural).

Verify with one command: `npm run check` — six gates (tsc, oxlint, token parity, glyph
manifest drift, no-fabrication, pick contract). It passes on the current commit.

Where the work stands: phases 0–8 of the plan are done. The world now draws no object that
a record does not justify, every part of a merged island resolves to a `RecordRef`, and the
scene holds **61 draw calls / 19,479 triangles** against a budget of 120.

## Next up

- **Phase 1 is done** (see Recently landed). Remaining follow-up, needs `app/**` and so
  belongs to the UI-shell session — raised as a numbered request in `WORLD_ELEMENTS.md`:
  delete tiers 1 and 2 from `app/tokens.css` now that `lib/tokens` emits every one of
  those 65 declarations with an identical value. Tier 3 stays hand-authored.
- **Decide `healthy` vs `active`.** They are distinct states with distinct colours but
  `stateLabel` maps both to "Healthy". See `docs/DECISIONS.md`. Product call, not a design one.
- **Finish request 10.** `/design/floor` consumes `onSelectRecord`; the product surface still
  tracks a bare id, so a click on a gate pylon there selects only the island.
- **Request 9** — `permission-boundary.glb` vs the review's own "boundaries are procedural".
  ChatGPT's rule to amend or apply.
- **Phase 4 — `/design/elements`.** One Canvas, ten glyphs from the registry, a state
  switcher, and each element's conform stats and `drivenBy` shown beside it. Needs the
  three-line route file in `app/`, raised as request 5 in `WORLD_ELEMENTS.md`.
  Owner: Claude · 3D/design (component), UI-shell session (route file).
- Phases 2–6 are described in `WORLD_ELEMENTS.md` and `docs/DECISIONS.md`.

## Recently landed

- `5f969f4` — Codex hardened the canonical token serializer: duplicate names now throw
  before object construction, missing and circular aliases fail validation, semantic tokens
  cannot contain raw colours, and the remaining action colours moved into the primitive teal
  ramp. Claim on `lib/tokens/**` and `scripts/check-tokens.ts` released.

- Codex · ChatGPT specified request 22: the ecosystem-wide Command Centre journeys,
  production-readiness gates, E2E matrix, structured error/observability contract,
  changelog discipline and phased landing order. Claim released after publication; owning
  sessions should implement the numbered request without extending the retired standalone
  cockpit.

- `5635ac9` — Codex registered its coordination presence. The same commit contains the
  deletion of `components/company/SurfaceStub.tsx`, which was already staged by the
  UI-shell session before Codex committed the board update; Codex did not author or alter
  that deletion.

- `03728a8` — The next element pass now has explicit semantic corrections, five missing concepts and outcome-based acceptance criteria.
- `92d9060` — Request 7 records the approved Mirror/Builder operating loop, actor/control separation, execution identity, canonical-workflow requirement and Record Token direction for the owning sessions.
Read `git log --oneline` for the full record. This section is only for things whose
consequences another agent needs to know about:

- **Phase 3 — conformance layer in typed TS.** `components/company-world/glyphs/`
  now holds `conformGlyph.ts`, `materialCache.ts` and `Glyph.tsx`. All four dead `.js`
  files are deleted and `**/*.js` is in tsconfig `include`, so untypechecked JS cannot
  reappear. Merges are cached by `(id, state)` and handed out as clones, so N platforms in
  one state cost one merge. **Nothing imports this from the render path yet** — the home
  scene measured 61 calls / 19,407 tris, exactly the baseline.
- **Phase 2 — generated glyph IDs.** The seven hand-maintained lists of the ten element
  ids are now one generated module (`components/company-world/generated/glyphIds.ts`) plus
  one authored registry (`lib/design/elements.ts`). The generator emits each asset's glTF
  material names, so `MATERIAL_ROLES` is `satisfies Record<KitMaterialName, MaterialRole>`
  — an unmapped material is now a compile error naming the material, verified by removing
  one. `npm run check:glyphs` fails if the generated module drifts from the manifest.
- **Phase 1 — one token root.** `lib/tokens/` is now the only place a colour, space, type
  or state value is authored. `components/company-world/tokens/sceneColors.ts` and
  `lib/tokens/state.ts` are re-export shims, so existing imports still work.
  `stateCssVariables()` kept its name deliberately — it now emits the *whole* token set, so
  `app/layout.tsx` gained every token without an edit across an ownership boundary.
  `npm run check:tokens` proves parity and is wired into `npm run check`.
- `c2d5bd2` — `AGENTS.md` + `docs/DECISIONS.md` exist now. Read them before working.
- `6b15fdb` — the glyph generator is vendored at `tools/glyph-kit/` and writes straight to
  `public/models/innerflect-v1/`. Regeneration is **not** byte-reproducible; see its README.
- `bcdad5e` — `tsconfig.tsbuildinfo` is untracked and gitignored. Do not re-add it.
  Ownership zones are declared in `WORLD_ELEMENTS.md`.
