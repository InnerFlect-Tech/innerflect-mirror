'use client';

import { useRef } from 'react';
import { Edges, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { shell } from '../tokens/sceneColors';
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
      <mesh position={[0, -0.33, 0]}>
        <cylinderGeometry args={[1.36, 1.5, 0.15, 6]} />
        <meshStandardMaterial color={shell.foundation} roughness={0.68} />
      </mesh>

      <RoundedBox args={[2.24, 0.2, 1.9]} radius={0.06} smoothness={4} position={[0, -0.16, 0]}>
        <meshPhysicalMaterial
          color={shell.core}
          roughness={0.26}
          metalness={0.18}
          clearcoat={0.45}
        />
        <Edges color={token.edge} threshold={15} transparent opacity={0.45} />
      </RoundedBox>

      {/* Translucent body */}
      <RoundedBox args={[1.74, 0.78, 1.48]} radius={0.07} smoothness={4} position={[0, 0.33, 0]}>
        <meshPhysicalMaterial
          color="#0b3937"
          roughness={0.15}
          metalness={0.1}
          clearcoat={0.85}
          clearcoatRoughness={0.18}
          envMapIntensity={1.15}
          transparent
          opacity={0.8 * opacity}
        />
        <Edges color={token.edge} threshold={15} transparent opacity={0.62} />
      </RoundedBox>

      {/* Light core — the brightest object in the scene, always. It sits
          inside the translucent body, which is what makes the system read as
          having a core rather than being one more box. */}
      <mesh ref={core} position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color="#17a89f"
          emissive={coreEmissive}
          emissiveIntensity={subdued ? 0.7 : 1.15}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
