import type { SceneState } from './state';
import type { Control } from './actor';

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
 * A RENDERING hint, not a semantic type. `person` is drawn as a circular avatar,
 * the way a human reads as a human; everything else is a square tile.
 *
 * It conflates two independent things — `system` is an actor kind while `gate` is
 * a control mode, and `person` vs `human` is purely a shape choice. The semantic
 * truth is `Control` in `./actor`, which keeps the two axes apart. Use
 * `controlFor()` to get it; prefer carrying a `Control` on new types and deriving
 * the shape from it, rather than adding meaning to this union.
 */
export type StepActor = 'person' | 'human' | 'system' | 'gate';

/**
 * The semantics behind a rendering hint, so the two axes are recoverable from
 * existing data without rewriting every row at once.
 */
export function controlFor(actor: StepActor): Control {
  switch (actor) {
    case 'person':
    case 'human':
      return { actor: 'human', mode: 'human-led' };
    case 'gate':
      // A gate is a stop awaiting authority: the actor is still whoever will
      // decide, but the mode is blocked until they do.
      return { actor: 'human', mode: 'blocked' };
    case 'system':
      return { actor: 'deterministic-system', mode: 'autonomous' };
  }
}

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
