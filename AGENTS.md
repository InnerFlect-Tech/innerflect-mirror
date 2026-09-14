# Innerflect Mirror — agent instructions

Read this first. It is deliberately short; it points at the documents that hold the
detail rather than repeating them. Claude Code, ChatGPT/Codex, Cursor and any future
agent all start here.

## What this is

This repository is the source and coordination environment for the **full Innerflect
ecosystem**: Mirror and Open Mirror, OS Shop and Forge Shop, Studio and Admin, the shared
company graph, operations, governance, agents and infrastructure, and the unified UI,
2D/3D design system, diagrams and ecosystem index that keep every surface aligned.

Mirror is the operational core and the only product with a live surface today — the
home surface is a spatial 3D world: domain islands around a company core, with a Mirror
layer beneath it — but this is not a Mirror-only repository. `PRODUCT_STRUCTURE.md` is
the authority on the product/deployment boundary between products; `lib/design/ecosystem.ts`
is the executable index of every product, entry point, relation and page across the
whole environment.

> See how your company works. Make it run itself.

## Authority chain

Read the highest-authority document that covers your question. Do not duplicate their
content into new files — update the source.

| Question | Authority |
|---|---|
| What does the product mean? What is a domain, a decision, a surface? | `PRODUCT_STRUCTURE.md` |
| What does each 3D object represent, and which field puts it there? | `WORLD_ELEMENTS.md` |
| How is the 3D scene written? | `99 System/AI/Rules/Code/threejs-r3f.md` in the My OS vault |
| Where does element geometry come from? | `tools/glyph-kit/README.md` |
| Why is something the way it is? | `docs/DECISIONS.md` |
| Who is working on what right now? | `docs/STATUS.md` |

`WORLD_ELEMENTS.md` also carries **ownership** and the **numbered requests** between
agents. That is the coordination channel — use it rather than assuming another agent
will read a chat log it cannot see.

## Rules that are not up for renegotiation

These have been decided, argued and written down. Reopen one only with a reason, and
record the outcome in `docs/DECISIONS.md`.

1. **State decides colour, never category.** Teal = safe autonomous operation, amber =
   attention, red = blocked or unsafe, grey = human-led. Domains do not get their own
   colours. Governance is a state layer, never an island.
2. **Domains are the path a euro takes** — Market, Sales, Delivery, Finance. Org-chart
   departments are not portable between companies and were explicitly rejected.
3. **Nothing is placed in the world unless it maps to a field on a record**, and the
   mapping is a row in `WORLD_ELEMENTS.md`. Add the row before drawing the object.
4. **A person is never recoloured by state.** Human glyphs stay grey.
5. **Labels are HTML.** WebGL is the spatial model only.
6. **Budget: under 120 draw calls and 200k triangles.** Currently 61 / 19.4k at 60fps,
   and zero draw calls when paused. Hold the measured line, not the ceiling.
7. **The state palette has exactly one definition**, `lib/tokens/source/state.ts`, which
   generates the CSS custom properties and is imported by the scene. Never add a second.
   ⚠️ `app/globals.css` still declares a third palette by hand — see request 11.

## How we communicate

Three agents share this repo — a Claude session on the 3D/design layer, a Claude session
on the UI shell, and ChatGPT. **None of us can see the others' chat conversations.** If it
is not in the repo, it does not exist. Four channels, each with one job:

| You want to... | Write it in | When |
|---|---|---|
| say what you are about to touch, so nobody collides | `docs/STATUS.md` | start and end of every work session |
| record why something was decided, so it is not reopened | `docs/DECISIONS.md` | whenever you decide something non-obvious |
| ask for a change in a file you do not own | `WORLD_ELEMENTS.md` (numbered request, with the exact diff) | instead of editing that file |
| explain what a change does and why | the commit message | every commit |

Do not invent a fifth channel. If none of these fits, it probably belongs in a commit
message.

## Sync discipline

The branch is `mirror/core-four-world` (it is the repo default; `main` is stale). Because
three writers share it and there is no CI, **the only thing keeping us consistent is that
everyone pushes early and pulls often.**

Start of a work session:

```bash
npm run sync          # git pull --rebase --autostash, then typecheck + lint
```

Then claim your paths in `docs/STATUS.md`.

Every time you finish a coherent piece of work:

```bash
npm run check         # tsc --noEmit && oxlint
git add -A <your paths>
git commit            # explain WHY; the what is in the diff
git pull --rebase     # someone may have landed while you worked
git push              # ← do not skip. unpushed work is invisible work
```

**Push after every commit, not at the end of the session.** An unpushed commit is a commit
the other two agents cannot see, cannot build on, and will eventually conflict with. If you
are about to stop working, push even if the piece feels unfinished — a pushed
work-in-progress is far cheaper than a silent divergence.

Other rules that follow from three writers and no CI:

- **Rebase, never merge.** `npm run sync` does the right thing.
- **Small, single-purpose commits.** One that touches a single owner's paths survives a
  rebase; a sweeping one does not.
- **Stay inside your ownership zone** (declared in `WORLD_ELEMENTS.md`).
- **Never commit `tsconfig.tsbuildinfo`** or build output. It is gitignored.
- After pulling, `git log --oneline -- <your paths>` shows whether someone swept your work.
- If a push is rejected, **pull --rebase and push again**. Never `push --force` on this
  branch — it is how another agent's work disappears.

## Seeing the system

Two routes, deliberately unlinked from the product navigation — they are where the visual
language is inspected, not where the company is operated. Both are `noindex`.

| Route | Shows |
|---|---|
| `/design/elements` | every glyph in isolation, across all five states, with what drives it |
| `/design/floor` | the real `<CompanyWorld>`; click any object to resolve it to its record |

They are built from the product's own components on purpose. A separate preview could only
assert it matched the product; these break the build if the import does.

## Before you finish

```bash
npm run check
```

Six gates: `tsc`, `oxlint`, token parity, glyph-manifest drift, no-fabrication and the
pick contract. Not two — several of them exist because a claim in a document was not
enough.

For anything touching the 3D scene, also check the budget in the browser console — the
renderer is exposed in development:

```js
const i = window.__mirrorGL.info; i.autoReset = false; i.reset();
// …let it run ~2s, then divide by the frames actually rendered
```

Record the number in the perf table in `WORLD_ELEMENTS.md`. A budget nobody measures is
a wish.

## Safety

- No secrets in this repo. It is **public**.
- Do not delete knowledge silently — migrate it and say why in `docs/DECISIONS.md`.
- Do not create a second source of truth for anything. If you find one, collapse it and
  record which copy won.
