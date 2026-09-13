import type { Workflow } from '@/lib/model/work';

/**
 * The documented detail for workflows that have been mapped in full.
 *
 * Keyed by the canonical workflow id and merged in by `defineDomain()`. These
 * four records used to live in `data/work.ts` under ids of their own
 * (`lead-intake`, `demand-signals`, `delivery-gate`, `invoice-recon`) that
 * matched nothing in the 38-workflow catalogue the 3D world draws — so the
 * Processes surface and the islands described different companies.
 *
 * Their `autonomy` values were dropped in the move rather than kept: each one
 * equalled its DOMAIN's autonomy rather than the workflow's own (the Gate 1
 * review record claimed 73, the workflow's real figure is 30). The canonical
 * per-workflow numbers in `data/company.ts` win.
 */
type WorkflowDetail = Omit<Workflow, 'id' | 'name' | 'domainId' | 'domainLabel' | 'state' | 'autonomy' | 'throughput' | 'humans'>
  & Partial<Pick<Workflow, 'name'>>;

export const WORKFLOW_DETAIL: Record<string, WorkflowDetail | undefined> = {
  'sl-qualify': {
    steps: [
      { id: 'sl-qualify-s1', stage: 'Trigger', label: 'Customer request', note: 'Email / Form', mode: 'autonomous' },
      { id: 'sl-qualify-s2', stage: 'Context', label: 'Understand', note: 'Extract intent', mode: 'autonomous' },
      { id: 'sl-qualify-s3', stage: 'Context', label: 'Check policy', note: 'Company rules', mode: 'autonomous' },
      { id: 'sl-qualify-s4', stage: 'Decision', label: 'Qualify', note: 'Criteria v4', mode: 'autonomous' },
      { id: 'sl-qualify-s5', stage: 'Action', label: 'Assign owner', note: 'CRM', mode: 'autonomous' },
      { id: 'sl-qualify-s6', stage: 'Action', label: 'Notify', note: 'Email', mode: 'autonomous' },
      { id: 'sl-qualify-s7', stage: 'Verification', label: 'Verify routing', note: 'Sampled', mode: 'supervised' },
      { id: 'sl-qualify-s8', stage: 'Outcome', label: 'Log outcome', note: 'Audit trail', mode: 'autonomous' },
    ],
    name: 'Lead intake and qualification',
    outcome: 'Every inbound lead reaches the right owner, qualified, within an hour',
    level: 'Autonomous',
    stages: {
      Trigger: 'autonomous', Context: 'autonomous', Work: 'autonomous',
      Decision: 'autonomous', Action: 'autonomous', Verification: 'supervised', Outcome: 'autonomous',
    },
    owner: 'Revenue Scout',
    volume: '146 / week',
    cycleTime: '7 min',
    humanEffort: '0.4 h / week',
    errorRate: '0.3%',
    exceptions: 0,
    systems: ['Website forms', 'CRM', 'Email'],
    policies: ['Qualification criteria v4', 'Data retention'],
    evidence: [
      { kind: 'observations', label: 'Successful observations', requirement: '200 clean runs', observed: '1,240 runs', met: true },
      { kind: 'decision-agreement', label: 'Decision agreement', requirement: '≥ 95% match with human', observed: '98.1%', met: true },
      { kind: 'policy-coverage', label: 'Policy coverage', requirement: 'All branches covered', observed: 'Complete', met: true },
      { kind: 'reversibility', label: 'Reversibility', requirement: 'Every action undoable', observed: 'Undoable', met: true },
      { kind: 'exception-rate', label: 'Exception rate', requirement: '< 2%', observed: '0.3%', met: true },
      { kind: 'evaluations', label: 'Passed evaluations', requirement: '3 consecutive', observed: '6 consecutive', met: true },
    ],
  },
  'mk-signal': {
    steps: [
      { id: 'mk-signal-s1', stage: 'Trigger', label: 'Signal captured', note: 'Web intelligence', mode: 'autonomous' },
      { id: 'mk-signal-s2', stage: 'Context', label: 'Extract claim', note: 'Parse source', mode: 'autonomous' },
      { id: 'mk-signal-s3', stage: 'Work', label: 'Score source', note: 'Trust levels', mode: 'autonomous' },
      { id: 'mk-signal-s4', stage: 'Work', label: 'Verify', note: 'Second source', mode: 'supervised' },
      { id: 'mk-signal-s5', stage: 'Decision', label: 'Accept or discard', note: 'Threshold 0.8', mode: 'supervised' },
      { id: 'mk-signal-s6', stage: 'Verification', label: 'Human review', note: 'Sampled weekly', mode: 'human-led' },
      { id: 'mk-signal-s7', stage: 'Action', label: 'Publish to Sales', note: 'CRM', mode: 'autonomous' },
    ],
    name: 'Demand signal verification',
    outcome: 'Market signals are verified against source before they reach a human',
    level: 'Supervised',
    stages: {
      Trigger: 'autonomous', Context: 'autonomous', Work: 'autonomous',
      Decision: 'supervised', Action: 'supervised', Verification: 'human-led', Outcome: 'autonomous',
    },
    owner: 'Signal Watcher',
    volume: '82 / week',
    cycleTime: '22 min',
    humanEffort: '3.1 h / week',
    errorRate: '1.1%',
    exceptions: 0,
    systems: ['Web intelligence', 'CRM', 'Knowledge spine'],
    policies: ['Source trust levels', 'Claim verification'],
    evidence: [
      { kind: 'observations', label: 'Successful observations', requirement: '200 clean runs', observed: '318 runs', met: true },
      { kind: 'decision-agreement', label: 'Decision agreement', requirement: '≥ 95% match with human', observed: '93.4%', met: false },
      { kind: 'policy-coverage', label: 'Policy coverage', requirement: 'All branches covered', observed: '2 branches uncovered', met: false },
      { kind: 'reversibility', label: 'Reversibility', requirement: 'Every action undoable', observed: 'Undoable', met: true },
      { kind: 'exception-rate', label: 'Exception rate', requirement: '< 2%', observed: '1.1%', met: true },
      { kind: 'evaluations', label: 'Passed evaluations', requirement: '3 consecutive', observed: '2 consecutive', met: false },
    ],
  },
  'dl-gate1': {
    steps: [
      { id: 'dl-gate1-s1', stage: 'Trigger', label: 'Milestone marked', note: 'Project tracker', mode: 'autonomous' },
      { id: 'dl-gate1-s2', stage: 'Context', label: 'Collect artefact', note: 'Document store', mode: 'autonomous' },
      { id: 'dl-gate1-s3', stage: 'Work', label: 'Quality checks', note: '4 criteria', mode: 'autonomous' },
      { id: 'dl-gate1-s4', stage: 'Decision', label: 'Approve gate', note: 'Human required', mode: 'human-led' },
      { id: 'dl-gate1-s5', stage: 'Action', label: 'Raise invoice', note: 'Irreversible', mode: 'blocked' },
      { id: 'dl-gate1-s6', stage: 'Verification', label: 'Client countersign', note: 'Often skipped', mode: 'human-led' },
      { id: 'dl-gate1-s7', stage: 'Outcome', label: 'Log outcome', note: 'Audit trail', mode: 'supervised' },
    ],
    name: 'Delivery gate review',
    outcome: 'No milestone is billed before its artefact passes quality checks',
    level: 'Supervised',
    stages: {
      Trigger: 'autonomous', Context: 'autonomous', Work: 'autonomous',
      Decision: 'human-led', Action: 'blocked', Verification: 'human-led', Outcome: 'supervised',
    },
    owner: 'Delivery Steward',
    volume: '47 / week',
    cycleTime: '2.4 days',
    humanEffort: '6.8 h / week',
    errorRate: '0.9%',
    exceptions: 1,
    systems: ['Project tracker', 'Invoicing', 'Document store'],
    policies: ['Gate criteria v2', 'Billing authority'],
    evidence: [
      { kind: 'observations', label: 'Successful observations', requirement: '200 clean runs', observed: '212 runs', met: true },
      { kind: 'decision-agreement', label: 'Decision agreement', requirement: '≥ 95% match with human', observed: '96.2%', met: true },
      { kind: 'policy-coverage', label: 'Policy coverage', requirement: 'All branches covered', observed: 'Complete', met: true },
      { kind: 'reversibility', label: 'Reversibility', requirement: 'Every action undoable', observed: 'Billing is irreversible', met: false },
      { kind: 'exception-rate', label: 'Exception rate', requirement: '< 2%', observed: '0.9%', met: true },
      { kind: 'evaluations', label: 'Passed evaluations', requirement: '3 consecutive', observed: '4 consecutive', met: true },
    ],
  },
  'fn-recon': {
    steps: [
      { id: 'fn-recon-s1', stage: 'Trigger', label: 'Payment received', note: 'Bank feed', mode: 'autonomous' },
      { id: 'fn-recon-s2', stage: 'Work', label: 'Match to invoice', note: 'Accounting', mode: 'supervised' },
      { id: 'fn-recon-s3', stage: 'Work', label: 'Flag exception', note: 'Unmatched', mode: 'supervised' },
      { id: 'fn-recon-s4', stage: 'Decision', label: 'Assign owner', note: 'No owner exists', mode: 'blocked' },
      { id: 'fn-recon-s5', stage: 'Decision', label: 'Approve match', note: 'Human required', mode: 'human-led' },
      { id: 'fn-recon-s6', stage: 'Action', label: 'Reconcile', note: 'Blocked', mode: 'blocked' },
      { id: 'fn-recon-s7', stage: 'Outcome', label: 'Log outcome', note: 'Manual', mode: 'human-led' },
    ],
    name: 'Invoice reconciliation',
    outcome: 'Payments received are matched to invoices without manual chasing',
    level: 'Assisted',
    stages: {
      Trigger: 'autonomous', Context: 'supervised', Work: 'supervised',
      Decision: 'human-led', Action: 'blocked', Verification: 'blocked', Outcome: 'human-led',
    },
    owner: 'Unassigned',
    volume: '19 / week',
    cycleTime: '5.2 days',
    humanEffort: '9.4 h / week',
    errorRate: '4.7%',
    exceptions: 2,
    systems: ['Accounting', 'Bank feed', 'Invoicing'],
    policies: ['Exceptional payments v3.2'],
    evidence: [
      { kind: 'observations', label: 'Successful observations', requirement: '200 clean runs', observed: '96 runs', met: false },
      { kind: 'decision-agreement', label: 'Decision agreement', requirement: '≥ 95% match with human', observed: '88.0%', met: false },
      { kind: 'policy-coverage', label: 'Policy coverage', requirement: 'All branches covered', observed: '4 branches uncovered', met: false },
      { kind: 'reversibility', label: 'Reversibility', requirement: 'Every action undoable', observed: 'Undoable', met: true },
      { kind: 'exception-rate', label: 'Exception rate', requirement: '< 2%', observed: '4.7%', met: false },
      { kind: 'evaluations', label: 'Passed evaluations', requirement: '3 consecutive', observed: '0 consecutive', met: false },
    ],
  },
};
