import type { Domain } from '@/lib/model/domain';

/**
 * Representative mock data. Per the contract, nothing here may be presented as
 * verified company truth until live integrations exist.
 *
 * The core four are the path a euro takes through any company — attention,
 * commitment, fulfilment, cash. Governance is deliberately absent: it is not a
 * place in the company, it is the layer that puts Delivery in `attention` and
 * Finance in `critical`.
 */
export const domains: Domain[] = [
  {
    id: 'market',
    processes: 7,
    icon: 'market',
    label: 'Market',
    mode: 'Supervised',
    state: 'healthy',
    autonomy: 74,
    metric: 'Intent captured',
    people: 2,
    activeWork: 82,
    openItems: 0,
    relationships: ['sales'],
    agents: [
      { id: 'SW', name: 'Signal Watcher', job: 'Reading demand signals', initials: 'SW', activity: 'acting' },
      { id: 'PC', name: 'Positioning Curator', job: 'Updating message tests', initials: 'PC', activity: 'acting' },
    ],
  },
  {
    id: 'sales',
    processes: 9,
    icon: 'sales',
    label: 'Sales',
    mode: 'Autonomous',
    state: 'active',
    autonomy: 68,
    metric: '14 qualified today',
    people: 4,
    activeWork: 146,
    openItems: 0,
    relationships: ['market', 'delivery'],
    agents: [
      { id: 'RS', name: 'Revenue Scout', job: 'Qualifying signals', initials: 'RS', activity: 'acting' },
      { id: 'CC', name: 'Commercial Copilot', job: 'Preparing follow-ups', initials: 'CC', activity: 'acting' },
    ],
  },
  {
    id: 'delivery',
    processes: 12,
    icon: 'delivery',
    label: 'Delivery',
    mode: 'Human gate',
    state: 'attention',
    autonomy: 73,
    metric: '1 gate needs you',
    people: 5,
    activeWork: 47,
    openItems: 1,
    relationships: ['sales', 'finance'],
    agents: [
      { id: 'DS', name: 'Delivery Steward', job: 'Waiting on Gate 1', initials: 'DS', activity: 'waiting' },
      { id: 'QA', name: 'Quality Auditor', job: 'Verifying artefact', initials: 'QA', activity: 'verifying' },
    ],
  },
  {
    id: 'finance',
    processes: 10,
    icon: 'finance',
    label: 'Finance',
    mode: 'Escalated',
    state: 'critical',
    autonomy: 54,
    metric: 'Ownership unassigned',
    people: 2,
    activeWork: 19,
    openItems: 2,
    relationships: ['delivery'],
    agents: [
      { id: 'RX', name: 'Cash Sentinel', job: 'Needs accountable owner', initials: 'RX', activity: 'escalating' },
      { id: 'IL', name: 'Invoice Ledger', job: 'Reconciling payments', initials: 'IL', activity: 'acting' },
    ],
  },
];

export type FeedEvent = {
  agent: string;
  event: string;
  domainId: string;
  at: string;
};

export const feed: FeedEvent[] = [
  { agent: 'Revenue Scout', event: 'Qualified 14 company signals', domainId: 'sales', at: 'now' },
  { agent: 'Signal Watcher', event: 'Verified 11 demand sources', domainId: 'market', at: '2m' },
  { agent: 'Quality Auditor', event: 'Completed Gate 1 checks', domainId: 'delivery', at: '5m' },
  { agent: 'Cash Sentinel', event: 'Escalated invoice ownership', domainId: 'finance', at: '8m' },
];

export const decisions = [
  {
    id: 'gate-1',
    tone: 'amber' as const,
    title: 'Approve Essência Gate 1',
    detail: 'Unlocks a €1,334 invoice · 96% confidence',
  },
  {
    id: 'ownership',
    tone: 'red' as const,
    title: 'Assign invoice ownership',
    detail: '4 critical findings · blocked 56 days',
  },
];

export const company = {
  autonomy: 68,
  level: 7,
  actionsToday: 1284,
  decisionsWaiting: 3,
  eventsObserved: 286,
  nextLevel: '11 verified workflows',
  autonomyDelta: '+12 this month',
  impact: {
    hoursReturned: '32h',
    verifiedOutcomes: '99.7%',
  },
};
