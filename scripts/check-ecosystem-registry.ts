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
import { validateRegistry, ECOSYSTEM_NODES, ECOSYSTEM_RELATIONS, ECOSYSTEM_PAGES } from '../lib/design/ecosystem';

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

console.log(failed ? `\n${failed} check(s) failed` : '\nthe ecosystem registry is a real graph, not a poster');
process.exit(failed ? 1 : 0);
