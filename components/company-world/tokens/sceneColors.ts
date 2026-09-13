// World palette. Everything here is deliberately desaturated: the teal in the
// scene comes from emissive material, never from coloured lighting or paint.

export const world = {
  plane: '#031012',
  fog: '#02090b',
  gridNear: '#1a3330',
  gridFar: '#0d1c1b',
} as const;

/** Monochrome palette for semantic miniatures (§8 — suggestion, not detail). */
export const massing = {
  darkest: '#152426',
  dark: '#203638',
  mid: '#304345',
  light: '#5c6a6b',
} as const;

export const shell = {
  /** Dark glass that catches teal light — never teal plastic. */
  platform: '#061719',
  core: '#071312',
  foundation: '#07100f',
} as const;
