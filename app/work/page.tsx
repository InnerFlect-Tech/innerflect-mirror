import { AppShell } from '@/components/company/AppShell';
import { SurfaceStub } from '@/components/company/SurfaceStub';
import { company, domains } from '@/data/company';
import { companyHeadline } from '@/components/company/Hero';
import { worstState } from '@/lib/model/state';

export default function Page() {
  const state = worstState(domains.map((d) => d.state));
  return (
    <AppShell active="work" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceStub
        eyebrow="Stable surface"
        title="Work"
        question="What work exists, how does it happen, and what should change?"
        object="Workflows and capabilities"
        detail="Every workflow follows Trigger → Context → Work → Decision → Action → Verification → Outcome. Autonomy is earned here, not toggled: progress requires observations, decision agreement, policy coverage, reversibility and passed evaluations."
      />
    </AppShell>
  );
}
