/**
 * Loads the V1 glyph kit once and hands out conformed, state-coloured copies.
 *
 * Both surfaces use this, so an element only ever exists in one place: fix a
 * glyph here (or regenerate the kit) and the sheet and the floor both change.
 *
 * Materials are cached per state, which is what stops ten platforms compiling
 * ten shader programs and keeps the merged draw calls shared.
 */
import { conformGlyph, buildMaterialSet } from './conformGlyph.js';

export const GLYPH_IDS = [
  'company-core', 'function-platform', 'human-glyph', 'agent-glyph', 'tool-glyph',
  'knowledge-slab', 'workflow-line', 'decision-gate', 'action-pulse', 'risk-hotspot',
];

let sources = null;
const materialCache = new Map();

/**
 * The kit ships as GLB. It travels base64 inside one JSON payload because the
 * host serves standard web media types and `model/gltf-binary` is not one; the
 * bytes are identical to the kit's own files.
 */
export async function loadKit(THREE, GLTFLoader, url = 'models.json') {
  if (sources) return sources;
  const loader = new GLTFLoader();
  const payload = await fetch(url).then((r) => r.json());
  const entries = await Promise.all(GLYPH_IDS.map((id) => new Promise((res) => {
    const b64 = payload[id];
    if (!b64) { console.error('glyphKit: missing', id); return res([id, null]); }
    const bin = atob(b64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    loader.parse(buf.buffer, '', (g) => res([id, g.scene]), (e) => { console.error(id, e); res([id, null]); });
  })));
  sources = new Map(entries);
  return sources;
}

export function materialsFor(THREE, state) {
  if (!materialCache.has(state)) materialCache.set(state, buildMaterialSet(THREE, state));
  return materialCache.get(state);
}

/**
 * A conformed instance of one glyph. `human-glyph` is forced to the neutral set
 * because a person is not a state — the kit's own `Human Neutral` material says
 * the same thing, so the rule is enforced twice over.
 */
export function makeGlyph(THREE, id, { state = 'active', merge = true, mergeGeometries } = {}) {
  const src = sources && sources.get(id);
  if (!src) return null;
  const materials = materialsFor(THREE, id === 'human-glyph' ? 'neutral' : state);
  return conformGlyph(THREE, src, { state, merge, mergeGeometries, materials });
}

/** Normalises a glyph into a footprint, returning the group and its height. */
export function fitGlyph(THREE, group, footprint) {
  const bb = new THREE.Box3().setFromObject(group);
  const size = bb.getSize(new THREE.Vector3());
  const ctr = bb.getCenter(new THREE.Vector3());
  const k = footprint / Math.max(size.x, size.z, 0.001);
  group.scale.setScalar(k);
  group.position.set(-ctr.x * k, -bb.min.y * k, -ctr.z * k);
  return { height: size.y * k, scale: k };
}
