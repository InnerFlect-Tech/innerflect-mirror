'use client';

import { BufferGeometry, Group, Mesh, type Object3D } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MATERIAL_ROLES, type MaterialRole } from '@/lib/design/materialRoles';
import type { MaterialSet } from './materialCache';

/**
 * Conforms a loaded kit asset to the product's rules.
 *
 * The kit is good, original, low-poly work. It is not safe to render as shipped:
 * it carries transmission (a full extra scene pass per object), it bakes colour
 * into materials the state layer must be able to override, and it ships 80
 * primitives across ten models — four platforms plus a core is 71 draw calls
 * before a single connection or label exists.
 *
 * All three are fixed here, at load, so the kit stays untouched on disk and
 * regenerable from its own Python source.
 */

export type ConformStats = {
  before: { meshes: number; materials: number; transmissive: number };
  after: { meshes: number };
  /** Material names with no role. Should always be empty — see below. */
  unknown: string[];
};

export type ConformResult = { group: Group; stats: ConformStats };

function roleFor(name: string, unknown: Set<string>, id: string): MaterialRole {
  const role = (MATERIAL_ROLES as Record<string, MaterialRole | undefined>)[name];
  if (role) return role;
  unknown.add(name || '(unnamed)');
  // `MATERIAL_ROLES satisfies Record<KitMaterialName, MaterialRole>` makes this
  // unreachable for any material the manifest knows about, so getting here means
  // a GLB's bytes disagree with the manifest describing them — a hand-edited asset.
  // Degrade rather than crash the product, but never do it quietly.
  if (process.env.NODE_ENV !== 'production') {
    console.error(
      `[glyphs] ${id}: material "${name}" has no role, rendering as structure. ` +
        `Add it to lib/design/materialRoles.ts and re-run npm run emit:glyphs.`,
    );
  }
  return 'structure';
}

/**
 * Clones the source, bakes world transforms in, buckets geometry by material role
 * and merges each bucket. Returns one mesh per role — ten materials, so at most ten
 * draw calls for an asset of any complexity.
 *
 * Transmission cannot survive this by construction rather than by a strip step
 * someone might forget: only `position` and `normal` are taken from the source, and
 * every material is replaced.
 */
export function conformGlyph(
  source: Object3D,
  { materials, id = 'glyph' }: { materials: MaterialSet; id?: string },
): ConformResult {
  const root = source.clone(true);
  root.updateMatrixWorld(true);

  const before = { meshes: 0, materials: new Set<string>(), transmissive: 0 };
  const buckets = new Map<MaterialRole, BufferGeometry[]>();
  const unknown = new Set<string>();

  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    before.meshes++;

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      if (!m) continue;
      before.materials.add(m.name || 'unnamed');
      if ('transmission' in m && typeof m.transmission === 'number' && m.transmission > 0) {
        before.transmissive++;
      }
    }

    const role = roleFor(mats[0]?.name ?? '', unknown, id);

    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);
    for (const attr of Object.keys(geo.attributes)) {
      if (attr !== 'position' && attr !== 'normal') geo.deleteAttribute(attr);
    }
    const bucket = buckets.get(role);
    if (bucket) bucket.push(geo);
    else buckets.set(role, [geo]);
  });

  const group = new Group();
  group.name = id;
  for (const [role, geos] of buckets) {
    const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
    if (!merged) continue;
    if (geos.length > 1) for (const g of geos) g.dispose();
    group.add(new Mesh(merged, materials[role]));
  }

  // Nothing is disposed here, deliberately. `Object3D.clone()` SHARES geometry by
  // reference, so disposing the clone's geometry would free the buffers owned by
  // drei's `useGLTF` cache — shared by every other (id, state) conform of the same
  // asset. The working copies this function owns are the `geometry.clone()` calls
  // above, and those are either merged (and the inputs disposed) or handed on.

  return {
    group,
    stats: {
      before: { meshes: before.meshes, materials: before.materials.size, transmissive: before.transmissive },
      after: { meshes: group.children.length },
      unknown: [...unknown],
    },
  };
}
