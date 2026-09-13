import type { SceneState } from './state';

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
export type StageMode = 'autonomous' | 'supervised' | 'human' | 'blocked';

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
  label: string;
  /** The system or note under the step — "ERP", "Automated", "If required". */
  note: string;
  mode: StageMode;
};

export type Workflow = {
  id: string;
  name: string;
  /** The business outcome, not the activity. */
  outcome: string;
  domainId: string;
  domainLabel: string;
  state: SceneState;
  level: AutonomyLevel;
  autonomy: number;
  /** Per-stage mode, in the fixed stage order. */
  stages: Record<WorkStage, StageMode>;
  /** The real sequence of this process, shown on the Flow tab. */
  steps: ProcessStep[];
  owner: string;
  volume: string;
  cycleTime: string;
  humanEffort: string;
  errorRate: string;
  exceptions: number;
  systems: string[];
  policies: string[];
  evidence: Evidence[];
};
