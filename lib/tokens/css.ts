import { ink, massing, shell, teal, world } from './source/palette';
import { motion, radius, shadow, space } from './source/space';
import { fontSize, leading, tracking, weight } from './source/type';
import { semantic } from './source/semantic';
import { stateColors } from './source/state';

/**
 * The one serialiser. Every path that puts tokens into CSS goes through here,
 * so two paths cannot disagree about what a token is.
 */

type Value = string | number;
type TokenEntries = ReadonlyArray<readonly [name: string, value: string]>;

/** `vars('c-ink', {900: '#060909'})` → `[['--c-ink-900', '#060909']]` */
function vars(prefix: string, obj: Record<string, Value>): TokenEntries {
  return Object.entries(obj).map(([key, value]) => [
    `--${prefix}-${key}`,
    String(value),
  ]);
}

/** For groups whose keys are already the full name: `{'ease-out': …}` → `--ease-out`. */
function named(obj: Record<string, Value>): TokenEntries {
  return Object.entries(obj).map(([key, value]) => [`--${key}`, String(value)]);
}

/** Ordered groups retain provenance and cannot silently overwrite one another. */
function tokenEntries(): TokenEntries {
  return [
    ...vars('c-ink', ink),
    ...vars('c-teal', teal),
    ...vars('world', world),
    ...vars('massing', massing),
    ...vars('shell', shell),
    ...vars('space', space),
    ...vars('radius', radius),
    ...vars('shadow', shadow),
    ...named(motion),
    ...vars('fs', fontSize),
    ...vars('weight', weight),
    ...vars('tracking', tracking),
    ...vars('leading', leading),
    ...Object.entries(semantic),
    ...Object.entries(stateColors).flatMap(([state, colors]) =>
      Object.entries(colors).map(
        ([role, value]) => [`--state-${state}-${role}`, value] as const,
      ),
    ),
  ];
}

/** Every token, as CSS custom properties. Throws instead of silently accepting duplicates. */
export function tokenVariables(): Record<string, string> {
  const entries = tokenEntries();
  const names = entries.map(([name]) => name);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicates.length) {
    throw new Error(`Duplicate design tokens: ${[...new Set(duplicates)].join(', ')}`);
  }
  return Object.fromEntries(entries);
}

/** Fails when an alias points to a token the canonical root does not emit. */
export function validateTokenReferences(tokens = tokenVariables()): void {
  const references = new Map(
    Object.entries(tokens).map(([name, value]) => [
      name,
      [...value.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]),
    ]),
  );
  const missing = [...references].flatMap(([name, names]) =>
    names
      .filter((reference) => !(reference in tokens))
      .map((reference) => `${name} → ${reference}`),
  );
  if (missing.length) {
    throw new Error(`Unknown design-token references: ${missing.join(', ')}`);
  }

  const resolved = new Set<string>();
  const resolve = (name: string, path: string[]): void => {
    if (resolved.has(name)) return;
    if (path.includes(name)) {
      throw new Error(`Circular design-token reference: ${[...path, name].join(' → ')}`);
    }
    for (const reference of references.get(name) ?? []) resolve(reference, [...path, name]);
    resolved.add(name);
  };
  for (const name of Object.keys(tokens)) resolve(name, []);
}

/** Serialised as a `:root{…}` block, ready for a `<style>` tag or a .css file. */
export function toCssVariables(): string {
  const body = Object.entries(tokenVariables())
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  return `:root{${body}}`;
}
