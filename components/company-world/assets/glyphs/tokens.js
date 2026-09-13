/**
 * The single source of truth for the Mirror visual language.
 *
 * Both surfaces — the element sheet and the live company floor — import this.
 * Nothing downstream may define a colour, a state meaning, or an emissive
 * strength of its own. Change it here and it changes in both places, which is
 * the entire point of tokenising it.
 *
 * Authority for the palette is PRODUCT_STRUCTURE.md / lib/tokens/state.ts.
 */

export const PALETTE = {
  void: '#080C0C',
  panel: '#0D1313',
  panel2: '#111918',
  rule: '#1B2523',
  ink: '#EEF3F1',
  dim: '#778581',
  faint: '#4A5754',

  // Structural massing, inherited from the V1 kit's own material names.
  structure: '#111616',
  structureLight: '#343C3B',
  warm: '#F5F5F3',
  human: '#8A8A85',
  glass: '#8FB3AE',
};

/**
 * State decides colour. There is deliberately no way to ask this module for
 * "the Sales colour" — category never reaches the colour channel.
 */
export const STATE_COLOR = {
  neutral: '#5C6A6B',
  healthy: '#55CBBB',
  active: '#55CBBB',
  attention: '#D8A34D',
  critical: '#E16D5D',
};

export const STATE_LABEL = {
  neutral: 'Observed',
  healthy: 'Healthy',
  active: 'Healthy',
  attention: 'Attention',
  critical: 'At risk',
};

export const STATES = ['neutral', 'healthy', 'active', 'attention', 'critical'];

export function stateColor(state) {
  return STATE_COLOR[state] ?? STATE_COLOR.neutral;
}

/** Worst-first: a company's state is the worst state present inside it. */
const SEVERITY = ['critical', 'attention', 'active', 'healthy', 'neutral'];
export function worstState(states) {
  return SEVERITY.find((s) => states.includes(s)) ?? 'neutral';
}

/**
 * Emissive strengths, chosen against a bloom threshold of 1 and kept from the
 * V1 kit because they were already correct: `hot` blooms, `mid` sits just above
 * the floor, `glass` stays well below so a whole pane never lights up.
 */
export const EMISSIVE = { hot: 3.0, mid: 1.65, glass: 0.45 };

/** Scene geometry constants shared by both surfaces. */
export const SCENE = {
  camera: { theta: -0.72, phi: 0.95 },
  env: { exposure: 1.15 },
};
