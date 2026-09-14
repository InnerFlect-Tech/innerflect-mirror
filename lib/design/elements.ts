import type { GlyphId } from '@/components/company-world/generated/glyphIds';

export type ElementFamily =
  | 'structure'
  | 'actor'
  | 'attachment'
  | 'flow'
  | 'control'
  | 'signal'
  | 'terminal';

/** Where an element is allowed to live in a composed workflow. */
export type CompositionRole =
  | 'root'
  | 'container'
  | 'node'
  | 'attachment'
  | 'connector'
  | 'edge-token'
  | 'node-overlay'
  | 'scope';

/** The first semantic zoom level at which the object earns its pixels. */
export type RevealLevel = 'company' | 'workflow' | 'execution';

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
  /** Visual family controls grouping in palettes; category never controls colour. */
  family: ElementFamily;
  /** Composition is constrained: not every glyph is a free-standing node. */
  composition: CompositionRole;
  /** Progressive disclosure keeps the company view quiet. */
  revealAt: RevealLevel;
  /** The field that puts this object in the world. One row of the object table. */
  drivenBy: string;
  /**
   * May state recolour it? False for a human — a person is not a state, and the
   * kit agrees: its figure is built from `Human Neutral`. Expressed as data so the
   * renderer never has to branch on an id, which the contract forbids.
   */
  takesState: boolean;
  /**
   * Does the record named by `drivenBy` exist as a type AND have instances?
   *
   * This alone is a weak claim, which is why it is no longer the only one. It
   * was briefly true of all fifteen elements while five of them reached no world
   * object at all — the flag validated itself and the check that read it passed
   * vacuously.
   */
  modelled: boolean;
  /**
   * Does the world actually DRAW this, from those records?
   *
   * The honest half. An element can be fully modelled and still be a glyph
   * nobody renders — `record-token` and `verification-marker` are exactly that
   * today. Separating the two stops "we have a type for it" from reading as
   * "the world shows it".
   */
  rendered: boolean;
};

export const ELEMENTS: readonly ElementDef[] = [
  {
    id: 'company-core',
    name: 'Company Core',
    family: 'structure',
    composition: 'root',
    revealAt: 'company',
    takesState: true,
    modelled: true,
    rendered: true,
    drivenBy: 'Company record',
  },
  {
    id: 'domain-platform',
    name: 'Domain Platform',
    family: 'structure',
    composition: 'container',
    revealAt: 'company',
    takesState: true,
    modelled: true,
    rendered: true,
    drivenBy: 'Domain record',
  },
  {
    id: 'human-glyph',
    name: 'Human Glyph',
    family: 'actor',
    composition: 'attachment',
    revealAt: 'workflow',
    takesState: false,
    modelled: true,
    rendered: true,
    drivenBy: 'Workflow.humans / Person record',
  },
  // The glyph is the Agent; pose may express activity. Identity and activity are
  // separate fields and must not collapse into one.
  {
    id: 'agent-glyph',
    name: 'Agent Glyph',
    family: 'actor',
    composition: 'attachment',
    revealAt: 'workflow',
    takesState: true,
    modelled: true,
    rendered: true,
    drivenBy: 'Agent record (pose from Agent.activity)',
  },
  // `Tool` records exist in data/tools.ts but nothing reads them yet.
  {
    id: 'tool-glyph',
    name: 'Tool Glyph',
    family: 'attachment',
    composition: 'attachment',
    revealAt: 'execution',
    takesState: true,
    modelled: true,
    rendered: false,
    drivenBy: 'Tool record',
  },
  // The knowledge object itself, not the file. A document is evidence FOR it.
  {
    id: 'knowledge-object',
    name: 'Knowledge Object',
    family: 'attachment',
    composition: 'attachment',
    revealAt: 'execution',
    takesState: true,
    modelled: true,
    rendered: false,
    drivenBy: 'Knowledge object in use at a step',
  },
  {
    id: 'workflow-line',
    name: 'Workflow Line',
    family: 'flow',
    composition: 'connector',
    revealAt: 'workflow',
    takesState: true,
    modelled: true,
    rendered: true,
    drivenBy: 'Workflow record',
  },
  // Justified by an actual decision, not inferred from a colour. One pylon per
  // Decision record whose workflowId matches.
  {
    id: 'decision-gate',
    name: 'Decision Gate',
    family: 'control',
    composition: 'node',
    revealAt: 'workflow',
    takesState: true,
    modelled: true,
    rendered: true,
    drivenBy: 'Decision / Authority record',
  },
  {
    id: 'action-pulse',
    name: 'Action Pulse',
    family: 'signal',
    composition: 'edge-token',
    revealAt: 'execution',
    takesState: true,
    modelled: true,
    rendered: true,
    drivenBy: 'ExecutionStep / ActivityEvent record',
  },
  // One hotspot per OPEN Exception record. An aggregate count is not a record.
  {
    id: 'risk-hotspot',
    name: 'Risk Hotspot',
    family: 'signal',
    composition: 'node-overlay',
    revealAt: 'workflow',
    takesState: true,
    modelled: true,
    rendered: true,
    drivenBy: 'Exception record (open)',
  },
  {
    id: 'step-node',
    name: 'Step Node',
    family: 'flow',
    composition: 'node',
    revealAt: 'workflow',
    takesState: true,
    modelled: true,
    rendered: false,
    drivenBy: 'ProcessStep record (id + stage)',
  },
  {
    id: 'record-token',
    name: 'Record Token',
    family: 'flow',
    composition: 'edge-token',
    revealAt: 'workflow',
    takesState: true,
    modelled: true,
    rendered: false,
    drivenBy: 'Execution.token (RecordToken)',
  },
  {
    id: 'verification-marker',
    name: 'Verification Marker',
    family: 'terminal',
    composition: 'node',
    revealAt: 'workflow',
    takesState: true,
    modelled: true,
    rendered: false,
    drivenBy: 'Verification record',
  },
  // No Outcome instance exists: the one execution is unfinished, correctly.
  {
    id: 'outcome-marker',
    name: 'Outcome Marker',
    family: 'terminal',
    composition: 'node',
    revealAt: 'workflow',
    takesState: true,
    modelled: false,
    rendered: false,
    drivenBy: 'Outcome record',
  },
  // The GLB is a normalised style unit; record scope controls its runtime extent.
  {
    id: 'permission-boundary',
    name: 'Permission Boundary',
    family: 'control',
    composition: 'scope',
    revealAt: 'execution',
    takesState: true,
    modelled: true,
    rendered: false,
    drivenBy: 'AuthorityLimit / RoleGrant record',
  },
];

export const ELEMENTS_BY_ID = Object.fromEntries(
  ELEMENTS.map((e) => [e.id, e]),
) as Record<GlyphId, ElementDef>;
