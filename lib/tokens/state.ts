/**
 * Compatibility surface. The tokens moved to `lib/tokens/` (see `index.ts`);
 * this keeps the two existing import sites working without a coordinated edit
 * across an ownership boundary.
 */
export { stateColors, type StateColor } from './source/state';

import { toCssVariables } from './css';

/**
 * Emitted into a `<style>` at the document root so CSS uses the same values the
 * scene does: `color: var(--state-critical-label)`.
 *
 * The name is historical — it now emits the WHOLE token set, not just state.
 * Keeping the name means `app/layout.tsx` did not have to change to gain the
 * rest of the tokens, which matters because that file belongs to another
 * session. Prefer `toCssVariables()` in new code.
 */
export function stateCssVariables(): string {
  return toCssVariables();
}
