/**
 * Knowledge is not a document repository. Files are evidence FOR knowledge,
 * which is why `sources` is a property of a knowledge object rather than the
 * object itself being a file.
 */
export type KnowledgeKind =
  | 'policy'
  | 'procedure'
  | 'decision'
  | 'experience'
  | 'exception'
  | 'customer'
  | 'product'
  | 'person'
  | 'project'
  | 'rule'
  | 'definition'
  | 'external-requirement';

export type Freshness = 'current' | 'ageing' | 'stale';

export type KnowledgeObject = {
  id: string;
  name: string;
  kind: KnowledgeKind;
  /** How far this is trusted, 0–100, and when that was last tested. */
  trust: number;
  confidence: number;
  freshness: Freshness;
  lastVerified: string;
  owner: string;
  /** How often it is actually used — unused knowledge is a signal. */
  usedBy: number;
  sources: string[];
  relatedWorkflows: string[];
  relatedDecisions: number;
  /**
   * The point of the surface: where what is written down and what actually
   * happens have come apart.
   */
  drift?: {
    documented: string;
    observed: string;
    /** How often reality departs from the document. */
    divergence: string;
  };
  conflicts?: string[];
};

/**
 * The knowledge map. Positions are a designed composition in a 0–100 coordinate
 * space, not a force layout — the same reasoning as the 3D world's curated
 * layouts: an auto-arranged graph is technically clever and visually terrible.
 */
export type MapNode = {
  id: string;
  label: string;
  /** Percent coordinates within the map viewport. */
  x: number;
  y: number;
  /** The centre node is drawn larger and brighter. */
  core?: boolean;
  count: number;
};

export type MapEdge = {
  from: string;
  to: string;
  strength: 'strong' | 'related' | 'other';
  /** What the relationship means, shown along strong edges. */
  label?: string;
};

/** One retrieved source behind an answer. */
export type RetrievedSource = {
  id: string;
  label: string;
  detail: string;
  badge: string;
};

export type Learning = {
  id: string;
  label: string;
  capturedFrom: string;
  at: string;
};

export type MemoryUpgrade = {
  id: string;
  title: string;
  detail: string;
  cta: string;
};
