/**
 * Type. The scale is in `rem` so it respects the reader's browser setting, and
 * nothing renders below 12px — density comes from spacing, weight and colour,
 * never from shrinking text past the legibility floor.
 */
export const fontSize = {
  xs: '.75rem',
  sm: '.8125rem',
  md: '.875rem',
  lg: '1rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
} as const;

export const weight = {
  regular: 400,
  medium: 500,
  strong: 520,
  bold: 600,
} as const;

export const tracking = {
  tight: '-0.5px',
  eyebrow: '0.13em',
} as const;

export const leading = {
  tight: '1.15',
  body: '1.55',
} as const;
