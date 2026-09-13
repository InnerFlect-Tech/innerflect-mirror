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
      { label: 'Customer request', note: 'Email / Form', mode: 'autonomous' },
      { label: 'Understand', note: 'Extract intent', mode: 'autonomous' },
      { label: 'Check policy', note: 'Company rules', mode: 'autonomous' },
      { label: 'Qualify', note: 'Criteria v4', mode: 'autonomous' },
      { label: 'Assign owner', note: 'CRM', mode: 'autonomous' },
      { label: 'Notify', note: 'Email', mode: 'autonomous' },
      { label: 'Verify routing', note: 'Sampled', mode: 'supervised' },
      { label: 'Log outcome', note: 'Audit trail', mode: 'autonomous' },
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
      { label: 'Signal captured', note: 'Web intelligence', mode: 'autonomous' },
      { label: 'Extract claim', note: 'Parse source', mode: 'autonomous' },
      { label: 'Score source', note: 'Trust levels', mode: 'autonomous' },
      { label: 'Verify', note: 'Second source', mode: 'supervised' },
      { label: 'Accept or discard', note: 'Threshold 0.8', mode: 'supervised' },
      { label: 'Human review', note: 'Sampled weekly', mode: 'human' },
      { label: 'Publish to Sales', note: 'CRM', mode: 'autonomous' },
    ],
    name: 'Demand signal verification',
    outcome: 'Market signals are verified against source before they reach a human',
    level: 'Supervised',
    stages: {
      Trigger: 'autonomous', Context: 'autonomous', Work: 'autonomous',
      Decision: 'supervised', Action: 'supervised', Verification: 'human', Outcome: 'autonomous',
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
      { label: 'Milestone marked', note: 'Project tracker', mode: 'autonomous' },
      { label: 'Collect artefact', note: 'Document store', mode: 'autonomous' },
      { label: 'Quality checks', note: '4 criteria', mode: 'autonomous' },
      { label: 'Approve gate', note: 'Human required', mode: 'human' },
      { label: 'Raise invoice', note: 'Irreversible', mode: 'blocked' },
      { label: 'Client countersign', note: 'Often skipped', mode: 'human' },
      { label: 'Log outcome', note: 'Audit trail', mode: 'supervised' },
    ],
    name: 'Delivery gate review',
    outcome: 'No milestone is billed before its artefact passes quality checks',
    level: 'Supervised',
    stages: {
      Trigger: 'autonomous', Context: 'autonomous', Work: 'autonomous',
      Decision: 'human', Action: 'blocked', Verification: 'human', Outcome: 'supervised',
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
      { label: 'Payment received', note: 'Bank feed', mode: 'autonomous' },
      { label: 'Match to invoice', note: 'Accounting', mode: 'supervised' },
      { label: 'Flag exception', note: 'Unmatched', mode: 'supervised' },
      { label: 'Assign owner', note: 'No owner exists', mode: 'blocked' },
      { label: 'Approve match', note: 'Human required', mode: 'human' },
      { label: 'Reconcile', note: 'Blocked', mode: 'blocked' },
      { label: 'Log outcome', note: 'Manual', mode: 'human' },
    ],
    name: 'Invoice reconciliation',
    outcome: 'Payments received are matched to invoices without manual chasing',
    level: 'Assisted',
    stages: {
      Trigger: 'autonomous', Context: 'supervised', Work: 'supervised',
      Decision: 'human', Action: 'blocked', Verification: 'blocked', Outcome: 'human',
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
