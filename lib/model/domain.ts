import type { AgentActivity, SceneState } from './state';
import { ref, type RecordRef } from './record';
import type { Workflow as WorkflowType } from './work';
import { isOpen, type Exception } from './exception';

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
 * The workflow type is canonical in `work.ts`. This module re-exports it so the
 * world layer keeps a short import, and adds the projection the renderer reads.
 *
 * There is deliberately no second `Workflow` shape here any more. There used to
 * be, and it carried 38 records with ids disjoint from the 4 in `data/work.ts` —
 * two independently authored truths about one company.
 */
export type { Workflow } from './work';

/**
 * What the renderer needs from a workflow: a bay per entry, a desk per human, a
 * column scaled by throughput and lit by autonomy. Derived by `Pick<>`, so the
 * world cannot drift from the model — the same relationship `WorldDomain` has
 * to `Domain`.
 */
export type WorldWorkflow = Pick<
  WorkflowType,
  'id' | 'name' | 'throughput' | 'autonomy' | 'humans' | 'state'
>;

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
  workflows: WorkflowType[];
  agents: Agent[];
  /** Other domain ids this one exchanges work with. */
  relationships?: string[];

  // Derived from `workflows` by `defineDomain()`. Never authored by hand: the
  // island and the HTML label read the same array, so they cannot disagree.

  /** Workflows this domain owns. Shown on the world label. `workflows.length`. */
  processes: number;
  /** Humans watching this domain. Sum of `workflows[].humans`. */
  people: number;
  /** Items awaiting a human. Count of OPEN `Exception` records in this domain. */
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
  | 'activeWork'
>;

export function toWorldDomain(d: Domain): WorldDomain {
  const {
    id, label, mode, state, autonomy, metric, processes, icon, relationships, workflows, agents, activeWork,
  } = d;
  return { id, label, mode, state, autonomy, metric, processes, icon, relationships, workflows, agents, activeWork };
}

/** A workflow is stopped and waiting on a person. */
export function needsHuman(w: WorkflowType): boolean {
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
/** Documented detail, keyed by workflow id. Supplied by the data layer. */
export type WorkflowDetailMap = Record<string, Partial<WorkflowType> | undefined>;

/**
 * What the data layer hands in so a domain can be derived rather than asserted.
 *
 * Parameters, not imports: `lib/model` describes shapes and must not depend on
 * `data`, or the dependency runs backwards and the model cannot be pointed at a
 * real integration later.
 */
export type DomainContext = {
  detail?: WorkflowDetailMap;
  /** Every exception in the company. `openItems` counts the open ones here. */
  exceptions?: Exception[];
};

export function defineDomain(
  d: Omit<Domain, 'processes' | 'people' | 'openItems' | 'workflows'> & {
    workflows: Omit<WorkflowType, 'domainId' | 'domainLabel'>[];
  },
  { detail = {}, exceptions = [] }: DomainContext = {},
): Domain {
  // A workflow's domain is wherever it is declared, and its documented detail is
  // joined here rather than repeated across 38 literals, so neither can be typed
  // wrong or fall out of step.
  //
  // The detail map is a PARAMETER, not an import: `lib/model` describes shapes
  // and must not depend on `data`, or the dependency runs backwards and the
  // model cannot be reused against real integrations later.
  const workflows: WorkflowType[] = d.workflows.map((w) => ({
    ...w,
    ...detail[w.id],
    domainId: d.id,
    domainLabel: d.label,
  }));

  return {
    ...d,
    workflows,
    processes: workflows.length,
    people: workflows.reduce((n, w) => n + w.humans, 0),
    // Counted from Exception RECORDS, not from which workflows happen to be
    // coloured attention or critical. An aggregate may summarise records; it may
    // never fabricate them, and this number is what the world draws hotspots for.
    openItems: exceptions.filter((e) => e.domainId === d.id && isOpen(e)).length,
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
export const workflowRef = (w: Pick<WorkflowType, 'id'>): RecordRef => ref('workflow', w.id);
export const agentRef = (a: Pick<Agent, 'id'>): RecordRef => ref('agent', a.id);
