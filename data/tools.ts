import type { Tool } from '@/lib/model/tool';

/**
 * The systems work actually runs through.
 *
 * Tools previously existed only as bare strings inside `Workflow.systems` and as
 * free text on each step, so "CRM" in Sales and "CRM" in Market were unrelated
 * prose. Nothing could be clicked, counted, or asked what depends on it.
 *
 * `integrationId` points at the settings-surface `Integration` record where one
 * exists — the same system seen as "what are we connected to" rather than "what
 * does work run through".
 */
export const tools: Tool[] = [
  { id: 'crm', name: 'CRM', kind: 'crm', integrationId: 'i1' },
  { id: 'email', name: 'Email', kind: 'email' },
  { id: 'website-forms', name: 'Website forms', kind: 'custom' },
  { id: 'web-intelligence', name: 'Web intelligence', kind: 'analytics' },
  { id: 'knowledge-spine', name: 'Knowledge spine', kind: 'storage' },
  { id: 'project-tracker', name: 'Project tracker', kind: 'custom' },
  { id: 'document-store', name: 'Document store', kind: 'storage', integrationId: 'i4' },
  { id: 'invoicing', name: 'Invoicing', kind: 'erp' },
  { id: 'accounting', name: 'Accounting', kind: 'erp', integrationId: 'i2' },
  { id: 'bank-feed', name: 'Bank feed', kind: 'erp', integrationId: 'i3' },
];

export const toolById = new Map(tools.map((t) => [t.id, t]));
