import { ref, type RecordRef } from './record';

/**
 * A software system the company works through: a CRM, a mailbox, an ERP, a
 * calendar.
 *
 * Tools existed only as bare strings — `Workflow.systems: string[]` and a free-text
 * note on each step — so "CRM" in one workflow and "CRM" in another were two
 * unrelated pieces of prose. A tool glyph could not be clicked, counted, or asked
 * what else depends on it.
 *
 * `Integration` in `constitution.ts` is the same subject seen from the settings
 * surface: what we are connected to and with what access. A Tool is the operational
 * view: what work runs through it. They are linked by `integrationId`.
 */
export type Tool = {
  id: string;
  name: string;
  kind: 'crm' | 'email' | 'calendar' | 'erp' | 'storage' | 'chat' | 'analytics' | 'custom';
  /** The Integration record on the settings surface, where one exists. */
  integrationId?: string;
};

export const toolRef = (t: Pick<Tool, 'id'>): RecordRef => ref('tool', t.id);
