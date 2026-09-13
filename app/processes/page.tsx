import { AppShell } from '@/components/company/AppShell';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { ProcessesSurface } from '@/components/company/ProcessesSurface';
import { companyHeadline } from '@/components/company/Hero';
import { company, domains } from '@/data/company';
import { workflows } from '@/data/work';
import { worstState } from '@/lib/model/state';

export default function WorkPage() {
  const state = worstState(domains.map((d) => d.state));
  const autonomous = workflows.filter((w) => w.level === 'Autonomous').length;
  const blocked = workflows.filter((w) => w.evidence.some((e) => !e.met)).length;

  return (
    <AppShell active="processes" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceHead
        eyebrow="Workflows and capabilities"
        title="Processes"
        pulse={`Explore how work flows through your company. ${workflows.length} processes · ${autonomous} autonomous · ${blocked} awaiting evidence.`}
      />
      <ProcessesSurface workflows={workflows} />
    </AppShell>
  );
}
