/**
 * The kit, as data.
 *
 * Loads every GLB in `public/models/innerflect-v2/`, runs it through the SAME
 * `conformGlyph` the product uses — transmission stripped, baked colour rebound
 * to roles, geometry merged per role — and writes the result as JSON together
 * with the material set for each state and the authored element registry.
 *
 * A builder surface can then hand someone the real pieces without a GLTF loader,
 * without a second conformance layer, and without a second opinion about what a
 * Decision Gate is. If the kit is regenerated, this is re-run; nothing downstream
 * gets to drift.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { Color, MeshStandardMaterial, type BufferGeometry, type Mesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { conformGlyph } from '../components/company-world/glyphs/conformGlyph';
import { materialsFor } from '../components/company-world/glyphs/materialCache';
import type { MaterialSet } from '../components/company-world/glyphs/materialCache';
import type { MaterialRole } from '../lib/design/materialRoles';
import { GLYPH_IDS, GLYPH_MANIFEST } from '../components/company-world/generated/glyphIds';
import { ELEMENTS } from '../lib/design/elements';
import { stateLabel, type SceneState } from '../lib/model/state';
import { stateTokens } from '../components/company-world/tokens/sceneStates';

const STATES = Object.keys(stateLabel) as SceneState[];

const ROLES: MaterialRole[] = ['structure', 'structureLight', 'warm', 'human', 'glass', 'stateGlass', 'stateMid', 'stateHot'];
const r4 = (n: number) => Math.round(n * 1e4) / 1e4;

// A probe set: each material carries its role as its name, so the conformed
// group can be read back role by role without conformGlyph having to say so.
const probe = Object.fromEntries(
  ROLES.map((role) => [role, Object.assign(new MeshStandardMaterial(), { name: role })]),
) as unknown as MaterialSet;

function serialiseMaterial(m: Record<string, unknown>) {
  const hex = (c: unknown) => (c instanceof Color ? `#${c.getHexString()}` : undefined);
  const rgb = (c: unknown) => (c instanceof Color ? [r4(c.r), r4(c.g), r4(c.b)] : undefined);
  return {
    kind: (m.type as string) === 'MeshPhysicalMaterial' ? 'physical' : 'standard',
    color: hex(m.color),
    // Emissive is kept linear: these values run above 1 on purpose and a hex
    // round-trip would clamp exactly the channels the bloom pass looks for.
    emissive: rgb(m.emissive),
    emissiveIntensity: m.emissiveIntensity as number,
    roughness: m.roughness as number,
    metalness: m.metalness as number,
    clearcoat: m.clearcoat as number | undefined,
    clearcoatRoughness: m.clearcoatRoughness as number | undefined,
    envMapIntensity: m.envMapIntensity as number | undefined,
    transparent: m.transparent as boolean,
    opacity: m.opacity as number,
    toneMapped: m.toneMapped as boolean,
  };
}

const loader = new GLTFLoader();

function parseGlb(file: string): Promise<{ scene: import('three').Group }> {
  const buf = readFileSync(file);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  return new Promise((resolve, reject) => loader.parse(ab, '', (g) => resolve(g as never), reject));
}

const pieces = [];
let totalTris = 0;

for (const id of GLYPH_IDS) {
  const gltf = await parseGlb(`public/models/innerflect-v2/${id}.glb`);
  const { group, stats } = conformGlyph(gltf.scene, { materials: probe, id });

  // Bounds, so a builder can sit a piece on the floor and scale the family to a
  // common footprint instead of guessing per asset.
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  const parts = group.children.map((child) => {
    const mesh = child as Mesh;
    const geo = mesh.geometry as BufferGeometry;
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    minX = Math.min(minX, bb.min.x); minY = Math.min(minY, bb.min.y); minZ = Math.min(minZ, bb.min.z);
    maxX = Math.max(maxX, bb.max.x); maxY = Math.max(maxY, bb.max.y); maxZ = Math.max(maxZ, bb.max.z);
    const tris = (geo.index ? geo.index.count : geo.attributes.position.count) / 3;
    totalTris += tris;
    return {
      role: (mesh.material as { name: string }).name as MaterialRole,
      triangles: tris,
      geo: {
        position: Array.from(geo.attributes.position.array, r4),
        normal: geo.attributes.normal ? Array.from(geo.attributes.normal.array, r4) : undefined,
        index: geo.index ? Array.from(geo.index.array) : undefined,
      },
    };
  });

  const element = ELEMENTS.find((e) => e.id === id)!;
  const meta = GLYPH_MANIFEST[id];
  pieces.push({
    id,
    name: element.name,
    semantic: meta.semantic,
    drivenBy: element.drivenBy,
    takesState: element.takesState,
    modelled: element.modelled,
    rendered: element.rendered,
    bounds: { min: [r4(minX), r4(minY), r4(minZ)], max: [r4(maxX), r4(maxY), r4(maxZ)] },
    conform: stats,
    parts,
  });
}

// One material set per state, built by the product's own cache.
const materials = Object.fromEntries(
  STATES.map((state) => {
    const set = materialsFor(state);
    return [state, Object.fromEntries(ROLES.map((r) => [r, serialiseMaterial(set[r] as never)]))];
  }),
);

const kit = {
  generated: new Date().toISOString().slice(0, 10),
  states: STATES.map((s) => ({ id: s, label: stateLabel[s], accent: stateTokens[s].label, edge: stateTokens[s].edge })),
  materials,
  pieces,
};

const out = process.argv[2] ?? 'kit.json';
writeFileSync(out, JSON.stringify(kit));
console.log(
  `wrote ${out} - ${pieces.length} pieces, ${totalTris} triangles, ` +
  `${pieces.reduce((n, p) => n + p.parts.length, 0)} role meshes ` +
  `(from ${pieces.reduce((n, p) => n + p.conform.before.meshes, 0)} raw, ` +
  `${pieces.reduce((n, p) => n + p.conform.before.transmissive, 0)} transmissive stripped)`,
);
