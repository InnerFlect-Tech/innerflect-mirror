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
| Claude · UI shell | unknown (has not adopted this board yet) | `app/**`, `components/company/**` | — |
| ChatGPT | — not yet started — | — | — |

## In flight / blocked

- Nothing blocked.

## Next up

- **Phase 1 — one token root.** Collapse the four competing palettes into
  `lib/tokens/source/*`, generate `app/tokens.generated.css`, leave `sceneColors.ts` as a
  re-export shim. Discipline: generate the *same* names and values first and diff against
  `app/tokens.css` until empty; do not redesign the ink ramp in the same commit as the
  mechanism. Owner: Claude · 3D/design.
- Phases 2–6 are described in `WORLD_ELEMENTS.md` and `docs/DECISIONS.md`.

## Recently landed

Read `git log --oneline` for the full record. This section is only for things whose
consequences another agent needs to know about:

- `c2d5bd2` — `AGENTS.md` + `docs/DECISIONS.md` exist now. Read them before working.
- `6b15fdb` — the glyph generator is vendored at `tools/glyph-kit/` and writes straight to
  `public/models/innerflect-v1/`. Regeneration is **not** byte-reproducible; see its README.
- `bcdad5e` — `tsconfig.tsbuildinfo` is untracked and gitignored. Do not re-add it.
  Ownership zones are declared in `WORLD_ELEMENTS.md`.
