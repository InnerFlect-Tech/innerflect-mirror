import type { Metadata } from 'next';
import { PublicNav } from '@/components/company/PublicNav';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { SurfaceSummary } from '@/components/company/SurfaceSummary';
import { OpenMirrorSurface } from '@/components/company/OpenMirrorSurface';
import { gradeCensus, stepCount, unverifiedShare } from '@/data/open-mirror';

/**
 * Open Mirror — the free/open edition, registered in `lib/design/ecosystem.ts`
 * as `/open-mirror` and pointed at this exact file since before it existed.
 *
 * Built here, in the app, rather than as a fifth static prototype under
 * `prototypes/`. The OS Shop and Forge Shop prototypes are the precedent for
 * how that goes: they look aligned and assert nothing, and the standalone
 * cockpit was retired for exactly that reason (`WORLD_ELEMENTS.md`, request
 * 24 — "a page can only assert alignment"). Because this route imports the
 * product's own `SurfaceHead`, `SurfaceSummary` and token surface, a drift
 * between the free edition and the paid one breaks the build instead of
 * quietly shipping.
 *
 * Deliberately NOT wrapped in `AppShell`: that shell carries the authenticated
 * operator's rail and a decisions-waiting count. Open Mirror is public and has
 * no company and no queue — borrowing the shell would be the first lie the
 * surface told.
 */
export const metadata: Metadata = {
  title: 'Open Mirror · Innerflect',
  description: 'A free operational twin that is honest about what it cannot see.',
};

export default function OpenMirrorPage() {
  const census = gradeCensus();
  const total = stepCount();

  return (
    <main data-surface="open-mirror">
      <PublicNav current="/open-mirror" />
      <SurfaceHead
        eyebrow="Free and open · nothing leaves your browser"
        title="Open Mirror"
        pulse="See how your company works, before anyone manages it for you. This edition reconstructs the same four-domain money path the paid Mirror uses — and tells you, step by step, how much of it is something you merely believe."
      />
      <SurfaceSummary
        stats={[
          { value: `${unverifiedShare()}%`, label: 'Unverified', tone: 'attention' },
          { value: String(census.observed), label: 'Steps something observed', tone: 'good' },
          { value: String(census.declared), label: 'Steps you declared' },
          { value: String(census.inferred), label: 'Steps inferred from a pattern' },
          { value: String(total), label: 'Steps reconstructed' },
        ]}
      />
      <OpenMirrorSurface />
    </main>
  );
}
