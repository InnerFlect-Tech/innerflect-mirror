/**
 * Compatibility surface. These are product colours, not scene-private ones, so
 * they moved to `lib/tokens/source/palette.ts` where the stylesheet can also
 * name them — they had no CSS mirror before, which meant the DOM could only
 * approximate them by eye.
 *
 * Five call sites inside this folder still import from here; they keep working.
 * Prefer `@/lib/tokens` in new code.
 */
export { world, massing, shell } from '@/lib/tokens';
