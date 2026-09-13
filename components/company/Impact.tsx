import { Clock3, Gauge, ShieldCheck, Zap } from 'lucide-react';

/** Server component — static projection of verified impact. Ships no JS. */
export function Impact({
  hoursReturned,
  safeActions,
  verifiedOutcomes,
}: {
  hoursReturned: string;
  safeActions: number;
  verifiedOutcomes: string;
}) {
  return (
    <article className="impact">
      <div className="section-head">
        <div><span className="eyebrow">Verified impact</span><h3>Autonomy that earns trust</h3></div>
        <Gauge size={18} aria-hidden="true" />
      </div>
      <div className="impact-grid">
        <div><Clock3 aria-hidden="true" /><b>{hoursReturned}</b><span>returned weekly</span></div>
        <div><Zap aria-hidden="true" /><b>{safeActions.toLocaleString()}</b><span>safe actions</span></div>
        <div><ShieldCheck aria-hidden="true" /><b>{verifiedOutcomes}</b><span>verified outcomes</span></div>
      </div>
      <ol className="level-track">
        <li>Observe</li><li>Recommend</li><li>Supervise</li><li className="active">Autonomous</li>
        <i aria-hidden="true" />
      </ol>
    </article>
  );
}
