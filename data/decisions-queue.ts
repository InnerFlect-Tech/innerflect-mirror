import type { Decision } from '@/lib/model/decision';

/**
 * Three. Not thirty. The queue length is itself a health signal — if this file
 * ever needs pagination, the system has failed, not the interface.
 */
export const decisionQueue: Decision[] = [
  {
    id: 'gate-1-essencia',
    title: 'Approve Essência Gate 1',
    situation:
      'The Gate 1 artefact passed all four quality checks two days ago. Billing is blocked until a human with billing authority approves, because the invoice it unlocks cannot be reversed.',
    domainId: 'delivery',
    domainLabel: 'Delivery',
    state: 'attention',
    urgency: 'high',
    deadline: 'Today, 18:00',
    recommendation: 'Approve and release the €1,334 milestone invoice',
    rationale:
      'All gate criteria are met, the client confirmed receipt, and the four previous gates on this account were approved unchanged.',
    alternatives: [
      'Approve with a 7-day payment term instead of 14',
      'Hold until the client countersigns the artefact',
      'Split the milestone and bill half now',
    ],
    confidence: 96,
    risk: 'low',
    reversibility: 'irreversible',
    exposure: '€1,334',
    downstream: 'Unblocks Gate 2 scheduling and the Q4 cash forecast',
    authority: 'Company owner or Delivery lead',
    policy: 'Gate criteria v2 · Billing authority',
    evidence: [
      { label: 'Quality checks', detail: '4 of 4 passed, verified 2 days ago' },
      { label: 'Client confirmation', detail: 'Receipt acknowledged by email' },
      { label: 'Artefact completeness', detail: 'All deliverables present' },
      { label: 'Contract terms', detail: 'Milestone billing permitted' },
    ],
    comparable: [
      { label: 'Essência Gate 0', outcome: 'Approved unchanged · paid in 9 days' },
      { label: 'Alma Gate 1', outcome: 'Approved unchanged · paid in 12 days' },
      { label: 'Essência discovery', outcome: 'Approved unchanged · paid on time' },
    ],
    policySuggestion: {
      timesSeen: 4,
      proposal:
        'Auto-approve gate billing under €2,000 when all quality checks pass and the client has acknowledged receipt.',
    },
  },
  {
    id: 'invoice-ownership',
    title: 'Assign invoice reconciliation ownership',
    situation:
      'Invoice reconciliation has had no accountable owner for 56 days. Four unmatched payments have accumulated and the workflow cannot progress past Decision without someone holding the authority.',
    domainId: 'finance',
    domainLabel: 'Finance',
    state: 'critical',
    urgency: 'high',
    deadline: 'Overdue by 56 days',
    recommendation: 'Assign ownership to the company owner until Finance has a named lead',
    rationale:
      'Every other candidate lacks the authority to sign off payment matching. Leaving it unassigned is what is generating the exception backlog.',
    alternatives: [
      'Assign to the Delivery lead as an interim',
      'Reduce the workflow to Observed until an owner exists',
      'Outsource reconciliation to the bookkeeper',
    ],
    confidence: 71,
    risk: 'high',
    reversibility: 'reversible',
    exposure: '4 unmatched payments · €6,910',
    downstream: 'Blocks the cash forecast and the Finance autonomy ladder',
    authority: 'Company owner only',
    policy: 'Exceptional payments v3.2',
    evidence: [
      { label: 'Days unassigned', detail: '56, since the last owner left the role' },
      { label: 'Exception backlog', detail: '4 payments unmatched' },
      { label: 'Workflow state', detail: 'Action and Verification both blocked' },
      { label: 'Policy coverage', detail: '4 branches uncovered' },
    ],
    comparable: [
      { label: 'Delivery gate ownership', outcome: 'Assigned to owner · backlog cleared in 6 days' },
    ],
  },
  {
    id: 'signal-threshold',
    title: 'Lower the demand signal trust threshold',
    situation:
      'Signal Watcher is discarding 31% of inbound market signals because their source trust falls below the configured threshold. Sampling suggests roughly a third of those were genuine.',
    domainId: 'market',
    domainLabel: 'Market',
    state: 'healthy',
    urgency: 'medium',
    deadline: 'This week',
    recommendation: 'Lower the threshold from 0.8 to 0.65 and route the gap to human review',
    rationale:
      'It recovers most discarded signals without accepting unverified ones, at a cost of roughly 40 minutes of review a week.',
    alternatives: [
      'Keep the threshold and accept the loss',
      'Lower to 0.5 and accept more noise',
      'Add a second verification source before changing anything',
    ],
    confidence: 82,
    risk: 'low',
    reversibility: 'reversible',
    exposure: 'Roughly 8 qualified signals a week',
    downstream: 'Raises Sales intake volume and Market cycle time',
    authority: 'Company owner or Growth lead',
    policy: 'Source trust levels',
    evidence: [
      { label: 'Discard rate', detail: '31% of inbound signals' },
      { label: 'Sampled false negatives', detail: '34% of a 50-signal sample were genuine' },
      { label: 'Review cost', detail: '≈ 40 min / week' },
      { label: 'Reversibility', detail: 'Threshold is a single config value' },
    ],
    comparable: [
      { label: 'Qualification criteria v3 → v4', outcome: 'Loosened · intake up 18%, no quality drop' },
    ],
  },
];
