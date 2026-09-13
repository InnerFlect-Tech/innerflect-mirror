import type { GlyphId } from '@/components/company-world/generated/glyphIds';

/**
 * The element registry — the authored half of the system.
 *
 * `GLYPH_MANIFEST` (generated) says what each asset physically *is*. This says
 * what it *means* and which record field puts it in the world, which is the rule
 * `WORLD_ELEMENTS.md` exists to enforce. Typed against `GlyphId`, so renaming an
 * asset in the kit breaks the build here rather than silently rendering nothing.
 */
export type ElementDef = {
  id: GlyphId;
  name: string;
  /** The field that puts this object in the world. One row of the object table. */
  drivenBy: string;
  /**
   * May state recolour it? False for a human — a person is not a state, and the
   * kit agrees: its figure is built from `Human Neutral`. Expressed as data so the
   * renderer never has to branch on an id, which the contract forbids.
   */
  takesState: boolean;
  /**
   * Does the record named by `drivenBy` actually exist in `lib/model/`?
   *
   * False means the object is currently justified by an aggregate or an inferred
   * state rather than by a record you could click and open — which the semantic
   * review in `WORLD_ELEMENTS.md` rejects. Carried as data so the gap is visible
   * on the design surface instead of living in a document nobody opens.
   */
  modelled: boolean;
};

export const ELEMENTS: readonly ElementDef[] = [
  { id: 'company-core', name: 'Company Core', takesState: true, modelled: true,
    drivenBy: 'Company record' },
  { id: 'domain-platform', name: 'Domain Platform', takesState: true, modelled: true,
    drivenBy: 'Domain record' },
  { id: 'human-glyph', name: 'Human Glyph', takesState: false, modelled: true,
    drivenBy: 'Workflow.humans / Person record' },
  // The glyph is the Agent; pose may express activity. Identity and activity are
  // separate fields and must not collapse into one.
  { id: 'agent-glyph', name: 'Agent Glyph', takesState: true, modelled: true,
    drivenBy: 'Agent record (pose from Agent.activity)' },
  { id: 'tool-glyph', name: 'Tool Glyph', takesState: true, modelled: false,
    drivenBy: 'Tool record' },
  // The knowledge object itself, not the file. A document is evidence FOR it.
  { id: 'knowledge-object', name: 'Knowledge Object', takesState: true, modelled: false,
    drivenBy: 'Knowledge object in use at a step' },
  { id: 'workflow-line', name: 'Workflow Line', takesState: true, modelled: true,
    drivenBy: 'Workflow record' },
  // Must be justified by an actual decision, not inferred from a colour. No
  // Decision record reaches the world yet, so this is currently unmodelled.
  { id: 'decision-gate', name: 'Decision Gate', takesState: true, modelled: false,
    drivenBy: 'Decision / Authority record' },
  { id: 'action-pulse', name: 'Action Pulse', takesState: true, modelled: false,
    drivenBy: 'Action / event record' },
  // An aggregate count is not a record you can open. Needs an Exception record.
  { id: 'risk-hotspot', name: 'Risk Hotspot', takesState: true, modelled: false,
    drivenBy: 'Risk / Exception / Policy conflict record' },
  { id: 'step-node', name: 'Step Node', takesState: true, modelled: false,
    drivenBy: 'Workflow step record' },
  { id: 'record-token', name: 'Record Token', takesState: true, modelled: false,
    drivenBy: 'Business record in a workflow execution' },
  { id: 'verification-marker', name: 'Verification Marker', takesState: true, modelled: false,
    drivenBy: 'Verification record' },
  { id: 'outcome-marker', name: 'Outcome Marker', takesState: true, modelled: false,
    drivenBy: 'Outcome record' },
  { id: 'permission-boundary', name: 'Permission Boundary', takesState: true, modelled: false,
    drivenBy: 'Authority / permission record' },
];

export const ELEMENTS_BY_ID = Object.fromEntries(
  ELEMENTS.map((e) => [e.id, e]),
) as Record<GlyphId, ElementDef>;
