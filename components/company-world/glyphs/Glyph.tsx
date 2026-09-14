'use client';

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import type { Group } from 'three';
import { ELEMENTS_BY_ID } from '@/lib/design/elements';
import { GLYPH_IDS, glyphUrl, type GlyphId } from '../generated/glyphIds';
import type { SceneState } from '../tokens/sceneStates';
import { conformGlyph, type ConformStats } from './conformGlyph';
import { materialsFor } from './materialCache';

/**
 * One conformed kit asset, ready to place in the world.
 *
 * Merging is cached by `(id, state)` rather than done per instance. Four platforms
 * in `active` share one merge, one set of geometries and one set of materials;
 * `Object3D.clone()` copies the node graph but shares geometry and material
 * references, so an extra instance costs nothing but a transform.
 *
 * Consequence worth stating plainly: the cache owns those geometries and they are
 * never disposed, exactly like the material sets. A component that disposed its own
 * geometry on unmount would corrupt every other instance sharing it. That is why
 * there is no cleanup here — it would be a bug, not an omission.
 */
const merged = new Map<string, { group: Group; stats: ConformStats }>();

export function useGlyph(id: GlyphId, state: SceneState) {
  const { scene } = useGLTF(glyphUrl(id));
  const element = ELEMENTS_BY_ID[id];
  // A person is not a state. Expressed as data on the registry, so the renderer
  // never branches on an id — which the contract forbids.
  const effective: SceneState = element.takesState ? state : 'neutral';

  return useMemo(() => {
    const key = `${id}:${effective}`;
    let entry = merged.get(key);
    if (!entry) {
      entry = conformGlyph(scene, { materials: materialsFor(effective), id });
      merged.set(key, entry);
    }
    return { group: entry.group.clone(true), stats: entry.stats };
  }, [scene, id, effective]);
}

export function Glyph({
  id,
  state,
  ...props
}: { id: GlyphId; state: SceneState } & Record<string, unknown>) {
  const { group } = useGlyph(id, state);
  // <primitive> treats its object as borrowed and does not dispose it, which is
  // what we want: the geometry belongs to the merge cache above.
  return <primitive object={group} {...props} />;
}

/**
 * Warm the GLTF cache. Pass only the glyphs a surface actually needs — the home
 * scene uses a handful, so preloading all fifteen there would be needless GLB transfer for two
 * used models.
 */
export function preloadGlyphs(ids: readonly GlyphId[] = GLYPH_IDS) {
  for (const id of ids) useGLTF.preload(glyphUrl(id));
}
