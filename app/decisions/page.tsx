import { AppShell } from '@/components/company/AppShell';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { DecisionsSurface } from '@/components/company/DecisionsSurface';
import { companyHeadline } from '@/components/company/Hero';
import { company, domains } from '@/data/company';
import { decisionQueue } from '@/data/decisions-queue';
import { worstState } from '@/lib/model/state';

export default function DecisionsPage() {
  const state = worstState(domains.map((d) => d.state));

  return (
    <AppShell active="decisions" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceHead
        eyebrow="Human authority layer"
        title={`${decisionQueue.length} decisions need you.`}
        pulse="Everything else is running. A large queue would be a system failure, not a busy day."
      />
      <DecisionsSurface decisions={decisionQueue} />
    </AppShell>
  );
}
