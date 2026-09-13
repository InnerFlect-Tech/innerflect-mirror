/**
 * Conformance layer for the InnerFlect Mirror V1 glyph kit.
 *
 * The kit (`innerflect-mirror-v1-3d`) is good, original, low-poly work. It is
 * not, as shipped, safe to drop into the product scene, for three reasons that
 * this module exists to fix:
 *
 *  1. TRANSMISSION. Eight of the ten models use `KHR_materials_transmission`
 *     (13 transmissive materials in total). Three renders the ENTIRE scene into
 *     a transmission target once per transmissive object. This project has
 *     already measured that cost: removing transmission from five objects took
 *     the home scene from 224 draw calls to 100. A world built from the raw kit
 *     — one core plus four platforms — carries ten-plus transmissive objects.
 *     We replace transmission with clearcoat over a dark base, which reads the
 *     same at this scale for none of the passes.
 *
 *  2. BAKED COLOUR. The kit bakes teal into materials named "Active Teal" and
 *     "Autonomy Teal". The product's governing rule is that STATE decides
 *     colour — a Finance domain in `critical` must render red. A baked teal
 *     platform cannot express that, so the semantic rule would be broken by the
 *     asset itself. We remap by material ROLE onto the live state token.
 *
 *  3. DRAW CALLS. The kit ships 80 primitives across ten models (15 in the
 *     function platform alone). Four platforms plus a core is 71 draw calls
 *     before a single connection or label. We merge by material, which is
 *     lossless here because the kit has only ten distinct materials.
 *
 * The kit is left untouched on disk and stays regenerable from its own Python
 * source. Everything here is applied at load time.
 */
import { PALETTE, EMISSIVE, stateColor } from './tokens.js';

/**
 * What each kit material MEANS, which is what decides whether state may recolour
 * it. The kit's own names are the contract — they are stable and semantic.
 */
export const MATERIAL_ROLES = {
  'Graphite': 'structure',
  'Graphite Light': 'structureLight',
  'Warm White': 'warm',
  // A person is not a state. Human grey never takes the state colour, which is
  // the same rule the procedural human glyph follows.
  'Human Neutral': 'human',
  // Neutral dark glass. Transmission stripped; stays uncoloured.
  'Smoky Glass': 'glass',
  // State-carrying. These are the only materials the state layer may touch.
  'Mirror Glass': 'stateGlass',
  'Autonomy Teal': 'stateMid',
  'Active Teal': 'stateHot',
  'Attention Amber': 'stateHot',
  'Risk Field': 'stateGlass',
};

// Palette, state colours and emissive strengths all come from the shared token
// module. Nothing in this file defines a colour of its own.
const STRUCTURE = PALETTE;
const EMISSIVE_STRENGTH = { stateHot: EMISSIVE.hot, stateMid: EMISSIVE.mid, stateGlass: EMISSIVE.glass };

export const glyphStateColor = stateColor;

/**
 * Builds the conformed material set for one state. Cached by the caller so that
 * N platforms in the same state share one set — which is what actually keeps
 * the draw calls and the shader compiles down.
 */
export function buildMaterialSet(THREE, state) {
  const accent = new THREE.Color(glyphStateColor(state));
  const set = {};

  const structural = (hex, roughness, extra = {}) =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex), roughness, metalness: 0.06,
      envMapIntensity: 1.1, ...extra,
    });

  set.structure = structural(STRUCTURE.structure, 0.3);
  set.structureLight = structural(STRUCTURE.structureLight, 0.34);
  set.warm = structural(STRUCTURE.warm, 0.4);
  set.human = structural(STRUCTURE.human, 0.68);

  // Transmission replaced by clearcoat over a dark base. Same dark-glass read
  // against the studio environment; zero extra scene passes.
  set.glass = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(STRUCTURE.glass).multiplyScalar(0.25),
    roughness: 0.16, metalness: 0.2,
    clearcoat: 0.9, clearcoatRoughness: 0.2,
    envMapIntensity: 1.5, transparent: true, opacity: 0.42,
  });

  set.stateGlass = new THREE.MeshPhysicalMaterial({
    color: accent.clone().multiplyScalar(0.22),
    emissive: accent.clone().multiplyScalar(EMISSIVE_STRENGTH.stateGlass),
    emissiveIntensity: 1,
    roughness: 0.14, metalness: 0.18,
    clearcoat: 0.9, clearcoatRoughness: 0.18,
    envMapIntensity: 1.5, transparent: true, opacity: 0.5,
  });

  set.stateMid = new THREE.MeshStandardMaterial({
    color: accent.clone().multiplyScalar(0.5),
    emissive: accent.clone().multiplyScalar(EMISSIVE_STRENGTH.stateMid),
    emissiveIntensity: 1, roughness: 0.35, toneMapped: false,
  });

  // The only material allowed past the bloom threshold.
  set.stateHot = new THREE.MeshStandardMaterial({
    color: accent.clone(),
    emissive: accent.clone().multiplyScalar(EMISSIVE_STRENGTH.stateHot),
    emissiveIntensity: 1, roughness: 0.15, toneMapped: false,
  });

  return set;
}

/**
 * Conforms a loaded glTF scene in place and optionally merges it down.
 *
 * Returns the prepared group plus before/after statistics, because a claim that
 * this saves draw calls is worthless unless the number is measured.
 */
export function conformGlyph(THREE, source, { state = 'active', materials, merge = true, mergeGeometries } = {}) {
  const set = materials ?? buildMaterialSet(THREE, state);
  const root = source.clone(true);
  root.updateMatrixWorld(true);

  const before = { meshes: 0, transmissive: 0, materials: new Set() };
  const buckets = new Map();          // role -> geometry[]
  const unknown = new Set();

  root.traverse((o) => {
    if (!o.isMesh) return;
    before.meshes++;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (!m) return;
      before.materials.add(m.name || 'unnamed');
      if (m.transmission > 0) before.transmissive++;
    });

    const name = (mats[0] && mats[0].name) || '';
    const role = MATERIAL_ROLES[name];
    if (!role) unknown.add(name || '(unnamed)');
    const key = role ?? 'structure';

    if (!merge) {
      o.material = set[key];
      return;
    }
    // Bake the world transform in, so merged geometry keeps its placement.
    const g = o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    for (const attr of Object.keys(g.attributes)) {
      if (attr !== 'position' && attr !== 'normal') g.deleteAttribute(attr);
    }
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(g);
  });

  if (!merge) {
    return {
      group: root,
      stats: { before: { ...before, materials: before.materials.size }, after: { meshes: before.meshes }, unknown: [...unknown] },
    };
  }

  const out = new THREE.Group();
  for (const [role, geos] of buckets) {
    const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
    if (!merged) continue;
    if (geos.length > 1) geos.forEach((g) => g.dispose());
    out.add(new THREE.Mesh(merged, set[role]));
  }

  // The clone's own geometries are no longer referenced.
  root.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });

  return {
    group: out,
    stats: {
      before: { meshes: before.meshes, materials: before.materials.size, transmissive: before.transmissive },
      after: { meshes: out.children.length, materials: out.children.length },
      unknown: [...unknown],
    },
  };
}
