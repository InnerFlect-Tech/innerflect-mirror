import { AppShell } from '@/components/company/AppShell';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { WorkSurface } from '@/components/company/WorkSurface';
import { companyHeadline } from '@/components/company/Hero';
import { company, domains } from '@/data/company';
import { workflows } from '@/data/work';
import { worstState } from '@/lib/model/state';

export default function WorkPage() {
  const state = worstState(domains.map((d) => d.state));
  const autonomous = workflows.filter((w) => w.level === 'Autonomous').length;
  const blocked = workflows.filter((w) => w.evidence.some((e) => !e.met)).length;

  return (
    <AppShell active="work" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceHead
        eyebrow="Workflows and capabilities"
        title="Work"
        pulse={`${workflows.length} workflows · ${autonomous} autonomous · ${blocked} awaiting evidence`}
      />
      <WorkSurface workflows={workflows} />
    </AppShell>
  );
}
