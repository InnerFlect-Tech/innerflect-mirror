/**
 * Who does the work, and under what control.
 *
 * These are two independent axes, and the model previously conflated them in
 * three different places: `StepActor` in `mirror.ts` mixed the actor kind
 * `system` with the control mode `gate`, and distinguished `person` from `human`
 * for *rendering* reasons rather than semantic ones; `Domain.mode` was a free
 * string; `MirrorRow.mode` was a fourth vocabulary.
 *
 * Neither axis implies the other. A deterministic system can be blocked. A human
 * can work under supervision.
 */

/** What kind of thing performs a step. */
export type ActorKind =
  | 'human'
  | 'ai-agent'
  /** Rule-based software that does the same thing every time — an ERP job, a script. */
  | 'deterministic-system'
  /** Something outside the company: a customer, a supplier, a regulator. */
  | 'external-system';

export const ACTOR_KINDS: readonly ActorKind[] = [
  'human', 'ai-agent', 'deterministic-system', 'external-system',
];

/**
 * How a step runs *right now*.
 *
 * NOT the autonomy ladder. `AUTONOMY_LADDER` in `work.ts` is earned maturity of a
 * whole workflow, moved only by evidence; this is the current control on one step.
 * `Observed` is a rung on that ladder and is deliberately absent here; `blocked`
 * is a mode and is deliberately absent there.
 */
export type ControlMode =
  | 'human-led'
  | 'assisted'
  | 'supervised'
  | 'autonomous'
  | 'blocked';

export const CONTROL_MODES: readonly ControlMode[] = [
  'human-led', 'assisted', 'supervised', 'autonomous', 'blocked',
];

/** Reads as a sentence: "a human, supervised". */
export type Control = {
  actor: ActorKind;
  mode: ControlMode;
};

/** Does this step currently require a person? */
export function needsPerson(c: Control): boolean {
  return c.actor === 'human' || c.mode === 'human-led' || c.mode === 'blocked';
}
