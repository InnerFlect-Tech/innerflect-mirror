import { ref, type RecordRef } from './record';
import type { SceneState } from './state';

/**
 * Something that went wrong, is uncertain, or is unsafe — as a record.
 *
 * The world used to draw a risk hotspot per `Domain.openItems`, a derived count of
 * workflows sitting in `attention` or `critical`. That is an aggregate inferred
 * from a colour: there was nothing to click, nothing to resolve, and no way to say
 * *what* was wrong. The semantic review is explicit that aggregate counts may
 * summarise records but never fabricate them.
 */
export type ExceptionKind =
  | 'error'
  /** The system was not confident enough to act. */
  | 'uncertainty'
  /** Two policies, or a policy and an instruction, disagree. */
  | 'policy-conflict'
  /** Acting would have been unsafe or irreversible. */
  | 'unsafe-condition'
  /** Work stopped waiting for a person. */
  | 'awaiting-human';

export type Exception = {
  id: string;
  kind: ExceptionKind;
  /** What is wrong, in the words a person would use. */
  summary: string;
  workflowId: string;
  domainId: string;
  /** The execution it happened in, where it came from a specific run. */
  executionId?: string;
  raisedAt: string;
  /** How much this should interrupt: `attention` or `critical`. */
  severity: SceneState;
  /** Unresolved exceptions are the ones the world draws. */
  resolvedAt?: string;
};

export const exceptionRef = (e: Pick<Exception, 'id'>): RecordRef => ref('exception', e.id);

export function isOpen(e: Exception): boolean {
  return e.resolvedAt === undefined;
}
