import { AppShell } from '@/components/company/AppShell';
import { SurfaceStub } from '@/components/company/SurfaceStub';
import { company, domains } from '@/data/company';
import { companyHeadline } from '@/components/company/Hero';
import { worstState } from '@/lib/model/state';

export default function Page() {
  const state = worstState(domains.map((d) => d.state));
  return (
    <AppShell active="impact" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceStub
        eyebrow="Stable surface"
        title="Impact"
        question="Is autonomy making the company better?"
        object="Verified business value"
        detail="The proof layer. Every claim traces back: Impact → Work → Execution → Action → Decision → Policy → Evidence → Source event."
      />
    </AppShell>
  );
}
