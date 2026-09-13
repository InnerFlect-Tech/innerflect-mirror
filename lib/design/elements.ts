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
};

export const ELEMENTS: readonly ElementDef[] = [
  { id: 'company-core', name: 'Company Core', takesState: true,
    drivenBy: 'Company record' },
  { id: 'function-platform', name: 'Function Platform', takesState: true,
    drivenBy: 'Domain record' },
  { id: 'human-glyph', name: 'Human Glyph', takesState: false,
    drivenBy: 'Workflow.humans / Person record' },
  { id: 'agent-glyph', name: 'Agent Glyph', takesState: true,
    drivenBy: 'Domain.agents[].activity' },
  { id: 'tool-glyph', name: 'Tool Glyph', takesState: true,
    drivenBy: 'Tool record' },
  { id: 'knowledge-slab', name: 'Knowledge Slab', takesState: true,
    drivenBy: 'Knowledge object in use at a step' },
  { id: 'workflow-line', name: 'Workflow Line', takesState: true,
    drivenBy: 'Workflow record' },
  { id: 'decision-gate', name: 'Decision Gate', takesState: true,
    drivenBy: 'Workflow.state is attention or critical' },
  { id: 'action-pulse', name: 'Action Pulse', takesState: true,
    drivenBy: 'Action / event stream' },
  { id: 'risk-hotspot', name: 'Risk Hotspot', takesState: true,
    drivenBy: 'Domain.openItems' },
];

export const ELEMENTS_BY_ID = Object.fromEntries(
  ELEMENTS.map((e) => [e.id, e]),
) as Record<GlyphId, ElementDef>;
