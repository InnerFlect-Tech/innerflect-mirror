/**
 * The audit trail, made visible.
 *
 * Every autonomous action must have authority, evidence, an observable outcome
 * and an audit trail. A feed that only says "something happened" satisfies none
 * of that, so each entry carries who acted — the system, or a named person —
 * and the reference you would quote when asking why.
 */
export type Actor =
  | { kind: 'system' }
  | { kind: 'human'; name: string };

export type ActivityEvent = {
  id: string;
  /** HH:MM, ordered oldest first. */
  at: string;
  label: string;
  actor: Actor;
  domainId: string;
  /** The record this belongs to, e.g. #CS-4821. */
  ref: string;
  /** Marks the point a human was required. */
  gate?: boolean;
};
