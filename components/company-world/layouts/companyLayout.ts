// Curated composition, not procedural layout.
//
// A force-directed graph is technically clever and visually terrible, so the
// renderer keeps a designed arrangement for each supported node count. The
// model decides WHICH domains exist; this file decides where they sit.
//
// The four-node family traces the path a euro takes — attention, commitment,
// fulfilment, cash — as a sweep around the core, deliberately leaving the
// front-left quadrant open so the scene has somewhere to breathe.

export type Slot = { position: [number, number, number]; scale: number };

const four: Slot[] = [
  { position: [-3.05, 0, -1.05], scale: 0.98 },
  { position: [-0.25, 0, -2.7], scale: 1.02 },
  { position: [2.95, 0, -0.95], scale: 1.05 },
  { position: [1.35, 0, 2.35], scale: 0.96 },
];

const five: Slot[] = [
  { position: [-3.15, 0, -1.3], scale: 0.96 },
  { position: [-0.55, 0, -2.8], scale: 1.02 },
  { position: [2.9, 0, -1.45], scale: 1.04 },
  { position: [2.65, 0, 1.55], scale: 0.98 },
  { position: [-1.05, 0, 2.6], scale: 0.94 },
];

const six: Slot[] = [
  { position: [-2.55, 0, -2.05], scale: 0.96 },
  { position: [0.55, 0, -2.85], scale: 1.02 },
  { position: [3.15, 0, -0.95], scale: 1.04 },
  { position: [2.65, 0, 1.95], scale: 0.98 },
  { position: [-0.45, 0, 2.85], scale: 0.94 },
  { position: [-3.25, 0, 0.85], scale: 0.96 },
];

const families: Record<number, Slot[]> = { 4: four, 5: five, 6: six };

/**
 * Returns a designed slot per domain. Counts outside the curated families fall
 * back to the nearest family, truncated or ringed — a deliberate degradation
 * rather than a procedural surprise.
 */
export function companyLayout(count: number): Slot[] {
  const exact = families[count];
  if (exact) return exact;
  if (count < 4) return four.slice(0, Math.max(count, 0));
  if (count > 6) {
    const ring: Slot[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.PI * 0.18;
      ring.push({
        position: [Math.cos(a) * 3.2, 0, Math.sin(a) * 2.5],
        scale: 0.92,
      });
    }
    return ring;
  }
  return four;
}
