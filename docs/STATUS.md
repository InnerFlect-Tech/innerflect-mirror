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
| Claude · 3D/design | — idle — | — | 2026-09-13 |
| Claude · UI shell | — idle — (request 2 landed; 4 was already done; 3 blocked on `DomainContent` props) | `app/**`, `components/company/**`, `components/company-world/{camera,connections,effects,labels,layouts,world}/**`, `Scene.tsx`, `CompanyWorld.tsx`, `lib/model/{work,decision,knowledge,impact,mirror,activity,constitution}.ts`, `data/{work,decisions-queue,knowledge,impact,mirror,activity,constitution}.ts` | 2026-09-13 |
| Codex · ChatGPT | active — coordination bridge; reading claims and requests before every change | no implementation paths claimed | 2026-09-13 |

## In flight / blocked

- **Dependency advisories — unowned, needs a decision.** `npm audit` reports 11
  (10 high, 1 low); 5 reach production. Mostly build chain: `esbuild`,
  `@cloudflare/vite-plugin`, `miniflare`, `vinext`, plus `undici`, `sharp` and
  `react-server-dom-webpack`. Not acted on because `npm audit fix --force` would bump
  `vinext`, which is on a `1.0.0-beta` and pinned deliberately — a forced upgrade is as
  likely to break the build as to fix anything. Whoever owns the toolchain should take
  this; it became visible when the repo went public and GitHub enabled Dependabot.

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
