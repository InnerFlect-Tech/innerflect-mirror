import { shell } from '@/lib/tokens';

/**
 * The company core's dimensions and materials, declared once.
 *
 * The core is the one object in the world that is NOT derived from a builder:
 * `buildIslandGeometry` produces the islands, so an island can only ever look
 * the same everywhere it is drawn. The core was hand-written as JSX in
 * `CompanyCore.tsx` and then hand-written a second time in
 * `scripts/export-world.ts`, which meant the exported world could — and did —
 * disagree with the product. Retuning the core in the component changed nothing
 * in the export, because the export was never reading it.
 *
 * Numbers live here; both the component and the exporter read them. Neither may
 * restate one.
 */
export const CORE = {
  /** Dark foundation the whole core sits on. */
  foundation: {
    radiusTop: 1.36,
    radiusBottom: 1.5,
    height: 0.15,
    segments: 6,
    y: -0.33,
    color: shell.foundation,
    roughness: 0.68,
  },
  /** The plinth between foundation and body. */
  plinth: {
    size: [2.24, 0.2, 1.9] as [number, number, number],
    radius: 0.06,
    y: -0.16,
    color: shell.core,
    roughness: 0.26,
    metalness: 0.18,
    clearcoat: 0.45,
    edgeOpacity: 0.45,
  },
  /**
   * The translucent body. Its opacity is the whole point: it exists to show the
   * core inside it, so at 0.8 it was hiding the object it is built around and
   * the system read as a slab with a light stuck to the front.
   */
  body: {
    size: [1.74, 0.78, 1.48] as [number, number, number],
    radius: 0.07,
    y: 0.33,
    color: '#0b3937',
    roughness: 0.06,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.4,
    opacity: 0.44,
    edgeOpacity: 0.62,
  },
  /**
   * The light core. An octahedron rather than a box: emissive is written raw,
   * so every face of a solid renders the same colour, and a box viewed down an
   * isometric axis presents one of those faces square to the camera — a flat
   * card. An octahedron never does.
   */
  light: {
    radius: 0.36,
    y: 0.3,
    rotationY: Math.PI / 4,
    color: '#17a89f',
    intensity: 1,
    subduedIntensity: 0.72,
  },
} as const;
