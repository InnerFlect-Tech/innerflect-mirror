/**
 * Record identity.
 *
 * Until this existed, every record in the model was an `id: string` whose type
 * was implied by which array it happened to live in — and the ids were not
 * unique across collections. `data/mirror.ts` row ids are `market`, `sales`,
 * `delivery`, `finance`, byte-identical to the `Domain` ids. So an id on its own
 * could never answer "what did I just click?".
 *
 * That is why the product contract now says: every selectable visual object
 * carries a stable record id AND record type, and clicking it resolves to the
 * same object the HTML surfaces use. A `RecordRef` is that pair.
 */

/**
 * Every kind of thing in the company model that can be pointed at.
 *
 * Kept as a closed union on purpose: a 3D object referencing a type that has no
 * surface to open is a broken link, and this is where that becomes a type error.
 */
export type RecordType =
  | 'company'
  | 'domain'
  | 'workflow'
  | 'step'
  | 'execution'
  | 'record-token'
  | 'person'
  | 'agent'
  | 'tool'
  | 'knowledge'
  | 'decision'
  | 'authority'
  | 'exception'
  | 'action'
  | 'verification'
  | 'outcome'
  | 'policy';

/** A stable pointer to one record. The id alone is never enough. */
export type RecordRef = {
  type: RecordType;
  id: string;
};

/** Anything that can be pointed at carries its own ref. */
export type Identified = {
  id: string;
  readonly recordType: RecordType;
};

export function ref(type: RecordType, id: string): RecordRef {
  return { type, id };
}

export function refOf(r: Identified): RecordRef {
  return { type: r.recordType, id: r.id };
}

export function refEquals(a: RecordRef | null, b: RecordRef | null): boolean {
  if (!a || !b) return a === b;
  return a.type === b.type && a.id === b.id;
}

/**
 * A stable string form, for React keys and map lookups. Never parse it back —
 * use the `RecordRef` itself; this exists so a ref can be a `Map` key.
 */
export function refKey(r: RecordRef): string {
  return `${r.type}:${r.id}`;
}
