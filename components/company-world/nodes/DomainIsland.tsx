'use client';

import { useRef, useState } from 'react';
import { Edges, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { damp } from 'maath/easing';
import type { Group } from 'three';
import { shell } from '../tokens/sceneColors';
import { stateTokens } from '../tokens/sceneStates';
import type { DomainVisual } from './NodeState';
import { DomainContent } from './DomainContent';

/**
 * Four stacked layers, which is what separates a WebGL prototype from a
 * polished product visualisation:
 *
 *   miniature environment
 *   inner illuminated surface
 *   dark bevelled glass platform
 *   soft contact shadow (owned by the scene)
 *
 * The bevels matter. A BoxGeometry with razor-sharp edges looks cheap at any
 * material quality.
 */
export function DomainIsland({
  visual,
  index: _index,
  selected,
  subdued,
  onSelect,
  reducedMotion,
}: {
  visual: DomainVisual;
  index: number;
  selected: boolean;
  subdued: boolean;
  onSelect: () => void;
  reducedMotion: boolean;
}) {
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { domain, position, scale } = visual;
  const token = stateTokens[domain.state];

  // Hover barely moves anything. `hover → scale 1.2` reads as a game menu.
  useFrame(({ invalidate }, delta) => {
    const g = group.current;
    if (!g) return;
    const lift = selected ? 0.13 : hovered ? 0.04 : 0;
    if (reducedMotion) {
      g.position.y = lift;
      return;
    }
    damp(g.position, 'y', lift, 0.14, delta);
    // Request the next frame only while the lift is still settling.
    if (Math.abs(lift - g.position.y) > 1e-4) invalidate();
  });

  const opacity = subdued ? 0.8 : 1;
  const edgeOpacity = subdued ? 0.2 : selected ? 0.8 : hovered ? 0.5 : 0.3;
  const emission = token.emission * (selected ? 1.35 : hovered ? 1.15 : 1) * (subdued ? 0.62 : 1);

  return (
    <group position={position}>
      <group
        ref={group}
        scale={scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        {/* Dark glass shell — it catches teal light, it is not teal itself. */}
        <RoundedBox args={[1.96, 0.16, 1.44]} radius={0.055} smoothness={4} position={[0, -0.08, 0]}>
          {/* No `transmission` here on purpose. Three renders the whole scene
              into a transmission target once per transmissive object, so five
              glass platforms cost five extra passes for a refraction nobody can
              see at this scale. Clearcoat over a dark base against the studio
              environment gives the same dark-glass read for one draw call. */}
          <meshPhysicalMaterial
            color={shell.platform}
            roughness={0.26}
            metalness={0.18}
            clearcoat={0.6}
            clearcoatRoughness={0.28}
            envMapIntensity={0.85}
            transparent
            opacity={opacity}
          />
          <Edges color={token.edge} threshold={15} transparent opacity={edgeOpacity} />
        </RoundedBox>

        {/* Inner illuminated surface — separate geometry, separate material,
            and deliberately tone-mapped so the platform glows without blooming. */}
        <RoundedBox args={[1.7, 0.045, 1.2]} radius={0.03} smoothness={3} position={[0, 0.008, 0]}>
          <meshStandardMaterial
            color={token.surface}
            emissive={token.surfaceEmissive}
            emissiveIntensity={emission}
            roughness={0.5}
            transparent
            opacity={opacity}
          />
        </RoundedBox>

        {/* The one piece allowed to bloom: a thin signal strip along the front
            edge. Small, HDR, untone-mapped — this is what carries state across
            the room without turning the island into a lamp. */}
        <mesh position={[0, 0.032, 0.58]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.16, 0.028]} />
          <meshStandardMaterial
            emissive={token.signalEmissive}
            emissiveIntensity={selected ? 1.25 : subdued ? 0.45 : 0.85}
            color="#000000"
            toneMapped={false}
            transparent
            opacity={opacity}
          />
        </mesh>

        <DomainContent domain={domain} accent={token.edge} />
      </group>
    </group>
  );
}
