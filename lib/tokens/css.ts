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

/** `vars('c-ink', {900: '#060909'})` → `{'--c-ink-900': '#060909'}` */
function vars(prefix: string, obj: Record<string, Value>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [`--${prefix}-${k}`, String(v)]),
  );
}

/** For groups whose keys are already the full name: `{'ease-out': …}` → `--ease-out`. */
function named(obj: Record<string, Value>): Record<string, string> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [`--${k}`, String(v)]));
}

/** Every token, as CSS custom properties. */
export function tokenVariables(): Record<string, string> {
  return {
    ...vars('c-ink', ink),
    ...vars('c-teal', teal),
    // Scene colours gain CSS mirrors for the first time: the DOM draws miniature
    // massing in HTML and had been eyeballing these.
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

    ...semantic,

    ...Object.fromEntries(
      Object.entries(stateColors).flatMap(([state, c]) =>
        Object.entries(c).map(([role, value]) => [`--state-${state}-${role}`, value]),
      ),
    ),
  };
}

/** Serialised as a `:root{…}` block, ready for a `<style>` tag or a .css file. */
export function toCssVariables(): string {
  const body = Object.entries(tokenVariables())
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  return `:root{${body}}`;
}
