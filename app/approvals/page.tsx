import { AppShell } from '@/components/company/AppShell';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { SurfaceSummary } from '@/components/company/SurfaceSummary';
import { ApprovalsSurface } from '@/components/company/ApprovalsSurface';
import { companyHeadline } from '@/components/company/Hero';
import { company, domains } from '@/data/company';
import { decisionQueue } from '@/data/decisions-queue';
import { worstState } from '@/lib/model/state';

export default function ApprovalsPage() {
  const state = worstState(domains.map((d) => d.state));
  const high = decisionQueue.filter((d) => d.priority === 'high').length;
  const overdue = decisionQueue.filter((d) => d.deadline.toLowerCase().includes('overdue')).length;
  const irreversible = decisionQueue.filter((d) => d.reversibility === 'irreversible').length;

  return (
    <AppShell active="approvals" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceHead
        eyebrow="Human authority layer"
        title="Approvals"
        pulse="Decisions that matter, with full context. A long queue here would be a system failure, not a busy day."
      />
      <SurfaceSummary
        stats={[
          { value: String(decisionQueue.length), label: 'Waiting for you' },
          { value: String(high), label: 'High priority', tone: high ? 'critical' : 'neutral' },
          { value: String(overdue), label: 'Past their deadline', tone: overdue ? 'critical' : 'good' },
          { value: String(irreversible), label: 'Cannot be undone', tone: irreversible ? 'attention' : 'neutral' },
          { value: '€8,244', label: 'Total exposure' },
        ]}
      />
      <ApprovalsSurface decisions={decisionQueue} />
    </AppShell>
  );
}
