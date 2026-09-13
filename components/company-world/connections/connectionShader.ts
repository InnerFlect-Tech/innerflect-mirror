import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { AdditiveBlending, Color } from 'three';

// A pulse of information travels down a static path. The path itself never
// flashes — that would read as "our website has animations" rather than
// "something happened here".

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uOffset;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    // Head of the pulse travels along the tube's length (uv.x).
    float head = fract(uTime * uSpeed + uOffset);
    float d = vUv.x - head;
    d -= floor(d + 0.5); // shortest wrapped distance, so the pulse loops cleanly

    float core = smoothstep(0.055, 0.0, abs(d));
    float tail = smoothstep(0.17, 0.0, max(0.0, -d)) * 0.35;
    float a = core + tail;

    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor * a * uIntensity, a);
  }
`;

/**
 * Declared as a material class rather than a `<shaderMaterial>` with a uniforms
 * object. Uniforms become ordinary JSX props, so nothing mutates a value React
 * owns and the component stays compilable — the usual R3F uniforms-object
 * pattern fights the React Compiler for no benefit.
 */
export const ConnectionPulseMaterial = shaderMaterial(
  { uTime: 0, uSpeed: 0.17, uOffset: 0, uIntensity: 0, uColor: new Color() },
  vertexShader,
  fragmentShader,
  (material) => {
    if (!material) return;
    material.transparent = true;
    material.depthWrite = false;
    material.blending = AdditiveBlending;
    material.toneMapped = false;
  },
);

extend({ ConnectionPulseMaterial });

export type ConnectionPulseMaterialImpl = InstanceType<
  typeof ConnectionPulseMaterial
>;

declare module '@react-three/fiber' {
  interface ThreeElements {
    connectionPulseMaterial: ThreeElements['shaderMaterial'] & {
      uTime?: number;
      uSpeed?: number;
      uOffset?: number;
      uIntensity?: number;
      uColor?: Color;
    };
  }
}
