import type { KnowledgeObject } from '@/lib/model/knowledge';

export const knowledgeObjects: KnowledgeObject[] = [
  {
    id: 'qualification-criteria',
    name: 'Qualification criteria',
    kind: 'rule',
    trust: 94,
    confidence: 91,
    freshness: 'current',
    lastVerified: '3 days ago',
    owner: 'Company owner',
    usedBy: 2,
    sources: ['Diagnostic call notes', 'CRM outcomes 2026'],
    relatedWorkflows: ['Lead intake and qualification'],
    relatedDecisions: 7,
  },
  {
    id: 'gate-criteria',
    name: 'Gate criteria v2',
    kind: 'procedure',
    trust: 68,
    confidence: 62,
    freshness: 'ageing',
    lastVerified: '41 days ago',
    owner: 'Delivery lead',
    usedBy: 1,
    sources: ['Delivery handbook', 'Client contracts'],
    relatedWorkflows: ['Delivery gate review'],
    relatedDecisions: 12,
    drift: {
      documented: 'Four quality checks, then the client countersigns before billing.',
      observed: 'Billing is raised on check completion; countersignature is collected afterwards, if at all.',
      divergence: '9 of the last 11 gates',
    },
  },
  {
    id: 'exceptional-payments',
    name: 'Exceptional payments v3.2',
    kind: 'policy',
    trust: 41,
    confidence: 38,
    freshness: 'stale',
    lastVerified: '8 months ago',
    owner: 'Unassigned',
    usedBy: 1,
    sources: ['Finance policy doc'],
    relatedWorkflows: ['Invoice reconciliation'],
    relatedDecisions: 3,
    drift: {
      documented: 'Payments outside terms require written approval from the finance owner.',
      observed: 'No finance owner exists; approvals are made ad hoc or not recorded.',
      divergence: 'every exception for 56 days',
    },
    conflicts: ['Billing authority — names a role that no longer exists'],
  },
  {
    id: 'source-trust',
    name: 'Source trust levels',
    kind: 'definition',
    trust: 87,
    confidence: 84,
    freshness: 'current',
    lastVerified: '9 days ago',
    owner: 'Company owner',
    usedBy: 2,
    sources: ['Web intelligence config', 'Sampling reviews'],
    relatedWorkflows: ['Demand signal verification'],
    relatedDecisions: 4,
  },
  {
    id: 'billing-authority',
    name: 'Billing authority',
    kind: 'policy',
    trust: 55,
    confidence: 51,
    freshness: 'ageing',
    lastVerified: '73 days ago',
    owner: 'Company owner',
    usedBy: 2,
    sources: ['Company constitution'],
    relatedWorkflows: ['Delivery gate review', 'Invoice reconciliation'],
    relatedDecisions: 9,
    conflicts: ['Exceptional payments v3.2 — assigns approval to an unfilled role'],
  },
  {
    id: 'essencia-account',
    name: 'Essência',
    kind: 'customer',
    trust: 96,
    confidence: 93,
    freshness: 'current',
    lastVerified: 'Yesterday',
    owner: 'Company owner',
    usedBy: 3,
    sources: ['Signed proposal', 'CRM', 'Delivery tracker'],
    relatedWorkflows: ['Delivery gate review', 'Invoice reconciliation'],
    relatedDecisions: 6,
  },
];

import type { Learning, MapEdge, MapNode, MemoryUpgrade, RetrievedSource } from '@/lib/model/knowledge';

