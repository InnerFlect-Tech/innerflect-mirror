/**
 * The shared state vocabulary, defined once.
 *
 * `SceneState` is what the contract calls semantic state: it is the ONLY thing
 * allowed to decide colour, in the DOM and in WebGL alike. Governance is not a
 * domain — it is the thing that moves a domain along this axis.
 *
 * `AgentActivity` is the contract's animation vocabulary. It was previously a
 * bare `string`, which meant the seven named states were enforced by nothing.
 *
 * 2026-09-14 — `healthy` and `active` merged into one state, `active`.
 *
 * They were two states with two distinct colours (`#42c8bd` vs the canonical
 * `#55CBBB` PRODUCT_STRUCTURE.md names for "safe machine operation") but one
 * user-facing word: `stateLabel` mapped both to "Healthy", so the distinction
 * existed in code and nowhere a person could see it. Decided as a genuine
 * product call, not a design one — the two states did not mean two different
 * things to an owner reading the product.
 *
 * `active` survives as the key, not `healthy`, because its colour values are
 * the ones already documented as canonical in PRODUCT_STRUCTURE.md's visual
 * grammar. `healthy` was the majority literal across `data/**` (30 sites vs 7),
 * so those call sites moved rather than the palette — cheaper to change data
 * than to re-document a colour. The display label is unchanged ("Healthy"),
 * so nothing rendered moves; only the internal vocabulary shrinks from five
 * states to four.
 */
export type SceneState =
  | 'neutral'
  | 'active'
  | 'attention'
  | 'critical';

export type AgentActivity =
  | 'idle'
  | 'moving'
  | 'acting'
  | 'waiting'
  | 'verifying'
  | 'escalating'
  | 'handing-off';

/** How a state is described to a person. */
export const stateLabel: Record<SceneState, string> = {
  neutral: 'Observed',
  active: 'Healthy',
  attention: 'Attention',
  critical: 'At risk',
};

/** Worst-first, so a company's state is the worst state present inside it. */
const SEVERITY: SceneState[] = ['critical', 'attention', 'active', 'neutral'];

export function worstState(states: SceneState[]): SceneState {
  return SEVERITY.find((s) => states.includes(s)) ?? 'neutral';
}
