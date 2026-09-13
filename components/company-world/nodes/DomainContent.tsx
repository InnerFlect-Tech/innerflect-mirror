'use client';

import {
  DeskCluster,
  DocumentStack,
  Person,
  Tower,
  Tree,
  Warehouse,
} from '../assets/primitives';

/**
 * What sits on an island. Composed from shared low-detail primitives and keyed
 * by the domain's index in the world, never by its name — a renderer that
 * branches on `id === 'finance'` stops being a projection of the model.
 *
 * `accent` arrives from the state token, so a domain in trouble tints its own
 * contents without any per-domain colour existing anywhere.
 */
export function DomainContent({
  shape,
  accent,
}: {
  shape: number;
  accent: string;
}) {
  switch (shape % 4) {
    case 0:
      return (
        <group position={[0, 0.04, -0.08]}>
          <Tower position={[-0.32, 0, -0.1]} height={0.4} accent={accent} />
          <Tower position={[0.02, 0, 0.02]} height={0.62} width={0.24} accent={accent} windows={4} />
          <Tower position={[0.34, 0, -0.06]} height={0.3} width={0.18} accent={accent} windows={2} />
          <Tree position={[-0.6, 0, 0.22]} />
          <Person position={[0.5, 0, 0.24]} accent={accent} />
        </group>
      );
    case 1:
      return (
        <group position={[0, 0.04, -0.04]}>
          <DeskCluster position={[-0.24, 0, 0.06]} accent={accent} />
          <DeskCluster position={[0.22, 0, -0.12]} accent={accent} />
          <Tower position={[0.5, 0, 0.12]} height={0.34} width={0.17} accent={accent} windows={2} />
          <Person position={[-0.02, 0, 0.24]} accent={accent} />
          <Person position={[0.42, 0, 0.26]} accent={accent} />
        </group>
      );
    case 2:
      return (
        <group position={[0, 0.04, -0.04]}>
          <Warehouse position={[-0.26, 0, -0.04]} accent={accent} />
          <Warehouse position={[0.3, 0, 0.08]} accent={accent} />
          <mesh position={[0.02, 0.06, 0.26]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#304345" roughness={0.7} />
          </mesh>
          <Person position={[-0.52, 0, 0.24]} accent={accent} />
        </group>
      );
    default:
      return (
        <group position={[0, 0.04, -0.04]}>
          <Tower position={[-0.28, 0, -0.08]} height={0.52} width={0.2} accent={accent} windows={4} />
          <DocumentStack position={[0.12, 0, 0.06]} accent={accent} />
          <DocumentStack position={[0.36, 0, -0.08]} accent={accent} />
          <Person position={[-0.02, 0, 0.26]} accent={accent} />
          <Tree position={[0.58, 0, 0.2]} />
        </group>
      );
  }
}
