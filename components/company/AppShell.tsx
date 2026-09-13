import type { SceneState } from '@/lib/model/state';
import { Rail, type Surface } from './Rail';
import { TopBar } from './TopBar';

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
    <main className="mirror">
      <Rail active={active} decisionsWaiting={decisionsWaiting} />
      <section className="main">
        <TopBar status={status} state={state} />
        {children}
      </section>
    </main>
  );
}
