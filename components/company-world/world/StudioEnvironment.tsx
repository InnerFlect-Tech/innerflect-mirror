'use client';

import { Environment, Lightformer } from '@react-three/drei';

/**
 * Physical transmission has nothing to reflect without an environment, which is
 * why the glass platforms and the company body read as flat quads until this
 * exists. Built from lightformers rather than an HDR file so it costs no
 * network request and stays under our control — a downloaded studio HDR would
 * also drag its own colour cast into a scene whose palette is the whole point.
 *
 * Deliberately neutral: the teal in the world comes from emissive material
 * inside the system, never from a coloured lamp pointed at it.
 */
export function StudioEnvironment() {
  return (
    <Environment resolution={128} frames={1}>
      {/* Key — broad and soft, high and to the left. */}
      <Lightformer
        intensity={1.4}
        position={[-4, 6, 3]}
        rotation={[Math.PI / 2.4, 0, 0]}
        scale={[10, 10, 1]}
        color="#dfeeec"
      />
      {/* Fill — cooler, opposite side, much weaker. */}
      <Lightformer
        intensity={0.42}
        position={[5, 3, -4]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[8, 6, 1]}
        color="#9fc0bc"
      />
      {/* Rim — a thin bright edge so bevels have something to catch. */}
      <Lightformer
        form="ring"
        intensity={0.9}
        position={[0, 4, -6]}
        scale={[4, 4, 1]}
        color="#b9d6d2"
      />
      {/* Floor bounce, keeps the undersides from going pure black. */}
      <Lightformer
        intensity={0.22}
        position={[0, -3, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[12, 12, 1]}
        color="#16302e"
      />
    </Environment>
  );
}
