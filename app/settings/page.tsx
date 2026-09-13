import { AppShell } from '@/components/company/AppShell';
import { SurfaceStub } from '@/components/company/SurfaceStub';
import { company, domains } from '@/data/company';
import { companyHeadline } from '@/components/company/Hero';
import { worstState } from '@/lib/model/state';

export default function Page() {
  const state = worstState(domains.map((d) => d.state));
  return (
    <AppShell active="settings" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceStub
        eyebrow="Company constitution"
        title="Settings"
        question="What may the system know, access, and do?"
        object="Company constitution"
        detail="Machine-readable boundaries: organisation structure, integrations, data access, policies, authority and financial limits, risk levels, roles, audit retention and model permissions."
      />
    </AppShell>
  );
}
