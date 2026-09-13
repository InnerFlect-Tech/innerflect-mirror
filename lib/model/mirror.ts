import type { SceneState } from './state';

/**
 * The Mirror: the company as it operates now, beside the same company operating
 * itself. Same structure, same people — different distribution of effort.
 *
 * The right-hand side is a PROJECTION, not a measurement. The contract forbids
 * presenting representative figures as verified company truth, and a projection
 * shown without that label is the most dangerous number in the product: it is
 * the one a person would act on.
 */
/**
 * `person` is drawn as a circular avatar, the way a human reads as a human.
 * Everything else is a square tile — the shape itself says whether a person or
 * a system is doing the work, before any colour is involved.
 */
export type StepActor = 'person' | 'human' | 'system' | 'gate';

export type StepIcon =
  | 'person' | 'mail' | 'doc' | 'crm' | 'search' | 'reply' | 'chart'
  | 'calendar' | 'image' | 'users' | 'chat' | 'sheet' | 'system'
  | 'send' | 'check' | 'database';

export type MirrorStep = {
  label: string;
  actor: StepActor;
  icon: StepIcon;
};

/** One workflow shown in full, labelled, beneath the department rows. */
export type WorkedExample = {
  title: string;
  note: string;
  today: MirrorStep[];
  reflected: MirrorStep[];
};

export type MirrorRow = {
  id: string;
  label: string;
  state: SceneState;
  /** Humans involved in this department's work today. */
  people: number;
  mode: 'Human-led' | 'Supervised' | 'Autonomous';
  /** How the work runs today. */
  today: MirrorStep[];
  /** How the same work would run once autonomy is earned. */
  reflected: MirrorStep[];
  /** Weekly human hours, now and projected. */
  hoursNow: number;
  hoursProjected: number;
};

/** A before/after pair. Rendered as `from → to`, never as a single number. */
export type DeltaMetric = {
  label: string;
  from: string;
  to: string;
  tone?: 'good' | 'attention';
};
