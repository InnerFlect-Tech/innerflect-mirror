'use client';

import { Color, MeshPhysicalMaterial, MeshStandardMaterial, type Material } from 'three';
import { massing, shell } from '@/lib/tokens';
import type { MaterialRole } from '@/lib/design/materialRoles';
import { stateTokens, type SceneState } from '../tokens/sceneStates';

/**
 * The material set the kit's assets are conformed to, one per state.
 *
 * Two problems are solved here, both measured rather than assumed:
 *
 *  1. TRANSMISSION. Eight of the ten kit models use `KHR_materials_transmission`.
 *     Three renders the ENTIRE scene into a separate target once per transmissive
 *     object — the raw kit measures 229 draw calls with 19 transmissive objects
 *     against a budget of 120; conformed it is 72 with none. Clearcoat over a dark
 *     base reads the same at this scale for none of the passes.
 *
 *  2. BAKED COLOUR. The kit bakes teal into materials named "Active Teal" and
 *     "Autonomy Teal". The rule is that STATE decides colour, so a Finance domain
 *     in `critical` must render red — which a baked-teal asset cannot express.
 *     Roles are rebound to the live state token instead.
 */
export type MaterialSet = Record<MaterialRole, Material>;

/**
 * Emissive comes from `sceneStates.ts`, not from a second scale of its own.
 *
 * The prototype carried `{hot: 3.0, mid: 1.65, glass: 0.45}` as scalar multipliers
 * while the scene carried per-state HDR triples. Two tuned parameterisations of the
 * same thing is exactly the duplication this work removes, so `stateHot` takes
 * `signalEmissive` directly — already tuned against `luminanceThreshold={1}` — and
 * the quieter roles derive from it. That makes the glyph layer and the procedural
 * island layer bloom identically, which they currently do not.
 */
const MID_OF_SIGNAL = 0.55;
const GLASS_OF_SIGNAL = 0.15;

function signal(state: SceneState): Color {
  const [r, g, b] = stateTokens[state].signalEmissive;
  return new Color(r, g, b);
}

function buildMaterialSet(state: SceneState): MaterialSet {
  const token = stateTokens[state];
  const accent = new Color(token.edge);
  const hot = signal(state);

  return {
    structure: new MeshStandardMaterial({
      color: new Color(massing.darkest), roughness: 0.62, metalness: 0.06, envMapIntensity: 1.1,
    }),
    structureLight: new MeshStandardMaterial({
      color: new Color(massing.mid), roughness: 0.58, metalness: 0.06, envMapIntensity: 1.1,
    }),
    warm: new MeshStandardMaterial({
      color: new Color(massing.light), roughness: 0.5, envMapIntensity: 1.1,
    }),
    // A person is not a state, so this never takes the accent.
    human: new MeshStandardMaterial({
      color: new Color(massing.light), roughness: 0.7, envMapIntensity: 0.9,
    }),
    // Transmission replaced by clearcoat over a dark base.
    glass: new MeshPhysicalMaterial({
      color: new Color(shell.platform), roughness: 0.18, metalness: 0.2,
      clearcoat: 0.9, clearcoatRoughness: 0.2, envMapIntensity: 1.5,
      transparent: true, opacity: 0.45,
    }),
    stateGlass: new MeshPhysicalMaterial({
      color: new Color(token.surface),
      emissive: hot.clone().multiplyScalar(GLASS_OF_SIGNAL),
      roughness: 0.16, metalness: 0.18,
      clearcoat: 0.9, clearcoatRoughness: 0.18, envMapIntensity: 1.5,
      transparent: true, opacity: 0.5,
    }),
    stateMid: new MeshStandardMaterial({
      color: accent.clone().multiplyScalar(0.5),
      emissive: hot.clone().multiplyScalar(MID_OF_SIGNAL),
      roughness: 0.35, toneMapped: false,
    }),
    // The only role allowed past the bloom threshold.
    stateHot: new MeshStandardMaterial({
      color: accent,
      emissive: hot,
      roughness: 0.15, toneMapped: false,
    }),
  };
}

const cache = new Map<SceneState, MaterialSet>();

/**
 * Shared across every glyph instance, and deliberately NEVER disposed.
 *
 * Five states x eight roles is forty materials for the lifetime of the page, which
 * is nothing. Refcounting them per component would be the wrong shape and would
 * break the sharing that keeps the shader-compile count down — so if you are here
 * to add a cleanup, that is why there isn't one.
 */
export function materialsFor(state: SceneState): MaterialSet {
  let set = cache.get(state);
  if (!set) {
    set = buildMaterialSet(state);
    cache.set(state, set);
  }
  return set;
}
