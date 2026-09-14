import type { DeltaMetric, MirrorRow, WorkedExample } from '@/lib/model/mirror';

/**
 * Left column: observed. Right column: projected once the evidence on the
 * Processes surface is satisfied. Nothing on the right has happened yet.
 *
 * Both columns carry the same number of steps on purpose — the argument is
 * that the work does not shrink, only the share of it a person has to do.
 */
export const mirrorRows: MirrorRow[] = [
  {
    id: 'market',
    label: 'Market',
    state: 'active',
    people: 2,
    mode: 'Supervised',
    hoursNow: 14,
    hoursProjected: 5,
    today: [
      { label: 'Analyst spots a signal', actor: 'person', icon: 'person' },
      { label: 'Reads the source', actor: 'human', icon: 'doc' },
      { label: 'Checks if it is real', actor: 'human', icon: 'search' },
      { label: 'Logs it', actor: 'human', icon: 'sheet' },
      { label: 'Hands to Sales', actor: 'person', icon: 'person' },
    ],
    reflected: [
      { label: 'Signal captured', actor: 'system', icon: 'system' },
      { label: 'Source verified', actor: 'system', icon: 'search' },
      { label: 'Scored on trust', actor: 'system', icon: 'chart' },
      { label: 'Sampled weekly by a person', actor: 'gate', icon: 'person' },
      { label: 'Passed to Sales', actor: 'system', icon: 'send' },
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
      { label: 'Lead arrives', actor: 'person', icon: 'mail' },
      { label: 'Rep reads the email', actor: 'person', icon: 'person' },
      { label: 'Checks the CRM', actor: 'human', icon: 'crm' },
      { label: 'Researches the company', actor: 'human', icon: 'search' },
      { label: 'Replies and updates CRM', actor: 'person', icon: 'person' },
    ],
    reflected: [
      { label: 'Lead arrives', actor: 'system', icon: 'mail' },
      { label: 'Context retrieved', actor: 'system', icon: 'database' },
      { label: 'Qualified against rules', actor: 'system', icon: 'system' },
      { label: 'Response drafted and sent', actor: 'system', icon: 'send' },
      { label: 'CRM updated', actor: 'system', icon: 'crm' },
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
      { label: 'Milestone marked done', actor: 'person', icon: 'person' },
      { label: 'Gathers the artefact', actor: 'human', icon: 'doc' },
      { label: 'Checks quality', actor: 'human', icon: 'check' },
      { label: 'Approves the gate', actor: 'human', icon: 'chat' },
      { label: 'Raises the invoice', actor: 'person', icon: 'person' },
    ],
    reflected: [
      { label: 'Milestone detected', actor: 'system', icon: 'system' },
      { label: 'Artefact collected', actor: 'system', icon: 'doc' },
      { label: 'Checks run', actor: 'system', icon: 'check' },
      { label: 'Gate approved by a person', actor: 'gate', icon: 'person' },
      { label: 'Invoice raised', actor: 'system', icon: 'sheet' },
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
      { label: 'Payment lands', actor: 'person', icon: 'person' },
      { label: 'Finds the invoice', actor: 'human', icon: 'doc' },
      { label: 'Matches by hand', actor: 'human', icon: 'sheet' },
      { label: 'Chases the mismatch', actor: 'human', icon: 'chat' },
      { label: 'Reconciles', actor: 'person', icon: 'person' },
    ],
    reflected: [
      { label: 'Payment lands', actor: 'system', icon: 'database' },
      { label: 'Invoice matched', actor: 'system', icon: 'system' },
      { label: 'Exception flagged', actor: 'system', icon: 'chart' },
      { label: 'Match approved by a person', actor: 'gate', icon: 'person' },
      { label: 'Reconciled', actor: 'system', icon: 'check' },
    ],
  },
];

export const mirrorDeltas: DeltaMetric[] = [
  { label: 'Autonomy', from: '47%', to: '68%', tone: 'good' },
  { label: 'Human hours / week', from: '127', to: '45', tone: 'good' },
  { label: 'Median operational response', from: '3h 42m', to: '4m', tone: 'good' },
  { label: 'Decisions needing a human', from: '31 / wk', to: '3 / wk', tone: 'good' },
];

/** The same workflow, transformed — shown labelled so the change is readable. */
export const workedExample: WorkedExample = {
  title: 'Sales lead handling',
  note: 'A person intervenes only when confidence or authority thresholds are crossed.',
  today: [
    { label: 'Lead arrives', actor: 'human', icon: 'mail' },
    { label: 'Read email', actor: 'person', icon: 'person' },
    { label: 'Check CRM', actor: 'human', icon: 'crm' },
    { label: 'Research company', actor: 'human', icon: 'search' },
    { label: 'Qualify lead', actor: 'human', icon: 'doc' },
    { label: 'Reply to lead', actor: 'human', icon: 'reply' },
    { label: 'Update CRM', actor: 'human', icon: 'crm' },
  ],
  reflected: [
    { label: 'System interprets email', actor: 'system', icon: 'mail' },
    { label: 'Retrieves context', actor: 'system', icon: 'database' },
    { label: 'Qualifies against company rules', actor: 'system', icon: 'system' },
    { label: 'Drafts and executes response', actor: 'system', icon: 'send' },
    { label: 'Updates CRM', actor: 'system', icon: 'crm' },
    { label: 'Logs result', actor: 'system', icon: 'chart' },
  ],
};

export const mirrorCaveat =
  'The right-hand column is a projection, not a measurement. Each step moves only when the evidence on Processes is satisfied — nothing here has happened yet.';
