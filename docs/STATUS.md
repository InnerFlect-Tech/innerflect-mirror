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
| Claude · 3D/design | — idle — pushed `a4e6c9b`: `EcosystemBoard.tsx` cards and state badges now colour by `ImplementationState` (live/external/building/planned), and the inspector shows a real screenshot per page a selected node owns. Screenshots are captured ahead of time by the new `scripts/capture-ecosystem-thumbnails.ts` (Playwright) into `public/ecosystem-thumbnails/<page id>.png`, looked up by naming convention — no registry field needed. Studio and Admin's thumbnails are their real external sign-in screens (public, no secrets). Before that, pushed `3c32912`: corrected `PRODUCT_STRUCTURE.md`, `lib/design/ecosystem.ts`, `README.md` and `AGENTS.md` on the user's direct instruction, since Studio and Admin were still described as planned in-repo routes and had already shipped as live external products (`studio.innerflect.tech`, and Admin reached via `innerflect.tech/auth/sign-in`), and the main website (`innerflect.tech`) had no registry entry at all. Decision recorded in `docs/DECISIONS.md`. Before that: acted on its own request-13 directive — researched, decided `@xyflow/react` over a hand-rolled canvas (docs/DECISIONS.md), and built `lib/design/composition.ts` + `scripts/check-composition.ts` (25 checks green) so the canvas can be wired against a real rule instead of one improvised later. A three-way shared-index collision (my staged content landed inside two other sessions' commits in turn, `f1c63c4` then `2f7e098`/`616ee44`) resolved itself once everyone actually committed — content intact and verified byte-for-byte, nothing rewritten | — | 2026-09-14 |
| Claude · UI shell | — idle, still released per the user's direction so Codex owns the cockpit production pass. Landed `a11d85f` first: request 23's two UI-shell diffs (`Hero.tsx`, `DomainInspector.tsx` — drop the redundant `healthy` branch) and request 15 (dead `.sheet*`/`.seg`/`.ghost`/`.eyebrow` rules in `app/design/design.css`). Neither file is in Codex's claimed list above, so no collision — but not re-claiming the released paths for further work | — | 2026-09-14 |
| Codex · cockpit production | — released — landed `f1c63c4`; accessible cmdk/Radix Command Centre follow-up landed through `616ee44` | — | 2026-09-14 |

## In flight / blocked

- **RESOLVED — the `Scene.tsx` race.** Reconciled in `2734696`; requests 2, 3 and 4 in
  `WORLD_ELEMENTS.md` are all ✅. The file-level cause (neither session had claimed it here
  first) is folded into the single ownership-conflict escalation below rather than repeated.

- **ASSIGNED — dependency advisories.** The user decided: investigate rather than
  force-upgrade or defer. Findings (`npm audit --json` + `npm view vinext versions`): every
  one of the 11 advisories' fix path resolves to `vinext@1.0.0-beta.9`
  (`isSemVerMajor: false`). Installed is `beta.5` — this is four betas behind on the *same*
  pinned `1.0.0-beta` line, not the major jump the previous note here assumed. That does not
  make the bump safe, only not the breaking change it was assumed to be. **Still needs:**
  someone to actually try `vinext@1.0.0-beta.9`, confirm the dev server boots, `npm run
  check` stays green, and a real page loads, before touching `package.json`. Whoever owns
  the toolchain — not claimed by any of the three sessions today — should pick this up.
  Recorded in `docs/DECISIONS.md`.

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
