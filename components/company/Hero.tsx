import type { SceneState } from '@/lib/model/state';
import { LiveActionCount } from './LiveActionCount';

/**
 * Server component. The headline is a claim about the company, so it is derived
 * from the same state the world renders — the two cannot tell different stories.
 * Only the ticking action count is a client island.
 */
export const companyHeadline: Record<SceneState, { top: string; lines: [string, string] }> = {
  neutral: { top: 'Company being observed', lines: ['Your company is', 'being observed.'] },
  healthy: { top: 'Company operating normally', lines: ['Your company is', 'operating normally.'] },
  active: { top: 'Company operating normally', lines: ['Your company is', 'operating normally.'] },
  attention: { top: 'One domain needs judgement', lines: ['Your company is running.', 'One thing needs judgement.'] },
  critical: { top: 'One domain is at risk', lines: ['Your company is running.', 'One thing is at risk.'] },
};

export function Hero({
  state,
  autonomy,
  level,
  actionsToday,
  decisionsWaiting,
  nextLevel,
  autonomyDelta,
}: {
  state: SceneState;
  autonomy: number;
  level: number;
  actionsToday: number;
  decisionsWaiting: number;
  nextLevel: string;
  autonomyDelta: string;
}) {
  return (
    <section className="hero-row">
      <div>
        <span className="context">Operational digital twin</span>
        <h1>{companyHeadline[state].lines.map((line) => <span key={line}>{line}</span>)}</h1>
        <p>
          {autonomy}% autonomous · <LiveActionCount from={actionsToday} /> actions today ·{' '}
          {decisionsWaiting} things need you
        </p>
      </div>
      <div className="autonomy-score">
        <div className="score-top"><span>Company autonomy</span><small>Level {level}</small></div>
        <div className="score">
          <strong>{autonomy}</strong><span>/100</span><em>{autonomyDelta}</em>
        </div>
        <div className="score-track"><i style={{ width: `${autonomy}%` }} /></div>
        <small>Next level: {nextLevel}</small>
      </div>
    </section>
  );
}
