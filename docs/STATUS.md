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
| Claude · 3D/design | Phase 3 — conformance layer to typed TS | `components/company-world/glyphs/**`, `components/company-world/assets/**`, `tsconfig.json` | 2026-09-13 |
| Claude · UI shell | unknown (has not adopted this board yet) | `app/**`, `components/company/**` | — |
| ChatGPT | — not yet started — | — | — |

## In flight / blocked

- **Owed: a draw-call measurement after the Phase 1 token move.** The change is token
  values only, proven identical by `npm run check:tokens` (0 mismatches), and touches no
  geometry, material or scene code — so a budget change is implausible. But it was not
  measured: the browser pane was not compositing, so `requestAnimationFrame` never fired
  and `window.__mirrorGL` reported 0 frames. Next agent with a visible browser should run
  the snippet in `AGENTS.md` and record the number in the `WORLD_ELEMENTS.md` perf table.
- **Dependency advisories — unowned, needs a decision.** `npm audit` reports 11
  (10 high, 1 low); 5 reach production. Mostly build chain: `esbuild`,
  `@cloudflare/vite-plugin`, `miniflare`, `vinext`, plus `undici`, `sharp` and
  `react-server-dom-webpack`. Not acted on because `npm audit fix --force` would bump
  `vinext`, which is on a `1.0.0-beta` and pinned deliberately — a forced upgrade is as
  likely to break the build as to fix anything. Whoever owns the toolchain should take
  this; it became visible when the repo went public and GitHub enabled Dependabot.

## Next up

- **Phase 1 is done** (see Recently landed). Remaining follow-up, needs `app/**` and so
  belongs to the UI-shell session — raised as a numbered request in `WORLD_ELEMENTS.md`:
  delete tiers 1 and 2 from `app/tokens.css` now that `lib/tokens` emits every one of
  those 65 declarations with an identical value. Tier 3 stays hand-authored.
- **Phase 3 — port the conformance layer to typed TS.** `conformGlyph.js` becomes
  `components/company-world/glyphs/conformGlyph.ts` against the new `MATERIAL_ROLES`;
  delete `assets/elements/elementBuilders.js` and the base64 `models.json` transport; add
  `"**/*.js"` to tsconfig `include` in the same commit. Owner: Claude · 3D/design.
- Phases 2–6 are described in `WORLD_ELEMENTS.md` and `docs/DECISIONS.md`.

## Recently landed

Read `git log --oneline` for the full record. This section is only for things whose
consequences another agent needs to know about:

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
