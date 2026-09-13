/**
 * Tier 2 — purpose, not appearance. Application CSS may use these and the
 * component tier; it may not reach past them to a primitive, and a raw hex in a
 * component rule is a bug, because it cannot be restyled, themed or audited.
 *
 * Values are `var(...)` references on purpose: the indirection is the point, and
 * it survives into the generated stylesheet so the cascade can still be read.
 */
export const semantic = {
  '--bg-page': 'var(--c-ink-850)',
  '--bg-surface': 'var(--c-ink-800)',
  '--bg-raised': 'var(--c-ink-700)',
  '--bg-hover': 'var(--c-ink-650)',
  '--bg-active': 'var(--c-ink-500)',

  '--border-subtle': 'var(--c-ink-450)',
  '--border-default': 'var(--c-ink-400)',
  '--border-strong': 'var(--c-ink-300)',

  '--text-primary': 'var(--c-ink-0)',
  '--text-secondary': 'var(--c-ink-100)',
  '--text-muted': 'var(--c-ink-150)',
  '--text-faint': 'var(--c-ink-200)',
  '--text-accent': 'var(--c-teal-300)',

  '--action-bg': 'var(--c-teal-500)',
  '--action-bg-hover': '#229083',
  '--action-border': 'var(--c-teal-400)',
  '--action-text': '#eafffb',

  '--focus-ring': 'var(--c-teal-300)',
} as const;
