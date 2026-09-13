import type {
  AuthorityLimit, DataScope, Integration, ModelPermission, RoleGrant,
} from '@/lib/model/constitution';

export const authorityLimits: AuthorityLimit[] = [
  { id: 'a1', action: 'Issue an invoice', autonomousUpTo: '€2,000', requiresApproval: 'Above €2,000, or any irreversible billing', owner: 'Company owner' },
  { id: 'a2', action: 'Approve a supplier payment', autonomousUpTo: '€0', requiresApproval: 'Always — no accountable owner assigned', owner: 'Unassigned' },
  { id: 'a3', action: 'Assign a lead owner', autonomousUpTo: 'Unlimited', requiresApproval: 'Never', owner: 'Company owner' },
  { id: 'a4', action: 'Change a policy', autonomousUpTo: 'None', requiresApproval: 'Always', owner: 'Company owner' },
  { id: 'a5', action: 'Send client-facing email', autonomousUpTo: 'Templated replies', requiresApproval: 'Anything non-templated', owner: 'Delivery lead' },
];

export const integrations: Integration[] = [
  { id: 'i1', name: 'CRM', purpose: 'Lead intake, ownership, pipeline', access: 'read-write', status: 'connected', lastSync: '2 min ago' },
  { id: 'i2', name: 'Accounting', purpose: 'Invoices and reconciliation', access: 'read', status: 'degraded', lastSync: '4 hours ago' },
  { id: 'i3', name: 'Bank feed', purpose: 'Payment matching', access: 'read', status: 'connected', lastSync: '18 min ago' },
  { id: 'i4', name: 'Document store', purpose: 'Delivery artefacts', access: 'read', status: 'connected', lastSync: '9 min ago' },
  { id: 'i5', name: 'Support inbox', purpose: 'Customer requests', access: 'read-write', status: 'not-connected', lastSync: '—' },
];

export const dataScopes: DataScope[] = [
  { id: 'd1', source: 'CRM', includes: 'Companies, contacts, deal stages, owners', excluded: 'Private notes marked confidential' },
  { id: 'd2', source: 'Accounting', includes: 'Invoices, payments, terms', excluded: 'Payroll, director remuneration' },
  { id: 'd3', source: 'Document store', includes: 'Delivery artefacts and contracts', excluded: 'HR folder, legal advice' },
];

export const roles: RoleGrant[] = [
  { id: 'r1', role: 'Company owner', people: 1, canApprove: 'Everything, including irreversible actions' },
  { id: 'r2', role: 'Delivery lead', people: 1, canApprove: 'Gate reviews and client communication' },
  { id: 'r3', role: 'Finance owner', people: 0, canApprove: 'Payment matching — role unfilled' },
];

export const modelPermissions: ModelPermission[] = [
  { id: 'm1', capability: 'Read company knowledge', allowed: true, note: 'Scoped to the sources above' },
  { id: 'm2', capability: 'Draft client-facing text', allowed: true, note: 'Never sent without approval unless templated' },
  { id: 'm3', capability: 'Take irreversible actions', allowed: false, note: 'Always requires a human with authority' },
  { id: 'm4', capability: 'Change its own limits', allowed: false, note: 'Constitution is edited by people only' },
  { id: 'm5', capability: 'Train on company data', allowed: false, note: 'No data leaves for model training' },
];

export const auditRetention = '7 years — every autonomous action, its authority, evidence and outcome.';
