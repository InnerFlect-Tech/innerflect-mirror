import type { Execution } from '@/lib/model/execution';

/**
 * One run, end to end, carrying one business record.
 *
 * This is the instance layer the model never had. The only previous trace of a
 * real run anywhere was the string `'#CS-4821'` repeated across eight activity
 * events — a customer request with no type, no lifecycle, and nothing to open.
 *
 * It is deliberately the Gate 1 execution: the one currently stopped, waiting for
 * a person. A worked example is only worth having if it shows the hard case.
 */
export const executions: Execution[] = [
  {
    id: 'exe-cs4821',
    workflowId: 'dl-gate1',
    token: {
      id: 'tok-cs4821',
      label: '#CS-4821',
      kind: 'request',
      source: 'Support inbox',
      openedAt: '2026-09-11T08:58:00Z',
    },
    startedAt: '2026-09-11T08:58:00Z',
    // Waiting, not running: the work is done and a person is the remaining step.
    state: 'waiting',
    steps: [
      {
        stepId: 'dl-gate1-s1', stage: 'Trigger',
        control: { actor: 'deterministic-system', mode: 'autonomous' },
        actor: { type: 'tool', id: 'project-tracker' },
        at: '2026-09-11T08:58:00Z',
        tools: [{ type: 'tool', id: 'project-tracker' }],
        knowledge: [],
      },
      {
        stepId: 'dl-gate1-s2', stage: 'Context',
        control: { actor: 'ai-agent', mode: 'autonomous' },
        actor: { type: 'agent', id: 'DS' },
        at: '2026-09-11T09:01:00Z',
        tools: [{ type: 'tool', id: 'document-store' }],
        knowledge: [{ type: 'knowledge', id: 'k1' }],
      },
      {
        stepId: 'dl-gate1-s3', stage: 'Work',
        control: { actor: 'ai-agent', mode: 'autonomous' },
        actor: { type: 'agent', id: 'QA' },
        at: '2026-09-11T09:14:00Z',
        tools: [{ type: 'tool', id: 'document-store' }],
        knowledge: [{ type: 'knowledge', id: 'k1' }],
      },
      {
        stepId: 'dl-gate1-s4', stage: 'Decision',
        // The actor is still the person who will decide; the mode is blocked
        // until they do. Two axes, never collapsed into one "gate" value.
        control: { actor: 'human', mode: 'blocked' },
        actor: { type: 'person', id: 'delivery-lead' },
        at: '2026-09-11T09:20:00Z',
        tools: [],
        knowledge: [],
        decision: { type: 'decision', id: 'gate-1' },
      },
    ],
    verifications: [
      {
        id: 'ver-cs4821-1', executionId: 'exe-cs4821', stepId: 'dl-gate1-s3',
        check: 'All four Gate 1 quality criteria met',
        result: 'pass',
        at: '2026-09-11T09:19:00Z',
        by: { type: 'agent', id: 'QA' },
      },
    ],
    // No outcome: it has not finished. An outcome recorded here before a person
    // approves would be the fabrication the contract forbids.
  },
];
