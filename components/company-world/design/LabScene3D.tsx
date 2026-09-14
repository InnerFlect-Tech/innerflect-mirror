'use client';

/**
 * The lab's 3D projection.
 *
 * Request 13, criterion 1: *one* in-memory graph drives both projections.
 * This component owns no graph of its own — it is handed the same nodes and
 * edges the 2D canvas renders, and the same selection, so toggling cannot
 * lose an id, a position, a connection, a state or a selection. If the two
 * projections ever disagree it is a bug in the mapping below, not a second
 * source of truth to reconcile.
 */

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { AgXToneMapping, Box3, SRGBColorSpace, Vector3, type Group } from 'three';
import type { Edge } from '@xyflow/react';
import { ELEMENTS_BY_ID } from '@/lib/design/elements';
import type { SceneState } from '@/lib/model/state';
import { stateColors } from '@/lib/tokens';
import type { GlyphId } from '../generated/glyphIds';
import { useGlyph } from '../glyphs/Glyph';
import { StudioEnvironment } from '../world/StudioEnvironment';

export type Projected = {
  id: string;
  elementId: string;
  state: SceneState;
  /** Absolute 2D canvas position — already resolved for docked children. */
  x: number;
  y: number;
};

/**
 * Canvas pixels to world units.
 *
 * The 2D canvas is the authority on layout, so 3D reads its coordinates rather
 * than keeping a second arrangement that would drift the moment anything moved.
 */
const UNITS_PER_PX = 1 / 58;

function Glyph({
  id,
  state,
  position,
  selected,
  onSelect,
}: {
  id: GlyphId;
  state: SceneState;
  position: [number, number, number];
  selected: boolean;
  onSelect: () => void;
}) {
  const { group } = useGlyph(id, state);
  const fitted = useMemo(() => {
    const g = (group as Group).clone(true);
    const box = new Box3().setFromObject(g);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    const k = 1.25 / Math.max(size.x, size.z, size.y * 0.8, 0.001);
    g.scale.setScalar(k);
    g.position.set(-centre.x * k, -box.min.y * k, -centre.z * k);
    return g;
  }, [group]);

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <primitive object={fitted} />
      {selected && (
        // A flat ring rather than an outline pass: it costs one draw call and
        // reads at any camera angle, which matters more here than fidelity.
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.85, 1, 32]} />
          <meshBasicMaterial color="#4d7a6f" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}

export function LabScene3D({
  nodes,
  edges,
  selectedId,
  onSelect,
}: {
  nodes: readonly Projected[];
  edges: readonly Edge[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  // Centre the graph so the camera does not have to chase it as nodes are added.
  const centre = useMemo(() => {
    if (!nodes.length) return { x: 0, y: 0 };
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    return {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
    };
  }, [nodes]);

  const at = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    for (const n of nodes) {
      map.set(n.id, [(n.x - centre.x) * UNITS_PER_PX, 0, (n.y - centre.y) * UNITS_PER_PX]);
    }
    return map;
  }, [nodes, centre]);

  return (
    <Canvas
      orthographic
      camera={{ position: [9, 8, 9], zoom: 52, near: 0.1, far: 200 }}
      dpr={[1, 2]}
      // Zero draw calls when nothing changes (criterion 9). The lab has no
      // animation of its own, so every frame is a response to an interaction.
      frameloop="demand"
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl, scene }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = AgXToneMapping;
        gl.toneMappingExposure = 0.9;
        scene.background = null;
        // Exposed for the budget measurement WORLD_ELEMENTS.md asks for.
        (window as unknown as { __labGL?: typeof gl.info }).__labGL = gl.info;
      }}
      onPointerMissed={() => onSelect(null)}
      aria-label="Composition canvas, 3D projection"
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 9, 5]} intensity={1.1} />
      <StudioEnvironment />
      <Suspense fallback={null}>
        {nodes.map((n) => {
          const element = ELEMENTS_BY_ID[n.elementId as GlyphId];
          const p = at.get(n.id);
          if (!element || !p) return null;
          return (
            <Glyph
              key={n.id}
              id={element.id}
              state={n.state}
              position={p}
              selected={n.id === selectedId}
              onSelect={() => onSelect(n.id)}
            />
          );
        })}
        {edges.map((e) => {
          const a = at.get(e.source);
          const b = at.get(e.target);
          if (!a || !b) return null;
          return (
            <Line
              key={e.id}
              points={[
                [a[0], 0.06, a[2]],
                [b[0], 0.06, b[2]],
              ]}
              color={stateColors.neutral.connection}
              lineWidth={1.6}
            />
          );
        })}
      </Suspense>
    </Canvas>
  );
}
