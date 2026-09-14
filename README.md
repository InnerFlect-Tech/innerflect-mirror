# Innerflect

This repository is the source and coordination environment for the **full Innerflect
ecosystem** — not a Mirror-only repository. It covers Mirror and the free/open Open
Mirror edition, OS Shop and Forge Shop, Studio and Admin, the shared company graph,
typed operation catalogue, governance, knowledge, agent runtime, integrations,
identity/access and audit, and the unified UI, 2D/3D design system, diagrams and
ecosystem index that keep every surface aligned.

> See how your company works. Make it run itself.

Mirror — the operational digital twin — is the operational core and the only product
with a live surface today. The rest are planned entry points inside this same
repository, registered in `lib/design/ecosystem.ts` and browsable at `/design/ecosystem`.

## Products and audiences

| Product | Entry point | Audience / access | State |
|---|---|---|---|
| Innerflect environment | `/ecosystem` | Public map of the full environment | planned |
| Open Mirror | `/open-mirror` | Self-builder; public/open | planned |
| OS Shop | `/shops/os` | Self-builder; public patterns | planned |
| Forge Shop | `/shops/forge` | Public catalogue, gated proprietary capabilities | planned |
| **Mirror** | `/` and `/mirror` | Authenticated company operator | **live** |
| Studio | `/studio` | Managed client; authenticated | planned |
| Admin | `/admin` | Innerflect team; internal | planned |
| Design and system surfaces | `/design/*` | Development and conformance | partially live |

The journeys these surfaces serve:

1. **Self-builder** — Open Mirror → OS Shop patterns → Forge Shop components → their own
   operating system.
2. **Managed client** — managed OS → proprietary Forge → Studio and Mirror; Innerflect
   operates delivery through Admin and its own Mirror.

One mechanism runs underneath all of them: a human in the UI and an agent acting through
an integration both go through the same typed operation — `interface or agent → typed
operation → policy and authority → effect → event → verification → outcome → Mirror`.

## Where things are decided (read before you write anything)

Start at `AGENTS.md` — it is short on purpose and points at the rest of this list rather
than repeating it. Do not duplicate any of these into a new file; update the source.

| Question | Authority |
|---|---|
| What does the product mean? What is a domain, a decision, a surface? Where is the product/deployment boundary between products? | [`PRODUCT_STRUCTURE.md`](PRODUCT_STRUCTURE.md) |
| What does each 3D object represent, and which record field puts it there? Who owns which files, and what are the open cross-team requests? | [`WORLD_ELEMENTS.md`](WORLD_ELEMENTS.md) |
| What products, entry points, relations and pages exist across the whole environment? | [`lib/design/ecosystem.ts`](lib/design/ecosystem.ts) (browsable at `/design/ecosystem`) |
| How is the 3D scene written? | `99 System/AI/Rules/Code/threejs-r3f.md` in the My OS vault |
| Where does element geometry come from? | [`tools/glyph-kit/README.md`](tools/glyph-kit/README.md) |
| Why was something decided, and what does that ruling rule out? | [`docs/DECISIONS.md`](docs/DECISIONS.md) |
| Who is working on what right now? | [`docs/STATUS.md`](docs/STATUS.md) |

## Working in this repository

Multiple agents share one branch (`mirror/core-four-world`) with no CI, so the written
record in this repo — not a chat log — is what keeps everyone consistent:

```bash
npm run sync   # git pull --rebase --autostash, then typecheck + lint
npm run check  # tsc, oxlint, token parity, glyph-manifest drift, no-fabrication, pick contract
```

Claim your paths in `docs/STATUS.md` before editing, stay inside the ownership zones
declared in `WORLD_ELEMENTS.md`, and raise a numbered request there instead of editing a
file another session owns. Commit small and single-purpose, then `git pull --rebase` and
push immediately — an unpushed commit is invisible to the other agents.

No secrets, credentials, customer data or private infrastructure information belong in
this repository. It is public.
