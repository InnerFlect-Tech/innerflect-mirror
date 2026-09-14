import { ref, type RecordRef } from '@/lib/model/record';
import type { Domain } from '@/lib/model/domain';
import type { IslandRecords } from './primitives';

/**
 * Every record an island draws, as a plain list a keyboard or screen-reader
 * user can reach — not the merged geometry a mouse resolves through.
 *
 * WORLD_ELEMENTS.md request 27's second finding: request 10 made a specific
 * pylon/agent/workflow pick resolve to a real `RecordRef` for the first time,
 * but the only way to *produce* that pick is still a pointer click on the 3D
 * canvas. `CompanyWorkspace`'s domain-controls buttons satisfy
 * PRODUCT_STRUCTURE.md's "Labels and all meaningful controls remain
 * accessible HTML" rule at domain level; nothing does at record level.
 *
 * This is the non-visual half of that fix: given a domain and the records
 * that justify its pylons/hotspots (the same `IslandRecords` the geometry
 * builder already takes), return the flat list of `{ ref, label }` pairs a
 * keyboard-operable list can render buttons from. It derives nothing new —
 * every ref here is one `buildIslandGeometry`/`buildAgentGeometry` would also
 * draw, from the same fields, so the accessible list and the 3D scene cannot
 * silently disagree about which records exist.
 *
 * Deliberately not a component: this session's ownership is the R3F scene,
 * not the HTML surface that would render the list
 * (`components/company/CompanyWorkspace.tsx`, owned elsewhere). A pure
 * function is what that surface can call without taking on a WebGL import.
 */
export type PickableRecord = {
  ref: RecordRef;
  /** What a screen reader announces — the thing itself, not its id. */
  label: string;
};

export function listPickableRecords(domain: Domain, records: IslandRecords): PickableRecord[] {
  const out: PickableRecord[] = [];

  for (const w of domain.workflows) {
    out.push({ ref: ref('workflow', w.id), label: w.name });

    const decisionId = records.decisionByWorkflow.get(w.id);
    if (decisionId) out.push({ ref: ref('decision', decisionId), label: `Decision — ${w.name}` });

    const exceptionId = records.exceptionByWorkflow.get(w.id);
    if (exceptionId) out.push({ ref: ref('exception', exceptionId), label: `Exception — ${w.name}` });
  }

  for (const a of domain.agents) {
    out.push({ ref: ref('agent', a.id), label: `${a.name} — ${a.job}` });
  }

  return out;
}
