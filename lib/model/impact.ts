/**
 * Impact is the proof layer. Every claim is traceable:
 * Impact → Work → Execution → Action → Decision → Policy → Evidence → Source event.
 * A number without that chain is marketing, not proof.
 */
export const TRACE_CHAIN = [
  'Impact',
  'Work',
  'Execution',
  'Action',
  'Decision',
  'Policy',
  'Evidence',
  'Source event',
] as const;

export type TraceStep = (typeof TRACE_CHAIN)[number];

export type ImpactKind =
  | 'capacity-returned'
  | 'cost-avoided'
  | 'revenue-protected'
  | 'cycle-time'
  | 'errors-prevented'
  | 'sla';

/** Safety counters. These are reported whether or not they flatter the system. */
export type SafetyRecord = {
  verifiedAutonomousWork: number;
  humanCorrection: number;
  unsafeActions: number;
  safeRecovery: number;
};

export type ImpactClaim = {
  id: string;
  kind: ImpactKind;
  headline: string;
  value: string;
  delta: string;
  period: string;
  workflowId: string;
  workflowName: string;
  domainLabel: string;
  /** The full chain, so the claim can be audited rather than believed. */
  trace: Record<TraceStep, string>;
  verified: boolean;
};
