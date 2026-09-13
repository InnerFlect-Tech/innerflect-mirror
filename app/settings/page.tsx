import { AppShell } from '@/components/company/AppShell';
import { SurfaceHead } from '@/components/company/SurfaceHead';
import { SurfaceSummary } from '@/components/company/SurfaceSummary';
import { SettingsSurface } from '@/components/company/SettingsSurface';
import { companyHeadline } from '@/components/company/Hero';
import { company, domains } from '@/data/company';
import { authorityLimits, integrations, modelPermissions, roles } from '@/data/constitution';
import { worstState } from '@/lib/model/state';

export default function SettingsPage() {
  const state = worstState(domains.map((d) => d.state));
  const connected = integrations.filter((i) => i.status === 'connected').length;
  const unowned = authorityLimits.filter((a) => a.owner === 'Unassigned').length
    + roles.filter((r) => r.people === 0).length;
  const denied = modelPermissions.filter((m) => !m.allowed).length;

  return (
    <AppShell active="settings" status={companyHeadline[state].top} state={state} decisionsWaiting={company.decisionsWaiting}>
      <SurfaceHead
        eyebrow="Company constitution"
        title="Settings"
        pulse="What the system may know, access, and do. Every limit names the person accountable for it."
      />
      <SurfaceSummary
        stats={[
          { value: String(authorityLimits.length), label: 'Authority limits' },
          { value: `${connected}/${integrations.length}`, label: 'Systems connected', tone: connected < integrations.length ? 'attention' : 'good' },
          { value: String(unowned), label: 'Boundaries with no owner', tone: unowned ? 'critical' : 'good' },
          { value: String(denied), label: 'Capabilities denied', tone: 'good' },
          { value: '7 years', label: 'Audit retention' },
        ]}
      />
      <SettingsSurface />
    </AppShell>
  );
}
