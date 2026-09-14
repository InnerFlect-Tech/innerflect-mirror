import type { SceneState } from '@/lib/model/state';
import type { Surface } from './Rail';
import { CockpitShell } from './CockpitShell';

/**
 * The persistent frame around every surface. Server component: the shell is the
 * same on every route and has no reason to exist on the client.
 */
export function AppShell({
  active,
  status,
  state,
  decisionsWaiting,
  children,
}: {
  active: Surface;
  status: string;
  state: SceneState;
  decisionsWaiting: number;
  children: React.ReactNode;
}) {
  return (
    <CockpitShell
      active={active}
      status={status}
      state={state}
      decisionsWaiting={decisionsWaiting}
    >
      {children}
    </CockpitShell>
  );
}
