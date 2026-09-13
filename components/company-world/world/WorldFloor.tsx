'use client';

import { world } from '../tokens/sceneColors';
import { AtmosphericGrid } from './AtmosphericGrid';

export function WorldFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]} receiveShadow>
        <planeGeometry args={[26, 20]} />
        <meshStandardMaterial color={world.plane} roughness={0.96} metalness={0} />
      </mesh>
      <AtmosphericGrid />
    </group>
  );
}
