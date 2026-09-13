import { AppShell } from '@/components/company/AppShell';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { ApprovalsSurface } from '@/components/company/ApprovalsSurface';
import { companyHeadline } from '@/components/company/Hero';
import { company, domains } from '@/data/company';
import { decisionQueue } from '@/data/decisions-queue';
import { worstState } from '@/lib/model/state';

export default function DecisionsPage() {
  const state = worstState(domains.map((d) => d.state));

  return (
    <AppShell active="approvals" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceHead
        eyebrow="Human authority layer"
        title="Approvals"
        pulse={`Decisions that matter. With full context. ${decisionQueue.length} need you — everything else is running.`}
      />
      <ApprovalsSurface decisions={decisionQueue} />
    </AppShell>
  );
}
