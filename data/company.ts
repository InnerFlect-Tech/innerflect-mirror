import { defineDomain, type Domain } from '@/lib/model/domain';
import { WORKFLOW_DETAIL } from './workflow-detail';
import { exceptions } from './exceptions';

/**
 * Representative mock data. Per the contract, nothing here may be presented as
 * verified company truth until live integrations exist.
 *
 * The core four are the path a euro takes through any company — attention,
 * commitment, fulfilment, cash. Governance is deliberately absent: it is not a
 * place in the company, it is the layer that puts Delivery in `attention` and
 * Finance in `critical`.
 *
 * Each domain's `workflows` array is what the 3D island is built from: a bay
 * per workflow, a desk and a seated figure per human seat, a column scaled by
 * throughput, a gate pylon wherever a workflow is waiting on a person. See
 * `WORLD_ELEMENTS.md`. `processes`, `people` and `openItems` are derived from
 * this array by `defineDomain`, so the island and the label cannot disagree.
 */
export const domains: Domain[] = [
  defineDomain({
    id: 'market',
    icon: 'market',
    label: 'Market',
    mode: 'Supervised',
    state: 'active',
    autonomy: 74,
    metric: 'Intent captured',
    activeWork: 82,
    relationships: ['sales'],
    workflows: [
      { id: 'mk-signal', name: 'Demand signal capture', throughput: 240, autonomy: 92, humans: 0, state: 'active' },
      { id: 'mk-routing', name: 'Inbound routing', throughput: 120, autonomy: 90, humans: 0, state: 'active' },
      { id: 'mk-segment', name: 'Audience segmentation', throughput: 88, autonomy: 85, humans: 0, state: 'active' },
      { id: 'mk-attrib', name: 'Campaign attribution', throughput: 52, autonomy: 58, humans: 0, state: 'active' },
      { id: 'mk-content', name: 'Content publishing', throughput: 46, autonomy: 70, humans: 1, state: 'active' },
      { id: 'mk-message', name: 'Message testing', throughput: 34, autonomy: 64, humans: 1, state: 'active' },
      { id: 'mk-compete', name: 'Competitor watch', throughput: 28, autonomy: 88, humans: 0, state: 'active' },
    ],
    agents: [
      { id: 'SW', name: 'Signal Watcher', job: 'Reading demand signals', initials: 'SW', activity: 'acting' },
      { id: 'PC', name: 'Positioning Curator', job: 'Updating message tests', initials: 'PC', activity: 'acting' },
    ],
  }, { detail: WORKFLOW_DETAIL, exceptions }),
  defineDomain({
    id: 'sales',
    icon: 'sales',
    label: 'Sales',
    mode: 'Autonomous',
    state: 'active',
    autonomy: 68,
    metric: '14 qualified today',
    activeWork: 146,
    relationships: ['market', 'delivery'],
    workflows: [
      { id: 'sl-followup', name: 'Follow-up sequencing', throughput: 190, autonomy: 94, humans: 0, state: 'active' },
      { id: 'sl-qualify', name: 'Lead qualification', throughput: 146, autonomy: 88, humans: 0, state: 'active' },
      { id: 'sl-hygiene', name: 'Pipeline hygiene', throughput: 96, autonomy: 90, humans: 0, state: 'active' },
      { id: 'sl-schedule', name: 'Discovery scheduling', throughput: 64, autonomy: 82, humans: 0, state: 'active' },
      { id: 'sl-proposal', name: 'Proposal drafting', throughput: 38, autonomy: 61, humans: 1, state: 'active' },
      { id: 'sl-handover', name: 'Handover to delivery', throughput: 26, autonomy: 72, humans: 1, state: 'active' },
      { id: 'sl-pricing', name: 'Pricing approval', throughput: 22, autonomy: 40, humans: 1, state: 'active' },
      { id: 'sl-winloss', name: 'Win/loss capture', throughput: 18, autonomy: 66, humans: 0, state: 'active' },
      { id: 'sl-redlines', name: 'Contract redlines', throughput: 14, autonomy: 35, humans: 1, state: 'active' },
    ],
    agents: [
      { id: 'RS', name: 'Revenue Scout', job: 'Qualifying signals', initials: 'RS', activity: 'acting' },
      { id: 'CC', name: 'Commercial Copilot', job: 'Preparing follow-ups', initials: 'CC', activity: 'acting' },
    ],
  }, { detail: WORKFLOW_DETAIL, exceptions }),
  defineDomain({
    id: 'delivery',
    icon: 'delivery',
    label: 'Delivery',
    mode: 'Human gate',
    state: 'attention',
    autonomy: 73,
    metric: '1 gate needs you',
    activeWork: 47,
    relationships: ['sales', 'finance'],
    workflows: [
      { id: 'dl-build', name: 'Build execution', throughput: 62, autonomy: 58, humans: 2, state: 'active' },
      { id: 'dl-comms', name: 'Client comms', throughput: 58, autonomy: 70, humans: 0, state: 'active' },
      { id: 'dl-verify', name: 'Artefact verification', throughput: 44, autonomy: 80, humans: 0, state: 'active' },
      { id: 'dl-envs', name: 'Environment provisioning', throughput: 30, autonomy: 86, humans: 0, state: 'active' },
      { id: 'dl-kickoff', name: 'Kickoff packaging', throughput: 24, autonomy: 74, humans: 0, state: 'active' },
      { id: 'dl-handover', name: 'Handover docs', throughput: 21, autonomy: 64, humans: 0, state: 'active' },
      { id: 'dl-scope', name: 'Scope baselining', throughput: 18, autonomy: 52, humans: 1, state: 'active' },
      { id: 'dl-change', name: 'Change requests', throughput: 16, autonomy: 45, humans: 1, state: 'active' },
      { id: 'dl-retro', name: 'Retro capture', throughput: 14, autonomy: 76, humans: 0, state: 'active' },
      { id: 'dl-gate1', name: 'Gate 1 review', throughput: 12, autonomy: 30, humans: 1, state: 'attention' },
      { id: 'dl-signoff', name: 'Acceptance sign-off', throughput: 11, autonomy: 42, humans: 0, state: 'active' },
      { id: 'dl-incident', name: 'Incident response', throughput: 9, autonomy: 55, humans: 0, state: 'active' },
    ],
    agents: [
      { id: 'DS', name: 'Delivery Steward', job: 'Waiting on Gate 1', initials: 'DS', activity: 'waiting' },
      { id: 'QA', name: 'Quality Auditor', job: 'Verifying artefact', initials: 'QA', activity: 'verifying' },
    ],
  }, { detail: WORKFLOW_DETAIL, exceptions }),
  defineDomain({
    id: 'finance',
    icon: 'finance',
    label: 'Finance',
    mode: 'Escalated',
    state: 'critical',
    autonomy: 54,
    metric: 'Ownership unassigned',
    activeWork: 19,
    relationships: ['delivery'],
    workflows: [
      { id: 'fn-recon', name: 'Payment reconciliation', throughput: 92, autonomy: 82, humans: 0, state: 'active' },
      { id: 'fn-expense', name: 'Expense capture', throughput: 74, autonomy: 88, humans: 0, state: 'active' },
      { id: 'fn-invoice', name: 'Invoice issue', throughput: 48, autonomy: 76, humans: 0, state: 'active' },
      { id: 'fn-vendor', name: 'Vendor payments', throughput: 40, autonomy: 78, humans: 0, state: 'active' },
      { id: 'fn-dunning', name: 'Dunning', throughput: 34, autonomy: 70, humans: 0, state: 'active' },
      { id: 'fn-revrec', name: 'Revenue recognition', throughput: 26, autonomy: 48, humans: 1, state: 'attention' },
      { id: 'fn-forecast', name: 'Cash forecasting', throughput: 20, autonomy: 60, humans: 0, state: 'active' },
      { id: 'fn-margin', name: 'Margin analysis', throughput: 15, autonomy: 56, humans: 0, state: 'active' },
      { id: 'fn-tax', name: 'Tax filing prep', throughput: 8, autonomy: 34, humans: 0, state: 'active' },
      { id: 'fn-owner', name: 'Ownership assignment', throughput: 6, autonomy: 20, humans: 1, state: 'critical' },
    ],
    agents: [
      { id: 'RX', name: 'Cash Sentinel', job: 'Needs accountable owner', initials: 'RX', activity: 'escalating' },
      { id: 'IL', name: 'Invoice Ledger', job: 'Reconciling payments', initials: 'IL', activity: 'acting' },
    ],
  }, { detail: WORKFLOW_DETAIL, exceptions }),
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
