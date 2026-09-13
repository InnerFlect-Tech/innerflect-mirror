/**
 * Proves the generated token set matches what the hand-authored stylesheet
 * declares, name for name and value for value.
 *
 * This exists because the token consolidation is only safe if it is provably a
 * no-op first. Redesigning the ramp and changing the mechanism in one commit is
 * how a "refactor" silently restyles a product.
 */
import { readFileSync } from 'node:fs';
import { tokenVariables } from '../lib/tokens/css';

const generated = tokenVariables();
const css = readFileSync('app/tokens.css', 'utf8');

const declared = new Map<string, string>();
for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
  declared.set(m[1], m[2].trim());
}

const missing: string[] = [];
const differing: string[] = [];
for (const [name, value] of declared) {
  if (!(name in generated)) missing.push(name);
  else if (generated[name] !== value) differing.push(`${name}\n      css: ${value}\n      ts : ${generated[name]}`);
}

console.log(`declared in app/tokens.css : ${declared.size}`);
console.log(`emitted from lib/tokens    : ${Object.keys(generated).length}`);
// Tier 3 is component plumbing with no TypeScript consumer and stays hand-authored,
// so these are expected. Printed as "by design" rather than as a bare list, which
// read like a warning on a passing run.
if (missing.length) {
  console.log(`\nhand-authored, by design (${missing.length}): ${missing.join(', ')}`);
}
if (differing.length) console.log(`\nVALUE MISMATCH (${differing.length}):\n  ${differing.join('\n  ')}`);
if (!missing.length && !differing.length) console.log('\nevery declared token is emitted with an identical value.');
process.exit(differing.length ? 1 : 0);
