import { AppShell } from '@/components/company/AppShell';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { SurfaceSummary } from '@/components/company/SurfaceSummary';
import { MirrorSurface } from '@/components/company/MirrorSurface';
import { companyHeadline } from '@/components/company/Hero';
import { company, domains } from '@/data/company';
import { mirrorCaveat, mirrorDeltas, mirrorRows, workedExample } from '@/data/mirror';
import { activity } from '@/data/activity';
import { worstState } from '@/lib/model/state';

/**
 * Its own surface, not a view inside Company. Company answers "is my company
 * okay, and where should I look"; Mirror answers "what would this company be
 * if the work it already does ran itself" — a different question, and the one
 * the product is named after.
 */
/**
 * The layout is readable from the URL so a particular reading of the comparison
 * can be linked to — `?layout=radial` is what you send someone when the point
 * you are making is about migration rather than about count.
 */
export default async function MirrorPage({
  searchParams,
}: {
  searchParams: Promise<{ layout?: string }>;
}) {
  const { layout } = await searchParams;
  const state = worstState(domains.map((d) => d.state));
  const hoursNow = mirrorRows.reduce((s, r) => s + r.hoursNow, 0);
  const hoursProjected = mirrorRows.reduce((s, r) => s + r.hoursProjected, 0);
  const gates = mirrorRows.reduce(
    (s, r) => s + r.reflected.filter((x) => x.actor === 'gate').length, 0,
  );

  return (
    <AppShell active="mirror" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceHead
        eyebrow="Your company, reflected as a system"
        title="Mirror"
        pulse="The same company on both sides. The work does not shrink — only the share of it a person has to carry."
      />
      <SurfaceSummary
        stats={[
          { value: '47% → 68%', label: 'Company autonomy', tone: 'good' },
          { value: `${hoursNow}h → ${hoursProjected}h`, label: 'Human hours per week', tone: 'good' },
          { value: String(mirrorRows.length), label: 'Departments reflected' },
          { value: String(gates), label: 'Steps still needing a person', tone: 'attention' },
          { value: 'Projection', label: 'Right column is not measured', tone: 'attention' },
        ]}
      />
      <MirrorSurface
        rows={mirrorRows}
        deltas={mirrorDeltas}
        example={workedExample}
        events={activity}
        caveat={mirrorCaveat}
        initialLayout={layout === 'radial' ? 'radial' : 'split'}
      />
    </AppShell>
  );
}
