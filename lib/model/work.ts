import type { SceneState } from './state';
import type { ControlMode } from './actor';

/**
 * Use **Work**, not Processes. Every workflow follows the same seven stages,
 * which is what makes one workflow comparable to another.
 */
export const WORK_STAGES = [
  'Trigger',
  'Context',
  'Work',
  'Decision',
  'Action',
  'Verification',
  'Outcome',
] as const;

export type WorkStage = (typeof WORK_STAGES)[number];

/** Where a stage currently sits. `human` means a person is still required here. */
/**
 * How a step runs. Re-exported from `actor.ts`, which is the single definition of
 * the control axis — this used to be a fourth, slightly different vocabulary
 * ('human' where the others said 'human-led', and missing 'assisted' entirely).
 */
export type StageMode = ControlMode;

/**
 * Autonomy is earned, not toggled. A workflow only moves up the ladder when
 * the evidence below is satisfied — which is why `Evidence` is a record with
 * a met/unmet state rather than a score someone can set.
 */
export const AUTONOMY_LADDER = [
  'Human-led',
  'Observed',
  'Assisted',
  'Supervised',
  'Autonomous',
] as const;

export type AutonomyLevel = (typeof AUTONOMY_LADDER)[number];

export type EvidenceKind =
  | 'observations'
  | 'decision-agreement'
  | 'policy-coverage'
  | 'reversibility'
  | 'exception-rate'
  | 'evaluations';

export type Evidence = {
  kind: EvidenceKind;
  label: string;
  /** What is required before the next level is unlocked. */
  requirement: string;
  /** Where the workflow currently stands against that requirement. */
  observed: string;
  met: boolean;
};

/**
 * A concrete step in this particular process, as opposed to the seven canonical
 * stages every workflow shares. The stages let you compare workflows; the steps
 * are what actually happens in this one.
 */
export type ProcessStep = {
  /** Stable identity. A step you cannot point at cannot be selected or verified. */
  id: string;
  /** Which of the seven canonical stages this step belongs to. */
  stage: WorkStage;
  label: string;
  /** The system or note under the step — "ERP", "Automated", "If required". */
  note: string;
  mode: StageMode;
};

/**
 * The canonical workflow. One catalogue, one identity.
 *
 * There used to be two `Workflow` types — this one with 4 rich instances in
 * `data/work.ts`, and a six-field one in `domain.ts` with 38 instances nested in
 * `data/company.ts` — carrying **disjoint ids** and numerically incompatible
 * numbers (the rich records' `autonomy` matched their *domain's* autonomy, not
 * their own). The product therefore told two stories about the same company: the
 * Processes surface listed one Delivery workflow while the Delivery island drew
 * twelve bays and labelled itself "12 processes".
 *
 * Now every workflow the company has is in one array. The fields above the fold
 * are the ones every workflow has, including the drivers the 3D world reads. The
 * optional block below is the full operational record, present only where a
 * workflow has actually been documented to that depth — which is an honest
 * statement about how much is known, not a second catalogue.
 */
export type Workflow = {
  id: string;
  name: string;
  domainId: string;
  state: SceneState;
  /** Earned autonomy for THIS workflow, 0–100. Drives the column's lit share. */
  autonomy: number;
  /** Actions per day moving through it. Drives column height. */
  throughput: number;
  /** Human seats working it. Drives desks and seated figures. */
  humans: number;

  // ── Documented detail. Present only where the workflow has been mapped. ──
  /** The business outcome, not the activity. */
  outcome?: string;
  domainLabel?: string;
  level?: AutonomyLevel;
  /** Per-stage mode, in the fixed stage order. */
  stages?: Record<WorkStage, StageMode>;
  /** The real sequence of this process, shown on the Flow tab. */
  steps?: ProcessStep[];
  owner?: string;
  volume?: string;
  cycleTime?: string;
  humanEffort?: string;
  errorRate?: string;
  exceptions?: number;
  systems?: string[];
  policies?: string[];
  evidence?: Evidence[];
};

/** The documented fields, required. What the Processes surface needs to render. */
type Documented =
  | 'outcome' | 'domainLabel' | 'level' | 'stages' | 'steps' | 'owner'
  | 'volume' | 'cycleTime' | 'humanEffort' | 'errorRate' | 'exceptions'
  | 'systems' | 'policies' | 'evidence';

export type DocumentedWorkflow = Workflow & Required<Pick<Workflow, Documented>>;

/**
 * Narrows to the workflows mapped in full. The Processes surface shows these;
 * the 3D world shows every workflow. Same objects, same ids, one catalogue — the
 * difference between the counts is now meaningful rather than contradictory.
 */
export function isDocumented(w: Workflow): w is DocumentedWorkflow {
  return w.evidence !== undefined && w.steps !== undefined && w.level !== undefined;
}
