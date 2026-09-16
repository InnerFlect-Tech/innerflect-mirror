/**
 * Primitive colour. Raw values with no meaning attached — `semantic.ts` gives
 * them jobs, and only those semantic names should reach application code.
 *
 * This file absorbed two palettes that used to live apart: the `--c-*` ramps
 * from `app/tokens.css`, and the scene's `world`/`massing`/`shell` hexes, which
 * were real product colours that had never had a CSS mirror. A colour the
 * stylesheet cannot name is a colour the DOM can only approximate by eye.
 */

/** Neutrals, darkest to lightest. One ramp, so contrast is predictable. */
export const ink = {
  900: '#060909',
  850: '#080c0c',
  800: '#0a1010',
  750: '#0b1211',
  700: '#0c1413',
  650: '#101918',
  600: '#111918',
  550: '#141f1d',
  500: '#182321',
  450: '#21302e',
  400: '#2a3a37',
  300: '#3d514e',
  200: '#73807c',
  150: '#778581',
  100: '#aebbb7',
  50: '#cad5d2',
  0: '#eef3f1',
} as const;

export const teal = {
  600: '#12332f',
  500: '#1c7a6d',
  450: '#229083',
  400: '#2f9c8c',
  300: '#55cbbb',
  200: '#a8ede2',
  100: '#eafffb',
} as const;

/**
 * The ground the world sits on. Deliberately desaturated: teal in the scene
 * comes from emissive material, never from coloured lighting or paint.
 */
export const world = {
  plane: '#031012',
  fog: '#02090b',
  gridNear: '#1a3330',
  gridFar: '#0d1c1b',
} as const;

/** Monochrome tones for low-detail semantic miniatures — suggestion, not detail. */
export const massing = {
  darkest: '#152426',
  dark: '#203638',
  mid: '#304345',
  light: '#5c6a6b',
} as const;

/** Dark glass that catches teal light. Never teal plastic. */
export const shell = {
  platform: '#061719',
  core: '#071312',
  foundation: '#07100f',
} as const;
