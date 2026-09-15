import type { RecordType } from '@/lib/model/record';
import { ELEMENTS_BY_ID, type ElementDef } from './elements';
import type { GlyphId } from '@/components/company-world/generated/glyphIds';

/**
 * Which SSOT element represents which kind of record.
 *
 * Every projection of the company — 3D world, 2D plan, lab — should draw the
 * same object language, and the only way to guarantee that is for all of them
 * to resolve a record to an element through one function rather than each
 * deciding for itself. This is that function.
 *
 * It deliberately covers **only** the record types the world actually draws
 * today. `ELEMENTS` carries a `rendered` flag for exactly this reason: an
 * element can be fully modelled and still be a glyph nobody renders, and
 * pretending otherwise is the kind of claim `check:records` exists to stop.
 * `tool`, `knowledge`, `step`, `verification`, `outcome`, `policy` and the rest
 * have elements defined but nothing drawing them, so they are absent here
 * rather than mapped to something plausible.
 *
 * Three elements name two record types in their `drivenBy` prose —
 * `decision-gate` ("Decision / Authority"), `action-pulse`
 * ("ExecutionStep / ActivityEvent") and `permission-boundary`
 * ("AuthorityLimit / RoleGrant"). Resolving which of those pairs is canonical
 * is a product decision, not a rendering one, so this map takes only the half
 * the world demonstrably draws and leaves the other half unmapped.
 */
const BY_RECORD: Partial<Record<RecordType, GlyphId>> = {
  // "Company record"
  company: 'company-core',
  // "Domain record"
  domain: 'domain-platform',
  // "Workflow record"
  workflow: 'workflow-line',
  // "Workflow.humans / Person record"
  person: 'human-glyph',
  // "Agent record (pose from Agent.activity)"
  agent: 'agent-glyph',
  // "Decision / Authority record"
  decision: 'decision-gate',
  // "Exception record (open)"
  exception: 'risk-hotspot',
};

/**
 * The element that represents this record type, or `undefined` if the world
 * draws no object for it.
 *
 * `undefined` is a real answer, not a failure: a caller rendering a record with
 * no element should show nothing rather than invent a glyph for it.
 */
export function elementForRecord(type: RecordType): ElementDef | undefined {
  const id = BY_RECORD[type];
  return id ? ELEMENTS_BY_ID[id] : undefined;
}

/**
 * Fails loudly if this map ever names an element the registry does not define,
 * or claims one the world does not draw.
 *
 * Both are silent failures otherwise: a bad id renders nothing, and a
 * `rendered: false` element here would let a 2D projection show an object the
 * 3D world has no counterpart for — which is precisely the drift every
 * projection sharing one registry is supposed to prevent.
 */
export function validateRecordElements(): true {
  for (const [record, id] of Object.entries(BY_RECORD)) {
    const element = ELEMENTS_BY_ID[id as GlyphId];
    if (!element) {
      throw new Error(`recordElements: '${record}' maps to '${id}', which is not in ELEMENTS.`);
    }
    if (!element.rendered) {
      throw new Error(
        `recordElements: '${record}' maps to '${id}', which ELEMENTS marks rendered: false. ` +
          `Either the world now draws it (update the registry) or this mapping is a claim the world cannot keep.`,
      );
    }
  }
  return true;
}
