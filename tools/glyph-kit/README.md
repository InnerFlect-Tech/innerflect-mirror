# Glyph kit — geometry source of truth

`generate_innerflect_v2.py` builds the fifteen canonical Mirror elements from primitives
(chamfered boxes, low-poly spheres, frustums, tori, tubes, an octahedron) and writes them
as glTF binaries to `public/models/innerflect-v2/`.

Vendored into this repo deliberately. The geometry source of truth is Python → GLB, and a
source of truth that lives in one person's `~/Desktop` is one `rm -rf` from gone.

V2 is the approved semantic set: Company Core, Domain Platform, Human Glyph, Agent Glyph,
Tool Glyph, Knowledge Object, Workflow Line, Decision Gate, Action Pulse, Risk Hotspot,
Step Node, Record Token, Verification Marker, Outcome Marker and Permission Boundary.

## V2.1 composition grammar

The 2026-09-14 pass rebuilt all fifteen shapes as one composable language. The important
change is not decorative: elements no longer behave like fifteen unrelated sculptures.

- **Step Node is the repeated primary unit.** Actors compose on top of it; tools and
  knowledge attach beside it.
- **Decision, Verification and Outcome are node variants.** Their diamond, ring and flag
  silhouettes remain legible without colour.
- **Workflow Line is a unit connector.** Runtime owns its length and curvature.
- **Record Token and Action Pulse live on an edge.** Risk Hotspot overlays the affected
  node; none of the three brings its own environment.
- **Permission Boundary is a normalised style unit.** Runtime derives its extent from the
  authority record and scales/repeats the unit around that scope.
- **Human and Agent are deliberately different silhouettes.** A Human remains entirely
  grey; an Agent is a compact machine head and may receive the work state.

The matching lightweight projection is
`components/company-world/design/ElementSymbol2D.tsx`. It uses the same fifteen ids, the
same authored registry and the same state tokens. It is not a second semantic catalogue.

## Regenerating

```bash
python3 tools/glyph-kit/generate_innerflect_v2.py            # geometry only
python3 tools/glyph-kit/generate_innerflect_v2.py --preview  # also the PNG contact sheet
```

Geometry needs **numpy and scipy only**. Previews additionally need matplotlib and Pillow,
and render fonts from Linux-only paths, so they degrade on macOS. Previews are opt-in
because the live `/design/elements` route is the real contact sheet now — it renders the
actual product materials under the actual bloom pass, which a matplotlib raster never could.

## Reproducibility and artifact policy

The committed V2 artifacts and their checksums remain the accepted baseline. The generator
now canonicalises every convex-hull triangle by preserving winding, rotating the smallest
vertex index first, and sorting the faces before serialisation. Two complete V2.1 runs in
the current environment (numpy 2.3.5, scipy 1.17.0) were byte-identical.

The earlier V1 investigation remains useful history. With scipy 1.13.1 it measured:

| Model | Difference |
|---|---|
| `human-glyph`, `tool-glyph`, `function-platform`, `action-pulse`, `risk-hotspot` | byte-identical |
| `decision-gate` | max delta 2.3e-16 — float noise, harmless |
| `company-core`, `agent-glyph` | **max delta ~2.5 world units on ~40 floats** |

The JSON chunk was identical. The large flattened-position delta was consistent with
`scipy.spatial.ConvexHull` emitting equivalent triangles in a different order; that is the
specific nondeterminism `canonical_faces()` removes. Reproduction across scipy versions has
not yet been measured, so a toolchain change still requires the full visual and checksum
review below.

**The committed GLBs are artifacts, not a disposable cache.** If you change geometry:

1. regenerate,
2. **look at every model** on `/design/elements`, not just the one you edited,
3. update `CHECKSUMS.sha256` in `public/models/innerflect-v2/` deliberately,
4. say in the commit message which models changed and why.

Pinning scipy, or replacing `ConvexHull` with a deterministic chamfer, would make this
reproducible. Worth doing before geometry changes become routine; not worth blocking on.

## Verifying the artifacts

```bash
cd public/models/innerflect-v2 && shasum -a 256 -c CHECKSUMS.sha256
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
