# Innerflect OS Shop and Forge Shop — HTML prototype

Standalone design prototype, intentionally isolated from the shared application, same
precedent as `prototypes/cockpit-html/`. Moved in from a separate, non-git "tryout"
workspace on 2026-09-14 so the work is no longer scattered outside this repository.

## What this is

Plain static HTML/CSS/JS — no framework, no build step. It demonstrates the two
self-builder-facing surfaces `PRODUCT_STRUCTURE.md` describes:

- `forge.html` / `forge-product.html` — **Forge Shop**: a shop of reusable creative
  layers (templates, sections, backgrounds, 3D scenes), with a membership model and
  a "reference study → owned system" build path.
- `os.html` / `os-portal.html` — **OS Shop**: a shop of agent architectures, automation
  recipes, governed prompts and operating blueprints, with a guided setup studio that
  turns a plain-language objective into an agent/automation architecture.
- `design-system.html`, `index.html` — shared design-system reference and a top-level
  index linking the two.
- `platform-pages.css/js`, `shared-system.css`, `portal-demo.css/js` — shared styling
  and behaviour across the pages above.
- `pattern-library/` — reference motion studies (video/poster assets) the Forge shop
  page cites as "reference studies," each marked as an external reference to be
  reconstructed as an original Innerflect system, not copied.

## Why it's here, not in `app/`

It is not wired into `app/shops/os` or `app/shops/forge` — those routes still do not
exist. `lib/design/ecosystem.ts` marks both `os-shop` and `forge-shop` as `building`
because of this prototype, not `live`: nothing here is deployed or reachable from the
real application yet. Porting it into real `app/shops/os/page.tsx` /
`app/shops/forge/page.tsx` routes (React, the shared design tokens, real navigation) is
follow-up work, not done by moving the files.

## Screenshots

`public/ecosystem-thumbnails/os-shop.png` and `forge-shop.png` are screenshots of
`os.html` and `forge.html` from this prototype, captured directly rather than through
`scripts/capture-ecosystem-thumbnails.ts` (that script assumes every page is reachable
either through the running app or a public URL; this one is neither). Re-capture them
by hand from these files if the prototype changes materially.
