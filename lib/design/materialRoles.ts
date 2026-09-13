import type { KitMaterialName } from '@/components/company-world/generated/glyphIds';

/**
 * What each kit material MEANS, which is what decides whether state may recolour it.
 *
 * The kit's glTF material names are the contract. They are stable, semantic, and
 * emitted by the generator into the manifest, so `KitMaterialName` is generated —
 * which makes this map exhaustive by compilation. A material the kit adds without
 * a role here is a type error, not a silent fallback to `structure`.
 */
export type MaterialRole =
  | 'structure'
  | 'structureLight'
  | 'warm'
  | 'human'
  | 'glass'
  | 'stateGlass'
  | 'stateMid'
  | 'stateHot';

export const MATERIAL_ROLES = {
  'Graphite': 'structure',
  'Graphite Light': 'structureLight',
  'Warm White': 'warm',
  // A person is not a state. Human grey never takes the state colour.
  'Human Neutral': 'human',
  // Neutral dark glass. Transmission stripped at load; stays uncoloured.
  'Smoky Glass': 'glass',
  // State-carrying. The only materials the state layer may touch.
  'Mirror Glass': 'stateGlass',
  'Risk Field': 'stateGlass',
  'Autonomy Teal': 'stateMid',
  'Active Teal': 'stateHot',
  'Attention Amber': 'stateHot',
} as const satisfies Record<KitMaterialName, MaterialRole>;

/** Roles that the state layer is allowed to recolour. */
export const STATE_DRIVEN_ROLES: readonly MaterialRole[] = ['stateGlass', 'stateMid', 'stateHot'];
