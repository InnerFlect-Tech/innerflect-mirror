import type { Exception } from '@/lib/model/exception';

/**
 * What is actually wrong, as records.
 *
 * The world used to draw a risk hotspot per `Domain.openItems` — a count derived
 * from which workflows happened to be coloured `attention` or `critical`. Nothing
 * to click, nothing to resolve, and no way to say what was wrong. These are the
 * records those hotspots should have been standing for all along, and `openItems`
 * is now derived from them rather than from a colour.
 *
 * Three are open, which is why the company reports three things needing a person.
 */
export const exceptions: Exception[] = [
  {
    id: 'exc-gate1',
    kind: 'awaiting-human',
    summary: 'Gate 1 artefact passed every automated check and is waiting for sign-off',
    workflowId: 'dl-gate1',
    domainId: 'delivery',
    executionId: 'exe-cs4821',
    raisedAt: '2026-09-11T09:20:00Z',
    severity: 'attention',
  },
  {
    id: 'exc-revrec',
    kind: 'uncertainty',
    summary: 'Revenue recognition could not choose between two treatments for a split invoice',
    workflowId: 'fn-revrec',
    domainId: 'finance',
    raisedAt: '2026-09-12T14:02:00Z',
    severity: 'attention',
  },
  {
    id: 'exc-owner',
    kind: 'policy-conflict',
    summary: 'No accountable owner exists for invoice ownership, so nothing may be approved',
    workflowId: 'fn-owner',
    domainId: 'finance',
    raisedAt: '2026-07-19T11:45:00Z',
    severity: 'critical',
  },
  {
    id: 'exc-dunning-resolved',
    kind: 'error',
    summary: 'Dunning email bounced for three customers with stale addresses',
    workflowId: 'fn-dunning',
    domainId: 'finance',
    raisedAt: '2026-09-09T08:10:00Z',
    severity: 'attention',
    // Resolved, so the world does not draw it. Kept because an exception that
    // vanishes on resolution cannot be learned from.
    resolvedAt: '2026-09-09T16:40:00Z',
  },
];
