import type { SceneState } from '@/lib/model/state';
import { Rail, type Surface } from './Rail';
import { TopBar } from './TopBar';

export function CockpitShell({
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
        <div className="stage">{children}</div>
      </section>
    </main>
  );
}
