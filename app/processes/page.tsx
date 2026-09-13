import { AppShell } from '@/components/company/AppShell';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { SurfaceSummary } from '@/components/company/SurfaceSummary';
import { ProcessesSurface } from '@/components/company/ProcessesSurface';
import { companyHeadline } from '@/components/company/Hero';
import { company, domains } from '@/data/company';
import { workflows } from '@/data/work';
import { worstState } from '@/lib/model/state';

export default function ProcessesPage() {
  const state = worstState(domains.map((d) => d.state));
  const autonomous = workflows.filter((w) => w.level === 'Autonomous').length;
  const awaiting = workflows.filter((w) => w.evidence.some((e) => !e.met)).length;
  const blocked = workflows.filter((w) => Object.values(w.stages).includes('blocked')).length;
  const effort = workflows.reduce((sum, w) => sum + parseFloat(w.humanEffort), 0).toFixed(1);

  return (
    <AppShell active="processes" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceHead
        eyebrow="Workflows and capabilities"
        title="Processes"
        pulse="How work flows through your company, and what it would take for more of it to run itself."
      />
      <SurfaceSummary
        stats={[
          { value: String(workflows.length), label: 'Processes observed' },
          { value: String(autonomous), label: 'Running autonomously', tone: 'good' },
          { value: String(awaiting), label: 'Awaiting evidence', tone: awaiting ? 'attention' : 'neutral' },
          { value: String(blocked), label: 'Blocked at a step', tone: blocked ? 'critical' : 'neutral' },
          { value: `${effort}h`, label: 'Human effort per week' },
        ]}
      />
      <ProcessesSurface workflows={workflows} />
    </AppShell>
  );
}
