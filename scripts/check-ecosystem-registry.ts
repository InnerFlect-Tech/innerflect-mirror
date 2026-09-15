/**
 * The ecosystem registry, as a gate — request 16's "not a decorative
 * architecture poster" made mechanical. `validateRegistry()` already existed
 * in `lib/design/ecosystem.ts`; this is the first thing that actually calls
 * it in CI-shaped form, same as every other `check:*` script.
 *
 * Not yet wired into `npm run check` — `package.json` is under active claim.
 * Run directly:
 *
 *   npx esbuild scripts/check-ecosystem-registry.ts --bundle --platform=node \
 *     --format=esm --outfile=node_modules/.cache/check-ecosystem-registry.mjs \
 *     --log-level=error --alias:@=. && node node_modules/.cache/check-ecosystem-registry.mjs
 */
import {
  validateRegistry,
  nodeShape,
  hasEntryPoint,
  ECOSYSTEM_JOURNEYS,
  ECOSYSTEM_NODES,
  ECOSYSTEM_NODES_BY_ID,
  ECOSYSTEM_RELATIONS,
  ECOSYSTEM_PAGES,
  ECOSYSTEM_SHAPES,
} from '../lib/design/ecosystem';

let failed = 0;
const check = (label: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
};

try {
  validateRegistry();
  check(
    'Registry validates',
    true,
    `${ECOSYSTEM_NODES.length} nodes, ${ECOSYSTEM_RELATIONS.length} relations, ${ECOSYSTEM_PAGES.length} pages`,
  );
} catch (err) {
  check('Registry validates', false, err instanceof Error ? err.message : String(err));
}

// Every relation's endpoints must be real registered nodes — validateRegistry
// checks structural well-formedness; this checks the graph doesn't dangle.
const nodeIds = new Set(ECOSYSTEM_NODES.map((n) => n.id));
for (const rel of ECOSYSTEM_RELATIONS) {
  check(`Relation ${rel.id}: from "${rel.from}" resolves`, nodeIds.has(rel.from));
  check(`Relation ${rel.id}: to "${rel.to}" resolves`, nodeIds.has(rel.to));
}

// A page in a 'live' state must actually have a route file — verified in the
// last few sessions by hand (curl + read); here as a standing check.
const fs = await import('node:fs');
for (const page of ECOSYSTEM_PAGES) {
  if (page.state !== 'live') continue;
  check(`Live page "${page.id}" has its route file on disk (${page.file})`, fs.existsSync(page.file));
}

// The board draws each node as a shape that says what it is. `surfaces` has to
// mean exactly "this node has a real entry point" — otherwise the board would
// draw a browser window around something you cannot open.
const shapeCensus = new Map<string, string[]>();
for (const node of ECOSYSTEM_NODES) {
  const shape = nodeShape(node);
  shapeCensus.set(shape, [...(shapeCensus.get(shape) ?? []), node.id]);
  check(
    `Node "${node.id}" is drawn as "${shape}"`,
    hasEntryPoint(node) === (shape === 'surface'),
    hasEntryPoint(node)
      ? 'has an entry point, so it must be drawn as a surface'
      : 'has no entry point, so it must not be drawn as a surface',
  );
}

// A legend entry nobody uses is a promise the board does not keep.
for (const entry of ECOSYSTEM_SHAPES) {
  const ids = shapeCensus.get(entry.id) ?? [];
  check(`Legend "${entry.name}" describes real nodes`, ids.length > 0, `${ids.length}: ${ids.join(', ')}`);
}

// A journey is an ordered walk through elements that already exist. Every step
// must resolve, or the lens would dim the whole board and highlight nothing.
for (const journey of ECOSYSTEM_JOURNEYS) {
  for (const step of journey.steps) {
    check(`Journey "${journey.name}" step "${step}" resolves`, Boolean(ECOSYSTEM_NODES_BY_ID[step]));
  }
  check(
    `Journey "${journey.name}" has no repeated step`,
    new Set(journey.steps).size === journey.steps.length,
    `${journey.steps.length} steps`,
  );
}

console.log(failed ? `\n${failed} check(s) failed` : '\nthe ecosystem registry is a real graph, not a poster');
process.exit(failed ? 1 : 0);
