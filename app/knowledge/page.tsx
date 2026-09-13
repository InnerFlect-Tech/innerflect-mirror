import { AppShell } from '@/components/company/AppShell';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { KnowledgeSurface } from '@/components/company/KnowledgeSurface';
import { companyHeadline } from '@/components/company/Hero';
import { company, domains } from '@/data/company';
import { knowledgeObjects } from '@/data/knowledge';
import { worstState } from '@/lib/model/state';

export default function KnowledgePage() {
  const state = worstState(domains.map((d) => d.state));
  const drifting = knowledgeObjects.filter((o) => o.drift).length;
  const stale = knowledgeObjects.filter((o) => o.freshness === 'stale').length;

  return (
    <AppShell active="knowledge" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceHead
        eyebrow="Trusted knowledge objects"
        title="Knowledge"
        pulse={`${knowledgeObjects.length} objects · ${drifting} diverging from observed behaviour · ${stale} unverified for months`}
      />
      <KnowledgeSurface objects={knowledgeObjects} />
    </AppShell>
  );
}
