/**
 * The shared state vocabulary, defined once.
 *
 * `SceneState` is what the contract calls semantic state: it is the ONLY thing
 * allowed to decide colour, in the DOM and in WebGL alike. Governance is not a
 * domain — it is the thing that moves a domain along this axis.
 *
 * `AgentActivity` is the contract's animation vocabulary. It was previously a
 * bare `string`, which meant the seven named states were enforced by nothing.
 */
export type SceneState =
  | 'neutral'
  | 'healthy'
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
  healthy: 'Healthy',
  active: 'Healthy',
  attention: 'Attention',
  critical: 'At risk',
};

/** Worst-first, so a company's state is the worst state present inside it. */
const SEVERITY: SceneState[] = ['critical', 'attention', 'active', 'healthy', 'neutral'];

export function worstState(states: SceneState[]): SceneState {
  return SEVERITY.find((s) => states.includes(s)) ?? 'neutral';
}
