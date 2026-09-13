/**
 * The pick contract, as a gate.
 *
 * The island merges everything into two meshes to hold the draw-call budget, and
 * resolves clicks by mapping a raycast's `faceIndex` back through a triangle-range
 * table. That only works if the table covers every triangle exactly once — a gap
 * makes an object unclickable, an overlap makes it open the wrong record, and
 * both fail silently in a way no type can catch.
 */
import { buildIslandGeometry } from '../components/company-world/assets/primitives';
import { refAt, triangleCount } from '../components/company-world/assets/pickTable';
import { domains } from '../data/company';
import { worldRecords } from '../data/world-records';

let failed = 0;
const check = (label: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
};

for (const d of domains) {
  const g = buildIslandGeometry(d.workflows, '#55cbbb', worldRecords);
  for (const [name, geo, table] of [
    ['body', g.body, g.bodyPicks],
    ['accent', g.accent, g.accentPicks],
  ] as const) {
    const tris = triangleCount(geo);
    const covered = table.reduce((n, r) => n + r.count, 0);
    let contiguous = table.length === 0 || table[0].start === 0;
    for (let i = 1; i < table.length; i++) {
      if (table[i].start !== table[i - 1].start + table[i - 1].count) contiguous = false;
    }
    let resolves = true;
    for (let f = 0; f < tris; f += Math.max(1, Math.floor(tris / 97))) {
      if (!refAt(table, f)) resolves = false;
    }
    check(
      `${d.label} ${name}`,
      covered === tris && contiguous && resolves,
      `${tris} triangles, ${table.length} ranges, covered ${covered}`,
    );
  }
  // The vertex-colour contract the merge depends on.
  for (const [name, geo] of [['body', g.body], ['accent', g.accent]] as const) {
    const pos = geo.attributes.position?.count ?? 0;
    const col = geo.attributes.color?.count ?? 0;
    check(`${d.label} ${name} vertex colours`, pos === col, `position ${pos}, color ${col}`);
  }
}

console.log(failed ? `\n${failed} check(s) failed` : '\nevery triangle resolves to exactly one record');
process.exit(failed ? 1 : 0);
