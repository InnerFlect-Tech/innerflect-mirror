'use client';

import { RoundedBox } from '@react-three/drei';
import { massing } from '../tokens/sceneColors';

/**
 * A small library of low-detail semantic objects (§8). These represent
 * semantic scale, not physical reality — a company of 500 people never renders
 * 500 people. Every piece here is tens of triangles, shares the monochrome
 * palette, and is tinted only where state needs to be legible.
 */

type P = [number, number, number];

export function Tower({
  position,
  height,
  width = 0.22,
  accent,
  windows = 3,
}: {
  position: P;
  height: number;
  width?: number;
  accent: string;
  windows?: number;
}) {
  return (
    <group position={position}>
      <RoundedBox
        args={[width, height, width]}
        radius={width * 0.06}
        smoothness={2}
        position={[0, height / 2, 0]}
      >
        <meshStandardMaterial color={massing.dark} roughness={0.62} />
      </RoundedBox>
      {Array.from({ length: windows }, (_, i) => (
        <mesh
          key={i}
          position={[0, height * ((i + 1) / (windows + 1)), width / 2 + 0.002]}
        >
          <planeGeometry args={[width * 0.62, 0.018]} />
          <meshBasicMaterial color={accent} transparent opacity={0.5} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function Warehouse({ position, accent }: { position: P; accent: string }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.52, 0.2, 0.32]} radius={0.02} smoothness={2} position={[0, 0.1, 0]}>
        <meshStandardMaterial color={massing.dark} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, 0.21, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.38, 0.03, 0.38]} />
        <meshStandardMaterial color={massing.mid} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.07, 0.161]}>
        <planeGeometry args={[0.16, 0.09]} />
        <meshBasicMaterial color={accent} transparent opacity={0.38} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function DeskCluster({ position, accent }: { position: P; accent: string }) {
  return (
    <group position={position}>
      {[-0.13, 0.13].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.055, 0]}>
            <boxGeometry args={[0.2, 0.012, 0.14]} />
            <meshStandardMaterial color={massing.mid} roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.09, -0.05]} rotation={[-0.22, 0, 0]}>
            <planeGeometry args={[0.11, 0.06]} />
            <meshBasicMaterial color={accent} transparent opacity={0.42} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function DocumentStack({ position, accent }: { position: P; accent: string }) {
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[i * 0.006, 0.012 + i * 0.018, i * 0.004]} rotation={[0, i * 0.12, 0]}>
          <boxGeometry args={[0.13, 0.016, 0.1]} />
          <meshStandardMaterial
            color={i === 2 ? massing.light : massing.mid}
            emissive={i === 2 ? accent : '#000000'}
            emissiveIntensity={i === 2 ? 0.18 : 0}
            roughness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Tree({ position }: { position: P }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.008, 0.012, 0.08, 4]} />
        <meshStandardMaterial color={massing.darkest} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <coneGeometry args={[0.05, 0.12, 5]} />
        <meshStandardMaterial color={massing.dark} roughness={0.85} />
      </mesh>
    </group>
  );
}

export function Person({ position, accent }: { position: P; accent: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.115, 0]}>
        <sphereGeometry args={[0.026, 8, 6]} />
        <meshStandardMaterial color={massing.light} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <capsuleGeometry args={[0.024, 0.05, 3, 6]} />
        <meshStandardMaterial color={massing.mid} emissive={accent} emissiveIntensity={0.14} roughness={0.7} />
      </mesh>
    </group>
  );
}
