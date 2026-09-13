'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { AgXToneMapping, SRGBColorSpace } from 'three';
// Registers <connectionPulseMaterial /> with R3F's catalogue. Imported here,
// above the Canvas, so the element type exists before the tree first renders.
import './connections/connectionShader';
import { Scene } from './Scene';
import { useOrbitControl } from './camera/useOrbitControl';
import { StudioEnvironment } from './world/StudioEnvironment';
import { SceneEffects } from './effects/SceneEffects';
import { SceneBudget } from './effects/SceneBudget';
import type { WorldDomain } from './nodes/NodeState';
import { world } from './tokens/sceneColors';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export function CompanyWorld({
  domains,
  selectedId,
  onSelect,
  running,
}: {
  domains: WorldDomain[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  running: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const { orbit, bindSurface, reset, wasDrag } = useOrbitControl();
  const surface = useRef<HTMLDivElement>(null);

  // Listeners are attached natively rather than as JSX props. A drag is a
  // per-frame path, so it wants a non-passive listener and none of React's
  // synthetic event overhead — and the container genuinely is an interactive
  // surface, which JSX handler props on a <div> can't express honestly.
  useEffect(() => bindSurface(surface.current), [bindSurface]);
  const [dpr, setDpr] = useState(1.5);

  // The scene is only genuinely continuous while work is flowing through it.
  // Paused — or for a viewer who asked for reduced motion — there is nothing
  // to redraw, so stop rendering instead of burning a GPU on a still image.
  const continuous = running && !reducedMotion;

  return (
    <div
      ref={surface}
      className="world-3d"
      aria-label={`Architectural model of the company. ${domains.length} operational domains surround the company core. Drag or use arrow keys to rotate, 0 to reset. Every domain is also selectable from the buttons below the world.`}
    >
      <button type="button" className="world-reset" onClick={reset}>
        Reset view
      </button>

      <Canvas
        frameloop={continuous ? 'always' : 'demand'}
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          // Colour management is doing more work here than it sounds like it
          // should: without it the blacks lift and the emissive values that
          // drive the bloom read wrong.
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = AgXToneMapping;
          gl.toneMappingExposure = 0.9;

          // The contract sets a budget for this scene (< 120 draw calls,
          // < 200k triangles). Expose the renderer in dev so that number can
          // actually be checked instead of assumed.
          if (process.env.NODE_ENV !== 'production') {
            (window as unknown as { __mirrorGL?: typeof gl }).__mirrorGL = gl;
          }
        }}
        fallback={<div className="webgl-fallback">3D unavailable. Use Practical view.</div>}
      >
        <fogExp2 attach="fog" args={[world.fog, 0.036]} />

        {/* Lighting is almost invisible by design. The teal appears to come
            from inside the system, not from a teal lamp pointed at it. */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[-5, 9, 4]} intensity={1.8} color="#e8f5f2" />
        <directionalLight position={[6, 4, -5]} intensity={0.35} color="#b8d5d0" />

        {/* Scale resolution to the device that actually turned up, rather
            than assuming the desktop GPU this was built on. */}
        <PerformanceMonitor
          onIncline={() => setDpr(Math.min(2, dpr + 0.25))}
          onDecline={() => setDpr(Math.max(1, dpr - 0.25))}
        />

        <Suspense fallback={null}>
          <StudioEnvironment />
          <Scene
            domains={domains}
            selectedId={selectedId}
            onSelect={(id) => {
              // A drag is not a click: rotating past an island must not select it.
              if (!wasDrag()) onSelect(id);
            }}
            running={running}
            reducedMotion={reducedMotion}
            orbit={orbit}
          />
          <SceneEffects />
          {process.env.NODE_ENV !== 'production' && <SceneBudget />}
        </Suspense>
      </Canvas>
    </div>
  );
}
