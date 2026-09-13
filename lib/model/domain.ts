import type { AgentActivity, SceneState } from './state';

/**
 * A Domain record, as the contract's shared domain model describes it. The 3D
 * scene renders a projection of this — never its own copy of the truth.
 */
export type Agent = {
  id: string;
  name: string;
  /** What the agent is doing right now, in plain language. */
  job: string;
  initials: string;
  activity: AgentActivity;
};

export type Domain = {
  id: string;
  label: string;
  /** Human-readable operating mode, e.g. "Supervised", "Human gate". */
  mode: string;
  state: SceneState;
  /** Earned autonomy, 0–100. */
  autonomy: number;
  /** One short line of evidence, shown on the world label. */
  metric: string;
  /** Workflows this domain owns. Shown on the world label. */
  processes: number;
  /** Icon key, resolved by the label component. Data, not a switch on `id`. */
  icon: 'market' | 'sales' | 'delivery' | 'finance' | 'people' | 'supply' | 'support';
  /** Humans watching this domain. */
  people: number;
  /** Work items currently in flight. */
  activeWork: number;
  /** Items awaiting a human. Must be 0 unless the state says otherwise. */
  openItems: number;
  agents: Agent[];
  /** Other domain ids this one exchanges work with. */
  relationships?: string[];
};

/** The subset the renderer needs. Derived, so the scene cannot drift from the model. */
export type WorldDomain = Pick<
  Domain,
  'id' | 'label' | 'mode' | 'state' | 'autonomy' | 'metric' | 'processes' | 'icon' | 'relationships'
>;

export function toWorldDomain(d: Domain): WorldDomain {
  const { id, label, mode, state, autonomy, metric, processes, icon, relationships } = d;
  return { id, label, mode, state, autonomy, metric, processes, icon, relationships };
}
