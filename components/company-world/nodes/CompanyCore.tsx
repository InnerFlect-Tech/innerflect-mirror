'use client';

import { useRef } from 'react';
import { Edges, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { CORE } from './coreSpec';
import { coreEmissive, stateTokens, type SceneState } from '../tokens/sceneStates';

/**
 * The centre is not an enlarged island — it represents the operational model
 * itself, so it is structurally different: a dark foundation, a translucent
 * body, and a bright core inside it. That inner volume is what makes the
 * system feel like it HAS a core rather than being one more box.
 */
export function CompanyCore({
  state,
  subdued,
  running,
  reducedMotion,
}: {
  state: SceneState;
  subdued: boolean;
  running: boolean;
  reducedMotion: boolean;
}) {
  const core = useRef<Mesh>(null);
  const token = stateTokens[state];

  useFrame(({ clock }) => {
    if (!core.current || !running || reducedMotion) return;
    core.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.2) * 0.022);
  });

  const opacity = subdued ? 0.72 : 1;

  return (
    <group>
      {/* Dark foundation */}
      <mesh position={[0, CORE.foundation.y, 0]}>
        <cylinderGeometry
          args={[CORE.foundation.radiusTop, CORE.foundation.radiusBottom, CORE.foundation.height, CORE.foundation.segments]}
        />
        <meshStandardMaterial color={CORE.foundation.color} roughness={CORE.foundation.roughness} />
      </mesh>

      <RoundedBox args={CORE.plinth.size} radius={CORE.plinth.radius} smoothness={4} position={[0, CORE.plinth.y, 0]}>
        <meshPhysicalMaterial
          color={CORE.plinth.color}
          roughness={CORE.plinth.roughness}
          metalness={CORE.plinth.metalness}
          clearcoat={CORE.plinth.clearcoat}
        />
        <Edges color={token.edge} threshold={15} transparent opacity={CORE.plinth.edgeOpacity} />
      </RoundedBox>

      {/* Translucent body */}
      <RoundedBox args={CORE.body.size} radius={CORE.body.radius} smoothness={4} position={[0, CORE.body.y, 0]}>
        <meshPhysicalMaterial
          color={CORE.body.color}
          roughness={CORE.body.roughness}
          metalness={CORE.body.metalness}
          clearcoat={CORE.body.clearcoat}
          clearcoatRoughness={CORE.body.clearcoatRoughness}
          envMapIntensity={CORE.body.envMapIntensity}
          transparent
          opacity={CORE.body.opacity * opacity}
        />
        <Edges color={token.edge} threshold={15} transparent opacity={CORE.body.edgeOpacity} />
      </RoundedBox>

      {/* Light core — the brightest object in the scene, always. It sits
          inside the translucent body, which is what makes the system read as
          having a core rather than being one more box. */}
      <mesh ref={core} position={[0, CORE.light.y, 0]} rotation={[0, CORE.light.rotationY, 0]}>
        <octahedronGeometry args={[CORE.light.radius, 0]} />
        <meshStandardMaterial
          color={CORE.light.color}
          emissive={coreEmissive}
          emissiveIntensity={subdued ? CORE.light.subduedIntensity : CORE.light.intensity}
          toneMapped={false}
          flatShading
        />
      </mesh>
    </group>
  );
}
