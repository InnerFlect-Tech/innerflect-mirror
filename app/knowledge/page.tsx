import { AppShell } from '@/components/company/AppShell';
import { KnowledgeSurface } from '@/components/company/KnowledgeSurface';
import { companyHeadline } from '@/components/company/Hero';
import { company, domains } from '@/data/company';
import { knowledgeObjects } from '@/data/knowledge';
import { worstState } from '@/lib/model/state';

export default function KnowledgePage() {
  const state = worstState(domains.map((d) => d.state));
  return (
    <AppShell active="knowledge" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <KnowledgeSurface objects={knowledgeObjects} />
    </AppShell>
  );
}
