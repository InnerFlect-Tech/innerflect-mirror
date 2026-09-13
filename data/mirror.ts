import type { DeltaMetric, MirrorRow } from '@/lib/model/mirror';

/**
 * Left column: observed. Right column: projected once the evidence on the
 * Processes surface is satisfied. Nothing on the right has happened yet.
 */
export const mirrorRows: MirrorRow[] = [
  {
    id: 'market',
    label: 'Market',
    state: 'healthy',
    people: 2,
    mode: 'Supervised',
    hoursNow: 14,
    hoursProjected: 5,
    today: [
      { label: 'Signal spotted', actor: 'human' },
      { label: 'Read source', actor: 'human' },
      { label: 'Check if real', actor: 'human' },
      { label: 'Log it', actor: 'human' },
      { label: 'Pass to Sales', actor: 'human' },
    ],
    reflected: [
      { label: 'Signal captured', actor: 'system' },
      { label: 'Source verified', actor: 'system' },
      { label: 'Scored on trust', actor: 'system' },
      { label: 'Sampled weekly', actor: 'gate' },
      { label: 'Passed to Sales', actor: 'system' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    state: 'active',
    people: 4,
    mode: 'Autonomous',
    hoursNow: 31,
    hoursProjected: 9,
    today: [
      { label: 'Lead arrives', actor: 'human' },
      { label: 'Read email', actor: 'human' },
      { label: 'Research company', actor: 'human' },
      { label: 'Qualify', actor: 'human' },
      { label: 'Assign owner', actor: 'human' },
    ],
    reflected: [
      { label: 'Lead arrives', actor: 'system' },
      { label: 'Intent extracted', actor: 'system' },
      { label: 'Context retrieved', actor: 'system' },
      { label: 'Qualified on criteria', actor: 'system' },
      { label: 'Owner assigned', actor: 'system' },
    ],
  },
  {
    id: 'delivery',
    label: 'Delivery',
    state: 'attention',
    people: 5,
    mode: 'Supervised',
    hoursNow: 44,
    hoursProjected: 19,
    today: [
      { label: 'Milestone hit', actor: 'human' },
      { label: 'Gather artefact', actor: 'human' },
      { label: 'Check quality', actor: 'human' },
      { label: 'Approve gate', actor: 'human' },
      { label: 'Raise invoice', actor: 'human' },
    ],
    reflected: [
      { label: 'Milestone detected', actor: 'system' },
      { label: 'Artefact collected', actor: 'system' },
      { label: 'Checks run', actor: 'system' },
      { label: 'Approve gate', actor: 'gate' },
      { label: 'Invoice raised', actor: 'system' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    state: 'critical',
    people: 2,
    mode: 'Human-led',
    hoursNow: 38,
    hoursProjected: 12,
    today: [
      { label: 'Payment lands', actor: 'human' },
      { label: 'Find the invoice', actor: 'human' },
      { label: 'Match by hand', actor: 'human' },
      { label: 'Chase mismatch', actor: 'human' },
      { label: 'Reconcile', actor: 'human' },
    ],
    reflected: [
      { label: 'Payment lands', actor: 'system' },
      { label: 'Invoice matched', actor: 'system' },
      { label: 'Exception flagged', actor: 'system' },
      { label: 'Approve match', actor: 'gate' },
      { label: 'Reconciled', actor: 'system' },
    ],
  },
];

export const mirrorDeltas: DeltaMetric[] = [
  { label: 'Company autonomy', from: '47%', to: '68%', tone: 'good' },
  { label: 'Human hours per week', from: '127', to: '45', tone: 'good' },
  { label: 'Median response', from: '3h 42m', to: '4m', tone: 'good' },
  { label: 'Decisions needing a human', from: '31/wk', to: '3/wk', tone: 'good' },
];

export const mirrorCaveat =
  'The right-hand column is a projection, not a measurement. Each step moves only when the evidence on Processes is satisfied — nothing here has happened yet.';