/** Curated composition — a hub with nine surrounding kinds of knowledge. */
export const mapNodes: MapNode[] = [
  { id: 'knowledge', label: 'Knowledge', x: 50, y: 50, core: true, count: 1842 },
  { id: 'people', label: 'People', x: 34, y: 16, count: 96 },
  { id: 'procedures', label: 'Procedures', x: 68, y: 18, count: 214 },
  { id: 'policies', label: 'Policies', x: 13, y: 33, count: 148 },
  { id: 'projects', label: 'Projects', x: 86, y: 39, count: 167 },
  { id: 'clients', label: 'Clients', x: 10, y: 58, count: 127 },
  { id: 'tools', label: 'Tools', x: 83, y: 63, count: 74 },
  { id: 'decisions', label: 'Decisions', x: 20, y: 82, count: 391 },
  { id: 'exceptions', label: 'Exceptions', x: 47, y: 88, count: 88 },
  { id: 'workflows', label: 'Workflows', x: 74, y: 85, count: 137 },
];

export const mapEdges: MapEdge[] = [
  { from: 'knowledge', to: 'policies', strength: 'strong', label: 'Guides decisions' },
  { from: 'knowledge', to: 'procedures', strength: 'strong', label: 'Powers autonomy' },
  { from: 'knowledge', to: 'decisions', strength: 'strong', label: 'Learns from experience' },
  { from: 'knowledge', to: 'workflows', strength: 'strong', label: 'Enables better work' },
  { from: 'knowledge', to: 'people', strength: 'related' },
  { from: 'knowledge', to: 'projects', strength: 'related' },
  { from: 'knowledge', to: 'clients', strength: 'related' },
  { from: 'knowledge', to: 'tools', strength: 'related' },
  { from: 'knowledge', to: 'exceptions', strength: 'related' },
  { from: 'policies', to: 'people', strength: 'other' },
  { from: 'procedures', to: 'projects', strength: 'other' },
  { from: 'clients', to: 'decisions', strength: 'other' },
  { from: 'tools', to: 'workflows', strength: 'other' },
  { from: 'exceptions', to: 'decisions', strength: 'other' },
];

export const exampleQuestion = 'Vendor payment exception';

export const retrievedSources: RetrievedSource[] = [
  { id: 'policy', label: 'Payment policy', detail: 'Finance / Policies', badge: 'Core policy' },
  { id: 'similar', label: 'Similar decisions (3)', detail: 'Previously approved', badge: 'Past decisions' },
  { id: 'supplier', label: 'Supplier history', detail: 'Acme Supplies Ltd', badge: 'Client context' },
  { id: 'workflow', label: 'Exception workflow', detail: 'Finance operations', badge: 'Process context' },
  { id: 'evidence', label: 'Supporting evidence', detail: 'Invoices, emails, notes', badge: 'Operational data' },
];

export const retrievalReasoning =
  'This answer is based on your company’s payment policy, 3 similar approved exceptions, supplier history with Acme Supplies, and the current finance workflow. These sources were selected because they match your question, context and past decision patterns.';

export const knowledgeHealth = {
  items: 1842,
  retrievalConfidence: 96,
  newLearnings: 42,
  policyGaps: 18,
};

export const recentLearnings: Learning[] = [
  { id: 'l1', label: 'Vendor payment exception', capturedFrom: 'Captured from Finance workflow', at: '2h ago' },
  { id: 'l2', label: 'Client requested custom terms', capturedFrom: 'Captured from Sales call', at: '5h ago' },
  { id: 'l3', label: 'Repeated NDA approval pattern', capturedFrom: 'Identified from 6 similar cases', at: '1d ago' },
  { id: 'l4', label: 'New regulatory requirement', capturedFrom: 'Captured from legal update', at: '2d ago' },
];

export const memoryUpgrades: MemoryUpgrade[] = [
  {
    id: 'formalise',
    title: 'Formalise repeated exception into policy',
    detail: 'This exception has occurred 6 times in 3 months. Consider creating a policy update.',
    cta: 'Create policy',
  },
  {
    id: 'consolidate',
    title: 'Consolidate duplicate procedure',
    detail: '3 similar procedures found across departments. Merge into one standard process.',
    cta: 'Review duplicates',
  },
  {
    id: 'connect',
    title: 'Connect CRM notes to support workflow',
    detail: 'Customer context from CRM is not yet linked to support procedures.',
    cta: 'Set up connection',
  },
];
