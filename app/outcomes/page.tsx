import { AppShell } from '@/components/company/AppShell';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { SurfaceSummary } from '@/components/company/SurfaceSummary';
import { ImpactSurface } from '@/components/company/ImpactSurface';
import { companyHeadline } from '@/components/company/Hero';
import { company, domains } from '@/data/company';
import { impactClaims, safety } from '@/data/impact';
import { worstState } from '@/lib/model/state';

export default function OutcomesPage() {
  const state = worstState(domains.map((d) => d.state));
  const verified = impactClaims.filter((c) => c.verified).length;

  return (
    <AppShell active="outcomes" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceHead
        eyebrow="Verified business value"
        title="Outcomes"
        pulse="Proof, not assertion. Every claim walks back to the source event that produced it."
      />
      <SurfaceSummary
        stats={[
          { value: '32h', label: 'Capacity returned weekly', tone: 'good' },
          { value: `${verified}/${impactClaims.length}`, label: 'Claims traceable', tone: verified < impactClaims.length ? 'attention' : 'good' },
          { value: String(safety.unsafeActions), label: 'Unsafe actions', tone: safety.unsafeActions ? 'critical' : 'good' },
          { value: String(safety.humanCorrection), label: 'Human corrections' },
          { value: safety.verifiedAutonomousWork.toLocaleString(), label: 'Verified autonomous actions' },
        ]}
      />
      <ImpactSurface claims={impactClaims} safety={safety} />
    </AppShell>
  );
}
