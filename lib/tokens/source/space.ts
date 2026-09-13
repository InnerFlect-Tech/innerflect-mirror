/** Spacing, radii, elevation and motion. */

/** A 4px base. Every gap and pad in the product is one of these. */
export const space = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.375rem',
  6: '1.75rem',
  7: '2.25rem',
  8: '3rem',
} as const;

export const radius = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  pill: '999px',
} as const;

export const shadow = {
  sm: '0 6px 18px rgb(0 0 0 / 0.3)',
  md: '0 12px 34px rgb(0 0 0 / 0.45)',
  lg: '0 18px 44px rgb(0 0 0 / 0.55)',
} as const;

/** Short and purposeful. Nothing decorative. */
export const motion = {
  'ease-out': 'cubic-bezier(0.2, 0, 0, 1)',
  'dur-fast': '120ms',
  'dur-base': '200ms',
} as const;
