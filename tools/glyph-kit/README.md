# Glyph kit — geometry source of truth

`generate_innerflect_v1.py` builds the ten canonical Mirror elements from primitives
(chamfered boxes, low-poly spheres, frustums, tori, tubes, an octahedron) and writes them
as glTF binaries to `public/models/innerflect-v1/`.

Vendored into this repo deliberately. The geometry source of truth is Python → GLB, and a
source of truth that lives in one person's `~/Desktop` is one `rm -rf` from gone.

## Regenerating

```bash
python3 tools/glyph-kit/generate_innerflect_v1.py            # geometry only
python3 tools/glyph-kit/generate_innerflect_v1.py --preview  # also the PNG contact sheet
```

Geometry needs **numpy and scipy only**. Previews additionally need matplotlib and Pillow,
and render fonts from Linux-only paths, so they degrade on macOS. Previews are opt-in
because the live `/design/elements` route is the real contact sheet now — it renders the
actual product materials under the actual bloom pass, which a matplotlib raster never could.

## ⚠️ Regeneration is not byte-reproducible

Measured on 2026-09-13, regenerating with scipy 1.13.1 against the committed artifacts:

| Model | Difference |
|---|---|
| `human-glyph`, `tool-glyph`, `function-platform`, `action-pulse`, `risk-hotspot` | byte-identical |
| `decision-gate` | max delta 2.3e-16 — float noise, harmless |
| `company-core`, `agent-glyph` | **max delta ~2.5 world units on ~40 floats** |

The JSON chunk (materials, colours, node graph) is identical in every case, so this is
purely geometry. A 2.5-unit delta on a 3.3 m model is a genuinely different shape, not
rounding — almost certainly `scipy.spatial.ConvexHull` (used by `chamfered_box`) emitting
faces in a different order or orientation than the version the kit was authored against.

**So: the committed GLBs are the artifacts, not a cache.** Do not regenerate casually and
commit the result. If you change geometry:

1. regenerate,
2. **look at every model** on `/design/elements`, not just the one you edited,
3. update `CHECKSUMS.sha256` in `public/models/innerflect-v1/` deliberately,
4. say in the commit message which models changed and why.

Pinning scipy, or replacing `ConvexHull` with a deterministic chamfer, would make this
reproducible. Worth doing before geometry changes become routine; not worth blocking on.

## Verifying the artifacts

```bash
cd public/models/innerflect-v1 && shasum -a 256 -c CHECKSUMS.sha256
```

This checks that nobody hand-edited a binary. It does **not** check that regeneration
reproduces them — see above.

## What the kit owns, and what it does not

It owns **geometry** and the glTF **material name** on each mesh (`"Active Teal"`,
`"Human Neutral"`, `"Smoky Glass"`…). Those names are the contract the runtime role map
keys on, so renaming one in `MATERIALS` is a breaking change.

It does **not** own colour. The conformance layer replaces every material at load so that
state — not the asset — decides colour: a domain in `critical` must render red, which a
baked-teal GLB physically cannot express. The kit's own palette reaches only its PNG
previews. Do not "fix" the kit by baking the product tokens into it.
