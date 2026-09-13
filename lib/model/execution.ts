import type { RecordRef } from './record';
import type { Control } from './actor';
import type { WorkStage } from './work';

/**
 * The instance layer: what actually happened, as opposed to what is supposed to.
 *
 * A workflow definition is not an execution. The definition says a lead gets
 * qualified; an execution is lead #CS-4821 being qualified on Tuesday at 14:03,
 * by whom, under what control, checked how, and with what result.
 *
 * None of this existed. The only trace of an instance anywhere in the model was
 * the string `'#CS-4821'` repeated across all eight `ActivityEvent`s — a business
 * record with no type, no lifecycle and nothing to click.
 */

/**
 * The business object moving through an execution: a lead, order, project,
 * invoice or ticket.
 *
 * This is the thing a person actually cares about. "146 runs a week" is a
 * statistic; "#CS-4821 has been waiting two days for your approval" is a fact
 * about a customer.
 */
export type RecordToken = {
  id: string;
  /** What the business calls it: `#CS-4821`, `INV-2291`. */
  label: string;
  kind: 'lead' | 'order' | 'project' | 'invoice' | 'ticket' | 'request';
  /** Where it entered the company. */
  source: string;
  openedAt: string;
};

/** A recorded check of an action, with a result. Not an autonomy-ladder criterion. */
export type Verification = {
  id: string;
  executionId: string;
  stepId: string;
  /** What was checked. */
  check: string;
  /** The only two answers a verification may have. */
  result: 'pass' | 'fail';
  at: string;
  /** Who or what performed the check. */
  by: RecordRef;
};

/**
 * An observable business result, not a completed activity.
 *
 * "Eight steps ran" is activity. "The lead reached the right owner in 7 minutes"
 * is an outcome. The contract's impact chain only means anything if this is a
 * record rather than a sentence.
 */
export type Outcome = {
  id: string;
  executionId: string;
  /** Stated as a result: what is now true that was not before. */
  statement: string;
  /** Observed, not projected. */
  observedAt: string;
  value?: string;
};

/** One step of one execution — where the definition meets reality. */
export type ExecutionStep = {
  stepId: string;
  stage: WorkStage;
  /** Who did it and under what control. Both axes, never collapsed. */
  control: Control;
  /** The actor that performed it: a person, an agent, a system. */
  actor: RecordRef;
  at: string;
  /** Tools used at this step. */
  tools: RecordRef[];
  /** Knowledge drawn on at this step. */
  knowledge: RecordRef[];
  /** A decision, where this step required authority. */
  decision?: RecordRef;
};

/** One run of one workflow, carrying one record. */
export type Execution = {
  id: string;
  workflowId: string;
  /** The business record moving through it. */
  token: RecordToken;
  startedAt: string;
  state: 'running' | 'waiting' | 'complete' | 'blocked';
  steps: ExecutionStep[];
  verifications: Verification[];
  outcome?: Outcome;
};
