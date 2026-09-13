import { AppShell } from '@/components/company/AppShell';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { ImpactSurface } from '@/components/company/ImpactSurface';
import { companyHeadline } from '@/components/company/Hero';
import { company, domains } from '@/data/company';
import { impactClaims, safety } from '@/data/impact';
import { worstState } from '@/lib/model/state';

export default function ImpactPage() {
  const state = worstState(domains.map((d) => d.state));
  const verified = impactClaims.filter((c) => c.verified).length;

  return (
    <AppShell active="outcomes" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceHead
        eyebrow="Verified business value"
        title="Impact"
        pulse={`${verified} of ${impactClaims.length} claims traceable to a source event · ${safety.unsafeActions} unsafe actions`}
      />
      <ImpactSurface claims={impactClaims} safety={safety} />
    </AppShell>
  );
}
