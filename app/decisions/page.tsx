import { AppShell } from '@/components/company/AppShell';
import { SurfaceStub } from '@/components/company/SurfaceStub';
import { company, domains } from '@/data/company';
import { companyHeadline } from '@/components/company/Hero';
import { worstState } from '@/lib/model/state';

export default function Page() {
  const state = worstState(domains.map((d) => d.state));
  return (
    <AppShell active="decisions" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceStub
        eyebrow="Stable surface"
        title="Decisions"
        question="Where does the company need human judgement?"
        object="Human authority layer"
        detail="A large queue is a system failure. Actions are Approve · Modify · Decline · Simulate, and repeated judgement should produce a policy suggestion — turning tacit knowledge into institutional memory."
      />
    </AppShell>
  );
}
