'use client';

import { useMemo } from 'react';
import { AdditiveBlending, DoubleSide } from 'three';

// A gridHelper reads as a debug tool. This is a grid whose opacity disappears
// radially, so the world has a floor near the centre and nothing at the edges.
const vertexShader = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uSpacing;
  uniform float uOpacity;
  uniform float uRadius;
  varying vec2 vPos;

  float line(vec2 p, float spacing) {
    vec2 g = abs(fract(p / spacing - 0.5) - 0.5) / fwidth(p / spacing);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }

  void main() {
    float falloff = 1.0 - smoothstep(0.0, uRadius, length(vPos));
    float a = line(vPos, uSpacing) * falloff * uOpacity;
    if (a < 0.002) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

export function AtmosphericGrid() {
  const uniforms = useMemo(
    () => ({
      uColor: { value: [0.11, 0.23, 0.22] },
      uSpacing: { value: 0.62 },
      uOpacity: { value: 0.085 },
      uRadius: { value: 6.4 },
    }),
    [],
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.415, 0]}>
      <planeGeometry args={[18, 18]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={DoubleSide}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}
