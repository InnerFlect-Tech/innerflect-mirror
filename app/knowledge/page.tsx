import { AppShell } from '@/components/company/AppShell';
import { SurfaceStub } from '@/components/company/SurfaceStub';
import { company, domains } from '@/data/company';
import { companyHeadline } from '@/components/company/Hero';
import { worstState } from '@/lib/model/state';

export default function Page() {
  const state = worstState(domains.map((d) => d.state));
  return (
    <AppShell active="knowledge" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceStub
        eyebrow="Stable surface"
        title="Knowledge"
        question="What does the company know, why, and where is it used?"
        object="Trusted knowledge objects"
        detail="Not a document repository — files are evidence for knowledge. Each object exposes trust, owner, freshness, conflicts and last verification against reality, so Mirror can show where documented procedure and observed behaviour disagree."
      />
    </AppShell>
  );
}
