# Innerflect Mirror — agent instructions

Read this first. It is deliberately short; it points at the documents that hold the
detail rather than repeating them. Claude Code, ChatGPT/Codex, Cursor and any future
agent all start here.

## What this is

Mirror is the **operational digital twin of a company**. The home surface is a spatial 3D
world: domain islands around a company core, with a Mirror layer beneath it.

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
7. **The state palette has exactly one definition**, `lib/tokens/state.ts`, which
   generates the CSS custom properties and is imported by the scene. Never add a second.

## Working protocol

Three writers share this repo — a Claude 3D/design session, a Claude UI-shell session,
and ChatGPT. There is no CI. So:

- **Working branch: `mirror/core-four-world`.** `main` is not current.
- **`git pull --rebase` before you start and again before you commit.** Never merge.
- **Small, single-purpose commits.** A commit that touches one owner's paths survives a
  rebase; a sweeping one does not.
- **Stay inside your ownership zone** (declared in `WORLD_ELEMENTS.md`). If you need a
  change outside it, add a numbered request there with the exact diff rather than
  editing the file.
- **Never commit `tsconfig.tsbuildinfo`** or any build output. It is gitignored.
- **Explain *why* in the commit message.** The what is in the diff.
- After pulling, `git log --oneline -- <your paths>` shows whether someone swept your work.

## Before you finish

```bash
npx tsc --noEmit && npx oxlint
```

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
