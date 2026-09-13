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
| Claude · 3D/design | Phase 9 — design routes | `components/company-world/design/**`, `app/design/**` | 2026-09-13 |
| Claude · UI shell | unknown (has not adopted this board yet) | `app/**`, `components/company/**` | — |
| ChatGPT | landed the V2 fifteen-element kit (`8acb18d`) | `tools/glyph-kit/**`, `public/models/**`, `lib/design/**` | 2026-09-13 |

## In flight / blocked

- **Dependency advisories — unowned, needs a decision.** `npm audit` reports 11
  (10 high, 1 low); 5 reach production. Mostly build chain: `esbuild`,
  `@cloudflare/vite-plugin`, `miniflare`, `vinext`, plus `undici`, `sharp` and
  `react-server-dom-webpack`. Not acted on because `npm audit fix --force` would bump
  `vinext`, which is on a `1.0.0-beta` and pinned deliberately — a forced upgrade is as
  likely to break the build as to fix anything. Whoever owns the toolchain should take
  this; it became visible when the repo went public and GitHub enabled Dependabot.

## Hand-off — read this first if you are picking the work up

Everything decided is in `docs/DECISIONS.md`, newest first — 14 entries. Read it before
proposing anything structural; it records what was decided, why, and what each ruling rules
out, so settled questions are not reopened and measurements are not re-derived.

Cross-boundary asks are numbered requests in `WORLD_ELEMENTS.md`. Three have landed (✅);
**five are open: 2, 3, 4, 5, 6, 9, 10**. Request 5 (the design routes) is the single blocker
on seeing any of the last five phases, and request 9 is addressed to ChatGPT about its own
rule.

Verify with one command: `npm run check` — six gates (tsc, oxlint, token parity, glyph
manifest drift, no-fabrication, pick contract). It passes on the current commit.

Where the work stands: phases 0–8 of the plan are done. The world now draws no object that
a record does not justify, every part of a merged island resolves to a `RecordRef`, and the
scene holds **61 draw calls / 19,479 triangles** against a budget of 120.

## Next up

- **Semantic gate before new geometry.** Review the corrections, five missing concepts and eight acceptance criteria in `WORLD_ELEMENTS.md` with the user. Do not change or add GLBs until that vocabulary is accepted.
- **Phase 1 is done** (see Recently landed). Remaining follow-up, needs `app/**` and so
  belongs to the UI-shell session — raised as a numbered request in `WORLD_ELEMENTS.md`:
  delete tiers 1 and 2 from `app/tokens.css` now that `lib/tokens` emits every one of
  those 65 declarations with an identical value. Tier 3 stays hand-authored.
- **Phase 9 — the design routes.** `ElementSheet` over the fifteen glyphs, and `/design/floor`
  rendering the real `<CompanyWorld>`. Both route files are three lines in `app/design/**` —
  request 5, outstanding since Phase 0 and now the last blocker. Owner: Claude · 3D/design
  (components), UI-shell session (route files).
- **`onSelectRecord` is wired but nothing consumes it.** `DomainIsland` resolves a click to a
  `RecordRef` and calls the prop; `CompanyWorkspace` still only takes a domain id. Widening
  that is request 10.
- **Phase 4 — `/design/elements`.** One Canvas, ten glyphs from the registry, a state
  switcher, and each element's conform stats and `drivenBy` shown beside it. Needs the
  three-line route file in `app/`, raised as request 5 in `WORLD_ELEMENTS.md`.
  Owner: Claude · 3D/design (component), UI-shell session (route file).
- Phases 2–6 are described in `WORLD_ELEMENTS.md` and `docs/DECISIONS.md`.

## Recently landed

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
