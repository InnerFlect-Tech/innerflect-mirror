import type { BufferGeometry } from 'three';
import type { RecordRef } from '@/lib/model/record';

/**
 * Which record owns which triangles of a merged geometry.
 *
 * The island merges everything into two meshes so a fully populated domain costs
 * two draw calls instead of forty. That is what holds the scene at 61 calls — and
 * it is also why nothing on an island could be clicked: once merged, a bay, a desk
 * and a pylon are the same mesh.
 *
 * The merge does not have to be given up. Parts are pushed in a per-workflow loop,
 * so the owning record is known at build time; recording the triangle range as each
 * part goes in lets a raycast's `faceIndex` resolve back to a `RecordRef`
 * afterwards. One draw call preserved, per-object picking gained.
 */
export type PickRange = {
  /** First triangle index of this object within the merged geometry. */
  start: number;
  count: number;
  ref: RecordRef;
};

export type PickTable = PickRange[];

/** Triangles in a geometry, indexed or not. */
export function triangleCount(g: BufferGeometry): number {
  return g.index ? g.index.count / 3 : g.attributes.position.count / 3;
}

/**
 * Accumulates geometry alongside the record each piece belongs to.
 *
 * Every part goes through `push`, so a part drawn without a record it stands for
 * is a compile-time impossibility rather than a review comment.
 */
export class PickBuilder {
  readonly parts: BufferGeometry[] = [];
  readonly table: PickTable = [];
  private triangles = 0;

  push(geometry: BufferGeometry, ref: RecordRef): void {
    const count = triangleCount(geometry);
    this.parts.push(geometry);
    this.table.push({ start: this.triangles, count, ref });
    this.triangles += count;
  }

  pushAll(geometries: BufferGeometry[], ref: RecordRef): void {
    for (const g of geometries) this.push(g, ref);
  }

  get total(): number {
    return this.triangles;
  }
}

/**
 * Resolves a raycast hit to the record that owns it.
 *
 * Binary search: an island can hold a few hundred ranges and this runs on every
 * pointer move, so a linear scan would be a per-frame cost for a lookup that does
 * not need one.
 */
export function refAt(table: PickTable, faceIndex: number): RecordRef | null {
  let lo = 0;
  let hi = table.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const r = table[mid];
    if (faceIndex < r.start) hi = mid - 1;
    else if (faceIndex >= r.start + r.count) lo = mid + 1;
    else return r.ref;
  }
  return null;
}
