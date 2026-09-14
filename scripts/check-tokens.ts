/**
 * Guards the one-definition rule for CSS tokens.
 *
 * It began life as a parity check: while tiers 1 and 2 still lived in
 * app/tokens.css, it proved every declaration matched lib/tokens value for value,
 * which is what made deleting them safe. Now that they are gone it enforces the
 * result — nothing the token root emits may be re-declared by hand. A name in
 * both places is a second copy waiting to drift, which is the thing this whole
 * effort removed.
 */
import { readFileSync } from 'node:fs';
import { tokenVariables, validateTokenReferences } from '../lib/tokens/css';
import { semantic } from '../lib/tokens/source/semantic';

const generated = tokenVariables();
validateTokenReferences(generated);
const css = readFileSync('app/tokens.css', 'utf8');
const rawSemanticValues = Object.entries(semantic).filter(([, value]) =>
  /#[\da-f]{3,8}|(?:rgb|hsl|oklch)a?\(/i.test(value),
);

const declared = new Map<string, string>();
for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
  declared.set(m[1], m[2].trim());
}

const duplicated = [...declared.keys()].filter((name) => name in generated);
const tier3 = [...declared.keys()].filter((name) => !(name in generated));

console.log(`declared in app/tokens.css : ${declared.size} (tier 3, hand-authored)`);
console.log(`emitted from lib/tokens    : ${Object.keys(generated).length}`);
console.log('references                 : aliases resolve without cycles');
console.log('semantic primitives         : no raw colours');
console.log(`tier 3: ${tier3.join(', ')}`);
if (duplicated.length) {
  console.log(
    `\nDUPLICATED — declared in CSS but already emitted from lib/tokens (${duplicated.length}):\n  ${duplicated.join('\n  ')}`,
  );
} else {
  console.log('\nno token is defined in two places.');
}
if (rawSemanticValues.length) {
  console.log(
    `\nRAW SEMANTIC COLOURS — add primitives to palette.ts and reference them:\n  ${rawSemanticValues.map(([name, value]) => `${name}: ${value}`).join('\n  ')}`,
  );
}
process.exit(duplicated.length || rawSemanticValues.length ? 1 : 0);
