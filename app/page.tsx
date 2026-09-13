import { AppShell } from '@/components/company/AppShell';
import { CompanyWorkspace } from '@/components/company/CompanyWorkspace';
import { Hero, companyHeadline } from '@/components/company/Hero';
import { Impact } from '@/components/company/Impact';
import { company, decisions, domains, feed } from '@/data/company';
import { worstState } from '@/lib/model/state';

/**
 * Server component. The shell, the hero and the impact panel render on the
 * server and ship no JavaScript; only CompanyWorkspace crosses to the client,
 * and the 3D world is loaded lazily inside it.
 *
 * The company's state is the worst state present inside it — which is what
 * makes governance a layer rather than a place.
 */
export default function CompanyPage() {
  const state = worstState(domains.map((d) => d.state));

  return (
    <AppShell
      active="company"
      status={companyHeadline[state].top}
      state={state}
      decisionsWaiting={company.decisionsWaiting}
    >
      <Hero
        state={state}
        autonomy={company.autonomy}
        level={company.level}
        actionsToday={company.actionsToday}
        decisionsWaiting={company.decisionsWaiting}
        nextLevel={company.nextLevel}
        autonomyDelta={company.autonomyDelta}
      />

      <CompanyWorkspace
        domains={domains}
        feed={feed}
        decisions={decisions}
        decisionsWaiting={company.decisionsWaiting}
        eventsObserved={company.eventsObserved}
        impact={
          <Impact
            hoursReturned={company.impact.hoursReturned}
            safeActions={company.actionsToday}
            verifiedOutcomes={company.impact.verifiedOutcomes}
          />
        }
      />
    </AppShell>
  );
}
