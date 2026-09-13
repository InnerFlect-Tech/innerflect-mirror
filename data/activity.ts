import type { ActivityEvent } from '@/lib/model/activity';

/** One request, followed end to end, so the audit trail is legible as a story. */
export const activity: ActivityEvent[] = [
  { id: 'e1', at: '14:03', label: 'Request received', actor: { kind: 'system' }, domainId: 'sales', ref: '#CS-4821' },
  { id: 'e2', at: '14:03', label: 'Intent classified', actor: { kind: 'system' }, domainId: 'sales', ref: '#CS-4821' },
  { id: 'e3', at: '14:03', label: 'Knowledge retrieved', actor: { kind: 'system' }, domainId: 'knowledge', ref: '#CS-4821' },
  { id: 'e4', at: '14:04', label: 'Escalated for approval', actor: { kind: 'system' }, domainId: 'delivery', ref: '#CS-4821', gate: true },
  { id: 'e5', at: '14:05', label: 'Approved', actor: { kind: 'human', name: 'Indias' }, domainId: 'delivery', ref: '#CS-4821', gate: true },
  { id: 'e6', at: '14:05', label: 'Resolution executed', actor: { kind: 'system' }, domainId: 'delivery', ref: '#CS-4821' },
  { id: 'e7', at: '14:05', label: 'Customer notified', actor: { kind: 'system' }, domainId: 'sales', ref: '#CS-4821' },
  { id: 'e8', at: '14:05', label: 'Logged', actor: { kind: 'system' }, domainId: 'finance', ref: '#CS-4821' },
];
