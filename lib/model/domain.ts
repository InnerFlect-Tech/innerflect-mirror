import type { AgentActivity, SceneState } from './state';
import { ref, type RecordRef } from './record';

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

/**
 * One workflow inside a domain — the contract's Work object, reduced to the
 * fields the world needs to draw it.
 *
 * This type exists because the islands used to hold abstract towers keyed on
 * array position, which meant a viewer could not ask what any object
 * represented. Every repeated object on an island is now one entry in this
 * array: a bay per workflow, a desk per human, a column scaled by throughput.
 * See `WORLD_ELEMENTS.md` for the full mapping.
 */
export type Workflow = {
  id: string;
  name: string;
  /** Actions per day moving through this workflow. Drives column height. */
  throughput: number;
  /** Earned autonomy for this workflow, 0–100. Drives the lit share. */
  autonomy: number;
  /** Human seats working it. Drives desks and seated figures. */
  humans: number;
  /** Workflow-level state. `attention`/`critical` raise a gate pylon. */
  state: SceneState;
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
  /** Icon key, resolved by the label component. Data, not a switch on `id`. */
  icon: 'market' | 'sales' | 'delivery' | 'finance' | 'people' | 'supply' | 'support';
  /** Work items currently in flight. */
  activeWork: number;
  /** The workflows this domain owns. The island is drawn from this array. */
  workflows: Workflow[];
  agents: Agent[];
  /** Other domain ids this one exchanges work with. */
  relationships?: string[];

  // Derived from `workflows` by `defineDomain()`. Never authored by hand: the
  // island and the HTML label read the same array, so they cannot disagree.

  /** Workflows this domain owns. Shown on the world label. `workflows.length`. */
  processes: number;
  /** Humans watching this domain. Sum of `workflows[].humans`. */
  people: number;
  /** Items awaiting a human. Count of workflows in `attention`/`critical`. */
  openItems: number;
};

/** The subset the renderer needs. Derived, so the scene cannot drift from the model. */
export type WorldDomain = Pick<
  Domain,
  | 'id'
  | 'label'
  | 'mode'
  | 'state'
  | 'autonomy'
  | 'metric'
  | 'processes'
  | 'icon'
  | 'relationships'
  | 'workflows'
  | 'agents'
>;

export function toWorldDomain(d: Domain): WorldDomain {
  const {
    id, label, mode, state, autonomy, metric, processes, icon, relationships, workflows, agents,
  } = d;
  return { id, label, mode, state, autonomy, metric, processes, icon, relationships, workflows, agents };
}

/** A workflow is stopped and waiting on a person. */
export function needsHuman(w: Workflow): boolean {
  return w.state === 'attention' || w.state === 'critical';
}

/**
 * Builds a Domain with `processes`, `people` and `openItems` computed from its
 * workflows rather than authored beside them.
 *
 * This is the drift guard described in `WORLD_ELEMENTS.md`. The island cannot
 * show six desks while the label says four people, because both read the same
 * array — adding a workflow with a human updates the world and the HTML in one
 * commit, or neither.
 */
export function defineDomain(
  d: Omit<Domain, 'processes' | 'people' | 'openItems'>,
): Domain {
  return {
    ...d,
    processes: d.workflows.length,
    people: d.workflows.reduce((n, w) => n + w.humans, 0),
    openItems: d.workflows.filter(needsHuman).length,
  };
}

/**
 * Typed pointers to these records.
 *
 * Derived rather than stored: adding a `recordType` field would mean editing 38
 * workflow literals and 8 agent literals for a value that is constant per type
 * and already known at every call site. The helper gives the same guarantee — you
 * cannot get a `domain` ref out of a `Workflow` — with no data churn.
 */
export const domainRef = (d: Pick<Domain, 'id'>): RecordRef => ref('domain', d.id);
export const workflowRef = (w: Pick<Workflow, 'id'>): RecordRef => ref('workflow', w.id);
export const agentRef = (a: Pick<Agent, 'id'>): RecordRef => ref('agent', a.id);
