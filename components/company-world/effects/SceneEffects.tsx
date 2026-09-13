'use client';

import { Bloom, EffectComposer } from '@react-three/postprocessing';

/**
 * Selective bloom, not `<Bloom intensity={4} />` over everything.
 *
 * The threshold is 1, so only materials with HDR emissive values above 1 and
 * `toneMapped={false}` are picked up — the company core, active connections,
 * and any domain in an attention or critical state. Everything else keeps its
 * shape. This is the difference between a controlled visual and a generic
 * sci-fi dashboard.
 */
export function SceneEffects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.68}
        luminanceThreshold={1}
        luminanceSmoothing={0.08}
        mipmapBlur
      />
    </EffectComposer>
  );
}
