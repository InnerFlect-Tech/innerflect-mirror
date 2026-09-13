'use client';

import { Instance, Instances } from '@react-three/drei';

/**
 * Distant, nearly invisible geometry. It suggests the company exists inside a
 * larger world without adding any information to read.
 *
 * Instanced: ten identical boxes are one draw call, not ten. Positions are a
 * fixed table rather than random, because a layout that reshuffles on every
 * reload is not a curated composition.
 */
const SEEDS: [number, number, number][] = [
  [-9.6, -6.8, 0.42],
  [-8.2, 5.4, 0.3],
  [8.9, -5.8, 0.48],
  [9.7, 3.1, 0.34],
  [-10.4, 0.6, 0.24],
  [5.6, -8.1, 0.28],
  [-4.8, 8.3, 0.36],
  [2.6, 8.9, 0.22],
  [10.8, -1.6, 0.3],
  [-6.9, -9.1, 0.32],
];

export function BackgroundContext() {
  return (
    <Instances limit={SEEDS.length} frustumCulled={false}>
      <boxGeometry args={[0.38, 1, 0.38]} />
      <meshStandardMaterial color="#0a1517" roughness={0.95} />
      {SEEDS.map(([x, z, h], i) => (
        <Instance key={i} position={[x, -0.42 + h / 2, z]} scale={[1, h, 1]} />
      ))}
    </Instances>
  );
}
