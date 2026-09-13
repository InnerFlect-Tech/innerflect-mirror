'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, type CubicBezierCurve3, TubeGeometry } from 'three';
// Side-effect import: the module calls `extend()`, which is what registers
// <connectionPulseMaterial /> with R3F. A type-only import would be elided.
import './connectionShader';
import type { ConnectionPulseMaterialImpl } from './connectionShader';

/**
 * A short luminous segment travelling down an existing path. The path itself
 * stays still — this communicates "activity occurred", not "we have animations".
 */
export function ConnectionPulse({
  curve,
  color,
  offset,
  intensity,
  running,
}: {
  curve: CubicBezierCurve3;
  color: string;
  offset: number;
  intensity: number;
  running: boolean;
}) {
  const material = useRef<ConnectionPulseMaterialImpl>(null);

  const geometry = useMemo(
    () => new TubeGeometry(curve, 48, 0.016, 5, false),
    [curve],
  );

  // R3F disposes what it creates declaratively; this geometry was built
  // imperatively, so disposing it is ours to do.
  useEffect(() => () => geometry.dispose(), [geometry]);

  const tint = useMemo(() => new Color(color), [color]);

  // Only the clock advances per frame, and it advances through a ref rather
  // than state — nothing here re-renders React.
  useFrame((_, delta) => {
    if (!running || !material.current) return;
    material.current.uTime += delta;
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <connectionPulseMaterial
        ref={material}
        uOffset={offset}
        uIntensity={intensity}
        uColor={tint}
      />
    </mesh>
  );
}
